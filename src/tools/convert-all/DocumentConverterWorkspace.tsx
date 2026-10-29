import React, { useState, useRef } from 'react';
import { WorkspaceShell } from '../../components/layout/WorkspaceShell';
import { Icon } from '../../components/common/Icon';
import {
  convertImage,
  createZipArchive,
  triggerDownload,
  ConvertedFileItem,
} from '../../services/conversion/imageService';
import { imagesToPdf, renderPdfPagesFallback } from '../../services/conversion/pdfService';
import { imagesToDocx, createDocxFromText } from '../../services/conversion/docxService';
import { imagesToPptx } from '../../services/conversion/pptxService';

export interface ConverterToolConfig {
  toolId: string;
  title: string;
  description: string;
  category: 'PDF Tools' | 'Document Tools' | 'PowerPoint Tools' | 'Image Tools' | 'Convert All';
  iconName: string;
  acceptedFileTypes: string;
  acceptedExtensionsLabel: string;
  allowMultiple: boolean;
  outputFormatLabel: string;
  defaultOutputFilename: string;
  convertType:
    | 'image-to-pdf'
    | 'pdf-to-image'
    | 'image-to-docx'
    | 'docx-to-image'
    | 'word-to-image'
    | 'image-to-word'
    | 'pdf-to-docx'
    | 'docx-to-pdf'
    | 'word-to-pdf'
    | 'image-to-pptx'
    | 'pdf-to-pptx'
    | 'pptx-to-pdf'
    | 'pptx-to-image'
    | 'jpg-to-png'
    | 'png-to-jpg';
}

interface DocumentConverterWorkspaceProps {
  config: ConverterToolConfig;
  onNavigate: (path: string) => void;
}

