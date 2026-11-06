import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WorkspaceShell } from '../../components/layout/WorkspaceShell';
import { Icon } from '../../components/common/Icon';
import {
  PRESET_BACKGROUND_COLORS,
  replaceImageBackground,
  hexToRgb,
  SegmentationResult,
} from '../../services/image/backgroundRemovalService';
import { triggerDownload } from '../../services/conversion/imageService';

interface ImageBackgroundChangerToolProps {
  onNavigate: (path: string) => void;
}

export const ImageBackgroundChangerTool: React.FC<ImageBackgroundChangerToolProps> = ({
  onNavigate,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 700,
  });

  // Settings
  const [selectedColor, setSelectedColor] = useState<string>('#FFFFFF');
  const [customColor, setCustomColor] = useState<string>('#38BDF8');
  const [tolerance, setTolerance] = useState<number>(30);
  const [edgeSmoothness, setEdgeSmoothness] = useState<number>(2);
  const [segmentationMode, setSegmentationMode] = useState<'flood' | 'global'>('flood');
  const [outputFormat, setOutputFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [jpegQuality, setJpegQuality] = useState<number>(0.92);

  // Eyedropper state
  const [eyedropperActive, setEyedropperActive] = useState<boolean>(false);
  const [manualSampleColor, setManualSampleColor] = useState<{ r: number; g: number; b: number } | null>(null);

  // Processing & Results
  const [processing, setProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<SegmentationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'result' | 'original' | 'split'>('result');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate demo portrait on initial mount so users can test immediately
  useEffect(() => {
    const demoCanvas = document.createElement('canvas');
    demoCanvas.width = 600;
    demoCanvas.height = 700;
    const ctx = demoCanvas.getContext('2d');
    if (ctx) {
      // Light blue-grey background to be replaced
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(0, 0, 600, 700);

      // Person shoulders & torso
      ctx.fillStyle = '#142B50'; // Navy shirt
      ctx.beginPath();
      ctx.ellipse(300, 680, 240, 190, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shirt collar
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(250, 520);
      ctx.lineTo(300, 580);
      ctx.lineTo(350, 520);
      ctx.closePath();
      ctx.fill();

      // Neck
      ctx.fillStyle = '#FBCFE8';
      ctx.fillRect(260, 430, 80, 110);

      // Head
      ctx.fillStyle = '#FDE68A';
      ctx.beginPath();
      ctx.ellipse(300, 330, 130, 165, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(300, 270, 135, Math.PI * 0.85, Math.PI * 2.15);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(255, 330, 9, 0, Math.PI * 2);
      ctx.arc(345, 330, 9, 0, Math.PI * 2);
      ctx.fill();

      // Eyebrows
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(255, 315, 20, Math.PI * 1.15, Math.PI * 1.85);
      ctx.arc(345, 315, 20, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      // Friendly Smile
      ctx.strokeStyle = '#991B1B';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(300, 400, 35, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();

      demoCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setImagePreviewUrl(url);
          setOriginalDimensions({ width: 600, height: 700 });
        }
      }, 'image/png');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMessage(null);
      setManualSampleColor(null);

      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setImagePreviewUrl(url);
      };
      img.onerror = () => {
        setErrorMessage('Failed to load image. Please provide a valid JPG, PNG, or WebP file.');
      };
      img.src = url;
    }
  };

  const runReplacement = useCallback(async () => {
    if (!imagePreviewUrl) return;

    setProcessing(true);
    setErrorMessage(null);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image could not be loaded'));
        img.src = imagePreviewUrl;
      });

      const effectiveBgColor = selectedColor === 'custom' ? customColor : selectedColor;

      const res = await replaceImageBackground(img, {
        backgroundColor: effectiveBgColor,
        tolerance,
        edgeSmoothness,
        format: outputFormat,
        quality: jpegQuality,
        manualSampleColor,
        mode: segmentationMode,
      });

      setResult(res);
    } catch (err: any) {
      console.error('Background change failed:', err);
      setErrorMessage(`Background processing failed: ${err.message || 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  }, [
    imagePreviewUrl,
    selectedColor,
    customColor,
    tolerance,
    edgeSmoothness,
    outputFormat,
    jpegQuality,
    manualSampleColor,
    segmentationMode,
  ]);

  // Run replacement when key parameters change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (imagePreviewUrl) {
        runReplacement();
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [runReplacement, imagePreviewUrl]);

  // Eyedropper click handler on original canvas/image
  const handleSampleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!eyedropperActive || !imagePreviewUrl) return;

    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const yRatio = (e.clientY - rect.top) / rect.height;

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    const pixelX = Math.floor(xRatio * img.naturalWidth);
    const pixelY = Math.floor(yRatio * img.naturalHeight);
    const pixel = ctx.getImageData(pixelX, pixelY, 1, 1).data;

    setManualSampleColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
    setEyedropperActive(false);
  };

  const handleDownload = (formatToDownload: 'image/png' | 'image/jpeg') => {
    if (!result) return;

    const baseName = selectedFile
      ? selectedFile.name.replace(/\.[^/.]+$/, '')
      : 'hps-edited-portrait';
    const ext = formatToDownload === 'image/jpeg' ? 'jpg' : 'png';
    const filename = `${baseName}-bg-changed.${ext}`;

    if (result.outputBlob && outputFormat === formatToDownload) {
      triggerDownload(result.outputUrl, filename);
    } else {
      // Export canvas directly with target format
      result.canvas.toBlob(
        (blob) => {
          if (blob) {
            const tempUrl = URL.createObjectURL(blob);
            triggerDownload(tempUrl, filename);
            setTimeout(() => URL.revokeObjectURL(tempUrl), 2000);
          }
        },
        formatToDownload,
        jpegQuality
      );
    }
  };

  return (
    <WorkspaceShell
      toolId="image-background-changer"
      title="Image Background Colour Changer"
      description="Effortlessly replace, tint, or remove the background of any portrait or photo with solid colours, studio presets, or transparency while keeping the subject crisp and unchanged."
      category="Image Tools"
      iconName="Palette"
      onNavigate={onNavigate}
    >
      <div className="space-y-6">
        {/* Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <Icon name="AlertCircle" size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. Image Upload Section */}
            <div className="p-4 sm:p-5 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs sm:text-sm font-bold text-hps-text flex items-center gap-2">
                  <Icon name="Upload" size={16} className="text-hps-primary" />
                  <span>Upload Image</span>
                </h2>
                {selectedFile && (
                  <span className="text-[10px] text-hps-muted font-mono">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleFileChange}
                className="hidden"
                id="bg-changer-file-input"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-hps-border hover:border-hps-primary/70 rounded-xl p-4 sm:p-5 text-center cursor-pointer bg-hps-bg/50 hover:bg-hps-bg transition-colors"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                aria-label="Upload photo to change background"
              >
                <div className="w-10 h-10 mx-auto rounded-xl bg-hps-primary/10 text-hps-primary flex items-center justify-center mb-2">
                  <Icon name="ImagePlus" size={20} />
                </div>
                <p className="text-xs font-bold text-hps-text">
                  {selectedFile ? selectedFile.name : 'Click or Drag & Drop Photo Here'}
                </p>
                <p className="text-[11px] text-hps-muted mt-1">
                  Supports PNG, JPG, and WebP (up to 20MB)
                </p>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between text-[11px] text-hps-muted pt-1">
                  <span>
                    Dimensions: {originalDimensions.width} × {originalDimensions.height} px
                  </span>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setManualSampleColor(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-rose-500 hover:underline"
                  >
                    Reset Photo
                  </button>
                </div>
              )}
            </div>

            {/* 2. Background Colour Selection */}
            <div className="p-4 sm:p-5 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs sm:text-sm font-bold text-hps-text flex items-center gap-2">
                  <Icon name="Palette" size={16} className="text-hps-accent" />
                  <span>Choose Background Colour</span>
                </h2>
                <span className="text-[10px] text-hps-muted font-mono uppercase">
                  {selectedColor === 'custom' ? customColor : selectedColor}
                </span>
              </div>

              {/* Preset Swatches Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {PRESET_BACKGROUND_COLORS.map((swatch) => {
                  const isSelected = selectedColor === swatch.value;
                  return (
                    <button
                      key={swatch.id}
                      onClick={() => setSelectedColor(swatch.value)}
                      className={`h-11 rounded-xl p-1 flex flex-col items-center justify-center relative border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-hps-primary ring-2 ring-hps-primary/40 scale-105 shadow-sm'
                          : 'border-hps-border hover:border-hps-primary/50'
                      }`}
                      style={{
                        backgroundColor: swatch.isTransparent ? 'transparent' : swatch.value,
                        backgroundImage: swatch.isTransparent
                          ? 'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)'
                          : undefined,
                        backgroundSize: '10px 10px',
                        backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
                      }}
                      title={swatch.label}
                      aria-label={swatch.label}
                    >
                      {isSelected && (
                        <span
                          className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs"
                          style={{
                            backgroundColor: swatch.textColor === '#FFFFFF' ? '#FFFFFF' : '#0F172A',
                            color: swatch.textColor === '#FFFFFF' ? '#0F172A' : '#FFFFFF',
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Colour Picker & Eyedropper Bar */}
              <div className="pt-2 border-t border-hps-border flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 p-2 rounded-xl border border-hps-border bg-hps-bg">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      setSelectedColor('custom');
                    }}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                    title="Open Color Wheel"
                    id="custom-color-picker"
                  />
                  <div className="flex-1">
                    <label htmlFor="custom-color-picker" className="text-[10px] text-hps-muted block font-semibold cursor-pointer">
                      Custom Color
                    </label>
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        setSelectedColor('custom');
                      }}
                      className="text-xs font-mono font-bold text-hps-text bg-transparent w-full focus:outline-hidden uppercase"
                    />
                  </div>
                </div>

                {/* Eyedropper Sample Button */}
                <button
                  onClick={() => setEyedropperActive(!eyedropperActive)}
                  className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                    eyedropperActive
                      ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 animate-pulse'
                      : 'border-hps-border bg-hps-surface hover:bg-hps-bg text-hps-text'
                  }`}
                  title="Click anywhere on the original photo to sample background color"
                >
                  <Icon name="Pipette" size={15} />
                  <span className="hidden sm:inline">Eyedropper</span>
                </button>
              </div>

              {manualSampleColor && (
                <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-hps-bg border border-hps-border text-hps-muted">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-black/20"
                      style={{
                        backgroundColor: `rgb(${manualSampleColor.r}, ${manualSampleColor.g}, ${manualSampleColor.b})`,
                      }}
                    />
                    <span>
                      Sampled: RGB({manualSampleColor.r}, {manualSampleColor.g}, {manualSampleColor.b})
                    </span>
                  </div>
                  <button
                    onClick={() => setManualSampleColor(null)}
                    className="text-xs font-bold text-hps-primary hover:underline"
                  >
                    Auto
                  </button>
                </div>
              )}
            </div>

            {/* 3. Fine-Tuning Sliders & Mode */}
            <div className="p-4 sm:p-5 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
              <h2 className="text-xs sm:text-sm font-bold text-hps-text flex items-center gap-2">
                <Icon name="Sliders" size={16} className="text-hps-primary" />
                <span>Segmentation & Edge Settings</span>
              </h2>

              {/* Mode Tabs */}
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold p-1 bg-hps-bg rounded-xl border border-hps-border">
                <button
                  onClick={() => setSegmentationMode('flood')}
                  className={`py-1.5 rounded-lg text-center transition-all ${
                    segmentationMode === 'flood'
                      ? 'bg-hps-primary text-white shadow-xs font-bold'
                      : 'text-hps-muted hover:text-hps-text'
                  }`}
                >
                  Smart Border Fill (Safe)
                </button>
                <button
                  onClick={() => setSegmentationMode('global')}
                  className={`py-1.5 rounded-lg text-center transition-all ${
                    segmentationMode === 'global'
                      ? 'bg-hps-primary text-white shadow-xs font-bold'
                      : 'text-hps-muted hover:text-hps-text'
                  }`}
                >
                  Global Chroma Match
                </button>
              </div>

              {/* Tolerance Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <label htmlFor="bg-tolerance-slider" className="text-hps-text">Color Tolerance</label>
                  <span className="font-mono text-hps-primary">{tolerance}%</span>
                </div>
                <input
                  id="bg-tolerance-slider"
                  type="range"
                  min="5"
                  max="90"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="w-full accent-hps-primary cursor-pointer"
                />
                <p className="text-[10px] text-hps-muted">
                  Higher values remove subtle background shadows and gradients.
                </p>
              </div>

              {/* Edge Smoothness / Feathering */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <label htmlFor="bg-smoothness-slider" className="text-hps-text">Edge Smoothness / Feather</label>
                  <span className="font-mono text-hps-primary">{edgeSmoothness} px</span>
                </div>
                <input
                  id="bg-smoothness-slider"
                  type="range"
                  min="0"
                  max="8"
                  value={edgeSmoothness}
                  onChange={(e) => setEdgeSmoothness(Number(e.target.value))}
                  className="w-full accent-hps-primary cursor-pointer"
                />
                <p className="text-[10px] text-hps-muted">
                  Softens boundary pixels to avoid jagged cut-outs around hair and shoulders.
                </p>
              </div>
            </div>
          </div>

          {/* Preview & Download Column (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="p-4 sm:p-5 rounded-2xl border border-hps-border bg-hps-surface shadow-xs space-y-4">
              {/* Preview Header & View Mode Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hps-border">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-hps-text flex items-center gap-2">
                    <Icon name="Eye" size={17} className="text-hps-primary" />
                    <span>Live Preview</span>
                  </h2>
                  <p className="text-[11px] text-hps-muted">
                    Full resolution output: {originalDimensions.width} × {originalDimensions.height} px
                  </p>
                </div>

                {/* View Mode Buttons */}
                <div className="flex items-center gap-1 bg-hps-bg p-1 rounded-xl border border-hps-border text-xs">
                  <button
                    onClick={() => setViewMode('result')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      viewMode === 'result'
                        ? 'bg-hps-surface text-hps-primary shadow-2xs'
                        : 'text-hps-muted hover:text-hps-text'
                    }`}
                  >
                    Edited
                  </button>
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      viewMode === 'split'
                        ? 'bg-hps-surface text-hps-primary shadow-2xs'
                        : 'text-hps-muted hover:text-hps-text'
                    }`}
                  >
                    Split
                  </button>
                  <button
                    onClick={() => setViewMode('original')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      viewMode === 'original'
                        ? 'bg-hps-surface text-hps-primary shadow-2xs'
                        : 'text-hps-muted hover:text-hps-text'
                    }`}
                  >
                    Original
                  </button>
                </div>
              </div>

              {/* Canvas Preview Area */}
              <div className="relative min-h-[360px] sm:min-h-[440px] flex items-center justify-center p-4 rounded-xl border border-hps-border bg-hps-bg/60 overflow-hidden">
                {eyedropperActive && (
                  <div className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold shadow-md animate-bounce flex items-center gap-1.5">
                    <Icon name="Pipette" size={14} />
                    <span>Click on background to sample color!</span>
                  </div>
                )}

                {processing && (
                  <div className="absolute inset-0 z-30 bg-hps-surface/70 backdrop-blur-xs flex flex-col items-center justify-center space-y-2">
                    <Icon name="Loader" size={28} className="animate-spin text-hps-primary" />
                    <span className="text-xs font-bold text-hps-text">Segmenting & Changing Background...</span>
                  </div>
                )}

                {viewMode === 'result' && result && (
                  <img
                    src={result.outputUrl}
                    alt="Edited Portrait with new background"
                    className="max-h-[420px] max-w-full object-contain rounded-lg shadow-sm"
                    style={{
                      backgroundImage:
                        selectedColor === 'transparent'
                          ? 'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)'
                          : undefined,
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                    }}
                  />
                )}

                {viewMode === 'original' && imagePreviewUrl && (
                  <img
                    src={imagePreviewUrl}
                    alt="Original Upload"
                    onClick={handleSampleClick}
                    className={`max-h-[420px] max-w-full object-contain rounded-lg shadow-sm ${
                      eyedropperActive ? 'cursor-crosshair ring-2 ring-amber-500' : ''
                    }`}
                  />
                )}

                {viewMode === 'split' && imagePreviewUrl && result && (
                  <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                    <div className="text-center space-y-1">
                      <span className="text-[10px] font-bold uppercase text-hps-muted">Original</span>
                      <img
                        src={imagePreviewUrl}
                        alt="Original"
                        onClick={handleSampleClick}
                        className={`h-[280px] sm:h-[350px] w-full object-contain rounded-lg border border-hps-border bg-white ${
                          eyedropperActive ? 'cursor-crosshair ring-2 ring-amber-500' : ''
                        }`}
                      />
                    </div>
                    <div className="text-center space-y-1">
                      <span className="text-[10px] font-bold uppercase text-hps-accent">Edited Output</span>
                      <img
                        src={result.outputUrl}
                        alt="Result"
                        className="h-[280px] sm:h-[350px] w-full object-contain rounded-lg border border-hps-border"
                        style={{
                          backgroundImage:
                            selectedColor === 'transparent'
                              ? 'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)'
                              : undefined,
                          backgroundSize: '12px 12px',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Format & Export Actions */}
              <div className="pt-3 border-t border-hps-border space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-hps-text">Download Format:</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="exportFormat"
                        checked={outputFormat === 'image/png'}
                        onChange={() => setOutputFormat('image/png')}
                        className="accent-hps-primary"
                      />
                      <span>PNG (Lossless & Alpha)</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer ml-2">
                      <input
                        type="radio"
                        name="exportFormat"
                        checked={outputFormat === 'image/jpeg'}
                        onChange={() => setOutputFormat('image/jpeg')}
                        className="accent-hps-primary"
                      />
                      <span>JPG (Solid Background)</span>
                    </label>
                  </div>

                  {result && (
                    <span className="text-[11px] font-mono text-hps-muted">
                      File Size: {(result.sizeBytes / 1024).toFixed(1)} KB
                    </span>
                  )}
                </div>

                {/* Download Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDownload('image/png')}
                    disabled={!result || processing}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-hps-primary text-white text-xs sm:text-sm font-bold hover:bg-hps-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                  >
                    <Icon name="Download" size={16} />
                    <span>Download PNG</span>
                  </button>

                  <button
                    onClick={() => handleDownload('image/jpeg')}
                    disabled={!result || processing}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-hps-border bg-hps-surface hover:bg-hps-bg text-hps-text text-xs sm:text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
                  >
                    <Icon name="Download" size={16} />
                    <span>Download JPG</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-4 rounded-2xl border border-hps-border bg-hps-surface/50 text-xs text-hps-muted space-y-2">
              <h3 className="font-bold text-hps-text flex items-center gap-1.5">
                <Icon name="Sparkles" size={14} className="text-hps-accent" />
                <span>Tips for Perfect Background Removal:</span>
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-[11px] leading-relaxed">
                <li>
                  <strong>Even Lighting:</strong> Photos taken against a clean wall or solid backdrop yield the sharpest subject edges.
                </li>
                <li>
                  <strong>Tolerance:</strong> If shadows around ears or shoulders remain, increase Color Tolerance to 35-45%.
                </li>
                <li>
                  <strong>Eyedropper:</strong> If the backdrop is tinted (e.g., beige or blue), click the Eyedropper and sample the exact color.
                </li>
                <li>
                  <strong>Client-Side:</strong> All pixel computations execute directly in your browser. Your pictures are never uploaded to remote servers.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
};
