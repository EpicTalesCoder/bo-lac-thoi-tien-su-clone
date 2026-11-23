# Pitfalls & Proven Patterns from J2ME Web Porting

Quick reference of real bugs encountered in this monorepo and their verified fixes.

## 1. Decompilation & Binary Decoding Pitfalls
- **Empty `javap` output**: Always check file size > 100 bytes after batch-dumping bytecode; missing JDK on `PATH` silently creates 1-line files.
- **Swapped table offsets**: Example in Prehistoric Tribes — Melee (`skillId 14`) is `e[1717]` while Throwing (`skillId 15`) is `e[1616]` per `mo[126]`. Always dump `mo[126]` / `mo[127]` directly from the binary instead of assuming sequential order.
- **Bias `-1` civil skills**: Civil skill bytes `e[6969..7575]` store `1..10` with `mo[127] = -1` (displayed as `0..9`). Clamping raw values to `>= 1` prevents `0 - 1` underflow.

## 2. Rendering & Palette Pitfalls
- **Red Tribe child turning solid red**: Never apply a flat RGB recolor (`paletteSwap >= 10`) to a faction that already has native J2ME `pi9` dark-skin sheets (`paletteSwap = 4` for `sheet 14/15` → `pi9/04.png`, `pi9/05.png`; `paletteSwap = 3` for `sheet 9` → `pi9/03.png`).
- **Building preview showing wrong faction flag**: In `buildPreview`, check `state.localTribe` for `kind === 6 && slotId === 1` (`animId++` for Red tribe) and draw the matching faction pennant.
- **Pointer lag**: Avoid synchronous `draw()` inside `pointermove`; call `markDirty()` so rendering stays locked to `requestAnimationFrame`.

## 3. Gameplay & Multiplayer Sync Pitfalls
- **Guest sees `!` / "chưa có người chủ trì" while worker fetches materials**: `state.tasks` and `state.savedJobs` only exist on the Host. Always include `staffedBids` and `builderCounts` in `packWorldSnapshot()` and merge them into `isBuildingSlot0Occupied()` / `getAssignedBuilderCount()` on Guests.
- **Guest tribe not breeding in Lều**: Never default `spawnNewbornVillager(..., owner = 0)` or compare against Host's `state.population < state.housingCap`. Compute `unitOwner = getUnitOwner(d, unitId)` and track `task.breedTicks` separately from `task.workTicks` so late-arriving partners never miss `workTicks === 36`.
- **Guest missing birth/death notifications**: Route tribe-scoped alerts through `notifyTribeEvent(tribe, message, warning, popup)` which sends `{ type: 'tribeEvent', ... }` to Guests when `tribe !== state.localTribe`.
- **Self-defense switching villager job**: When a villager defends against a wild predator (`defendOnly = true`), keep their equipped weapon and resume `savedJobs` after the kill instead of switching to meat gathering.

## 4. Vercel & Discord Activity Pitfalls
- **Vercel Serverless multi-instance split**: Concurrent requests to `/api/mp` even in a single region (`sin1`) hit separate Node instances (observed 3/6 misses in parallel reads). Bridge all instances server-side via a persistent `WebSocket` to `wss://broker.emqx.io:8084/mqtt`.
- **Discord Electron aggressive caching**: `Cache-Control: no-cache` on `*.js` alone misses `/` and `/games/*/` directory routes and can still be cached by Electron's ES module loader. Combine:
  1. `no-store` headers on `/`, `/games/*/`, and `*.html|js|mjs|css|json` in `vercel.json`
  2. `<meta http-equiv="Cache-Control" ...>` in HTML
  3. Automatic `?v=<timestamp>` stamping on all `dist/` HTML/CSS/JS module imports in `tools/build-portal.py`.
- **Heavy monorepo `package.json` on Vercel**: Add `"installCommand": "true"` in `vercel.json` when the web build is pure Python/static + zero-dependency Node API.
