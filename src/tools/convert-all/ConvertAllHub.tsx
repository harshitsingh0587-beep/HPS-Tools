import React, { useState } from 'react';
import { WorkspaceShell } from '../../components/layout/WorkspaceShell';
import { Icon } from '../../components/common/Icon';

interface ConvertAllHubProps {
  onNavigate: (path: string) => void;
}

export const CONVERSION_TOOLS_LIST = [
  {
    path: '/tools/image-to-pdf',
    title: 'Image to PDF',
    from: 'JPG, PNG, WebP',
    to: 'PDF Document',
    category: 'PDF Tools',
    icon: 'FileImage',
    description: 'Combine multiple photos, receipts, and scans into a single, clean PDF file with orientation options.',
  },
  {
    path: '/tools/pdf-to-image',
    title: 'PDF to Image',
    from: 'PDF Document',
    to: 'PNG / JPG',
    category: 'PDF Tools',
    icon: 'Layers',
    description: 'Render and extract high-resolution raster images from individual or all pages of a PDF document.',
  },
  {
    path: '/tools/pdf-to-word',
    title: 'PDF to Word (DOCX)',
    from: 'PDF Document',
    to: 'Microsoft Word (.docx)',
    category: 'Document Tools',
    icon: 'FileCheck',
    description: 'Transform PDF document paragraphs, headers, and contents into an editable .docx file.',
  },
  {
    path: '/tools/word-to-pdf',
    title: 'Word (DOCX) to PDF',
    from: 'Word (.docx)',
    to: 'PDF Document',
    category: 'PDF Tools',
    icon: 'FileUp',
    description: 'Convert DOCX documents into universal, printable PDF files that open identically on all devices.',
  },
  {
    path: '/tools/image-to-word',
    title: 'Image to Word (DOCX)',
    from: 'JPG, PNG',
    to: 'Word (.docx)',
    category: 'Document Tools',
    icon: 'FileCode',
    description: 'Compile sets of graphics, charts, or photo records into a neatly formatted Microsoft Word document.',
  },
  {
    path: '/tools/word-to-image',
    title: 'Word (DOCX) to Image',
    from: 'Word (.docx)',
    to: 'PNG Cards',
    category: 'Document Tools',
    icon: 'Image',
    description: 'Render DOCX document layout and text pages into crisp shareable PNG cards.',
  },
  {
    path: '/tools/image-to-powerpoint',
    title: 'Image to PowerPoint (PPTX)',
    from: 'JPG, PNG',
    to: 'PowerPoint (.pptx)',
    category: 'PowerPoint Tools',
    icon: 'Presentation',
    description: 'Generate authentic 16:9 Microsoft PowerPoint presentation slides from image files with titles.',
  },
  {
    path: '/tools/pdf-to-powerpoint',
    title: 'PDF to PowerPoint (PPTX)',
    from: 'PDF Document',
    to: 'PowerPoint (.pptx)',
    category: 'PowerPoint Tools',
    icon: 'Sliders',
    description: 'Convert PDF document pages and slides directly into a native Microsoft PowerPoint deck.',
  },
  {
    path: '/tools/powerpoint-to-pdf',
    title: 'PowerPoint (PPTX) to PDF',
    from: 'PowerPoint (.pptx)',
    to: 'PDF Document',
    category: 'PDF Tools',
    icon: 'FileSpreadsheet',
    description: 'Package presentation decks into a compact, easily shareable PDF document.',
  },
  {
    path: '/tools/powerpoint-to-image',
    title: 'PowerPoint to Image',
    from: 'PowerPoint (.pptx)',
    to: 'PNG Slides',
    category: 'PowerPoint Tools',
    icon: 'Grid',
    description: 'Extract slides from presentation files as separate PNG graphics for websites and social media.',
  },
  {
    path: '/tools/jpg-to-png',
    title: 'JPG to PNG',
    from: 'JPEG / JPG',
    to: 'PNG (Lossless)',
    category: 'Image Tools',
    icon: 'Sparkles',
    description: 'Convert JPEG graphics into lossless PNG files with support for sharp typography and transparency.',
  },
  {
    path: '/tools/png-to-jpg',
    title: 'PNG to JPG',
    from: 'PNG',
    to: 'JPEG (Compact)',
    category: 'Image Tools',
    icon: 'Sparkles',
    description: 'Convert heavy PNG graphics into lightweight, web-optimized JPEG images with custom quality.',
  },
];

export const ConvertAllHub: React.FC<ConvertAllHubProps> = ({ onNavigate }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'PDF Tools', 'Document Tools', 'PowerPoint Tools', 'Image Tools'];

  const filteredTools = CONVERSION_TOOLS_LIST.filter((tool) => {
    const matchesSearch =
      tool.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(filterQuery.toLowerCase()) ||
      tool.from.toLowerCase().includes(filterQuery.toLowerCase()) ||
      tool.to.toLowerCase().includes(filterQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || tool.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <WorkspaceShell
      toolId="convert-all"
      title="Convert All — Document Conversion Centre"
      description="The centralized conversion workshop for documents, presentations, PDFs, and images. All conversions execute 100% in your browser for absolute data confidentiality."
      category="Convert All"
      iconName="RefreshCw"
      onNavigate={onNavigate}
    >
      <div className="space-y-8">
        {/* Filter bar */}
        <div className="p-4 rounded-2xl border border-hps-border bg-hps-surface shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Icon name="Search" size={16} className="absolute left-3.5 top-3 text-hps-muted" />
            <input
              type="text"
              placeholder="Filter converters (e.g. PDF, Word, JPG)..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-hps-border bg-hps-bg text-xs text-hps-text focus:outline-hidden focus:ring-2 focus:ring-hps-primary/30"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-hps-primary text-white shadow-xs'
                    : 'border border-hps-border bg-hps-bg text-hps-muted hover:text-hps-text'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Converters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => (
            <div
              key={tool.path}
              className="p-5 rounded-2xl border border-hps-border bg-hps-surface hover:border-hps-primary/50 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-hps-primary/10 text-hps-primary group-hover:bg-hps-primary group-hover:text-white transition-colors">
                    <Icon name={tool.icon} size={20} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-hps-border bg-hps-bg text-hps-muted">
                    {tool.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-hps-text group-hover:text-hps-primary transition-colors">
                    {tool.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-hps-muted mt-1">
                    <span>{tool.from}</span>
                    <span>→</span>
                    <span className="text-hps-primary">{tool.to}</span>
                  </div>
                  <p className="text-xs text-hps-muted leading-relaxed mt-2 line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-hps-border flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Client Engine
                </span>
                <button
                  onClick={() => onNavigate(tool.path)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-hps-border bg-hps-bg hover:bg-hps-primary hover:text-white text-hps-text transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Open Tool</span>
                  <Icon name="ArrowRight" size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Technical Architecture Note */}
        <div className="p-6 rounded-2xl border border-hps-border bg-hps-bg space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-hps-primary flex items-center gap-2">
            <Icon name="Cpu" size={16} />
            <span>Honest Technical Architecture & Limitations</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-hps-muted leading-relaxed">
            <p>
              • <strong>Genuine Standards-Compliant File Generation:</strong> When converting images or documents to PDF, Word (.docx), or PowerPoint (.pptx), HPS Tools constructs valid OpenXML and PDF binary packages in JavaScript using libraries like `docx`, `pptxgenjs`, and `jspdf`. We never rename extensions.
            </p>
            <p>
              • <strong>Zero Third-Party Cloud Transmission:</strong> Because your data is converted on your own CPU within web worker and canvas memory contexts, your files remain strictly private. No external quotas or paid API restrictions apply.
            </p>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
};
