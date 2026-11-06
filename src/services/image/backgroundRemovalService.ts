/**
 * Background Detection & Colour Replacement Engine
 * Performs client-side, edge-aware chroma and flood-fill segmentation
 * to replace or remove backgrounds while preserving person/object foreground.
 */

export interface BackgroundChangerOptions {
  backgroundColor: string; // Hex color (e.g. '#FFFFFF', '#38BDF8', or 'transparent')
  tolerance: number; // 5 to 100 (color distance threshold)
  edgeSmoothness: number; // 0 to 10 (feathering / anti-aliasing radius in pixels)
  format: 'image/png' | 'image/jpeg';
  quality: number; // 0.7 to 1.0 for jpeg
  manualSampleColor?: { r: number; g: number; b: number } | null;
  mode?: 'flood' | 'global'; // 'flood' starts from borders (prevents erasing matching shirt); 'global' removes everywhere
}

export interface SegmentationResult {
  outputBlob: Blob;
  outputUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  canvas: HTMLCanvasElement;
}

export interface ColorSwatch {
  id: string;
  label: string;
  value: string;
  textColor?: string;
  isTransparent?: boolean;
}

export const PRESET_BACKGROUND_COLORS: ColorSwatch[] = [
  { id: 'transparent', label: 'Transparent', value: 'transparent', isTransparent: true },
  { id: 'white', label: 'Crisp White', value: '#FFFFFF', textColor: '#0F172A' },
  { id: 'off-white', label: 'Light Studio', value: '#F8FAFC', textColor: '#0F172A' },
  { id: 'navy', label: 'HPS Navy', value: '#142B50', textColor: '#FFFFFF' },
  { id: 'sky-blue', label: 'Passport Sky Blue', value: '#38BDF8', textColor: '#0F172A' },
  { id: 'neutral-grey', label: 'Neutral Grey', value: '#94A3B8', textColor: '#0F172A' },
  { id: 'light-grey', label: 'Studio Grey', value: '#E2E8F0', textColor: '#0F172A' },
  { id: 'forest-green', label: 'Forest Green', value: '#10B981', textColor: '#FFFFFF' },
  { id: 'emerald', label: 'Dark Emerald', value: '#065F46', textColor: '#FFFFFF' },
  { id: 'peach', label: 'Warm Peach', value: '#FDBA74', textColor: '#0F172A' },
  { id: 'sunset', label: 'Sunset Coral', value: '#FB923C', textColor: '#FFFFFF' },
  { id: 'crimson', label: 'Crimson Red', value: '#EF4444', textColor: '#FFFFFF' },
  { id: 'royal-purple', label: 'Royal Purple', value: '#8B5CF6', textColor: '#FFFFFF' },
  { id: 'charcoal', label: 'Dark Charcoal', value: '#1E293B', textColor: '#FFFFFF' },
  { id: 'black', label: 'Deep Black', value: '#000000', textColor: '#FFFFFF' },
];

/**
 * Parses Hex or color string to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  if (hex === 'transparent') {
    return { r: 0, g: 0, b: 0 };
  }
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 255, g: 255, b: 255 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Calculates Euclidean color distance with perceptual weighting
 */
function colorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  // Redmean color difference (fast, perceptually accurate approximation of Delta E)
  const rmean = (r1 + r2) / 2;
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(
    (((512 + rmean) * dr * dr) >> 8) +
      4 * dg * dg +
      (((767 - rmean) * db * db) >> 8)
  );
}

/**
 * Automatically samples the dominant background color from image corners
 */
export function detectBackgroundColor(
  imgData: ImageData,
  sampleRadius = 6
): { r: number; g: number; b: number } {
  const { width, height, data } = imgData;
  const samples: { r: number; g: number; b: number }[] = [];

  // Corner sampling regions
  const corners = [
    { x: 0, y: 0 },
    { x: Math.max(0, width - sampleRadius), y: 0 },
    { x: 0, y: Math.max(0, height - sampleRadius) },
    { x: Math.max(0, width - sampleRadius), y: Math.max(0, height - sampleRadius) },
    { x: Math.floor(width / 2), y: 0 }, // Top edge center
  ];

  for (const corner of corners) {
    for (let dx = 0; dx < sampleRadius; dx++) {
      for (let dy = 0; dy < sampleRadius; dy++) {
        const x = Math.min(width - 1, corner.x + dx);
        const y = Math.min(height - 1, corner.y + dy);
        const idx = (y * width + x) * 4;
        // Ignore fully transparent pixels if input has alpha
        if (data[idx + 3] > 20) {
          samples.push({
            r: data[idx],
            g: data[idx + 1],
            b: data[idx + 2],
          });
        }
      }
    }
  }

  if (samples.length === 0) {
    return { r: 255, g: 255, b: 255 }; // Default white
  }

  // Compute average of sampled pixels
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  for (const s of samples) {
    totalR += s.r;
    totalG += s.g;
    totalB += s.b;
  }

  return {
    r: Math.round(totalR / samples.length),
    g: Math.round(totalG / samples.length),
    b: Math.round(totalB / samples.length),
  };
}

/**
 * Performs intelligent background replacement on a canvas image
 */
