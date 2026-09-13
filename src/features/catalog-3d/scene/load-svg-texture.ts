import { CanvasTexture, Loader, SRGBColorSpace, type LoadingManager, type Texture } from 'three';

const TEXTURE_WIDTH = 512;
const TEXTURE_HEIGHT = 720;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to decode image: ${src}`));
    image.src = src;
  });
}

/**
 * Three.js TextureLoader cannot reliably turn SVG into a GPU texture.
 * This loader fetches the SVG, draws it to a canvas at a fixed size, and
 * returns a CanvasTexture — the same approach browsers use for `<img src="*.svg">`.
 */
async function rasterizeSvg(url: string): Promise<Texture> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch SVG (${response.status}): ${url}`);
  }

  const svgText = await response.text();
  const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);

  try {
    const image = await loadImage(blobUrl);
    const canvas = document.createElement('canvas');
    canvas.width = TEXTURE_WIDTH;
    canvas.height = TEXTURE_HEIGHT;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context is unavailable.');
    }

    context.drawImage(image, 0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}

export class SvgTextureLoader extends Loader {
  constructor(manager?: LoadingManager) {
    super(manager);
  }

  load(
    url: string,
    onLoad: (texture: Texture) => void,
    _onProgress?: (event: ProgressEvent<EventTarget>) => void,
    onError?: (error: unknown) => void,
  ): void {
    void rasterizeSvg(url)
      .then(onLoad)
      .catch((error: unknown) => {
        onError?.(error);
      });
  }
}
