import { loadImageElement } from '../conversion/imageService';

export type DimensionUnit = 'px' | 'mm' | 'cm' | 'in';
export type ResizeFitMode = 'contain' | 'cover' | 'stretch';

export interface ImageResizeConfig {
  unit: DimensionUnit;
  width: number;
  height: number;
  dpi: number;
  lockAspectRatio: boolean;
  fitMode: ResizeFitMode;
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  quality: number; // 0.1 to 1.0
  backgroundColor?: string;
}

export interface ResizeResult {
  blob: Blob;
  url: string;
  widthPx: number;
  heightPx: number;
  originalSizeBytes: number;
  newSizeBytes: number;
  format: string;
}

export function unitToPixels(val: number, unit: DimensionUnit, dpi: number): number {
  switch (unit) {
    case 'px':
      return Math.round(val);
    case 'in':
      return Math.round(val * dpi);
    case 'cm':
      return Math.round((val / 2.54) * dpi);
    case 'mm':
      return Math.round((val / 25.4) * dpi);
  }
}

export function pixelsToUnit(px: number, unit: DimensionUnit, dpi: number): number {
  switch (unit) {
    case 'px':
      return Math.round(px);
    case 'in':
      return Math.round((px / dpi) * 100) / 100;
    case 'cm':
      return Math.round(((px / dpi) * 2.54) * 100) / 100;
    case 'mm':
      return Math.round(((px / dpi) * 25.4) * 10) / 10;
  }
}

export async function processImageResize(
  file: File,
  config: ImageResizeConfig
): Promise<ResizeResult> {
  const img = await loadImageElement(file);
  const targetWidthPx = Math.max(1, unitToPixels(config.width, config.unit, config.dpi));
  const targetHeightPx = Math.max(1, unitToPixels(config.height, config.unit, config.dpi));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidthPx;
  canvas.height = targetHeightPx;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not obtain canvas 2D context');

  // Fill canvas background if JPG or custom background specified
  if (config.format === 'image/jpeg' || config.backgroundColor) {
    ctx.fillStyle = config.backgroundColor || '#FFFFFF';
    ctx.fillRect(0, 0, targetWidthPx, targetHeightPx);
  }

  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  const srcAspect = srcW / srcH;
  const targetAspect = targetWidthPx / targetHeightPx;

  if (config.fitMode === 'stretch') {
    ctx.drawImage(img, 0, 0, targetWidthPx, targetHeightPx);
  } else if (config.fitMode === 'contain') {
    let drawW = targetWidthPx;
    let drawH = drawW / srcAspect;
    if (drawH > targetHeightPx) {
      drawH = targetHeightPx;
      drawW = drawH * srcAspect;
    }
    const offsetX = (targetWidthPx - drawW) / 2;
    const offsetY = (targetHeightPx - drawH) / 2;
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  } else if (config.fitMode === 'cover') {
    let drawW = targetWidthPx;
    let drawH = drawW / srcAspect;
    if (drawH < targetHeightPx) {
      drawH = targetHeightPx;
      drawW = drawH * srcAspect;
    }
    const offsetX = (targetWidthPx - drawW) / 2;
    const offsetY = (targetHeightPx - drawH) / 2;
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (b) => resolve(b!),
      config.format,
      config.format === 'image/png' ? undefined : config.quality
    );
  });

  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    widthPx: targetWidthPx,
    heightPx: targetHeightPx,
    originalSizeBytes: file.size,
    newSizeBytes: blob.size,
    format: config.format,
  };
}