export async function replaceImageBackground(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  options: BackgroundChangerOptions
): Promise<SegmentationResult> {
  const {
    backgroundColor,
    tolerance = 32,
    edgeSmoothness = 2,
    format = 'image/png',
    quality = 0.95,
    manualSampleColor = null,
    mode = 'flood',
  } = options;

  const width = imageSource instanceof HTMLImageElement ? imageSource.naturalWidth || imageSource.width : imageSource.width;
  const height = imageSource instanceof HTMLImageElement ? imageSource.naturalHeight || imageSource.height : imageSource.height;

  // Working canvas
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = width;
  srcCanvas.height = height;
  const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
  if (!srcCtx) throw new Error('Could not initialize canvas context');

  srcCtx.drawImage(imageSource, 0, 0, width, height);
  const srcImgData = srcCtx.getImageData(0, 0, width, height);
  const srcData = srcImgData.data;

  // Determine reference background color
  const targetBg = manualSampleColor || detectBackgroundColor(srcImgData);

  // Scaled threshold based on 0-100 tolerance slider (scale max distance ~ 450)
  const maxThreshold = (tolerance / 100) * 260 + 10;
  const softRange = Math.max(4, edgeSmoothness * 6);

  // Mask array: 0 = background (replaced), 255 = foreground (kept)
  const mask = new Uint8Array(width * height);

  if (mode === 'flood') {
    // Flood-fill connected component starting from all 4 borders
    // This prevents wiping out matching colors inside the subject (e.g. eye color, shirt)
    const visited = new Uint8Array(width * height);
    const queue: number[] = [];

    // Push boundary pixels to queue
    for (let x = 0; x < width; x++) {
      queue.push(x); // Top row
      queue.push((height - 1) * width + x); // Bottom row
    }
    for (let y = 1; y < height - 1; y++) {
      queue.push(y * width); // Left col
      queue.push(y * width + (width - 1)); // Right col
    }

    // Default all mask to foreground (255)
    mask.fill(255);

    let head = 0;
    while (head < queue.length) {
      const p = queue[head++];
      if (visited[p]) continue;
      visited[p] = 1;

      const px = p % width;
      const py = Math.floor(p / width);
      const dataIdx = p * 4;

      const r = srcData[dataIdx];
      const g = srcData[dataIdx + 1];
      const b = srcData[dataIdx + 2];
      const a = srcData[dataIdx + 3];

      // If already transparent in source, it's definitely background
      if (a < 20) {
        mask[p] = 0;
      } else {
        const dist = colorDistance(r, g, b, targetBg.r, targetBg.g, targetBg.b);
        if (dist <= maxThreshold) {
          // It's background
          mask[p] = 0;

          // Expand to 4 neighbors
          if (px > 0 && !visited[p - 1]) queue.push(p - 1);
          if (px < width - 1 && !visited[p + 1]) queue.push(p + 1);
          if (py > 0 && !visited[p - width]) queue.push(p - width);
          if (py < height - 1 && !visited[p + width]) queue.push(p + width);
        } else if (dist < maxThreshold + softRange) {
          // Soft boundary pixel
          const factor = (dist - maxThreshold) / softRange;
          mask[p] = Math.round(factor * 255);
        }
      }
    }
  } else {
    // Global color distance mode
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      const a = srcData[idx + 3];
      if (a < 20) {
        mask[i] = 0;
      } else {
        const dist = colorDistance(
          srcData[idx],
          srcData[idx + 1],
          srcData[idx + 2],
          targetBg.r,
          targetBg.g,
          targetBg.b
        );
        if (dist <= maxThreshold) {
          mask[i] = 0;
        } else if (dist < maxThreshold + softRange) {
          const factor = (dist - maxThreshold) / softRange;
          mask[i] = Math.round(factor * 255);
        } else {
          mask[i] = 255;
        }
      }
    }
  }

  // Create Output Canvas
  const outCanvas = document.createElement('canvas');
  outCanvas.width = width;
  outCanvas.height = height;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) throw new Error('Could not create output canvas');

  const isTransparent = backgroundColor === 'transparent' && format === 'image/png';
  const newBgRgb = hexToRgb(backgroundColor);

  // Prepare destination image data
  const outImgData = outCtx.createImageData(width, height);
  const outData = outImgData.data;

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    const fgWeight = mask[i] / 255; // 0 to 1
    const bgWeight = 1 - fgWeight;

    const srcR = srcData[idx];
    const srcG = srcData[idx + 1];
    const srcB = srcData[idx + 2];
    const srcA = srcData[idx + 3] / 255;

    if (isTransparent) {
      outData[idx] = srcR;
      outData[idx + 1] = srcG;
      outData[idx + 2] = srcB;
      outData[idx + 3] = Math.round(fgWeight * srcA * 255);
    } else {
      // Blend foreground with new background color
      outData[idx] = Math.round(srcR * fgWeight + newBgRgb.r * bgWeight);
      outData[idx + 1] = Math.round(srcG * fgWeight + newBgRgb.g * bgWeight);
      outData[idx + 2] = Math.round(srcB * fgWeight + newBgRgb.b * bgWeight);
      outData[idx + 3] = 255; // Solid background for JPG or solid PNG
    }
  }

  outCtx.putImageData(outImgData, 0, 0);

  // Generate output blob
  const targetMime = format === 'image/jpeg' ? 'image/jpeg' : 'image/png';
  const blob = await new Promise<Blob>((resolve, reject) => {
    outCanvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to create image blob'));
      },
      targetMime,
      targetMime === 'image/jpeg' ? quality : undefined
    );
  });

  return {
    outputBlob: blob,
    outputUrl: URL.createObjectURL(blob),
    width,
    height,
    sizeBytes: blob.size,
    canvas: outCanvas,
  };
}
