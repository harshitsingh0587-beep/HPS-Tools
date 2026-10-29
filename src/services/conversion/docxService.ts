import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun } from 'docx';
import { loadImageElement } from './imageService';

/**
 * Creates a real Microsoft Word (.docx) document embedding uploaded images
 */
export async function imagesToDocx(
  files: File[],
  title = 'HPS Tools Document'
): Promise<{ blob: Blob; url: string; filename: string }> {
  const sectionsChildren: Paragraph[] = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 300 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated with HPS Tools on ${new Date().toLocaleDateString()}`,
          italics: true,
          color: '666666',
        }),
      ],
      spacing: { after: 400 },
    }),
  ];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const img = await loadImageElement(file);
    const arrayBuffer = await file.arrayBuffer();

    // Scale image dimensions down proportionally to fit page (max 550px wide)
    const maxWidth = 550;
    const aspect = img.width / img.height;
    const width = Math.min(maxWidth, img.width || maxWidth);
    const height = Math.round(width / aspect);

    sectionsChildren.push(
      new Paragraph({
        text: `Figure ${i + 1}: ${file.name}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 150 },
      }),
      new Paragraph({
        children: [
          new ImageRun({
            data: arrayBuffer,
            transformation: {
              width,
              height,
            },
            type: file.type.includes('png') ? 'png' : 'jpg',
          }),
        ],
        spacing: { after: 300 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sectionsChildren,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const filename = files.length === 1
    ? `${files[0].name.replace(/\.[^/.]+$/, '')}.docx`
    : 'hps-document.docx';

  return { blob, url, filename };
}

/**
 * Creates a real Microsoft Word (.docx) document from text or parsed PDF content
 */
export async function createDocxFromText(
  title: string,
  content: string
): Promise<{ blob: Blob; url: string; filename: string }> {
  const paragraphs = content.split(/\r?\n+/).map((line) => {
    return new Paragraph({
      children: [
        new TextRun({
          text: line,
          size: 24, // 12pt
        }),
      ],
      spacing: { after: 120 },
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
            spacing: { after: 200 },
          }),
          ...paragraphs,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.docx`;

  return { blob, url, filename };
}
