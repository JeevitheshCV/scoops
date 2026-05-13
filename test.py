# import subprocess
# from pathlib import Path
# import sys


# WEBM_PATH = Path(
#     r"C:\Users\cvjg9\OneDrive\Documents\GitHub\scoops\assets\mascot\Ice_Cream_Mascot_Animation.webm"
# )

# MOV_PATH = WEBM_PATH.with_name("Ice_Cream_Mascot_Animation_alpha.mov")


# def run_command(command):
#     try:
#         result = subprocess.run(
#             command,
#             check=True,
#             capture_output=True,
#             text=True,
#         )
#         return result.stdout.strip()
#     except FileNotFoundError:
#         print("ERROR: ffmpeg/ffprobe was not found.")
#         print("Install FFmpeg first, then make sure it is available in PATH.")
#         sys.exit(1)
#     except subprocess.CalledProcessError as error:
#         print("ERROR while running command:")
#         print(" ".join(command))
#         print(error.stderr)
#         sys.exit(1)


# def check_alpha():
#     command = [
#         "ffprobe",
#         "-v",
#         "error",
#         "-select_streams",
#         "v:0",
#         "-show_entries",
#         "stream=pix_fmt",
#         "-of",
#         "default=nw=1:nk=1",
#         str(WEBM_PATH),
#     ]

#     pix_fmt = run_command(command)

#     print(f"Detected pixel format: {pix_fmt}")

#     if "a" not in pix_fmt:
#         print()
#         print("WARNING: This WebM does not appear to contain an alpha channel.")
#         print("Expected something like: yuva420p")
#         print("Detected something like: yuv420p")
#         print()
#         print("Converting will still create a MOV, but it may keep the black background.")
#         answer = input("Continue anyway? Type yes to continue: ").strip().lower()

#         if answer != "yes":
#             print("Stopped.")
#             sys.exit(0)
#     else:
#         print("Alpha channel detected. Good to continue.")


# def convert_to_prores_4444():
#     command = [
#         "ffmpeg",
#         "-y",
#         "-i",
#         str(WEBM_PATH),
#         "-c:v",
#         "prores_ks",
#         "-profile:v",
#         "4",
#         "-pix_fmt",
#         "yuva444p10le",
#         "-vendor",
#         "apl0",
#         "-an",
#         str(MOV_PATH),
#     ]

#     print()
#     print("Converting to MOV ProRes 4444 with alpha...")
#     run_command(command)

#     print()
#     print("Done.")
#     print(f"Created: {MOV_PATH}")


# def verify_output():
#     command = [
#         "ffprobe",
#         "-v",
#         "error",
#         "-select_streams",
#         "v:0",
#         "-show_entries",
#         "stream=codec_name,profile,pix_fmt",
#         "-of",
#         "default=nw=1",
#         str(MOV_PATH),
#     ]

#     print()
#     print("Output verification:")
#     print(run_command(command))


# if __name__ == "__main__":
#     if not WEBM_PATH.exists():
#         print(f"ERROR: File not found: {WEBM_PATH}")
#         sys.exit(1)

#     check_alpha()
#     convert_to_prores_4444()
#     verify_output()






import cv2
import numpy as np
import subprocess
from pathlib import Path
import shutil
import sys
import time


PROJECT_DIR = Path(__file__).resolve().parent

INPUT_VIDEO = PROJECT_DIR / "assets" / "mascot" / "test_1.mp4"

OUTPUT_DIR = PROJECT_DIR / f"transparent_frames_{int(time.time())}"

MOV_OUTPUT = PROJECT_DIR / "assets" / "mascot" / "Ice_Cream_Mascot_Animation.mov"
WEBM_OUTPUT = PROJECT_DIR / "assets" / "mascot" / "Ice_Cream_Mascot_Animation.webm"


# -------------------------
# TUNING SETTINGS
# -------------------------

# Crop only the extreme outside black edges, if any
AUTO_CROP_BLACK_OUTER_EDGES = True
CROP_PADDING = 12

# Detect and remove internal vertical black bars
REMOVE_VERTICAL_BLACK_BARS = True
BLACK_BAR_GRAY_THRESHOLD = 35
BLACK_BAR_COLUMN_RATIO = 0.55
BLACK_BAR_MIN_WIDTH = 3
BLACK_BAR_PADDING = 8

# White / light-gray background removal
BACKGROUND_BRIGHTNESS_THRESHOLD = 185
BACKGROUND_SATURATION_RANGE = 45
DARK_PIXEL_KEEP_THRESHOLD = 170

# Loop correction
# Parent video has extra tail frames after the real loop point.
# The clean loop endpoint is frame 257.
# This keeps frames 0 through 257 and removes frames 258 through the end.
TRIM_TO_LOOP_END = True
LOOP_END_FRAME = 257

