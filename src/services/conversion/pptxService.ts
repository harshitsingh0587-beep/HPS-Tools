import pptxgen from 'pptxgenjs';
import { loadImageElement } from './imageService';

/**
 * Creates a real Microsoft PowerPoint (.pptx) presentation from image files
 */
export async function imagesToPptx(
  files: File[],
  presentationTitle = 'HPS Tools Presentation'
): Promise<{ blob: Blob; url: string; filename: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pres = new (pptxgen as any)();

  pres.layout = 'LAYOUT_16x9';
  pres.title = presentationTitle;

  // Title Slide
  const titleSlide = pres.addSlide();
  titleSlide.background = { color: '142B50' }; // HPS Navy
  titleSlide.addText(presentationTitle, {
    x: 0.8,
    y: 2.2,
    w: '80%',
    h: 1.5,
    fontSize: 36,
    bold: true,
    color: 'D4AF37', // HPS Gold
  });
  titleSlide.addText(`Assembled with HPS Tools • ${files.length} Slides`, {
    x: 0.8,
    y: 3.8,
    w: '80%',
    h: 0.8,
    fontSize: 16,
    color: 'FFFFFF',
  });

  // Slide per image
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const slide = pres.addSlide();
    slide.background = { color: 'F8FAFC' };

    // Slide header
    slide.addText(`Slide ${i + 1}: ${file.name}`, {
      x: 0.8,
      y: 0.4,
      w: '85%',
      h: 0.6,
      fontSize: 18,
      bold: true,
      color: '142B50',
    });

    const img = await loadImageElement(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

      // Fit inside 16:9 layout (width 10 inches, height 5.625 inches)
      // Usable bounds: x=1, y=1.2, w=8, h=4
      const aspect = img.width / img.height;
      let w = 8;
      let h = w / aspect;
      if (h > 4) {
        h = 4;
        w = h * aspect;
      }
      const x = (10 - w) / 2;
      const y = 1.2 + (4 - h) / 2;

      slide.addImage({
        data: dataUrl,
        x,
        y,
        w,
        h,
      });
    }
  }

  // Generate output blob
  const output = await pres.write({ outputType: 'blob' });
  const blob = output as Blob;
  const url = URL.createObjectURL(blob);
  const filename = files.length === 1
    ? `${files[0].name.replace(/\.[^/.]+$/, '')}.pptx`
    : 'hps-presentation.pptx';

  return { blob, url, filename };
}
