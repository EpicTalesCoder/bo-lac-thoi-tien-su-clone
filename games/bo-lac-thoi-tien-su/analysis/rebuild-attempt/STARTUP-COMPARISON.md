# FreeJ2ME startup comparison

## Setup

- Built FreeJ2ME AWT from the official `hex007/freej2me` source snapshot saved under `freej2me-source/` (source archive SHA-256 `fa12f257b297952bc45d005898ffbdfaec05e30d60e8494e747bb6aed7cbb628`).
- Used FreeJ2ME's `MobilePlatform` headless API to run the MIDlet and capture 240x320 frames. Harnesses: `capture-tools/FreeJ2meCapture.java`, `FreeJ2meCaptureSequence.java`, `FreeJ2meProgression.java`.
- Original target: `../Bolacthoitiensu.jar`; candidate: `rebuilt-host8-candidate.jar`. Both copies preserve their own archive resources; original digest remained `56b371ba36750028321933d7fedaabbb20b161cd0d35b9c7497d2631f9a53735`.
- Captures are in `captures/original-flow/` and `captures/candidate-flow/`; sequence scenario starts each run from a fresh FreeJ2ME process, waits comparable fixed intervals, then sends repeated Fire (`5`) key presses.

## Observations

- Both run at 240x320 and render the same splash (`01-splash`), language selection (`02-language`), music question (`03-after-language`), next menu (`04-after-music-choice`), and selected opening panels. The first opening language/menu screenshot hashes are equal after conversion to TIFF, and panels at corresponding sequence points through the first description (original `06-step`, candidate `07-step`) are visually identical in inspection.
- The automated repeated-Fire sequence later diverges in time/selection: original `05-step` shows the next menu, while candidate `05-step` is one screen earlier (mode selection); original reaches the story narrative at `06-step`, candidate at `07-step`. This suggests a timing/state-machine difference under the harness, but fixed waits and one-keypress inputs are not a deterministic, fully synchronized interaction protocol. The aligned story panels themselves match visually.
- A separate initial capture showed original and candidate splash hashes equal, language and later opening frames equal at matched labels (`t03`, `t09`, `t12`); one label (`t06`) differed by captured state timing.
- The FreeJ2ME AWT desktop window could not be brought into the captured screen/automated keyboard interaction path here. The headless API provides framebuffer captures and key events instead.

## Limits

This verifies a useful subset of visual startup rendering only. It does **not** verify all menus, gameplay decisions, input edge cases, animation over equal game-state snapshots, audio/MMAPI, RMS saves/load, native handset CLDC 1.0 compatibility, or full behavioral equivalence. Candidate was host-compiled with Java 8 (class version 52), not CLDC-preverified handset bytecode. Continue with deterministic key-event/state capture and compare more flows before using it for modifications.
