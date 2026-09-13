export const PAGE_WIDTH = 1.05;
export const PAGE_HEIGHT = 1.48;

/** Segments across the width — enough to bend convincingly without a dense mesh. */
export const PAGE_SEGMENTS_X = 20;
/** Segments across the height — pages bend mainly along the width, so few are needed. */
export const PAGE_SEGMENTS_Y = 4;

export const SHEET_THICKNESS = 0.012;
export const CURL_STRENGTH = 0.28;
export const REDUCED_MOTION_CURL = 0.04;

export const TURN_DURATION_MS = 700;
export const REDUCED_MOTION_DURATION_MS = 160;

/** Bounded DPR keeps GPU cost predictable on high-density displays. */
export const CANVAS_DPR: [number, number] = [1, 1.75];

/** Keep OrbitControls off by default; only flip for local camera-framing debugging. */
export const ENABLE_ORBIT_CONTROLS = false;

export const SCENE_BACKGROUND = '#f4f7f7';
export const SPINE_COLOR = '#007a73';
export const BOARD_COLOR = '#005a55';
