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

## 5. Pixel UI, HUD, Menu Chrome & Combat Parity (`total-tournament` Lessons)
- **System font / `strokeRect` blur**: Never render canvas menus with `ctx.fillText('Arial...')` or `ctx.strokeRect` when the JAR ships a pixel bitmap font (`fnt.png`+`cf`) and 1px MIDP borders (`drawRect`). Port `fnt.png` + NFD Vietnamese diacritic overlay and `drawRectMIDP`/`drawLineMIDP`.
- **Invisible Unicode punctuation**: Bitmap font tables lack symbols like middot `·` (`U+00B7`) or em-dash `—`. Map them cleanly to `-` in the tokenizer and audit Help/About screenshots visually so words never show awkward holes.
- **Overlay toolbar blocking softkeys/HUD**: `position: fixed; bottom: 10px` floats over the bottom-right HUD (`Ammo` / `Back` softkey) at compact viewport heights. Use a vertical `flex-direction: column` stage with `#game` sized to `calc(100vh - 54px)` and `.floating-toolbar` docked underneath.
- **Pause backdrop losing arena background**: When `app.screen` switches to `'menu'` (`K=1` pause), `createRenderState` must check `pausedMatch` before clearing `backgroundName = null`, otherwise the frozen arena renders a flat solid fallback color instead of its parallax sky.
- **Ignorable-looking `cu2` `ox/oy` & `% 3` flag wrap bugs**: Applying `& 3` instead of `% 3` on a 3-frame flag animation draws podium tile `106` as frame 3; omitting `ox/oy` shifts flame burn sprites (`43..48`, `ox = -25`) completely off the fighter's torso.
- **Round reset missing `tables` & weapon/mode parity**: Ensure `advanceLastHeroRound(match, tables)` forwards `tables` to `respawnActor`; track `hitOnce` on multi-tick beam weapons (Railgun) after truncating beam width; derive rocket splash radius (`ar = 72`) and death knockback speeds directly from `e.java`.
- **One-way platform drop-through snap-back**: If `applyDrop` only adds `+4px` to `y` on a platform tile whose swept landing band spans `[surfaceY - 2, surfaceY + 6]`, gravity re-snaps the actor back onto the same row next tick! Always check `hasSafeFloorBelow` (never drop off bottomless/lowest floors; pan camera down instead), track `dropIgnoreTy = standTy` (skipping that row in swept landing until cleared), and clear `dropCooldown` on key release so multi-tier drops stay responsive.
- **Unit tests miss visual bugs**: Always run an automated Chrome headless CDP screenshot walkthrough (`http` + `WebSocket`) across Startup, Title, every Menu screen (VI + EN), Config, Map/Char select, Loading splash, Pause, Scoreboard, and live Combat, then visually inspect every PNG via `read_file`.

---

## Multiplayer & Shared Transport Pitfalls
- **Room code collisions across games on `/api/mp`**: `api/mp.mjs` subscribes to `bltts/mp/v2/${code}/+` (max 8 alnum chars). Always namespace room codes per game via `normalizeRoomCode()` (e.g. `TT4829`, `AE4829`, `GF4829`) instead of bare 4-digit codes.
- **Typing inside `#mp-lobby` hijacked by canvas hotkeys**: Guard `createEngineLoop` `keydown`/`keyup` against `INPUT`, `TEXTAREA`, and `SELECT` targets so player names, room codes, and dropdowns work cleanly without moving the character or calling `preventDefault()`.
- **Guest edge triggers (`switchWeapon`) & disconnect stuck keys**: In `onGuestInput`, OR-preserve `switchWeapon` until Host's `tickSourceMatch` consumes and clears it (otherwise a rapid `key-down` + `key-up` within one `77ms` tick drops the swap); on Guest local side, clear `app.input.switchWeapon = false` immediately after sending so it doesn't repeat every heartbeat; on `onGuestLeave`, delete `remoteInputs[clientId]`.
- **Guest win/loss inversion & offline console noise**: Compute `match.winner` inside `applyMatchSnapshot` relative to Guest's own `playerIndex` / `player.team` (Host losing CTF Red vs Blue still means Guest won!). Close `SameOriginHttpRelay` on first `404` when probing static servers without `/api/mp`, and avoid third-party CDN `<script>` tags (`peerjs`) that log failed network requests in sandboxed/offline Chrome QA.
- **Browser throttles background Host tabs**: Always drive Host's simulation tick + snapshot broadcast with an inline `Blob` `Worker` `setInterval` (falling back to `source-tick` if CSP blocks `blob:` workers) so Tab 1 Host keeps simulating while the user tests/plays Tab 2 Guest in the foreground.
- **BroadcastChannel starving WiFi/4G network relays**: Calling `bc.postMessage()` only delivers within the same local browser, never to remote phones over WiFi/4G! Never let `bc` or single-protocol `relay` set `fastSent = true` to suppress `/api/mp` or `ntfy` snapshots; let `_from:_seq` deduplication handle redundant cloud transports cleanly.
- **Overhead player names in Multiplayer**: When `showPlayerNames` / online mode is active, draw each living fighter's `name` centered above its health bar using the game's original bitmap font (`fnt.png`), never raw `ctx.fillText`.
