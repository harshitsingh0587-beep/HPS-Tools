import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WorkspaceShell } from '../../components/layout/WorkspaceShell';
import {
  processImageResize,
  unitToPixels,
  pixelsToUnit,
  DimensionUnit,
  ResizeFitMode,
  ResizeResult,
} from '../../services/image/resizerService';
import { triggerDownload } from '../../services/conversion/imageService';
import { Icon } from '../../components/common/Icon';

interface ImageResizerToolProps {
  onNavigate: (path: string) => void;
}

export const ImageResizerTool: React.FC<ImageResizerToolProps> = ({ onNavigate }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 800,
  });

  const [unit, setUnit] = useState<DimensionUnit>('px');
  const [width, setWidth] = useState<number>(1200);
  const [height, setHeight] = useState<number>(800);
  const [dpi, setDpi] = useState<number>(72);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [fitMode, setFitMode] = useState<ResizeFitMode>('contain');
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState<number>(0.9);
  const [processing, setProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ResizeResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize demo image
  useEffect(() => {
    const demoCanvas = document.createElement('canvas');
    demoCanvas.width = 1200;
    demoCanvas.height = 800;
    const ctx = demoCanvas.getContext('2d');
    if (ctx) {
      // Landscape demo
      const grad = ctx.createLinearGradient(0, 0, 1200, 800);
      grad.addColorStop(0, '#142B50');
      grad.addColorStop(0.5, '#0284C7');
      grad.addColorStop(1, '#D4AF37');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 800);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HPS Tools • High Resolution Asset', 600, 380);

      ctx.font = '24px sans-serif';
      ctx.fillText('Original: 1200 × 800 px', 600, 440);

      demoCanvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'sample-landscape.jpg', { type: 'image/jpeg' });
          setSelectedFile(file);
          setOriginalDimensions({ width: 1200, height: 800 });
        }
      }, 'image/jpeg', 0.95);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        setOriginalDimensions({ width: w, height: h });
        setWidth(w);
        setHeight(h);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleWidthChange = (newVal: number) => {
    setWidth(newVal);
    if (lockAspect && originalDimensions.width > 0) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setHeight(Math.round(newVal * ratio));
    }
  };

  const handleHeightChange = (newVal: number) => {
    setHeight(newVal);
    if (lockAspect && originalDimensions.height > 0) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(newVal * ratio));
    }
  };

  const handleUnitChange = (newUnit: DimensionUnit) => {
    if (newUnit === unit) return;
    const currentPxW = unitToPixels(width, unit, dpi);
    const currentPxH = unitToPixels(height, unit, dpi);
    setWidth(pixelsToUnit(currentPxW, newUnit, dpi));
    setHeight(pixelsToUnit(currentPxH, newUnit, dpi));
    setUnit(newUnit);
  };

  const handleProcessResize = useCallback(async () => {
    if (!selectedFile) return;
    setProcessing(true);
    try {
      const res = await processImageResize(selectedFile, {
        unit,
        width,
        height,
        dpi,
        lockAspectRatio: lockAspect,
        fitMode,
        format,
        quality,
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  }, [selectedFile, unit, width, height, dpi, lockAspect, fitMode, format, quality]);

  useEffect(() => {
    if (selectedFile) {
      handleProcessResize();
    }
  }, [selectedFile, unit, width, height, dpi, lockAspect, fitMode, format, quality, handleProcessResize]);

  const handleDownload = () => {
    if (result) {
      const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
      triggerDownload(result.url, `hps-resized-${result.widthPx}x${result.heightPx}.${ext}`);
    }
  };

  return (
    <WorkspaceShell
      toolId="image-resizer"
      title="Precision Image Resizer"
      description="Resize images by exact pixels, millimeters, centimeters, or inches with aspect lock, DPI calibration, format conversion, and real-time size compression preview."
      category="Image Tools"
      iconName="Maximize2"
      onNavigate={onNavigate}
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-hps-border">
              <h2 className="text-sm font-bold text-hps-text">Dimension & Quality Controls</h2>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg border border-hps-border bg-hps-bg hover:bg-hps-surface text-xs font-semibold text-hps-primary transition-colors flex items-center gap-1.5"
              >
                <Icon name="Upload" size={14} />
                <span>Upload Image</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Units selection */}
            <div className="space-y-1.5">
              <label htmlFor="dim-unit-select" className="text-xs font-bold text-hps-text block">Dimension Unit</label>
              <div className="grid grid-cols-4 gap-2">
                {(['px', 'mm', 'cm', 'in'] as DimensionUnit[]).map((u) => (
                  <button
                    key={u}
                    onClick={() => handleUnitChange(u)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      unit === u
                        ? 'border-hps-primary bg-hps-primary text-white'
                        : 'border-hps-border bg-hps-bg hover:bg-hps-surface text-hps-text'
                    }`}
                  >
                    {u.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Width & Height */}
            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="space-y-1">
                <label htmlFor="resizer-width-input" className="text-xs font-bold text-hps-text block">Width ({unit})</label>
                <input
                  id="resizer-width-input"
                  type="number"
                  min={1}
                  value={width}
                  onChange={(e) => handleWidthChange(parseFloat(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl border border-hps-border bg-hps-bg text-sm font-bold font-mono text-hps-text"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="resizer-height-input" className="text-xs font-bold text-hps-text block">Height ({unit})</label>
                <input
                  id="resizer-height-input"
                  type="number"
                  min={1}
                  value={height}
                  onChange={(e) => handleHeightChange(parseFloat(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl border border-hps-border bg-hps-bg text-sm font-bold font-mono text-hps-text"
                />
              </div>
            </div>

            {/* Aspect Ratio Lock & DPI */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setLockAspect(!lockAspect)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  lockAspect
                    ? 'border-hps-primary bg-hps-primary/10 text-hps-primary'
                    : 'border-hps-border bg-hps-bg text-hps-muted hover:text-hps-text'
                }`}
              >
                <Icon name={lockAspect ? 'Lock' : 'Unlock'} size={15} />
                <span>Lock Aspect Ratio</span>
              </button>

              <div className="flex items-center gap-2">
                <label htmlFor="resizer-dpi-select" className="text-xs font-bold text-hps-muted shrink-0">DPI:</label>
                <select
                  id="resizer-dpi-select"
                  value={dpi}
                  onChange={(e) => setDpi(parseInt(e.target.value))}
                  className="w-full p-2 rounded-xl border border-hps-border bg-hps-bg text-xs font-semibold text-hps-text"
                >
                  <option value={72}>72 (Screen / Web)</option>
                  <option value={150}>150 (Medium)</option>
                  <option value={300}>300 (Print / Press)</option>
                </select>
              </div>
            </div>

            {/* Fit mode */}
            <div className="space-y-2 pt-2 border-t border-hps-border">
              <label htmlFor="resizer-fit-mode-select" className="text-xs font-bold text-hps-text block">Fit Behavior</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'contain', label: 'Contain' },
                  { id: 'cover', label: 'Crop (Cover)' },
                  { id: 'stretch', label: 'Stretch' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setFitMode(mode.id as ResizeFitMode)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      fitMode === mode.id
                        ? 'border-hps-primary bg-hps-primary/10 text-hps-primary font-bold'
                        : 'border-hps-border bg-hps-bg text-hps-muted hover:text-hps-text'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Output Format & Compression */}
            <div className="space-y-3 pt-2 border-t border-hps-border">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="resizer-format-select" className="text-xs font-bold text-hps-text block mb-1">Output Format</label>
                  <select
                    id="resizer-format-select"
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-hps-border bg-hps-bg text-xs font-semibold text-hps-text"
                  >
                    <option value="image/jpeg">JPEG (.jpg)</option>
                    <option value="image/png">PNG (.png)</option>
                    <option value="image/webp">WebP (.webp)</option>
                  </select>
                </div>

                {format !== 'image/png' && (
                  <div>
                    <div className="flex justify-between text-xs font-bold text-hps-text mb-1">
                      <label htmlFor="resizer-quality-slider">Quality</label>
                      <span className="font-mono text-hps-primary">{(quality * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      id="resizer-quality-slider"
                      type="range"
                      min={0.2}
                      max={1.0}
                      step={0.05}
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="w-full accent-hps-primary cursor-pointer mt-1"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Before & After Preview Side (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-hps-border">
                <h2 className="text-sm font-bold text-hps-text">Before & After Comparison</h2>
                {result && (
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-hps-muted">
                      Original: {(result.originalSizeBytes / 1024).toFixed(1)} KB
                    </span>
                    <span>→</span>
                    <span className="font-bold text-hps-primary">
                      New: {(result.newSizeBytes / 1024).toFixed(1)} KB
                    </span>
                  </div>
                )}
              </div>

              {/* Preview image */}
              <div className="flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-hps-border min-h-[320px]">
                {result ? (
                  <div className="text-center space-y-2">
                    <img
                      src={result.url}
                      alt="Resized output preview"
                      className="max-h-[300px] max-w-full object-contain mx-auto shadow-md rounded-lg"
                    />
                    <div className="text-xs text-hps-muted font-mono pt-1">
                      Target Output: {result.widthPx} × {result.heightPx} px • {result.format.split('/')[1].toUpperCase()}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-hps-muted">Loading preview...</div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-hps-muted">
                  Original Source: {originalDimensions.width} × {originalDimensions.height} px
                </span>
                <button
                  onClick={handleDownload}
                  disabled={!result || processing}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-2 hover:opacity-90 disabled:opacity-40 cursor-pointer"
                  style={{ backgroundColor: 'var(--hps-primary)' }}
                >
                  <Icon name="Download" size={16} />
                  <span>Download Resized Image</span>
                </button>
              </div>
            </div>

            {/* Target file size guidance note */}
            <div className="p-4 rounded-xl border border-hps-border bg-hps-bg text-xs text-hps-muted space-y-1 leading-relaxed">
              <span className="font-bold text-hps-text block flex items-center gap-1.5">
                <Icon name="Info" size={14} className="text-hps-accent" />
                <span>File Size Optimization:</span>
              </span>
              <p>
                To achieve smaller target file sizes without introducing image blur, reduce the resolution dimensions or switch the format to WebP with 80% quality. PNG produces lossless fidelity but larger byte sizes for photographs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
};
