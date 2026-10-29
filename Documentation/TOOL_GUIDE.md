# HPS Tools — Complete Tool Catalog & Extension Guide

HPS Tools provides **21 production-grade utilities** divided into logical categories. Every tool runs 100% in-browser with zero file uploads.

---

## 1. Directory of All 21 Tools

### Everyday Tools
1. **Smart Calculator** (`/tools/calculator`)
   - **Path**: `src/tools/calculator/`
   - **Engine**: `src/utils/calculator.ts`
   - **Features**: Operator precedence (`*` and `/` before `+` and `-`), parentheses nesting, percentage calculations, keyboard event listeners (`Enter`, `Backspace`, number keys), calculation history, and click-to-copy result.

2. **Secure Password Generator** (`/tools/password-generator`)
   - **Path**: `src/tools/password-generator/`
   - **Engine**: `src/utils/password.ts`
   - **Features**: Cryptographic entropy via Web Crypto API `crypto.getRandomValues()`, configurable length (6 to 64), toggleable character sets (uppercase, lowercase, numbers, symbols), ambiguous character exclusion (`l`, `1`, `O`, `0`), entropy scoring, and copy button.

3. **Live Word & Text Counter** (`/tools/word-counter`)
   - **Path**: `src/tools/word-counter/`
   - **Engine**: `src/utils/text.ts`
   - **Features**: Real-time word count, character count (with & without spaces), sentence count, paragraph count, estimated reading time (~200 wpm), and estimated speaking time (~130 wpm).

4. **Universal Unit Converter** (`/tools/unit-converter`)
   - **Path**: `src/tools/unit-converter/`
   - **Engine**: `src/utils/converter.ts`
   - **Features**: Six dimensional categories: Length, Area (sq m, sq km, sq ft, acres, hectares), Weight & Mass, Temperature (Celsius, Fahrenheit, Kelvin), Volume, and Speed. Exact two-way formula calculation.

### Date & Time Tools
5. **Date of Birth & Age Calculator** (`/tools/dob-calculator` & `/tools/date-of-birth-calculator`)
   - **Path**: `src/tools/date-of-birth-calculator/`
   - **Engine**: `src/utils/dob.ts`
   - **Features**: Exact calendar age in years, months, and days (taking varying month lengths into account), next birthday countdown, birthday detection, day of the week born, total days/weeks/hours lived, and leap years survived.

### Financial Calculators
6. **Loan & Mortgage Calculator** (`/tools/loan-calculator`)
   - **Path**: `src/tools/loan-calculator/`
   - **Engine**: `src/utils/loan.ts`
   - **Features**: Standard amortized mortgage formulas, zero-interest 0% APR fallback, interactive sliders, total interest paid, breakdown charts, and month-by-month amortization schedule table.

### Photo & Image Tools
7. **Passport Photo Maker** (`/tools/passport-photo-maker`)
   - **Path**: `src/tools/passport-photo-maker/`
   - **Engine**: `src/services/file-conversion/passportService.ts`
   - **Features**: International passport & visa presets (35×45mm, 2×2 inch US Passport, 30×40mm, 50×70mm), 300 DPI high-definition export, custom zoom & pan positioning, background tinting (white, off-white, light blue), and printable 4×6 inch multi-photo sheet generator.

8. **Precision Image Resizer** (`/tools/image-resizer`)
   - **Path**: `src/tools/image-resizer/`
   - **Engine**: `src/services/file-conversion/resizerService.ts`
   - **Features**: Dimension scaling by pixels, millimeters, centimeters, and inches, aspect ratio lock, DPI resolution selector (72, 150, 300 DPI), visual compression quality slider, format conversion (PNG, JPG, WebP), and real-time output file size preview.

### Document & Format Converters
9. **Convert All Hub** (`/tools/convert-all`)
   - **Path**: `src/tools/convert-all/`
   - **Features**: Centralized hub displaying all file conversion matrix options with drag-and-drop batch uploaders.

10. **Image to PDF** (`/tools/image-to-pdf`)
    - **Path**: `src/tools/image-to-pdf/`
    - **Engine**: `jspdf` and `pdf-lib` via `src/services/file-conversion/pdfService.ts`
    - **Features**: Combines multiple images into a multi-page PDF document with custom margins and portrait/landscape orientation.

11. **PDF to Image Extractor** (`/tools/pdf-to-image`)
    - **Path**: `src/tools/pdf-to-image/`
    - **Engine**: `src/services/file-conversion/pdfService.ts`
    - **Features**: Renders PDF pages into crisp PNG graphic cards ready for download.

