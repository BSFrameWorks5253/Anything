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
  Sparkles,
  Circle,
  Square,
  Sliders,
} from 'lucide-react';
import { GlassButton } from './GlassButton';

interface InstagramImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  initialShape?: 'circle' | 'square';
  title?: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

export const InstagramImageCropModal: React.FC<InstagramImageCropModalProps> = ({
  isOpen,
  imageSrc,
  initialShape = 'circle',
  title = 'Edit Photo',
  onClose,
  onCropComplete,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropShape, setCropShape] = useState<'circle' | 'square'>(initialShape);
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

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.min(3, Math.max(0.8, prev + delta)));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleToggleFit = () => {
    if (fitMode === 'fill') {
      setFitMode('fit');
      setZoom(0.85);
      setPan({ x: 0, y: 0 });
    } else {
      setFitMode('fill');
      setZoom(1.2);
      setPan({ x: 0, y: 0 });
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
    const size = 720; // 720x720 high-res output
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Circular crop clipping if requested
    if (cropShape === 'circle') {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    // Transform setup
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Compute aspect ratio scaling
    const viewportSize = 340; // Size of CSS viewport in px
    const scaleFactor = size / viewportSize;

    // Apply pan & zoom
    const drawX = pan.x * scaleFactor;
    const drawY = pan.y * scaleFactor;

    // Calculate natural draw dimensions based on fitMode
    const naturalRatio = img.naturalWidth / img.naturalHeight;
    let baseWidth = size;
    let baseHeight = size;

    if (fitMode === 'fit') {
      if (naturalRatio > 1) {
        baseWidth = size;
        baseHeight = size / naturalRatio;
      } else {
        baseHeight = size;
        baseWidth = size * naturalRatio;
      }
    } else {
      // Fill
      if (naturalRatio > 1) {
        baseHeight = size;
        baseWidth = size * naturalRatio;
      } else {
        baseWidth = size;
        baseHeight = size / naturalRatio;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Instagram Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs font-bold text-white tracking-wide">
            <span className="w-2 h-2 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600" />
            <span>{title}</span>
          </div>

          <button
            onClick={handleApplyCrop}
            className="px-3.5 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Done</span>
          </button>
        </div>

        {/* Viewport Area */}
        <div className="p-6 flex flex-col items-center justify-center bg-black select-none">
          <div
            ref={viewportRef}
            onMouseDown={handleMouseDown}
            onWheel={handleWheel}
            className={`relative w-[320px] h-[320px] sm:w-[340px] sm:h-[340px] overflow-hidden cursor-grab active:cursor-grabbing bg-zinc-900 shadow-inner flex items-center justify-center transition-all ${
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

            {/* Instagram Rule-of-Thirds 3x3 Grid Overlay */}
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
                <div className="border-r border-white/40" />
                <div className="border-r border-white/40" />
                <div className="" />
              </div>
            </div>

            {/* Circular Border Guide for PFP */}
            {cropShape === 'circle' && (
              <div className="absolute inset-0 rounded-full border-2 border-white/40 pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]" />
            )}
          </div>
        </div>

        {/* Instagram Tooling Bar */}
        <div className="px-5 py-4 bg-zinc-900/90 border-t border-zinc-800 space-y-3.5">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setZoom((prev) => Math.max(0.8, prev - 0.2))}
              className="text-zinc-400 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="0.8"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <button
              onClick={() => setZoom((prev) => Math.min(3, prev + 0.2))}
              className="text-zinc-400 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono text-zinc-400 w-9 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Action Buttons: Fit, Rotate, Shape, Reset */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {/* Fit / Fill Toggle */}
              <button
                onClick={handleToggleFit}
                className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
                  fitMode === 'fit'
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                    : 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white'
                }`}
                title="Toggle Fit / Fill"
              >
                {fitMode === 'fit' ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
                <span>{fitMode === 'fit' ? 'Fit' : 'Fill'}</span>
              </button>

              {/* Rotate 90° */}
              <button
                onClick={handleRotate}
                className="p-2 rounded-xl text-xs font-medium bg-zinc-800/80 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 transition-all flex items-center gap-1.5"
                title="Rotate 90° Clockwise"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate ({rotation}°)</span>
              </button>

              {/* Shape Switcher (Circle PFP / Square) */}
              <button
                onClick={() => setCropShape((prev) => (prev === 'circle' ? 'square' : 'circle'))}
                className="p-2 rounded-xl text-xs font-medium bg-zinc-800/80 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 transition-all flex items-center gap-1.5"
                title="Switch Circle / Square Frame"
              >
                {cropShape === 'circle' ? (
                  <Circle className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <span>{cropShape === 'circle' ? 'Circle' : 'Square'}</span>
              </button>
            </div>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="p-2 rounded-xl text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              title="Reset All Adjustments"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
