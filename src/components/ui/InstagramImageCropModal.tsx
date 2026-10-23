import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Check,
  X,
  RotateCcw,
  Circle,
  Square,
  Layers,
  Layout,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export type CropShape = 'banner' | '16:9' | 'square' | 'circle';

interface InstagramImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  initialShape?: CropShape;
  title?: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

export const InstagramImageCropModal: React.FC<InstagramImageCropModalProps> = ({
  isOpen,
  imageSrc,
  initialShape = 'banner',
  title = 'Edit Photo',
  onClose,
  onCropComplete,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropShape, setCropShape] = useState<CropShape>(initialShape);
  const [fitMode, setFitMode] = useState<'fill' | 'fit'>('fill');

  const viewportRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset controls when a new image is loaded
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setFitMode('fill');
      setCropShape(initialShape);
    }
  }, [isOpen, imageSrc, initialShape]);

  // Drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Touch drag handling for touch screens
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((prev) => Math.min(3, Math.max(0.6, prev + delta)));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleToggleFit = () => {
    if (fitMode === 'fill') {
      setFitMode('fit');
      setZoom(0.9);
      setPan({ x: 0, y: 0 });
    } else {
      setFitMode('fill');
      setZoom(1.05);
      setPan({ x: 0, y: 0 });
    }
  };

  const handleAlignVertical = (pos: 'top' | 'center' | 'bottom') => {
    if (pos === 'top') {
      setPan((prev) => ({ ...prev, y: 70 }));
    } else if (pos === 'bottom') {
      setPan((prev) => ({ ...prev, y: -70 }));
    } else {
      setPan((prev) => ({ ...prev, y: 0 }));
    }
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
    setFitMode('fill');
  };

  // High-Resolution Export
  const handleApplyCrop = () => {
    if (!imageRef.current) return;

    const img = imageRef.current;
    const canvas = document.createElement('canvas');

    let outWidth = 720;
    let outHeight = 720;
    let vpWidth = 340;
    let vpHeight = 340;

    if (cropShape === 'banner') {
      // 2.055:1 matches Splash Screen (740px x 360px) in Ultra-HD
      outWidth = 1480;
      outHeight = 720;
      vpWidth = viewportRef.current?.clientWidth || 460;
      vpHeight = viewportRef.current?.clientHeight || 224;
    } else if (cropShape === '16:9') {
      outWidth = 1280;
      outHeight = 720;
      vpWidth = viewportRef.current?.clientWidth || 460;
      vpHeight = viewportRef.current?.clientHeight || 258;
    } else {
      outWidth = 720;
      outHeight = 720;
      vpWidth = viewportRef.current?.clientWidth || 340;
      vpHeight = viewportRef.current?.clientHeight || 340;
    }

    canvas.width = outWidth;
    canvas.height = outHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Circular crop clipping if requested
    if (cropShape === 'circle') {
      ctx.beginPath();
      ctx.arc(outWidth / 2, outHeight / 2, Math.min(outWidth, outHeight) / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    // Transform setup
    ctx.translate(outWidth / 2, outHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Compute aspect ratio scaling
    const scaleFactorX = outWidth / vpWidth;
    const scaleFactorY = outHeight / vpHeight;
    const scaleFactor = (scaleFactorX + scaleFactorY) / 2;

    // Apply pan & zoom
    const drawX = pan.x * scaleFactor;
    const drawY = pan.y * scaleFactor;

    // Calculate natural draw dimensions based on fitMode
    const naturalRatio = img.naturalWidth / img.naturalHeight;
    const targetRatio = outWidth / outHeight;
    let baseWidth = outWidth;
    let baseHeight = outHeight;

    if (fitMode === 'fit') {
      if (naturalRatio > targetRatio) {
        baseWidth = outWidth;
        baseHeight = outWidth / naturalRatio;
      } else {
        baseHeight = outHeight;
        baseWidth = outHeight * naturalRatio;
      }
    } else {
      // Fill
      if (naturalRatio > targetRatio) {
        baseHeight = outHeight;
        baseWidth = outHeight * naturalRatio;
      } else {
        baseWidth = outWidth;
        baseHeight = outWidth / naturalRatio;
      }
    }

    const finalWidth = baseWidth * zoom;
    const finalHeight = baseHeight * zoom;

    ctx.drawImage(
      img,
      drawX - finalWidth / 2,
      drawY - finalHeight / 2,
      finalWidth,
      finalHeight
    );

    const dataUrl = canvas.toDataURL('image/png', 0.95);
    onCropComplete(dataUrl);
    onClose();
  };

  if (!isOpen) return null;

  // Compute viewport classes based on aspect ratio
  let vpWidthHeightClass = 'w-[320px] h-[320px] sm:w-[340px] sm:h-[340px]';
  if (cropShape === 'banner') {
    vpWidthHeightClass = 'w-[320px] h-[156px] sm:w-[460px] sm:h-[224px]';
  } else if (cropShape === '16:9') {
    vpWidthHeightClass = 'w-[320px] h-[180px] sm:w-[460px] sm:h-[258px]';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-white tracking-wide">
            <span className="w-2 h-2 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-600" />
            <span>{title}</span>
          </div>

          <button
            onClick={handleApplyCrop}
            className="px-4 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Apply Crop</span>
          </button>
        </div>

        {/* Viewport Area */}
        <div className="p-6 flex flex-col items-center justify-center bg-black select-none">
          <div
            ref={viewportRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            className={`relative ${vpWidthHeightClass} overflow-hidden cursor-grab active:cursor-grabbing bg-zinc-900 shadow-inner flex items-center justify-center transition-all ${
              cropShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
            }`}
          >
            {/* The Image */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop Source"
              draggable={false}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                maxWidth: fitMode === 'fit' ? '100%' : 'none',
                maxHeight: fitMode === 'fit' ? '100%' : 'none',
              }}
              className={`pointer-events-none select-none ${
                fitMode === 'fill' ? 'w-full h-full object-cover' : 'object-contain'
              }`}
            />

            {/* Rule-of-Thirds 3x3 Grid Overlay */}
            <div
              className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${
                isDragging ? 'opacity-70' : 'opacity-20 hover:opacity-50'
              }`}
            >
              <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                <div className="border-r border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="" />
              </div>
            </div>

            {/* Circular Border Guide for PFP */}
            {cropShape === 'circle' && (
              <div className="absolute inset-0 rounded-full border-2 border-white/40 pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]" />
            )}

            {/* Splash Banner Guide Indicator */}
            {cropShape === 'banner' && (
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono text-cyan-300 pointer-events-none">
                Splash Screen Frame (2.05:1)
              </div>
            )}
          </div>
          <p className="text-[11px] font-mono text-zinc-500 mt-2">
            Drag to pan position • Scroll or slider to zoom • Click &quot;Top&quot; to keep head/upper area visible
          </p>
        </div>

        {/* Tooling Bar */}
        <div className="px-5 py-4 bg-zinc-900/90 border-t border-zinc-800 space-y-3.5">
          {/* Zoom Slider & Vertical Alignment */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={() => setZoom((prev) => Math.max(0.6, prev - 0.15))}
                className="text-zinc-400 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="0.6"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <button
                onClick={() => setZoom((prev) => Math.min(3, prev + 0.15))}
                className="text-zinc-400 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono text-zinc-400 w-10 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Quick Focus / Alignment Buttons */}
            <div className="flex items-center gap-1.5 self-center">
              <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">Focus:</span>
              <button
                onClick={() => handleAlignVertical('top')}
                className="px-2 py-1 rounded-lg text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 flex items-center gap-1 transition-all"
                title="Focus on Top of Image (e.g. Character Head / Logo)"
              >
                <ArrowUp className="w-3 h-3 text-cyan-400" />
                <span>Top</span>
              </button>
              <button
                onClick={() => handleAlignVertical('center')}
                className="px-2 py-1 rounded-lg text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-all"
                title="Center Image"
              >
                <span>Center</span>
              </button>
              <button
                onClick={() => handleAlignVertical('bottom')}
                className="px-2 py-1 rounded-lg text-[11px] font-mono bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 flex items-center gap-1 transition-all"
                title="Focus on Bottom of Image"
              >
                <ArrowDown className="w-3 h-3 text-cyan-400" />
                <span>Bottom</span>
              </button>
            </div>
          </div>

          {/* Ratio & Shape Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-800/70">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCropShape('banner')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  cropShape === 'banner'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-zinc-400 hover:text-white bg-zinc-800/80 border border-zinc-700'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Banner (Splash 2:1)</span>
              </button>

              <button
                onClick={() => setCropShape('16:9')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  cropShape === '16:9'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-zinc-400 hover:text-white bg-zinc-800/80 border border-zinc-700'
                }`}
              >
                <Layout className="w-3 h-3" />
                <span>16:9</span>
              </button>

              <button
                onClick={() => setCropShape('square')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  cropShape === 'square'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-zinc-400 hover:text-white bg-zinc-800/80 border border-zinc-700'
                }`}
              >
                <Square className="w-3 h-3" />
                <span>Square</span>
              </button>

              <button
                onClick={() => setCropShape('circle')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  cropShape === 'circle'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-zinc-400 hover:text-white bg-zinc-800/80 border border-zinc-700'
                }`}
              >
                <Circle className="w-3 h-3" />
                <span>Circle</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Fit / Fill Toggle */}
              <button
                onClick={handleToggleFit}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 border transition-all ${
                  fitMode === 'fit'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white'
                }`}
                title="Toggle Fit / Fill"
              >
                {fitMode === 'fit' ? (
                  <Minimize2 className="w-3 h-3" />
                ) : (
                  <Maximize2 className="w-3 h-3" />
                )}
                <span>{fitMode === 'fit' ? 'Fit (No Crop)' : 'Fill'}</span>
              </button>

              {/* Rotate 90° */}
              <button
                onClick={handleRotate}
                className="p-1.5 rounded-lg text-xs font-medium bg-zinc-800/80 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 transition-all flex items-center gap-1"
                title="Rotate 90°"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              {/* Reset */}
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                title="Reset adjustments"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
