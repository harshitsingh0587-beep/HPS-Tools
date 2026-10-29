import { loadImageElement } from '../conversion/imageService';
import { jsPDF } from 'jspdf';

export interface PassportPreset {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  description: string;
}

export const PASSPORT_PRESETS: PassportPreset[] = [
  {
    id: '35x45',
    name: '35 × 45 mm (EU / UK / India / Australia / International)',
    widthMm: 35,
    heightMm: 45,
    description: 'Standard biometric passport and visa size for Schengen, UK, India, Australia, Canada, etc.',
  },
  {
    id: '2x2',
    name: '2 × 2 inches / 51 × 51 mm (United States / India OCI)',
    widthMm: 50.8,
    heightMm: 50.8,
    description: 'Standard US Passport, US Visa, Diversity Visa, and Indian OCI requirements.',
  },
  {
    id: '33x48',
    name: '33 × 48 mm (China Visa / Passport)',
    widthMm: 33,
    heightMm: 48,
    description: 'Official standard for Chinese visas and passports.',
  },
  {
    id: 'custom',
    name: 'Custom Dimensions',
    widthMm: 35,
    heightMm: 45,
    description: 'Specify custom millimeter width and height.',
  },
];

export interface PassportSettings {
  presetId: string;
  widthMm: number;
  heightMm: number;
  dpi: number; // 300 default
  zoom: number; // 0.5 to 3
  rotation: number; // degrees -180 to 180
  offsetX: number; // pan X
  offsetY: number; // pan Y
  backgroundColor: 'original' | 'white' | 'light-grey' | 'transparent';
  format: 'image/jpeg' | 'image/png';
  quality: number; // 0.1 to 1.0
}

/**
 * Calculates pixel dimensions for mm at specified DPI
 * 1 inch = 25.4 mm
 */
export function mmToPixels(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi);
}

/**
 * Renders the processed passport photo onto an offscreen canvas
 */
export async function renderPassportPhoto(
  file: File | string,
  settings: PassportSettings
): Promise<{
  canvas: HTMLCanvasElement;
  blob: Blob;
  url: string;
  widthPx: number;
  heightPx: number;
  sizeBytes: number;
}> {
  const img = await loadImageElement(file);
  const targetWidth = mmToPixels(settings.widthMm, settings.dpi);
  const targetHeight = mmToPixels(settings.heightMm, settings.dpi);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context failed');

  // Background Fill
  if (settings.backgroundColor === 'white') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else if (settings.backgroundColor === 'light-grey') {
    ctx.fillStyle = '#F3F4F6';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else if (settings.backgroundColor === 'transparent' && settings.format === 'image/jpeg') {
    // JPEG cannot be transparent, default to clean white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // Draw photo with transform (center, scale, rotate, translate)
  ctx.save();
  ctx.translate(targetWidth / 2 + settings.offsetX, targetHeight / 2 + settings.offsetY);
  ctx.rotate((settings.rotation * Math.PI) / 180);
  ctx.scale(settings.zoom, settings.zoom);

  // Center the image relative to origin
  const imgAspect = img.width / img.height;
  const canvasAspect = targetWidth / targetHeight;

  let drawW = targetWidth;
  let drawH = targetHeight;

  if (imgAspect > canvasAspect) {
    drawH = targetHeight;
    drawW = drawH * imgAspect;
  } else {
    drawW = targetWidth;
    drawH = drawW / imgAspect;
  }

  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob(
      (b) => resolve(b!),
      settings.format,
      settings.format === 'image/jpeg' ? settings.quality : undefined
    );
  });

  const url = URL.createObjectURL(blob);

  return {
    canvas,
    blob,
    url,
    widthPx: targetWidth,
    heightPx: targetHeight,
    sizeBytes: blob.size,
  };
}

/**
 * Creates a printable sheet (4x6 inch / 10x15 cm photo paper) with multiple passport photos
 */
export async function generatePrintableSheet(
  singlePhotoCanvas: HTMLCanvasElement,
  photoWidthMm: number,
  photoHeightMm: number
): Promise<{ blob: Blob; url: string; pdfUrl: string; copies: number }> {
  // 4 x 6 inch sheet at 300 DPI
  const sheetWidthMm = 152.4; // 6 inches
  const sheetHeightMm = 101.6; // 4 inches
  const dpi = 300;

  const sheetCanvas = document.createElement('canvas');
  sheetCanvas.width = mmToPixels(sheetWidthMm, dpi); // 1800 px
  sheetCanvas.height = mmToPixels(sheetHeightMm, dpi); // 1200 px

  const ctx = sheetCanvas.getContext('2d');
  if (!ctx) throw new Error('Sheet canvas failed');

  // Solid white photo paper
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);

  const photoWidthPx = mmToPixels(photoWidthMm, dpi);
  const photoHeightPx = mmToPixels(photoHeightMm, dpi);
  const marginPx = mmToPixels(8, dpi);
  const gapPx = mmToPixels(4, dpi);

  const availableWidth = sheetCanvas.width - marginPx * 2;
  const availableHeight = sheetCanvas.height - marginPx * 2;

  const cols = Math.floor((availableWidth + gapPx) / (photoWidthPx + gapPx));
  const rows = Math.floor((availableHeight + gapPx) / (photoHeightPx + gapPx));
  const totalCopies = cols * rows;

  const startX = (sheetCanvas.width - (cols * photoWidthPx + (cols - 1) * gapPx)) / 2;
  const startY = (sheetCanvas.height - (rows * photoHeightPx + (rows - 1) * gapPx)) / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * (photoWidthPx + gapPx);
      const y = startY + r * (photoHeightPx + gapPx);

      ctx.drawImage(singlePhotoCanvas, x, y, photoWidthPx, photoHeightPx);

      // Subtle cutting guide border
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, photoWidthPx, photoHeightPx);
    }
  }

  // Printable Image Blob
  const imageBlob = await new Promise<Blob>((res) => sheetCanvas.toBlob((b) => res(b!), 'image/jpeg', 0.98));
  const url = URL.createObjectURL(imageBlob);

  // Also build PDF sheet
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [sheetHeightMm, sheetWidthMm],
  });
  pdf.addImage(url, 'JPEG', 0, 0, sheetWidthMm, sheetHeightMm);
  const pdfBlob = pdf.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);

  return {
    blob: imageBlob,
    url,
    pdfUrl,
    copies: totalCopies,
  };
}
