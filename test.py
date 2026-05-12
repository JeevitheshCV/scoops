import subprocess
from pathlib import Path
import sys


WEBM_PATH = Path(
    r"C:\Users\cvjg9\OneDrive\Documents\GitHub\scoops\assets\mascot\Ice_Cream_Mascot_Animation.webm"
)

MOV_PATH = WEBM_PATH.with_name("Ice_Cream_Mascot_Animation_alpha.mov")


def run_command(command):
    try:
        result = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
        )
        return result.stdout.strip()
    except FileNotFoundError:
        print("ERROR: ffmpeg/ffprobe was not found.")
        print("Install FFmpeg first, then make sure it is available in PATH.")
        sys.exit(1)
    except subprocess.CalledProcessError as error:
        print("ERROR while running command:")
        print(" ".join(command))
        print(error.stderr)
        sys.exit(1)


def check_alpha():
    command = [
        "ffprobe",
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=pix_fmt",
        "-of",
        "default=nw=1:nk=1",
        str(WEBM_PATH),
    ]

    pix_fmt = run_command(command)

    print(f"Detected pixel format: {pix_fmt}")

    if "a" not in pix_fmt:
        print()
        print("WARNING: This WebM does not appear to contain an alpha channel.")
        print("Expected something like: yuva420p")
        print("Detected something like: yuv420p")
        print()
        print("Converting will still create a MOV, but it may keep the black background.")
        answer = input("Continue anyway? Type yes to continue: ").strip().lower()

        if answer != "yes":
            print("Stopped.")
            sys.exit(0)
    else:
        print("Alpha channel detected. Good to continue.")


def convert_to_prores_4444():
    command = [
        "ffmpeg",
        "-y",
        "-i",
        str(WEBM_PATH),
        "-c:v",
        "prores_ks",
        "-profile:v",
        "4",
        "-pix_fmt",
        "yuva444p10le",
        "-vendor",
        "apl0",
        "-an",
        str(MOV_PATH),
    ]

    print()
    print("Converting to MOV ProRes 4444 with alpha...")
    run_command(command)

    print()
    print("Done.")
    print(f"Created: {MOV_PATH}")


def verify_output():
    command = [
        "ffprobe",
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=codec_name,profile,pix_fmt",
        "-of",
        "default=nw=1",
        str(MOV_PATH),
    ]

    print()
    print("Output verification:")
    print(run_command(command))


if __name__ == "__main__":
    if not WEBM_PATH.exists():
        print(f"ERROR: File not found: {WEBM_PATH}")
        sys.exit(1)

    check_alpha()
    convert_to_prores_4444()
    verify_output()