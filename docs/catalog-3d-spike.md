# Catalog 3D technical spike

This document describes the `/3d-lab` experiment. It is not a Three.js tutorial and not the production catalog.

The public entry point is `Catalog3D`. All Three.js, React Three Fiber, and Drei code stays inside `src/features/catalog-3d`. The homepage and marketing layout do not import this feature.

## Scene concepts

These are the pieces used in this implementation, explained as they apply here:

- **Canvas** (`CatalogCanvas.tsx`) is the React Three Fiber root. It owns the WebGL renderer and is loaded via `next/dynamic` with `ssr: false`, so it never runs on the server and is only downloaded when `/3d-lab` is visited.
- **Scene** (`CatalogScene.tsx`) is everything placed inside that Canvas: lights, the camera rig, the book, and a ground plane that only exists to catch the shadow.
- **Camera** is a fixed presentation camera (`CameraRig.tsx`). It is not a generic orbiting viewer — position and look-at target are set in `catalog-scene.ts` so the user always sees a designed angle. `ENABLE_ORBIT_CONTROLS` can enable `OrbitControls` for local debugging; it stays `false` in the shipped experience.
- **Mesh** — each sheet is one `SkinnedMesh`: a segmented box whose vertices follow a bone chain. There is no separate spine mesh or base board.
- **Light** is a small set: ambient + hemisphere for soft fill, one shadow-casting directional key light, and a weak second directional light to lift the shadow side. No environment map, no post-processing.
- **`useFrame`** is the per-frame render loop callback. It dampens bone rotations, group yaw, and material highlights directly on Three.js objects — no React re-render happens during a page turn.

## Skinned book engine

### Why the old engine was replaced

The first spike bent pages by rewriting vertex positions every frame (`deform-page.ts` over a segmented `PlaneGeometry`). That approach was useful for proving the lab architecture, but it produced too many visual inconsistencies for production-quality page turning: rigid outer regions, awkward mid-turn shapes, and no real page thickness.

The current engine replaces direct vertex deformation with **skeletal animation**: each sheet is a `SkinnedMesh` bound to a hierarchical **bone chain** and a **Skeleton**. Curvature is applied by rotating bones inside `useFrame`, not by mutating geometry buffers.

### Geometry

Each sheet is built in `page-geometry.ts` as a **`BoxGeometry`**, not a zero-thickness plane:

| Parameter                | Value                   |
| ------------------------ | ----------------------- |
| Width × height           | 1.28 × 1.71 world units |
| Horizontal segments      | 30                      |
| Vertical segments        | 2                       |
| Paper depth              | 0.004                   |
| Cover / back-cover depth | 0.015                   |

The geometry is translated so its **local origin sits at the spine** (`x = 0`). The page extends toward **positive local X** — the same frame the bone chain and bend math use.

Geometries are **shared by depth** in `Book.tsx`: all plain pages reuse one buffer, covers reuse another. `Book.tsx` disposes owned geometries on unmount.

A box rather than a plane gives:

- **Visible edges** — four extruded side faces with paper/board edge colours.
- **Separate front/back faces** — the two printed artwork slots of the box.
- **Real stacking** — closed and open books read as physical stacks, not infinitely thin cards.
- **Stable skinning** — vertices along X map cleanly onto the horizontal bone chain.

### Skinning

For a React developer new to Three.js, these are the pieces that matter in _this_ engine:

| Concept          | Role here                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bone**         | An invisible joint in the skeleton. Rotating a bone moves every vertex weighted to it.                                                          |
| **Skeleton**     | The ordered list of bones bound to one mesh.                                                                                                    |
| **SkinnedMesh**  | A mesh whose vertices are deformed on the GPU from bone transforms + skin weights, instead of by rewriting `position` attributes in JavaScript. |
| **`skinIndex`**  | For each vertex, up to four bone indices that influence it. Stored as a buffer attribute on the geometry.                                       |
| **`skinWeight`** | How much each of those four bones contributes (weights sum to 1). Stored alongside `skinIndex`.                                                 |

Implementation (`lib/skinning.ts`, attached in `page-geometry.ts`):

- **31 bones** for **30 horizontal segments** — one bone per segment boundary, including both ends.
- Each vertex blends between the **two neighbouring bones** along X.
- `positionInSegments = x / segmentWidth`; inner bone = floor of that value; blend = fractional part.
- Weights: `(1 − blend)` on the inner bone, `blend` on the outer bone.
- The two unused influence slots are pinned to bone 0 with weight 0 (Three.js allows four influences per vertex).