DELETE_FRAMES_AFTER_EXPORT = False


def run(cmd):
    print()
    print("Running:")
    print(" ".join(str(x) for x in cmd))
    subprocess.run(cmd, check=True)


def make_even(value):
    return value if value % 2 == 0 else value - 1


def detect_black_outer_crop(cap, frame_count):
    sample_positions = [
        0,
        frame_count // 4,
        frame_count // 2,
        (frame_count * 3) // 4,
        max(frame_count - 1, 0),
    ]

    x_mins = []
    x_maxs = []

    for pos in sample_positions:
        cap.set(cv2.CAP_PROP_POS_FRAMES, pos)
        ret, frame = cap.read()

        if not ret:
            continue

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Treat anything brighter than near-black as content
        content_mask = gray > 18
        cols_with_content = np.where(content_mask.any(axis=0))[0]

        if len(cols_with_content) == 0:
            continue

        x_mins.append(cols_with_content[0])
        x_maxs.append(cols_with_content[-1])

    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

    if not x_mins or not x_maxs:
        print("Could not detect outer crop. Using full frame.")
        return 0, None

    x1 = max(min(x_mins) - CROP_PADDING, 0)
    x2 = max(x_maxs) + CROP_PADDING

    width = x2 - x1
    width = make_even(width)
    x2 = x1 + width

    print(f"Outer crop detected: x1={x1}, x2={x2}, width={x2 - x1}")

    return x1, x2


def find_vertical_black_bands(frame):
    """
    Finds tall vertical black bars inside the frame.
    This avoids deleting mascot outlines because outlines are not full-height columns.
    """

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    near_black = gray < BLACK_BAR_GRAY_THRESHOLD

    # For each column, calculate how much of the column is black
    column_black_ratio = near_black.mean(axis=0)

    bar_columns = column_black_ratio > BLACK_BAR_COLUMN_RATIO

    bands = []
    start = None

    for i, is_bar in enumerate(bar_columns):
        if is_bar and start is None:
            start = i

        if not is_bar and start is not None:
            end = i - 1
            if end - start + 1 >= BLACK_BAR_MIN_WIDTH:
                bands.append((start, end))
            start = None

    if start is not None:
        end = len(bar_columns) - 1
        if end - start + 1 >= BLACK_BAR_MIN_WIDTH:
            bands.append((start, end))

    padded_bands = []

    width = frame.shape[1]

    for x1, x2 in bands:
        x1 = max(x1 - BLACK_BAR_PADDING, 0)
        x2 = min(x2 + BLACK_BAR_PADDING, width - 1)
        padded_bands.append((x1, x2))

    return padded_bands


def detect_static_vertical_black_bands(cap, frame_count, crop_x1, crop_x2):
    """
    Detects black vertical bars using several frames.
    Combines all detected bar regions.
    """

    sample_positions = [
        0,
        frame_count // 4,
        frame_count // 2,
        (frame_count * 3) // 4,
        max(frame_count - 1, 0),
    ]

    all_bands = []

    for pos in sample_positions:
        cap.set(cv2.CAP_PROP_POS_FRAMES, pos)
        ret, frame = cap.read()

        if not ret:
            continue

        if crop_x2 is not None:
            frame = frame[:, crop_x1:crop_x2]

        bands = find_vertical_black_bands(frame)
        all_bands.extend(bands)

    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

    if not all_bands:
        print("No internal vertical black bars detected.")
        return []

    # Merge overlapping bands
    all_bands.sort()
    merged = []

    for band in all_bands:
        if not merged:
            merged.append(list(band))
        else:
            last = merged[-1]
            if band[0] <= last[1] + 12:
                last[1] = max(last[1], band[1])
            else:
                merged.append(list(band))

    merged = [(x1, x2) for x1, x2 in merged]

    print("Internal vertical black bars detected:")
    for x1, x2 in merged:
        print(f"  x1={x1}, x2={x2}, width={x2 - x1 + 1}")

    return merged


