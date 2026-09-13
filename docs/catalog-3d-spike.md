# Catalog 3D technical spike

This document describes the `/3d-lab` experiment. It is not a Three.js tutorial and not the production catalog.

The public entry point is `Catalog3D`. All Three.js, React Three Fiber, and Drei code stays inside `src/features/catalog-3d`. The homepage and marketing layout do not import this feature.

## Scene concepts

These are the pieces used in this implementation, explained as they apply here:

- **Canvas** (`CatalogCanvas.tsx`) is the React Three Fiber root. It owns the WebGL renderer and is loaded via `next/dynamic` with `ssr: false`, so it never runs on the server and is only downloaded when `/3d-lab` is visited.
- **Scene** (`CatalogScene.tsx`) is everything placed inside that Canvas: lights, the camera rig, the book, and a ground plane that only exists to catch the shadow.
- **Camera** is a fixed presentation camera (`CameraRig.tsx`). It is not a generic orbiting viewer — position and look-at target are set once (and re-set on breakpoint changes) so the user always sees a designed angle. `ENABLE_ORBIT_CONTROLS` in `catalog-scene.ts` can enable `OrbitControls` for local debugging; it stays `false` in the shipped experience.
- **Mesh** is a visible object: each page is two meshes sharing one geometry (front face, and a back face rendered with `side={BackSide}`). The spine and base board are simple boxes.
- **Geometry** for a page is a segmented `PlaneGeometry`, shifted so `x = 0` sits at the spine and `+x` points to the outer edge — this makes the bend math read naturally as "distance from the spine."
- **Material** is `MeshStandardMaterial`. Pages use a local SVG texture; the spine/board use flat colors from `catalog-scene.ts` instead of hardcoded hex values scattered through components.
- **Texture** files live in `/public/catalog-spike/` as local SVG placeholders. Three.js's built-in `TextureLoader` cannot reliably turn SVG into a GPU texture, so `SvgTextureLoader` (`load-svg-texture.ts`) fetches each SVG, rasterizes it to a 512×720 canvas, and returns a `CanvasTexture`. `Book.tsx` loads them via R3F's `useLoader(SvgTextureLoader, urls)` inside `<Suspense>`.
- **Light** is a small set: ambient + hemisphere for soft fill, one shadow-casting directional key light, and a weak second directional light to lift the shadow side. No environment map, no post-processing.
- **`useFrame`** is the per-frame render loop callback. It reads animation progress from a ref and writes directly into the page's geometry buffer — no React re-render happens during a page turn.

## Page turning

A catalog entry in `catalog-pages.ts` is one physical sheet: `{ id, title, front, back }`.

`turnedCount` (React state) is how many sheets currently rest on the left of the spine:

- `turnedCount = 0` — closed, cover showing on the right
- `turnedCount = catalogPages.length` — fully turned, back cover on the left

`pendingTurn` (`'next' | 'prev' | null`, React state) is the in-flight request. While it is non-null, new turn requests are ignored — this is what keeps rapid repeated clicks from corrupting the state (acceptance criterion #9).

**Bend.** `deform-page.ts` exports `deformPagePositions`, a pure function that rewrites a page's vertex positions from a saved rest pose:

1. `progress` runs from `0` (flat, right side) to `1` (flat, left side).
2. Each vertex rotates around the spine by `progress * π`.
3. Before that rotation, a curl offset is added along Z. The curl envelope is `sin(progress * π)` (zero at both ends, strongest mid-turn) multiplied by a per-vertex profile that peaks near the spine and fades to ~0 at the outer edge. This is what makes the page visibly bow instead of swinging like a rigid door.

**Progress calculation.** `Book.tsx` keeps two refs, never React state, for the animation itself:

- `turnState` — `{ sheetIndex, progress }`, read by every `BookPage` each frame.
- `animation` — start/end/elapsed/duration for the current turn.

`useFrame` advances `animation.elapsed` by `delta`, computes `t = elapsed / duration`, eases it with a cubic in-out curve, and writes the eased value into `turnState.progress`. Only when the animation finishes does it call `onTurnSettled(nextCount)`, which is the single `setState` call per turn — matching the requirement to avoid `setState` inside `useFrame`.

**Current page.** Each `BookPage` compares its own `sheetIndex` against `turnState.sheetIndex`: if it's the sheet currently animating, it reads the live progress; otherwise it's fully flat on whichever side `turnedCount` puts it. Clicking the front-most right page or the front-most left page calls the same `onRequestTurn('next' | 'prev')` used by the HTML buttons.

**React Compiler note.** `eslint-plugin-react-hooks` (v7, ships with `eslint-config-next` 16) enforces two rules that affect idiomatic R3F code: it flags mutating a value that traces back to certain hooks (e.g. `useThree()`, `useTexture()`) directly in the component that called them, and it flags reading or writing `ref.current` during render (only effects/`useFrame`/event handlers may touch refs). This scene works within both rules instead of disabling them:

- Per-page geometry is created with `useMemo` and mutated only inside `useFrame` — mutating a **locally-owned** memoized object inside the render loop is fine; the rule blocks mutating component props and hook return/argument values specifically, anywhere in the component, not just during render.
- The camera is positioned declaratively via `<PerspectiveCamera position={...} onUpdate={(camera) => camera.lookAt(...)} />` instead of imperatively calling `.position.set()` / `.lookAt()` on the object returned by `useThree()`.
- Texture `colorSpace`/`anisotropy` are configured inside `SvgTextureLoader` (a plain module, not a React component), where the lint rule does not apply.

## Performance

- Pages use **20 × 4** geometry segments — enough for a visibly smooth curl without a dense mesh (5 sheets × 2 faces × ~200 vertices is trivial for any GPU from the last decade).
- Textures are local SVGs around 512×720px, loaded once and reused; no remote fetches.
- Canvas `dpr` is clamped to `[1, 1.75]` (`CANVAS_DPR`) so 3x/4x mobile displays don't force full-resolution rendering.
- Shadows: a single shadow-casting light with a `1024×1024` map and a tight orthographic shadow-camera frustum sized to the book, instead of scene-wide shadow coverage.
- No post-processing, no environment map, no per-frame React state.

Likely future costs if this grows toward production: more sheets (more textures + draw calls), larger/print-quality artwork, additional lights, and any temptation to add bloom/DOF — all should be re-measured against real device targets before landing-page integration.

## Production path

Before `Catalog3D` can be used on the real landing page:

- Replace the placeholder SVGs with final catalog artwork and confirm Persian typesetting stays legible at the presentation camera angle and at compressed texture resolutions.
- Decide the intended page-turn direction for an RTL context (this spike turns like a conventional demo book; the real catalog may want the mirrored direction).
- Re-tune camera framing, scale, and lighting to sit inside a real marketing section layout instead of the standalone lab page.
- Add texture load progress/skeleton state instead of the current plain "در حال آماده‌سازی صحنه" message.
- Profile actual frame time on mid-range Android hardware; adjust segment count or shadow resolution if needed.
- Verify with Next.js bundle analysis that this feature is still only downloaded on demand once embedded in a real page (not eagerly bundled by a parent that imports too much).
- Add basic tests around turn-state transitions (bounds checking, ignoring requests mid-animation).
- Only then import `Catalog3D` into an actual marketing section — never into the root layout or a globally rendered provider.