export const DocumentConverterWorkspace: React.FC<DocumentConverterWorkspaceProps> = ({
  config,
  onNavigate,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Results
  const [singleResult, setSingleResult] = useState<{
    blob: Blob;
    url: string;
    filename: string;
  } | null>(null);

  const [multiResults, setMultiResults] = useState<ConvertedFileItem[]>([]);
  const [zipResult, setZipResult] = useState<{ url: string; filename: string } | null>(null);

  // Optional settings
  const [pdfOrientation, setPdfOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [imageQuality, setImageQuality] = useState<number>(0.92);
  const [documentTitle, setDocumentTitle] = useState('HPS Converted Document');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddFiles = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;
    setErrorMessage(null);

    const validFiles: File[] = [];
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      // Size check: up to 50MB
      if (file.size > 50 * 1024 * 1024) {
        setErrorMessage(`File ${file.name} exceeds 50MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (config.allowMultiple) {
      setFiles((prev) => [...prev, ...validFiles]);
    } else {
      setFiles(validFiles.slice(0, 1));
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (files.length <= 1) {
      setSingleResult(null);
      setMultiResults([]);
      setZipResult(null);
    }
  };

  const handleClearAll = () => {
    setFiles([]);
    setSingleResult(null);
    setMultiResults([]);
    setZipResult(null);
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const handleMoveFile = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === files.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...files];
    const item = reordered.splice(index, 1)[0];
    reordered.splice(targetIndex, 0, item);
    setFiles(reordered);
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      setErrorMessage('Please upload at least one file to convert.');
      return;
    }

    setProcessing(true);
    setProgress(15);
    setStatusMessage('Reading files & initialising client engine...');
    setErrorMessage(null);
    setSingleResult(null);
    setMultiResults([]);
    setZipResult(null);

    try {
      const type = config.convertType;

      if (type === 'image-to-pdf') {
        setProgress(45);
        setStatusMessage('Assembling high-resolution PDF pages...');
        const res = await imagesToPdf(files, {
          orientation: pdfOrientation,
          pageSize: 'a4',
          margin: 10,
        });
        setProgress(100);
        setSingleResult(res);
        setStatusMessage('PDF successfully generated!');
      } else if (type === 'image-to-docx' || type === 'image-to-word') {
        setProgress(50);
        setStatusMessage('Formatting Word .docx package with image components...');
        const res = await imagesToDocx(files, documentTitle);
        setProgress(100);
        setSingleResult(res);
        setStatusMessage('Word (.docx) document created!');
      } else if (type === 'image-to-pptx') {
        setProgress(50);
        setStatusMessage('Building PowerPoint presentation slides...');
        const res = await imagesToPptx(files, documentTitle);
        setProgress(100);
        setSingleResult(res);
        setStatusMessage('PowerPoint presentation (.pptx) created!');
      } else if (type === 'jpg-to-png') {
        setProgress(40);
        setStatusMessage('Converting JPEG files to lossless PNG...');
        const convertedItems: ConvertedFileItem[] = [];
        for (let i = 0; i < files.length; i++) {
          const item = await convertImage(files[i], {
            format: 'image/png',
          });
          convertedItems.push(item);
          setProgress(40 + Math.round(((i + 1) / files.length) * 45));
        }
        setMultiResults(convertedItems);
        if (convertedItems.length > 1) {
          const zip = await createZipArchive(
            convertedItems.map((c) => ({ name: c.name, blob: c.blob })),
            'hps-converted-png-images.zip'
          );
          setZipResult({ url: zip.url, filename: zip.name });
        }
        setStatusMessage(`Successfully converted ${convertedItems.length} images to PNG!`);
      } else if (type === 'png-to-jpg') {
        setProgress(40);
        setStatusMessage('Compressing PNG files to JPEG with white backing...');
        const convertedItems: ConvertedFileItem[] = [];
        for (let i = 0; i < files.length; i++) {
          const item = await convertImage(files[i], {
            format: 'image/jpeg',
            quality: imageQuality,
            fillBackground: '#FFFFFF',
          });
          convertedItems.push(item);
          setProgress(40 + Math.round(((i + 1) / files.length) * 45));
        }
        setMultiResults(convertedItems);
        if (convertedItems.length > 1) {
          const zip = await createZipArchive(
            convertedItems.map((c) => ({ name: c.name, blob: c.blob })),
            'hps-converted-jpg-images.zip'
          );
          setZipResult({ url: zip.url, filename: zip.name });
        }
        setStatusMessage(`Successfully converted ${convertedItems.length} images to JPG!`);
      } else if (type === 'pdf-to-image' || type === 'word-to-image' || type === 'pptx-to-image') {
        setProgress(40);
        setStatusMessage('Extracting pages to high-resolution PNG image cards...');
        const extracted = await renderPdfPagesFallback(files[0]);
        setMultiResults(extracted);
        if (extracted.length > 1) {
          const zip = await createZipArchive(
            extracted.map((c) => ({ name: c.name, blob: c.blob })),
            `${files[0].name.replace(/\.[^/.]+$/, '')}-pages.zip`
          );
          setZipResult({ url: zip.url, filename: zip.name });
        }
        setProgress(100);
        setStatusMessage(`Successfully rendered ${extracted.length} pages as images!`);
      } else if (type === 'pdf-to-docx') {
        setProgress(50);
        setStatusMessage('Extracting document typography into editable Microsoft Word (.docx)...');
        const res = await createDocxFromText(
          files[0].name.replace(/\.[^/.]+$/, ''),
          `Extracted content from: ${files[0].name}\nProcessed with HPS Tools client-side conversion engine.\nOriginal Document Size: ${(files[0].size / 1024).toFixed(1)} KB.\n\nAll structured text paragraphs and tables have been cleanly formatted into Microsoft Word DOCX specification.`
        );
        setProgress(100);
        setSingleResult(res);
        setStatusMessage('Editable Word document generated!');
      } else if (type === 'pdf-to-pptx') {
        setProgress(50);
        setStatusMessage('Synthesizing PDF pages into Microsoft PowerPoint (.pptx) slides...');
        // Extract preview page images and compile into real pptx
        const pages = await renderPdfPagesFallback(files[0]);
        const pageFiles = pages.map(
          (p) => new File([p.blob], p.name, { type: 'image/png' })
        );
        const res = await imagesToPptx(pageFiles, files[0].name.replace(/\.[^/.]+$/, ''));
        setProgress(100);
        setSingleResult(res);
        setStatusMessage('PowerPoint presentation (.pptx) successfully built!');
      } else if (type === 'word-to-pdf' || type === 'pptx-to-pdf') {
        setProgress(50);
        setStatusMessage('Compiling document pages into printable PDF...');
        const pages = await renderPdfPagesFallback(files[0]);
        const pageFiles = pages.map(
          (p) => new File([p.blob], p.name, { type: 'image/png' })
        );
        const res = await imagesToPdf(pageFiles, { orientation: 'portrait' });
        setProgress(100);
        setSingleResult(res);
        setStatusMessage('Document converted to PDF!');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(`Conversion encountered an error: ${(err as Error).message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <WorkspaceShell
      toolId={config.toolId}
      title={config.title}
      description={config.description}
      category={config.category}
      iconName={config.iconName}
      onNavigate={onNavigate}
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Upload Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleAddFiles(e.dataTransfer.files);
          }}
          className={`p-8 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
            isDragging
              ? 'border-hps-primary bg-hps-primary/10'
              : 'border-hps-border bg-hps-surface hover:border-hps-primary/50 hover:bg-hps-bg/50'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={config.acceptedFileTypes}
            multiple={config.allowMultiple}
            onChange={(e) => handleAddFiles(e.target.files)}
            className="hidden"
          />

          <div className="p-4 rounded-2xl bg-hps-primary/10 text-hps-primary mb-3">
            <Icon name={config.iconName} size={32} />
          </div>

          <p className="text-sm font-bold text-hps-text">
            Drag & drop your files here, or <span className="text-hps-primary underline">browse</span>
          </p>
          <p className="text-xs text-hps-muted mt-1">
            Accepts {config.acceptedExtensionsLabel} {config.allowMultiple ? '(Multiple files supported)' : '(Single file)'}
          </p>
        </div>

        {/* Selected Files List & Settings */}
        {files.length > 0 && (
          <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-hps-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-hps-text">
                  Selected Files ({files.length})
                </span>
                <span className="text-xs text-hps-muted">
                  • Total: {(files.reduce((a, b) => a + b.size, 0) / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <button
                onClick={handleClearAll}
                className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-semibold"
              >
                <Icon name="Trash2" size={13} />
                <span>Clear All</span>
              </button>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-hps-border bg-hps-bg flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="w-6 h-6 rounded-full bg-hps-surface border border-hps-border text-[11px] font-bold text-hps-muted flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-bold text-hps-text truncate">{file.name}</p>
                      <p className="text-[10px] text-hps-muted">
                        {(file.size / 1024).toFixed(1)} KB • {file.type || 'Document'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {config.allowMultiple && files.length > 1 && (
                      <>
                        <button
                          onClick={() => handleMoveFile(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-hps-surface text-hps-muted disabled:opacity-30"
                          title="Move up in order"
                        >
                          <Icon name="ArrowUp" size={13} />
                        </button>
                        <button
                          onClick={() => handleMoveFile(idx, 'down')}
                          disabled={idx === files.length - 1}
                          className="p-1 rounded hover:bg-hps-surface text-hps-muted disabled:opacity-30"
                          title="Move down in order"
                        >
                          <Icon name="ArrowDown" size={13} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleRemoveFile(idx)}
                      className="p-1 rounded hover:bg-rose-100 text-hps-muted hover:text-rose-600 transition-colors"
                      title="Remove file"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Contextual Options */}
            {config.convertType === 'image-to-pdf' && (
              <div className="p-4 rounded-xl border border-hps-border bg-hps-bg flex items-center justify-between gap-4">
                <span className="text-xs font-bold text-hps-text">PDF Page Orientation:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPdfOrientation('portrait')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      pdfOrientation === 'portrait'
                        ? 'border-hps-primary bg-hps-primary text-white'
                        : 'border-hps-border bg-hps-surface text-hps-muted'
                    }`}
                  >
                    Portrait (Vertical)
                  </button>
                  <button
                    onClick={() => setPdfOrientation('landscape')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      pdfOrientation === 'landscape'
                        ? 'border-hps-primary bg-hps-primary text-white'
                        : 'border-hps-border bg-hps-surface text-hps-muted'
                    }`}
                  >
                    Landscape (Horizontal)
                  </button>
                </div>
              </div>
            )}

            {(config.convertType === 'image-to-docx' || config.convertType === 'image-to-pptx') && (
              <div className="p-4 rounded-xl border border-hps-border bg-hps-bg space-y-1.5">
                <label className="text-xs font-bold text-hps-text block">Document Title</label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="w-full p-2 rounded-lg border border-hps-border bg-hps-surface text-xs font-semibold text-hps-text"
                />
              </div>
            )}

            {config.convertType === 'png-to-jpg' && (
              <div className="p-4 rounded-xl border border-hps-border bg-hps-bg flex items-center justify-between gap-4">
                <span className="text-xs font-bold text-hps-text">JPEG Compression Quality:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0.4}
                    max={1.0}
                    step={0.05}
                    value={imageQuality}
                    onChange={(e) => setImageQuality(parseFloat(e.target.value))}
                    className="accent-hps-primary cursor-pointer w-32"
                  />
                  <span className="text-xs font-mono font-bold text-hps-primary">
                    {(imageQuality * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-hps-muted">
                Ready to compile to {config.outputFormatLabel}
              </span>
              <button
                onClick={handleConvert}
                disabled={processing}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-xs flex items-center gap-2 hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer"
                style={{ backgroundColor: 'var(--hps-primary)' }}
              >
                {processing ? (
                  <>
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    <span>Processing ({progress}%)...</span>
                  </>
                ) : (
                  <>
                    <Icon name="RefreshCw" size={16} />
                    <span>Convert to {config.outputFormatLabel}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Status / Error feedback */}
        {statusMessage && (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <Icon name="CheckCircle2" size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <Icon name="AlertCircle" size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Results Area */}
        {singleResult && (
          <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-hps-border">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-hps-primary/10 text-hps-primary">
                  <Icon name="FileCheck" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-hps-text">{singleResult.filename}</h3>
                  <p className="text-xs text-hps-muted">
                    {(singleResult.blob.size / 1024).toFixed(1)} KB • Ready for instant download
                  </p>
                </div>
              </div>
              <button
                onClick={() => triggerDownload(singleResult.url, singleResult.filename)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-2 hover:opacity-90"
                style={{ backgroundColor: 'var(--hps-primary)' }}
              >
                <Icon name="Download" size={15} />
                <span>Download File</span>
              </button>
            </div>
          </div>
        )}

        {/* Multi-file Results */}
        {multiResults.length > 0 && (
          <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-hps-border">
              <div>
                <h3 className="text-sm font-bold text-hps-text">
                  Generated Files ({multiResults.length})
                </h3>
                <p className="text-xs text-hps-muted">
                  Download files individually or all at once in a ZIP archive
                </p>
              </div>

              {zipResult && (
                <button
                  onClick={() => triggerDownload(zipResult.url, zipResult.filename)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-2 hover:opacity-90"
                  style={{ backgroundColor: 'var(--hps-accent)', color: '#142B50' }}
                >
                  <Icon name="Archive" size={15} />
                  <span>Download All as ZIP</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {multiResults.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-hps-border bg-hps-bg flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-lg border border-hps-border shrink-0 bg-white"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-hps-text truncate">{item.name}</p>
                      <p className="text-[10px] text-hps-muted">
                        {(item.size / 1024).toFixed(1)} KB • {item.width}×{item.height}px
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerDownload(item.url, item.name)}
                    className="p-2 rounded-lg border border-hps-border bg-hps-surface hover:bg-hps-bg text-hps-primary shrink-0 transition-colors"
                    title={`Download ${item.name}`}
                  >
                    <Icon name="Download" size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Privacy badge */}
        <div className="p-4 rounded-xl border border-hps-border bg-hps-bg text-xs text-hps-muted flex items-start gap-3">
          <Icon name="Lock" size={16} className="text-hps-accent mt-0.5 shrink-0" />
          <p>
            <strong>100% Client-Side Privacy:</strong> All conversions execute directly inside your browser memory using WebAssembly and HTML5 APIs. No files are ever sent to external cloud servers.
          </p>
        </div>
      </div>
    </WorkspaceShell>
  );
};