def remove_background():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    cap = cv2.VideoCapture(str(INPUT_VIDEO))

    if not cap.isOpened():
        print(f"Could not open video: {INPUT_VIDEO}")
        sys.exit(1)

    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    original_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    original_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    if not fps or fps <= 0:
        fps = 30

    print(f"Input video: {INPUT_VIDEO}")
    print(f"FPS: {fps}")
    print(f"Frames: {frame_count}")
    print(f"Original size: {original_width}x{original_height}")
    print(f"Frame output folder: {OUTPUT_DIR}")

    if TRIM_TO_LOOP_END:
        print(f"Loop trim enabled. Exporting frames 0 through {LOOP_END_FRAME}.")
        print(f"Frames after {LOOP_END_FRAME} will be skipped.")

    if AUTO_CROP_BLACK_OUTER_EDGES:
        crop_x1, crop_x2 = detect_black_outer_crop(cap, frame_count)
    else:
        crop_x1, crop_x2 = 0, None

    if REMOVE_VERTICAL_BLACK_BARS:
        black_bands = detect_static_vertical_black_bands(
            cap,
            frame_count,
            crop_x1,
            crop_x2,
        )
    else:
        black_bands = []

    source_frame_index = 0
    output_frame_index = 0

    while True:
        ret, frame = cap.read()

        if not ret:
            break

        # Stop at the real loop endpoint.
        # This removes the extra tail frames that break the browser loop.
        if TRIM_TO_LOOP_END and source_frame_index > LOOP_END_FRAME:
            print(f"Stopped export at source frame {source_frame_index}.")
            break

        # Crop outside black edges first
        if crop_x2 is not None:
            frame = frame[:, crop_x1:crop_x2]

        b, g, r = cv2.split(frame)

        max_channel = np.maximum(np.maximum(r, g), b)
        min_channel = np.minimum(np.minimum(r, g), b)
        saturation_range = max_channel - min_channel

        # White / light-gray background
        background_mask = (
            (max_channel > BACKGROUND_BRIGHTNESS_THRESHOLD)
            & (saturation_range < BACKGROUND_SATURATION_RANGE)
        )

        mask = background_mask.astype(np.uint8) * 255
        mask = cv2.GaussianBlur(mask, (5, 5), 0)

        alpha = 255 - mask

        # Keep dark mascot/text pixels visible
        dark_pixels = max_channel < DARK_PIXEL_KEEP_THRESHOLD
        alpha[dark_pixels] = 255

        # Remove detected vertical black bars after dark-pixel preservation
        for x1, x2 in black_bands:
            alpha[:, x1:x2 + 1] = 0

        bgra = cv2.cvtColor(frame, cv2.COLOR_BGR2BGRA)
        bgra[:, :, 3] = alpha

        output_file = OUTPUT_DIR / f"frame_{output_frame_index:04d}.png"
        cv2.imwrite(str(output_file), bgra)

        output_frame_index += 1
        source_frame_index += 1

        if output_frame_index % 30 == 0:
            print(f"Processed {output_frame_index} exported frames")

    cap.release()

    print()
    print(f"Done. Transparent PNG frames saved to: {OUTPUT_DIR}")
    print(f"Total exported frames: {output_frame_index}")

    if TRIM_TO_LOOP_END:
        expected_frames = LOOP_END_FRAME + 1
        print(f"Expected loop-safe frame count: {expected_frames}")

    return fps


def create_mov(fps):
    run([
        "ffmpeg",
        "-y",
        "-framerate", str(fps),
        "-i", str(OUTPUT_DIR / "frame_%04d.png"),
        "-c:v", "prores_ks",
        "-profile:v", "4",
        "-pix_fmt", "yuva444p10le",
        "-vendor", "apl0",
        str(MOV_OUTPUT),
    ])


def create_webm(fps):
    run([
        "ffmpeg",
        "-y",
        "-framerate", str(fps),
        "-i", str(OUTPUT_DIR / "frame_%04d.png"),
        "-c:v", "libvpx-vp9",
        "-pix_fmt", "yuva420p",
        "-auto-alt-ref", "0",
        "-metadata:s:v:0", "alpha_mode=1",
        "-b:v", "0",
        "-crf", "30",
        str(WEBM_OUTPUT),
    ])


def verify_output():
    print()
    print("Verifying MOV:")
    run([
        "ffprobe",
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=codec_name,profile,pix_fmt,width,height,nb_frames,duration",
        "-of", "default=nw=1",
        str(MOV_OUTPUT),
    ])

    print()
    print("Verifying WebM:")
    run([
        "ffprobe",
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=codec_name,pix_fmt,width,height,nb_frames,duration:stream_tags=alpha_mode",
        "-of", "default=nw=1",
        str(WEBM_OUTPUT),
    ])


def cleanup_frames():
    if DELETE_FRAMES_AFTER_EXPORT and OUTPUT_DIR.exists():
        try:
            shutil.rmtree(OUTPUT_DIR)
            print(f"Deleted temporary frame folder: {OUTPUT_DIR}")
        except PermissionError:
            print(f"Could not delete frame folder because Windows locked it: {OUTPUT_DIR}")


if __name__ == "__main__":
    if not INPUT_VIDEO.exists():
        print(f"Input video not found: {INPUT_VIDEO}")
        sys.exit(1)

    fps = remove_background()
    create_mov(fps)
    create_webm(fps)
    verify_output()
    cleanup_frames()

    print()
    print("Finished creating:")
    print(MOV_OUTPUT)
    print(WEBM_OUTPUT)