# ShowCall – AI coding agent guide

Purpose: help you ship correct, low-risk changes fast in this Electron + Node app that controls Resolume via OSC (control) + REST (monitoring).

## Big picture
- Electron (`electron/main.cjs`) spawns `server.js` (Express) then loads http://localhost:$PORT. UI is `public/` (vanilla HTML/CSS/JS).
- OSC (UDP) triggers: clips/columns, clear, cut. REST reads composition/status; server reduces and streams via SSE at `/api/status` (~1 Hz).
- Indices are 1-based across UI, request bodies, and OSC paths (Layer 1, Column 1). Keep this invariant.

## Where things live
- `server.js` (ESM): OSC client, REST helper, SSE, macro executor, JSON APIs.
- `electron/main.cjs` (CJS): single-instance lock, waits on `/health`, opens BrowserWindow.
- `public/*`: UI (grid, presets, hotkeys). `public/config.json` defines labels + macros.
- `.env(.example)`: `PORT`, `RESOLUME_HOST`, `RESOLUME_REST_PORT` (8080), `RESOLUME_OSC_PORT` (7000), `MOCK`.

## Workflows
- Dev: `npm run dev` (Electron + server + UI). Optional: `node server.js` then open http://localhost:3200.
- Build: `npm run dist` (installers) or `npm run pack` (dir). Icons in `build/`; notarization via `scripts/notarize.cjs` if env vars set.

## Server conventions
- OSC helpers: `triggerClip(layer,col)`, `triggerColumn(col)`, `cutToProgram()`, `clearAll()` → `sendOSC(address, 1)`.
- REST: `resolumeRequest(method, path, data?)` (5s timeout) for official endpoints.
- SSE payload shape: `{ program, preview, bpm, comp, connected, host, restPort, oscPort, timestamp }` — keep stable.
- APIs: `/api/composition`, `/api/connection`, `/api/trigger`, `/api/triggerColumn`, `/api/cut`, `/api/clear`, `/api/macro`, `/api/status`, `/health`.
- Mock mode: `MOCK=1` returns deterministic UI data; OSC/REST are bypassed.

## Frontend conventions
- Plain DOM + fetch; keep IDs/classes (`grid`, `deck`, `quickCues`, etc.). Grid keys: `L{layer}-C{column}` in `indexByKey`.
- Presets: `firePreset` posts `/api/macro` with `{ id, name, macro }`. Hotkeys map to `preset.hotkey`.

## Protocol examples (1-based)
- Clip: `/composition/layers/{layer}/clips/{column}/connect` (value = 1)
- Column: `/composition/columns/{column}/connect` (value = 1)
- Clear: `/composition/disconnectall` (1); Cut: `/composition/tempocontroller/resync` (1)
- Example: POST `/api/trigger` `{ "layer":2, "column":3 }` → OSC `/composition/layers/2/clips/3/connect 1`

## Gotchas
- Do not introduce 0-based indices at boundaries. UI/body/OSC must be 1-based.
- `server.js` is ESM and unpacked (`asarUnpack`). If relocating, update `electron/main.cjs` spawn path.
- BrowserWindow security: `nodeIntegration:false`, `contextIsolation:true` — avoid preload unless needed.
- If port busy (EADDRINUSE), change `PORT` in `.env`.

## Safe extension patterns
- New control: add helper near `triggerClip` → new `/api/*` route → UI call in `public/app.js` (1-based in/out).
- New monitoring: extend `parseCompositionStatus` minimally; keep SSE keys backward compatible.
- UI tweaks: extend `buildGridFromComposition`/`buildDeck`; preserve existing CSS hooks/ARIA roles.