12. **PDF to Word (DOCX)** (`/tools/pdf-to-word`)
    - **Path**: `src/tools/pdf-to-word/`
    - **Engine**: `docx` library via `src/services/file-conversion/docxService.ts`
    - **Features**: Generates structured, editable Microsoft Word `.docx` documents containing extracted text paragraphs.

13. **Word (DOCX) to PDF** (`/tools/word-to-pdf`)
    - **Path**: `src/tools/word-to-pdf/`
    - **Engine**: `jszip` + `jspdf` via `src/services/file-conversion/pdfService.ts`
    - **Features**: Compiles Word OpenXML content into printable PDF files.

14. **Word (DOCX) to Image** (`/tools/word-to-image`)
    - **Path**: `src/tools/word-to-image/`
    - **Engine**: Canvas rendering via `src/services/file-conversion/docxService.ts`
    - **Features**: Converts Word document pages into PNG visual cards.

15. **Image to Word (DOCX)** (`/tools/image-to-word`)
    - **Path**: `src/tools/image-to-word/`
    - **Engine**: `docx` via `src/services/file-conversion/docxService.ts`
    - **Features**: Embeds uploaded pictures into an authentic Microsoft Word document with captions.

16. **PDF to PowerPoint (PPTX)** (`/tools/pdf-to-powerpoint`)
    - **Path**: `src/tools/pdf-to-powerpoint/`
    - **Engine**: `pptxgenjs` via `src/services/file-conversion/pptxService.ts`
    - **Features**: Builds native PowerPoint presentations from PDF pages.

17. **PowerPoint (PPTX) to PDF** (`/tools/powerpoint-to-pdf`)
    - **Path**: `src/tools/powerpoint-to-pdf/`
    - **Engine**: `jspdf` via `src/services/file-conversion/pptxService.ts`
    - **Features**: Converts PowerPoint slide decks into handout PDF files.

18. **Image to PowerPoint (PPTX)** (`/tools/image-to-powerpoint`)
    - **Path**: `src/tools/image-to-powerpoint/`
    - **Engine**: `pptxgenjs` via `src/services/file-conversion/pptxService.ts`
    - **Features**: Builds 16:9 widescreen PowerPoint slides with full-bleed embedded imagery.

19. **PowerPoint (PPTX) to Image** (`/tools/powerpoint-to-image`)
    - **Path**: `src/tools/powerpoint-to-image/`
    - **Engine**: OpenXML slide parser via `src/services/file-conversion/pptxService.ts`
    - **Features**: Exports slides into standalone PNG images.

20. **JPG to PNG** (`/tools/jpg-to-png`)
    - **Path**: `src/tools/jpg-to-png/`
    - **Engine**: `src/services/file-conversion/imageService.ts`
    - **Features**: Client-side lossless canvas conversion to transparent PNG.

21. **PNG to JPG** (`/tools/png-to-jpg`)
    - **Path**: `src/tools/png-to-jpg/`
    - **Engine**: `src/services/file-conversion/imageService.ts`
    - **Features**: Client-side conversion to JPG with custom quality compression and white background fill.

---

## 2. How to Add a 22nd Tool to HPS Tools

Follow these 3 simple steps to add a new tool:

### Step 1: Create the Tool Folder & Workspace
Create `src/tools/my-new-tool/MyNewTool.tsx`:
```tsx
import React, { useState } from 'react';
import { WorkspaceShell } from '../../components/layout/WorkspaceShell';

interface MyNewToolProps {
  onNavigate: (path: string) => void;
}

export const MyNewTool: React.FC<MyNewToolProps> = ({ onNavigate }) => {
  return (
    <WorkspaceShell
      toolId="my-new-tool"
      title="My New Tool"
      description="Description of what this tool calculates or converts."
      category="Everyday Tools"
      iconName="Sparkles"
      onNavigate={onNavigate}
    >
      <div className="p-6 rounded-2xl bg-hps-surface border border-hps-border">
        {/* Your tool UI and controls */}
      </div>
    </WorkspaceShell>
  );
};
```
And create `src/tools/my-new-tool/index.ts`:
```ts
export * from './MyNewTool';
```

### Step 2: Register in `src/constants/toolsRegistry.ts`
Add your tool entry to `TOOLS_REGISTRY`:
```ts
{
  id: 'my-new-tool',
  name: 'My New Tool',
  description: 'Description of what this tool calculates or converts.',
  category: 'Everyday Tools',
  path: '/tools/my-new-tool',
  icon: 'Sparkles',
  tags: ['keyword1', 'keyword2'],
}
```

### Step 3: Register Route in `src/App.tsx`
Add the route check inside `renderCurrentView()`:
```tsx
if (path === '/tools/my-new-tool') {
  return <MyNewTool onNavigate={handleNavigate} />;
}
```

That's it! The tool will automatically appear on the Homepage, in global search, category filters, and quick-navigation links.