Because neighbouring vertices share bones with smoothly shifting weights, a rotation distributed across the chain reads as one continuous curve instead of visible facets.

### Bone hierarchy

Built in `page-skeleton.ts`:

```text
bone 0 (spine, x = 0)
  └─ bone 1 (+segmentWidth along X)
      └─ bone 2
          └─ …
              └─ bone 30 (outer edge)
```

Each child is parented to the previous bone and offset by `PAGE_WIDTH / PAGE_SEGMENTS_X` along local X. Because the chain is hierarchical, small rotations accumulate into a smooth bend along the sheet.

Two levels carry rotation:

- **Group yaw** (`BookSheet` outer group, and bone 0's share applied there) — whole-sheet resting position (±90° around the spine), fan offset, and closed-book snap.
- **Bone rotations** — local curvature: inside/outside resting curve, turning arch, and X-axis fold.

`SkinnedMesh.raycast` caches a CPU-side bounding sphere from the rest pose, which breaks once the sheet bends. The engine sets `frustumCulled = false` and assigns one conservative pose-independent `boundingSphere` centred at the spine so clicks stay reliable.

### Page pose

Pose math lives in `lib/page-pose.ts` as plain functions (no Three.js, no React) so it can be reasoned about and later unit-tested.

#### Resting curvature — inside and outside curves

When a sheet rests open, its target yaw (±90°) is split across the bone chain as **normalised shares** that sum to 1, so the outer edge reaches exactly the target angle:

- **Inside curve** — quarter-cosine strongest near the spine, fading over the first ~30% of the sheet (`SPINE_CURVE_SPAN`). Creates the bend where paper leaves the binding.
- **Outside curve** — gentle sine hump over the remainder so the outer half does not read as a flat board.

Weights are controlled by `insideCurveStrength` and `outsideCurveStrength` in `book-engine.ts`.

#### Turning curve

A **temporary arch** during an active flip:

- Zero at rest, peaks mid-turn, returns to zero.
- Sine distribution across bones (strongest in the middle of the sheet).
- Driven by a per-sheet **turning pulse** (see Animation).

Scaled by `turningCurveStrength` and the sheet's `turnCurveScale` (lower for covers).

#### Fold

A subtle **X-axis twist** on outer bones only, starting past `FOLD_SPAN_START` (~45% from the spine). Peaks mid-turn via the same pulse, zero at rest. Scaled by `foldStrength`. Covers use a reduced `turnCurveScale`.

#### Turning pulse

When a sheet's `turned` state changes, `BookSheet` records a timestamp. `turningPulse(elapsedMs, turningPulseMs)` returns a sine hump: 0 → 1 → 0 over the configured duration. It drives both the turning arch and the fold.

#### Cover hinge behaviour

Covers are not special-cased by index. Their `SheetSurface` in `book-engine.ts` sets:

- Greater **depth** (0.015 vs 0.004).
- **`hingeShare`** — fraction of resting rotation concentrated at the binding joint instead of spread as paper curve.
- Lower **`turnCurveScale`** — less transient arch/fold during a flip.
- Lower **roughness** and darker **edge colour**.

#### Page fan

While the book is open, each sheet gets a small index-based yaw offset (`FAN_STEP_RAD`) so stacked pages fan slightly instead of occupying the same plane. No fan is applied when the book is closed.

#### Stack offsets

Sheets are separated along their local normal to avoid z-fighting. `cumulativeSheetDepths` sums each sheet's thickness plus `SHEET_STACK_GAP`; `sheetStackOffset` places each sheet in its stack relative to the displayed position. The offset is applied as `position-z` on the mesh inside the rotated sheet group.

#### Scene framing

`bookFramingOffsetX` shifts the whole book horizontally when closed so the visible side stays centred (half a page width toward the closed side). Open spreads need no offset.

### Animation

All motion runs in **`useFrame`** (`BookSheet.tsx`, framing in `Book.tsx`):

- **`maath/easing`** — `dampAngle` for bone/group yaw and fold; `damp` for emissive highlight and framing offset.
- **Frame-rate independent** — smooth times are in seconds; `delta` comes from the R3F clock.
- **Interruptible** — damping chases a moving target every frame, so rapid navigation retargets smoothly without resetting an animation timeline.
- **No React state in the frame loop** — only Three.js objects and refs are mutated. React state holds navigation (`targetPosition`, `displayedPosition`) and hover boolean; everything else is imperative.

Bone 0 sits exactly at the pivot, so its resting share is applied to the **sheet group** rather than the bone object — same rotation, but the group also carries stack offset and pointer handlers.

When the book is closed, all bone rotations collapse: only the group carries the flat-stack yaw, fold goes to zero.

### Navigation model

Content is defined in `config/catalog-sheets.ts`. Each entry is one physical sheet: `{ id, title, front, back, type }`. The renderer consumes URLs and surface type only — replacing artwork does not require engine changes.

#### Position domain

```text
0           = front cover closed, nothing turned
1 … N−1     = first k sheets turned (k = position)
N           = back cover closed, everything turned
```

For `N` sheets there are **`N + 1` valid positions** (0 through `sheetCount`).

#### Target vs displayed

Managed by `useCatalogNavigation.ts`:

| State                   | Meaning                                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| **`targetPosition`**    | Where the user asked to go. Updates immediately on button click, direct position selection, or sheet click. |
| **`displayedPosition`** | Where the physical book currently is. Walks toward the target one position at a time.                       |

Diagnostics and controls in `/3d-lab` show both values.

#### Sequential multi-page navigation

A jump such as `0 → 5` does **not** flip every sheet at once. The displayed position steps:

```text
0 → 1 → 2 → 3 → 4 → 5
```

Delay between steps comes from `sequentialStepDelayMs` in `lib/navigation.ts`:

- **Near** (~190 ms) for moves of one or two positions.
- **Far** (~70 ms) for longer jumps, so a six-page jump does not feel six times slower than a one-page move.

A single `setTimeout` is recreated after each step. If the user changes the target mid-sequence, the pending timer is cleared and the next step is recomputed toward the new target — no race conditions. The timer is cleaned up on unmount.

Pure helpers in `lib/navigation.ts` also provide bounds clamping, closed-book detection, sheet-turned checks, click-to-position mapping, and Persian position labels shared by controls and fallback.

### RTL / LTR

```ts
type BookDirection = 'rtl' | 'ltr';
```

Noskhe Sabz defaults to **`rtl`** via `BOOK_DIRECTION` in `book-engine.ts`. Switching to `'ltr'` should not require rewriting the engine — only the config value.

All direction-sensitive signs derive from **`directionSign()`** in `lib/page-pose.ts`:

- `rtl` → `-1` (right-bound Persian book: binding on the right, sheets rest to the left, pages turn left-to-right).
- `ltr` → `+1` (left-bound Western book: mirrored).

Direction affects:

- **Resting page yaw** and which side ±90° corresponds to.
- **Fan direction** — index-based spread sign.
- **Stack offset** — which way sheets pile relative to the camera.
- **Click semantics** — which canvas side moves forward vs backward (`positionForSheetClick`).
- **Texture face assignment** — `faceSlotsForDirection` swaps front/back onto ±Z because mirroring a book is not a rotation; artwork must swap sides to keep content order correct.
- **Scene framing** — closed-book horizontal centreing sign.

The book group applies a fixed **`BOOK_BASE_YAW`** (−90°) so a sheet passing through yaw 0 during a turn sweeps toward the camera regardless of binding.

### Textures and color space

Placeholder artwork lives in `/public/catalog-spike/` as local SVGs. Three.js `TextureLoader` cannot reliably turn SVG into a GPU texture, so `SvgTextureLoader` (`load-svg-texture.ts`) rasterizes each file:

```text
SVG → fetch → 2D canvas draw → CanvasTexture → SRGBColorSpace
```

Current rasterization size: **512 × 720**. **`anisotropy = 4`** is set on the texture.

**Why the loader owns configuration:** `eslint-plugin-react-hooks` (React Compiler rules in `eslint-config-next` 16) rejects mutating objects returned from hooks such as `useLoader`. Because `SvgTextureLoader` creates a fresh `CanvasTexture` and sets `colorSpace` and `anisotropy` inside the loader module — before any React component touches it — no component mutates a hook result and no ESLint rule is suppressed.

`Book.tsx` loads textures via `useLoader(SvgTextureLoader, urls)` inside `<Suspense>`. Final production artwork may use PNG/WebP at higher resolution or a different loading strategy; the engine only needs sRGB `Texture` instances on the face materials.

### Resource ownership

| Resource                         | Created by          | Owned by              | Disposed                                                                      |
| -------------------------------- | ------------------- | --------------------- | ----------------------------------------------------------------------------- |
| Shared `BoxGeometry` (per depth) | `page-geometry.ts`  | `Book.tsx`            | `geometry.dispose()` on unmount                                               |
| Page materials                   | `page-materials.ts` | `BookSheet.tsx`       | `disposePageMaterials()` in effect cleanup                                    |
| `SkinnedMesh` + `Skeleton`       | `page-skeleton.ts`  | `BookSheet.tsx`       | `disposeSkinnedPage()` → `skeleton.dispose()`                                 |
| Textures                         | `SvgTextureLoader`  | R3F `useLoader` cache | Not disposed per sheet — shared across all sheets that reference the same URL |

Materials are per sheet (each has its own hover emissive state). Textures are cached globally by the loader, so disposing them when one sheet unmounts would break siblings.

### Reduced motion

When `prefers-reduced-motion: reduce` is active, `resolveBookMotion(true)` in `book-engine.ts` applies:

- Shorter damping times (~0.1 s vs ~0.4 s).
- Shorter turning pulse (~140 ms vs ~520 ms).
- Lower turning arch and fold strength.
- Shorter sequential step delays.

Navigation remains fully functional — the catalog is not disabled.

### Performance

Current intentional limits:

- **Shared geometry** — two `BoxGeometry` instances (paper depth + cover depth), not one per sheet.
- **No React state in `useFrame`** — bone rotations, group yaw, highlights, and framing offset only.
- **Bounded DPR** — `CANVAS_DPR = [1, 1.75]` in `catalog-scene.ts`.
- **One main shadow-casting light** — 1024×1024 shadow map, tight orthographic frustum.
- **No post-processing**, no environment map.
- **Memoised curve shares** — resting, turning, and fold distributions computed once per sheet type.
- **Viewport-derived scale** — `CatalogScene.tsx` fits the open book to the visible frame instead of hard-coded breakpoints.

Likely future costs if this grows toward production: more sheets (more draw calls), larger print-quality artwork, and any temptation to add bloom or depth-of-field — all should be re-measured on real device targets before landing-page integration.

### Current limitations

- **Placeholder artwork** — SVG rasterization at 512×720 uses basic font shaping; Persian text is legible but not print quality.
- **Mid-turn lighting** — the back face of a turning sheet can appear darker because the key light comes from above-right; fill was tuned but not perfect.
- **Hover cursor quirk** — clicking a sheet clears hover state; if the pointer does not move, the cursor may stay `auto` until the pointer re-enters the mesh (R3F internal hover tracking).
- **Real-device profiling not done yet** — lab QA used headless Edge + CDP; frame time on mid-range Android hardware is unknown.
- **Catalog content not on homepage** — `/3d-lab` only; marketing pages do not depend on WebGL.

### React Compiler note

This scene works within React Compiler / `eslint-plugin-react-hooks` rules without disabling them:

- Three.js objects created in `useMemo` are mutated only inside `useFrame` or effects — locally owned objects, not hook return values.
- The camera is positioned declaratively via `<PerspectiveCamera onUpdate={…} />` rather than mutating the object from `useThree()` during render.
- Texture colour space is configured in `SvgTextureLoader`, not on hook-returned textures.

## Production integration path

Before `Catalog3D` can be used on the real landing page:

1. **Final Noskhe Sabz catalog artwork** — replace placeholder SVGs; confirm Persian typesetting stays legible at the presentation camera angle and chosen texture resolution.
2. **Final book visual tuning** — curve strengths, cover stiffness, fan, and fold in `book-engine.ts` against real content.
3. **Real-device profiling** — measure frame time on mid-range Android hardware; adjust segment count, shadow resolution, or DPR if needed.
4. **Camera / lighting in the actual section** — re-tune framing, scale, and lights for a marketing layout instead of the standalone lab page.
5. **Loading UX** — progress or skeleton state beyond the current "در حال آماده‌سازی صحنه" overlay.
6. **Homepage placement decision** — where the book sits in the page structure and how much viewport it receives.
7. **Optional page-flip audio** — explicitly deferred; not implemented in this spike.
8. **Deterministic tests** — add unit tests for `lib/navigation.ts`, `lib/page-pose.ts`, and `lib/skinning.ts` once the project's test stack is introduced.
9. **Integrate without WebGL dependency** — import `Catalog3D` only into the target section via dynamic import; keep `CatalogFallback` and error boundary so core marketing content never depends on Three.js. Verify with bundle analysis that the feature stays on-demand.

Never import this feature into the root layout or a globally rendered provider.
