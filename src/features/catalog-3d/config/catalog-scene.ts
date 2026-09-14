import { PAGE_HEIGHT, PAGE_WIDTH } from './book-engine';

/** Bounded DPR keeps GPU cost predictable on high-density displays. */
export const CANVAS_DPR: [number, number] = [1, 1.75];

/** Keep OrbitControls off by default; only flip for local camera-framing debugging. */
export const ENABLE_ORBIT_CONTROLS = false;

export const SCENE_BACKGROUND = '#f4f7f7';

export const CAMERA_FOV = 38;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 40;
export const CAMERA_POSITION: [number, number, number] = [0, 0.62, 3.6];
export const CAMERA_TARGET: [number, number, number] = [0, 0.02, 0];

/** Slight downward tilt of the whole book; yaw stays 0 so RTL and LTR frame identically. */
export const BOOK_TILT_X = -0.14;

/**
 * Bounding box the open book has to fit into, used to derive a responsive
 * scale from the actual visible viewport instead of guessing at breakpoints.
 */
export const BOOK_FIT_WIDTH = PAGE_WIDTH * 2 + 0.5;
export const BOOK_FIT_HEIGHT = PAGE_HEIGHT + 0.55;
export const BOOK_SCALE_RANGE: [min: number, max: number] = [0.42, 1.1];

export const GROUND_OFFSET_Y = -PAGE_HEIGHT / 2 - 0.16;
export const GROUND_SHADOW_OPACITY = 0.15;
