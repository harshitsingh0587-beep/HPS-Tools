import JSZip from 'jszip';

export interface ImageConversionOptions {
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  quality?: number; // 0.1 to 1.0 (for jpeg/webp)
  fillBackground?: string; // e.g. '#ffffff' for jpg
  width?: number;
  height?: number;
  dpi?: number;
}

export interface ConvertedFileItem {
  id: string;
  originalName: string;
  name: string;
  url: string;
  blob: Blob;
  size: number;
  width: number;
  height: number;
}

/**
 * Loads an image file or URL into an HTMLImageElement
 */
export function loadImageElement(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e));

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('Empty file read'));
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Converts an image file to another format, size, or quality on a canvas
 */
export async function convertImage(
  file: File,
  options: ImageConversionOptions
): Promise<ConvertedFileItem> {
  const img = await loadImageElement(file);
  const canvas = document.createElement('canvas');
  const targetWidth = options.width || img.naturalWidth || img.width;
  const targetHeight = options.height || img.naturalHeight || img.height;

  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create 2D canvas context');

  // Fill background if needed (e.g. converting transparent PNG to JPG)
  if (options.fillBackground && options.format === 'image/jpeg') {
    ctx.fillStyle = options.fillBackground;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // Draw image to canvas
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Determine output extension and mime
  const extension =
    options.format === 'image/png'
      ? 'png'
      : options.format === 'image/webp'
      ? 'webp'
      : 'jpg';

  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const outputFileName = `${baseName}.${extension}`;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Canvas conversion failed'));
      },
      options.format,
      options.quality ?? 0.92
    );
  });

  const url = URL.createObjectURL(blob);

  return {
    id: Math.random().toString(36).substring(2, 9),
    originalName: file.name,
    name: outputFileName,
    url,
    blob,
    size: blob.size,
    width: targetWidth,
    height: targetHeight,
  };
}

/**
 * Bundles multiple converted files into a downloadable ZIP archive
 */
export async function createZipArchive(
  files: { name: string; blob: Blob }[],
  archiveName = 'hps-tools-converted.zip'
): Promise<{ blob: Blob; url: string; name: string }> {
  const zip = new JSZip();

  files.forEach((file) => {
    zip.file(file.name, file.blob);
  });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);

  return {
    blob: zipBlob,
    url,
    name: archiveName,
  };
}

/**
 * Helper to trigger file download in browser
 */
export function triggerDownload(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
