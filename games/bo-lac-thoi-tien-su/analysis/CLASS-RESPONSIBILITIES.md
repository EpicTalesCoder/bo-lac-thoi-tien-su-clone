# Recovered class map (inferred from bytecode)

Class names below are the obfuscated names in the JAR. Role labels are analysis hypotheses derived from observed inheritance, calls, field usage, and resources; they are not original source names.

| Class | Inferred responsibility | Direct evidence |
|---|---|---|
| `tribes` | MIDlet/application lifecycle and startup | Extends `MIDlet`, implements `Runnable`; starts the canvas and transitions to `f` (`decompiled-procyon/tribes.java`). |
| `f` | Main full-screen game canvas/controller, render loop, UI/input, game state | Extends `Canvas`, implements `Runnable`; owns `run`, `paint`, game loop, map/tile rendering, keyboard handling (`decompiled-procyon/f.java`). |
| `b` | Game simulation/entity movement/pathing and opponent/AI logic | Uses map occupancy, entity-state arrays and path-search; `Z()` selects entities in two 30-slot ranges (`decompiled-procyon/b.java:4479-4539`). |
| `c` | Font/text and sprite drawing utility | Decodes packed text records and draws glyph/sprite data through `Graphics` (`decompiled-procyon/c.java:112-160, 162-254`). |
| `d` | Startup/splash Canvas | Draws `/l0`..`/l3` onto a 264x352 buffer; game content includes a 240x320 splash image (`decompiled-procyon/d.java`). |
| `e` | Startup asset/resource loader | Reads `/pd0`, `/pi0`, `/pi9`, `/pi8`, `/a`, `/sa`, `/ma` (`decompiled-procyon/e.java`). |
| `a` | Java ME media player wrapper, likely music/audio | Implements `PlayerListener`, creates MIDP player and controls volume/state (`decompiled-procyon/a.java`). |
| `WapTai.COM.WapTai` | Secondary web-link MIDlet | Calls `platformRequest("https://waptai.com")`, then destroys itself (`decompiled-procyon/WapTai/COM/WapTai.java`). |

`b` is likely the largest game-logic class and likely includes AI decision routines; that role is inferred from behavior, not author labels or original symbols. See `ANALYSIS-README.md` for bytecode and behavioral-equivalence limits.
