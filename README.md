# Space Shuttle Explorer

A point-and-click 3D exploration of the Space Shuttle Orbiter, built with [three.js](https://threejs.org/) around a NASA 3D Resources model. Drag to rotate, scroll to zoom, and click the glowing markers to learn about seven parts of the orbiter (flight deck, payload bay, wings, tail, OMS pods, main engines, thermal tiles), with Earth visible in the background.

## Files

- **`shuttle-embed.html`** — the main entry point. An arcade-cabinet-style frame (title bar, badge/XP HUD, Prev/Next nav) that embeds the interactive in an iframe. Open this file directly in a browser.
- **`shuttle-interactive.html`** — the interactive itself (can also be opened standalone, without the arcade frame).
- **`shuttle-bundle.js`** — machine-generated bundle (three.js + GLTFLoader + OrbitControls + app logic), built from `shuttle-source.js` with esbuild. Not meant to be hand-edited.
- **`shuttle-source.js`** — the actual readable application source. Edit this, then re-bundle (see below).
- **`model-data.js`** — the 3D shuttle model (glTF, quantized, WebP-textured) embedded as a base64 string, no WebAssembly dependency required.
- **`earth-data.js`** — a NASA Blue Marble Earth texture (via three.js's example assets), embedded as base64, used for the background Earth sphere.

## Viewing it

Everything is self-contained — no server or build step needed to view it. Just open `shuttle-embed.html` in a modern browser (Chrome or Edge recommended).

## Editing

If you want to change hotspot text, positions, colors, or camera behavior, edit `shuttle-source.js`, then rebuild `shuttle-bundle.js`:

```bash
npm install --no-save esbuild three@0.160.0
npx esbuild shuttle-source.js --bundle --format=iife --outfile=shuttle-bundle.js
```

`model-data.js` and `earth-data.js` don't need to change unless you're swapping the 3D model or background texture.

## Why no WebAssembly

An earlier version used Draco/meshopt mesh compression, which requires WebAssembly at runtime. That got blocked by a strict Content Security Policy in one embedding context (`script-src 'self' 'unsafe-inline'` without `unsafe-eval`/`wasm-unsafe-eval`), so the model was rebuilt using glTF mesh quantization instead — larger file size, but works everywhere without needing to compile any WASM.

## Credit

3D model: NASA 3D Resources (Space Shuttle Orbiter exterior). Earth texture: three.js example assets (NASA Blue Marble).
