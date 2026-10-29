import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WorkspaceShell } from '../../components/layout/WorkspaceShell';
import {
  PASSPORT_PRESETS,
  PassportSettings,
  renderPassportPhoto,
  generatePrintableSheet,
  mmToPixels,
} from '../../services/image/passportService';
import { triggerDownload } from '../../services/conversion/imageService';
import { Icon } from '../../components/common/Icon';

interface PassportPhotoToolProps {
  onNavigate: (path: string) => void;
}

export const PassportPhotoTool: React.FC<PassportPhotoToolProps> = ({ onNavigate }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [settings, setSettings] = useState<PassportSettings>({
    presetId: '35x45',
    widthMm: 35,
    heightMm: 45,
    dpi: 300,
    zoom: 1.0,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
    backgroundColor: 'white',
    format: 'image/jpeg',
    quality: 0.95,
  });

  const [processing, setProcessing] = useState(false);
  const [renderedResult, setRenderedResult] = useState<{
    blob: Blob;
    url: string;
    widthPx: number;
    heightPx: number;
    sizeBytes: number;
    canvas: HTMLCanvasElement;
  } | null>(null);

  const [sheetResult, setSheetResult] = useState<{
    blob: Blob;
    url: string;
    pdfUrl: string;
    copies: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load a demo headshot when first loading if user hasn't selected a file yet
  useEffect(() => {
    // Generate an illustrative placeholder avatar on canvas so the user can immediately test controls
    const demoCanvas = document.createElement('canvas');
    demoCanvas.width = 600;
    demoCanvas.height = 800;
    const ctx = demoCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(0, 0, 600, 800);
      
      // Shoulders
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.ellipse(300, 750, 240, 180, 0, 0, Math.PI * 2);
      ctx.fill();

      // Neck
      ctx.fillStyle = '#FBCFE8';
      ctx.fillRect(260, 480, 80, 100);

      // Head
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.ellipse(300, 380, 120, 160, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(300, 320, 130, Math.PI, 0, false);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(260, 360, 10, 0, Math.PI * 2);
      ctx.arc(340, 360, 10, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(300, 420, 30, 0.2, Math.PI - 0.2, false);
      ctx.stroke();

      const url = demoCanvas.toDataURL('image/jpeg');
      setImagePreviewUrl(url);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      setRenderedResult(null);
      setSheetResult(null);
    }
  };

  const handlePresetChange = (presetId: string) => {
    const preset = PASSPORT_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSettings((prev) => ({
        ...prev,
        presetId,
        widthMm: preset.widthMm,
        heightMm: preset.heightMm,
      }));
    }
  };

  const updatePassport = useCallback(async () => {
    if (!imagePreviewUrl) return;
    setProcessing(true);
    try {
      const res = await renderPassportPhoto(imagePreviewUrl, settings);
      setRenderedResult(res);

      // Also generate 4x6" printable sheet
      const sheet = await generatePrintableSheet(res.canvas, settings.widthMm, settings.heightMm);
      setSheetResult(sheet);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  }, [imagePreviewUrl, settings]);

  useEffect(() => {
    if (imagePreviewUrl) {
      updatePassport();
    }
  }, [imagePreviewUrl, settings, updatePassport]);

  const handleDownloadSingle = () => {
    if (renderedResult) {
      const ext = settings.format === 'image/png' ? 'png' : 'jpg';
      triggerDownload(renderedResult.url, `hps-passport-photo-${settings.widthMm}x${settings.heightMm}mm.${ext}`);
    }
  };

  const handleDownloadSheet = () => {
    if (sheetResult) {
      triggerDownload(sheetResult.url, `hps-passport-printable-sheet-4x6in.jpg`);
    }
  };

  const handleDownloadPdf = () => {
    if (sheetResult) {
      triggerDownload(sheetResult.pdfUrl, `hps-passport-print-ready.pdf`);
    }
  };

  return (
    <WorkspaceShell
      toolId="passport-photo-maker"
      title="Biometric Passport Photo Maker"
      description="Create compliant, high-resolution passport and visa photos with exact millimeter presets (35×45mm, 2×2 in), 300 DPI, background options, and 4×6 inch multi-copy print sheets."
      category="Photo Tools"
      iconName="Camera"
      onNavigate={onNavigate}
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Panel (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-hps-border">
              <h2 className="text-sm font-bold text-hps-text">Photo Controls & Preset</h2>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg border border-hps-border bg-hps-bg hover:bg-hps-surface text-xs font-semibold text-hps-primary transition-colors flex items-center gap-1.5"
              >
                <Icon name="Upload" size={14} />
                <span>Upload Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <label htmlFor="preset-select" className="text-xs font-bold text-hps-text block">Country / Standard Preset</label>
              <select
                id="preset-select"
                value={settings.presetId}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-hps-border bg-hps-bg text-xs font-semibold text-hps-text"
              >
                {PASSPORT_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dimensions & DPI */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="width-mm-input" className="text-[11px] font-bold text-hps-muted block mb-1">Width (mm)</label>
                <input
                  id="width-mm-input"
                  type="number"
                  value={settings.widthMm}
                  disabled={settings.presetId !== 'custom'}
                  onChange={(e) => setSettings({ ...settings, widthMm: parseFloat(e.target.value) || 35 })}
                  className="w-full p-2.5 rounded-xl border border-hps-border bg-hps-bg text-xs font-bold font-mono text-hps-text disabled:opacity-60"
                />
              </div>
              <div>
                <label htmlFor="height-mm-input" className="text-[11px] font-bold text-hps-muted block mb-1">Height (mm)</label>
                <input
                  id="height-mm-input"
                  type="number"
                  value={settings.heightMm}
                  disabled={settings.presetId !== 'custom'}
                  onChange={(e) => setSettings({ ...settings, heightMm: parseFloat(e.target.value) || 45 })}
                  className="w-full p-2.5 rounded-xl border border-hps-border bg-hps-bg text-xs font-bold font-mono text-hps-text disabled:opacity-60"
                />
              </div>
              <div>
                <label htmlFor="dpi-select" className="text-[11px] font-bold text-hps-muted block mb-1">DPI</label>
                <select
                  id="dpi-select"
                  value={settings.dpi}
                  onChange={(e) => setSettings({ ...settings, dpi: parseInt(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-hps-border bg-hps-bg text-xs font-bold font-mono text-hps-text"
                >
                  <option value={300}>300 DPI (Official)</option>
                  <option value={600}>600 DPI (Ultra)</option>
                  <option value={150}>150 DPI (Web)</option>
                </select>
              </div>
            </div>

            {/* Transform Sliders: Zoom, Pan, Rotation */}
            <div className="space-y-4 pt-2 border-t border-hps-border">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="zoom-slider" className="font-bold text-hps-text">Zoom & Framing</label>
                  <span className="font-mono text-hps-muted font-bold">{(settings.zoom * 100).toFixed(0)}%</span>
                </div>
                <input
                  id="zoom-slider"
                  type="range"
                  min={0.5}
                  max={2.5}
                  step={0.05}
                  value={settings.zoom}
                  onChange={(e) => setSettings({ ...settings, zoom: parseFloat(e.target.value) })}
                  className="w-full accent-hps-primary cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="pan-x-slider" className="text-[11px] font-bold text-hps-muted block">Pan Horizontal (X)</label>
                  <input
                    id="pan-x-slider"
                    type="range"
                    min={-200}
                    max={200}
                    value={settings.offsetX}
                    onChange={(e) => setSettings({ ...settings, offsetX: parseInt(e.target.value) })}
                    className="w-full accent-hps-primary cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="pan-y-slider" className="text-[11px] font-bold text-hps-muted block">Pan Vertical (Y)</label>
                  <input
                    id="pan-y-slider"
                    type="range"
                    min={-200}
                    max={200}
                    value={settings.offsetY}
                    onChange={(e) => setSettings({ ...settings, offsetY: parseInt(e.target.value) })}
                    className="w-full accent-hps-primary cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label htmlFor="rotation-slider" className="font-bold text-hps-text">Tilt / Rotation Angle</label>
                  <span className="font-mono text-hps-muted font-bold">{settings.rotation}°</span>
                </div>
                <input
                  id="rotation-slider"
                  type="range"
                  min={-30}
                  max={30}
                  step={1}
                  value={settings.rotation}
                  onChange={(e) => setSettings({ ...settings, rotation: parseInt(e.target.value) })}
                  className="w-full accent-hps-primary cursor-pointer"
                />
              </div>
            </div>

            {/* Background & Output Format */}
            <div className="space-y-3 pt-2 border-t border-hps-border">
              <label htmlFor="bg-color-select" className="text-xs font-bold text-hps-text block">Background Base</label>
              <select
                id="bg-color-select"
                value={settings.backgroundColor}
                onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value as any })}
                className="w-full p-2.5 rounded-xl border border-hps-border bg-hps-bg text-xs font-semibold text-hps-text"
              >
                <option value="white">Solid White (#FFFFFF - Standard)</option>
                <option value="light-grey">Light Off-White / Grey (#F3F4F6)</option>
                <option value="original">Original Photo Background</option>
                <option value="transparent">Transparent (PNG Only)</option>
              </select>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label htmlFor="format-select" className="text-[11px] font-bold text-hps-muted block mb-1">Format</label>
                  <select
                    id="format-select"
                    value={settings.format}
                    onChange={(e) => setSettings({ ...settings, format: e.target.value as any })}
                    className="w-full p-2 rounded-lg border border-hps-border bg-hps-bg text-xs font-semibold text-hps-text"
                  >
                    <option value="image/jpeg">JPEG (.jpg)</option>
                    <option value="image/png">PNG (.png)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="jpeg-quality-select" className="text-[11px] font-bold text-hps-muted block mb-1">JPEG Quality</label>
                  <select
                    id="jpeg-quality-select"
                    value={settings.quality}
                    onChange={(e) => setSettings({ ...settings, quality: parseFloat(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-hps-border bg-hps-bg text-xs font-semibold text-hps-text"
                  >
                    <option value={0.98}>Maximum (98%)</option>
                    <option value={0.92}>High (92%)</option>
                    <option value={0.85}>Standard (85%)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Preview & Output Side (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Cropped Preview Box */}
            <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-hps-text">Single Biometric Photo Preview</h2>
                  <p className="text-xs text-hps-muted">
                    {settings.widthMm} × {settings.heightMm} mm ({mmToPixels(settings.widthMm, settings.dpi)} × {mmToPixels(settings.heightMm, settings.dpi)} px @ {settings.dpi} DPI)
                  </p>
                </div>
                {renderedResult && (
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full border border-hps-border bg-hps-bg text-hps-primary">
                    {(renderedResult.sizeBytes / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>

              {/* Viewport Frame */}
              <div className="flex justify-center p-6 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-hps-border">
                {renderedResult && (
                  <div className="relative shadow-lg border-2 border-white rounded-xs overflow-hidden">
                    <img
                      src={renderedResult.url}
                      alt="Passport preview"
                      className="max-h-[300px] object-contain"
                    />
                    {/* Head positioning guideline overlay */}
                    <div className="absolute inset-0 pointer-events-none border border-dashed border-sky-400/50 flex flex-col items-center justify-center">
                      <div className="w-1/2 h-1/2 rounded-full border border-dashed border-sky-400/40" />
                    </div>
                  </div>
                )}
              </div>

              {/* Single Download Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleDownloadSingle}
                  disabled={!renderedResult || processing}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-xs flex items-center gap-2 hover:opacity-90 disabled:opacity-40 cursor-pointer"
                  style={{ backgroundColor: 'var(--hps-primary)' }}
                >
                  <Icon name="Download" size={15} />
                  <span>Download Single Photo ({settings.widthMm}×{settings.heightMm}mm)</span>
                </button>
              </div>
            </div>

            {/* Printable 4x6" Sheet Section */}
            {sheetResult && (
              <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Icon name="Printer" size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-hps-text">Ready-to-Print 4×6&quot; Photo Sheet</h2>
                      <p className="text-xs text-hps-muted">
                        Contains {sheetResult.copies} identical passport photos with cutting guide lines
                      </p>
                    </div>
                  </div>
                </div>

                {/* Thumbnail of the sheet */}
                <div className="flex justify-center p-4 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-hps-border">
                  <img
                    src={sheetResult.url}
                    alt="Printable 4x6 sheet preview"
                    className="max-h-[160px] object-contain shadow-md rounded-xs border border-white"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3">
                  <button
                    onClick={handleDownloadSheet}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-hps-border bg-hps-surface hover:bg-hps-bg text-hps-text transition-colors flex items-center gap-1.5"
                  >
                    <Icon name="Image" size={14} />
                    <span>Download 4×6&quot; JPEG</span>
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 hover:opacity-90 transition-colors"
                    style={{ backgroundColor: 'var(--hps-primary)' }}
                  >
                    <Icon name="FileText" size={14} />
                    <span>Download Printable PDF Sheet</span>
                  </button>
                </div>
              </div>
            )}

            {/* Official Requirements Disclosure */}
            <div className="p-4 rounded-xl border border-hps-border bg-hps-bg text-xs text-hps-muted space-y-1.5">
              <span className="font-bold text-hps-text block flex items-center gap-1.5">
                <Icon name="Info" size={14} className="text-hps-accent" />
                <span>Biometric Photo Standards:</span>
              </span>
              <p>• Official passport requirements differ across countries. Maintain a neutral expression, direct eye contact, and no eyeglasses or shadows.</p>
              <p>• We do not alter facial features, skin tone, or apply artificial filters to keep your document genuine and valid for government inspection.</p>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
};
