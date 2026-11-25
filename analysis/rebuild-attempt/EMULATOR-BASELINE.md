# Emulator baseline probe

- Isolated MicroEmulator 2.0.4 jars are in `lib/` (MIDP, CLDC, Java SE, Swing), plus ASM 3.1. SHA-256 values are recorded in the build-session transcript or can be regenerated with `shasum -a 256 lib/*.jar`.
- `original-emulator-test.jar` is a copy of the original archive; its entry contents were verified byte-for-byte equal to the source JAR. Its ZIP container SHA-256 differs because it was copied/recompressed.
- A derived `original-emulator-test.jad` points at that copy and preserves manifest MIDlet name/version/vendor, both MIDlet declarations, MIDP 2.0 and CLDC 1.0 properties.
- Ran MicroEmulator `org.microemu.app.Main --headless -Xautotest:<JAD> --quit` under the bundled JDK 17. Log: `logs/microemu-original-baseline.txt`. It opened the JAD and temporary copied JAR and reported `AutoTests start class [tribes]`, then did not exit in 20 seconds (MIDlet has a continuous game loop); the bounded process was terminated by its timeout.

This proves only that MicroEmulator 2.0.4 can load the original archive and start the `tribes` MIDlet far enough to enter its app lifecycle. It does **not** verify visible startup, 240x320 presentation, controls, sound/RMS, or gameplay equivalence. A compiled-source candidate has since been packaged at `rebuilt-candidate.jar`; see `BUILD-STATUS.md` for its limitations and its separate startup probe log.
