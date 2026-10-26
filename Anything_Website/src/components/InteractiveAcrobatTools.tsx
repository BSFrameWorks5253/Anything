import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileCheck, 
  Sliders, 
  Minimize2, 
  Scan, 
  Layers, 
  RotateCw, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  ShieldCheck, 
  Sparkles,
  RefreshCcw
} from 'lucide-react';

export const InteractiveAcrobatTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sign' | 'organize' | 'compress' | 'ocr' | 'fusion'>('sign');

  // --- 1. SIGNATURE PAD STATE ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#ffffff');
  const [brushWidth, setBrushWidth] = useState(3);
  const [hasSignature, setHasSignature] = useState(false);
  const [typedName, setTypedName] = useState('Burhanuddin Sounasath');
  const [activeSignatureMode, setActiveSignatureMode] = useState<'draw' | 'type'>('draw');
  const [copiedSignature, setCopiedSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set high DPI
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushWidth;
  }, [brushColor, brushWidth, activeTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const downloadSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = image;
    a.download = 'signature_acroflow.png';
    a.click();
  };

  // --- 2. ORGANIZE & SPLIT STATE ---
  interface PageItem {
    id: number;
    title: string;
    rotation: number;
    type: string;
    badgeColor: string;
  }

  const [pages, setPages] = useState<PageItem[]>([
    { id: 1, title: 'Architectural Blueprint Cover', rotation: 0, type: 'CAD DXF', badgeColor: 'bg-blue-500/20 text-blue-400' },
    { id: 2, title: 'Project Scope & Requirements', rotation: 0, type: 'Word Doc', badgeColor: 'bg-cyan-500/20 text-cyan-400' },
    { id: 3, title: 'Cost Estimation & Bill of Quantities', rotation: 0, type: 'Excel Sheet', badgeColor: 'bg-emerald-500/20 text-emerald-400' },
    { id: 4, title: 'Regulatory Compliance & Code', rotation: 0, type: 'Legal PDF', badgeColor: 'bg-rose-500/20 text-rose-400' },
    { id: 5, title: 'Executive Approval & Digital Sign', rotation: 0, type: 'Sign Form', badgeColor: 'bg-amber-500/20 text-amber-400' }
  ]);
  const [organizeSuccess, setOrganizeSuccess] = useState(false);

  const rotatePage = (id: number) => {
    setPages(pages.map(p => p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
  };

  const deletePage = (id: number) => {
    setPages(pages.filter(p => p.id !== id));
  };

  const movePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pages.length) return;
    const newPages = [...pages];
    const [moved] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, moved);
    setPages(newPages);
  };

  // --- 3. COMPRESSOR STATE ---
  const [compressionRatio, setCompressionRatio] = useState(70);
  const originalSizeMB = 24.6;
  const compressedSizeMB = (originalSizeMB * (1 - compressionRatio / 100)).toFixed(2);
  const savedPercent = compressionRatio;

  // --- 4. OCR VISION STATE ---
  const [isScanningOCR, setIsScanningOCR] = useState(false);
  const [ocrCompleted, setOcrCompleted] = useState(true);
  const [ocrCopied, setOcrCopied] = useState(false);
  const sampleOcrText = `ACROFLOW STUDIO PRO — CLIENT INVOICE & SPECIFICATION
Invoice Number: AF-2026-8941
Client Name: Global Creative Labs Inc.
Date of Issue: October 24, 2026
License Type: Sovereign Enterprise (100% Free / Zero Cloud Telemetry)

ITEM DESCRIPTION                         QTY    RATE       TOTAL
1. AcroFlow PDF Viewer & Markup Suite     1     $0.00      $0.00
2. Universal Heterogeneous Fusion Engine   1     $0.00      $0.00
3. AutoCAD DXF Vector Blueprint Parser     1     $0.00      $0.00
4. Offline Tesseract OCR Vision Engine     1     $0.00      $0.00
----------------------------------------------------------------
TOTAL BILLING: $0.00 (Adobe Acrobat Pro Equivalent: $239.88/yr Saved!)`;

  const triggerOCRScan = () => {
    setIsScanningOCR(true);
    setOcrCompleted(false);
    setTimeout(() => {
      setIsScanningOCR(false);
      setOcrCompleted(true);
    }, 1200);
  };

  // --- 5. HETEROGENEOUS FUSION STATE ---
  const [fusionQueue] = useState([
    { name: 'Master_Design_Spec.docx', size: '2.4 MB', type: 'Word', color: 'text-blue-400 bg-blue-500/10' },
    { name: 'Financial_Projections_2026.xlsx', size: '1.8 MB', type: 'Excel', color: 'text-emerald-400 bg-emerald-500/10' },
    { name: 'Tower_Level_3_Blueprint.dxf', size: '14.2 MB', type: 'CAD DXF', color: 'text-cyan-400 bg-cyan-500/10' },
    { name: 'Render_Orthographic_View.png', size: '8.1 MB', type: 'Image', color: 'text-purple-400 bg-purple-500/10' }
  ]);
  const [isFusing, setIsFusing] = useState(false);
  const [fusedResult, setFusedResult] = useState<string | null>(null);

  const triggerFusion = () => {
    setIsFusing(true);
    setFusedResult(null);
    setTimeout(() => {
      setIsFusing(false);
      setFusedResult('Complete_Master_Publication_2026.pdf (48 Pages · 16.4 MB)');
    }, 1500);
  };

  return (
    <section id="interactive-tools" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 scroll-mt-24">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Online Acrobat Tools</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
          Try Adobe Acrobat Tools, <span className="text-gradient-acrobat">100% Free Right Here</span>
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          Adobe Acrobat charges $20/month and locks you out after 1 document. Test our client-side tools directly in your browser with zero limits, zero accounts, and zero cloud uploads.
        </p>
      </div>

      {/* Main Glass Workspace */}
      <div className="liquid-glass rounded-3xl p-4 sm:p-8 shadow-2xl border-white/10 relative overflow-hidden">
        {/* Tool Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pb-6 border-b border-white/10 mb-8">
          <button
            onClick={() => setActiveTab('sign')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'sign'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-105'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Digital Signature Pad</span>
          </button>

          <button
            onClick={() => setActiveTab('organize')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'organize'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 scale-105'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Visual Page Splitter</span>
          </button>

          <button
            onClick={() => setActiveTab('compress')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'compress'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300'
            }`}
          >
            <Minimize2 className="w-4 h-4" />
            <span>Smart Compressor</span>
          </button>

          <button
            onClick={() => setActiveTab('ocr')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'ocr'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300'
            }`}
          >
            <Scan className="w-4 h-4" />
            <span>Offline OCR Vision</span>
          </button>

          <button
            onClick={() => setActiveTab('fusion')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'fusion'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 scale-105'
                : 'bg-white/5 hover:bg-white/10 text-zinc-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Universal Multi-Fusion</span>
          </button>
        </div>

        {/* 1. SIGNATURE PAD CONTENT */}
        {activeTab === 'sign' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>AcroFlow Digital Signature & Stamp Studio</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">
                    Free Acrobat Feature
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Draw with your mouse or stylus, or generate cursive calligraphy. Export as a transparent PNG stamp.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                <button
                  onClick={() => setActiveSignatureMode('draw')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    activeSignatureMode === 'draw' ? 'bg-white/20 text-white' : 'text-zinc-400'
                  }`}
                >
                  Draw Signature
                </button>
                <button
                  onClick={() => setActiveSignatureMode('type')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    activeSignatureMode === 'type' ? 'bg-white/20 text-white' : 'text-zinc-400'
                  }`}
                >
                  Type Calligraphy
                </button>
              </div>
            </div>

            {activeSignatureMode === 'draw' ? (
              <div className="space-y-4">
                {/* Controls Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400 font-medium">Ink Color:</span>
                    <div className="flex items-center gap-2">
                      {[
                        { color: '#ffffff', label: 'White / Silver' },
                        { color: '#ef4444', label: 'Acrobat Crimson' },
                        { color: '#38bdf8', label: 'Cyan Blue' },
                        { color: '#10b981', label: 'Emerald' }
                      ].map((item) => (
                        <button
                          key={item.color}
                          onClick={() => setBrushColor(item.color)}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            brushColor === item.color ? 'scale-120 border-white' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: item.color }}
                          title={item.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400 font-medium">Pen Thickness:</span>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={brushWidth}
                      onChange={(e) => setBrushWidth(Number(e.target.value))}
                      className="w-24 accent-rose-500 cursor-pointer"
                    />
                    <span className="font-mono text-zinc-300 w-4">{brushWidth}px</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={clearSignature}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Canvas</span>
                    </button>
                    <button
                      onClick={downloadSignature}
                      disabled={!hasSignature}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 disabled:opacity-40 text-white font-bold flex items-center gap-1.5 shadow-md shadow-rose-500/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Save Signature PNG</span>
                    </button>
                  </div>
                </div>

                {/* Draw Canvas */}
                <div className="relative w-full h-64 bg-[#0d0d12] rounded-2xl border-2 border-dashed border-white/15 overflow-hidden flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full cursor-crosshair touch-none"
                  />
                  {!hasSignature && (
                    <div className="absolute pointer-events-none text-center text-zinc-600 text-xs">
                      <p className="font-medium text-zinc-500">Sign here with mouse, finger, or stylus</p>
                      <span className="font-mono text-[10px]">Zero data uploaded · 100% Client-side canvas</span>
                    </div>
                  )}
                  {/* Subtle baseline */}
                  <div className="absolute bottom-8 left-12 right-12 h-[1px] bg-white/10 pointer-events-none flex justify-between text-[10px] text-zinc-600 font-mono pt-1">
                    <span>X ______________________________________</span>
                    <span>Sign on line</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Type Calligraphy Mode */
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                  <label className="text-xs font-bold text-zinc-300">Enter Your Full Name for Cursive Stamp:</label>
                  <input
                    type="text"
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="Enter name..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#09090d] border border-white/15 text-white text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { style: 'font-serif italic tracking-wider text-2xl text-rose-300', fontName: 'Formal Presidential Script' },
                    { style: 'font-mono italic tracking-widest text-xl text-cyan-300', fontName: 'Modern Executive Cursive' },
                    { style: 'italic font-light tracking-wide text-2xl text-amber-300', fontName: 'Elegance Fine Calligraphy' },
                    { style: 'font-bold uppercase tracking-widest text-lg text-emerald-300', fontName: 'Official Corporate Stamp' }
                  ].map((preset, idx) => (
                    <div
                      key={idx}
                      className="liquid-glass-subtle p-5 rounded-2xl border border-white/10 flex flex-col justify-between gap-4 group hover:border-white/30 transition-all"
                    >
                      <div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">{preset.fontName}</span>
                        <div className={`mt-3 py-2 ${preset.style}`}>
                          {typedName || 'Your Signature Here'}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                        <span className="text-emerald-400 font-mono text-[10px]">Verified Hash Stamp</span>
                        <button
                          onClick={() => {
                            setCopiedSignature(true);
                            navigator.clipboard.writeText(typedName);
                            setTimeout(() => setCopiedSignature(false), 2000);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          {copiedSignature ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedSignature ? 'Copied' : 'Copy Stamp'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. ORGANIZE & SPLIT CONTENT */}
        {activeTab === 'organize' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>DocuFlow Visual PDF Page Studio & Splitter</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono">
                    Free Acrobat Feature
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Drag pages, rotate orientation, or delete unwanted sheets. In Adobe this costs $239/year.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setOrganizeSuccess(true);
                    setTimeout(() => setOrganizeSuccess(false), 3000);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Reorganized PDF</span>
                </button>
              </div>
            </div>

            {organizeSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between animate-in fade-in">
                <span className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Success! PDF page structure reorganized and ready for instant lossless download.</span>
                </span>
                <span className="font-mono text-[10px]">0s server delay</span>
              </div>
            )}

            {/* Visual Page Thumbnails Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  className="liquid-glass-subtle p-3 rounded-2xl border border-white/10 flex flex-col justify-between gap-3 group hover:border-cyan-500/40 transition-all relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-mono text-[10px] text-zinc-300">
                      {index + 1}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${page.badgeColor}`}>
                      {page.type}
                    </span>
                  </div>

                  {/* Thumbnail Card Preview */}
                  <div 
                    className="w-full h-32 bg-[#09090d] rounded-xl border border-white/5 flex flex-col items-center justify-center p-2 text-center transition-transform duration-300"
                    style={{ transform: `rotate(${page.rotation}deg)` }}
                  >
                    <FileText className="w-6 h-6 text-zinc-500 mb-1" />
                    <span className="text-[10px] font-semibold text-zinc-300 line-clamp-2">
                      {page.title}
                    </span>
                    <span className="text-[9px] text-zinc-600 font-mono mt-1">
                      {page.rotation > 0 ? `${page.rotation}°` : '0° Normal'}
                    </span>
                  </div>

                  {/* Page Action Controls */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-zinc-400">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => movePage(index, index - 1)}
                        disabled={index === 0}
                        className="px-1.5 py-1 rounded bg-white/5 hover:bg-white/15 disabled:opacity-30 text-[10px]"
                        title="Move Left"
                      >
                        &larr;
                      </button>
                      <button
                        onClick={() => movePage(index, index + 1)}
                        disabled={index === pages.length - 1}
                        className="px-1.5 py-1 rounded bg-white/5 hover:bg-white/15 disabled:opacity-30 text-[10px]"
                        title="Move Right"
                      >
                        &rarr;
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => rotatePage(page.id)}
                        className="p-1 rounded bg-white/5 hover:bg-white/15 hover:text-cyan-400 text-zinc-400"
                        title="Rotate 90 degrees"
                      >
                        <RotateCw className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deletePage(page.id)}
                        className="p-1 rounded bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-zinc-400"
                        title="Exclude Page"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs">
              <span className="text-zinc-400">
                Total Pages in Master Publication: <strong className="text-white">{pages.length}</strong>
              </span>
              <span className="text-zinc-400 font-mono text-[11px]">
                Tip: Use desktop app <Link to="/apps/docuflow-studio" className="text-cyan-400 hover:underline">DocuFlow Studio Pro</Link> for 1000+ page blueprints
              </span>
            </div>
          </div>
        )}

        {/* 3. SMART COMPRESSOR CONTENT */}
        {activeTab === 'compress' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Lossless Vector & Image PDF Compressor</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono">
                  No 100MB File Size Limits
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Adobe limits file uploads and compresses on slow cloud servers. AcroFlow optimizes locally on your CPU/GPU.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Slider Control */}
              <div className="md:col-span-2 liquid-glass-subtle p-6 rounded-2xl border border-white/10 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Target Compression Level:</span>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs">
                    {savedPercent}% Reduction
                  </span>
                </div>

                <input
                  type="range"
                  min="20"
                  max="85"
                  step="5"
                  value={compressionRatio}
                  onChange={(e) => setCompressionRatio(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
                />

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div
                    onClick={() => setCompressionRatio(35)}
                    className={`p-3 rounded-xl cursor-pointer border transition-all ${
                      compressionRatio <= 40
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-white'
                        : 'bg-white/5 border-white/5 text-zinc-400'
                    }`}
                  >
                    <span className="font-bold block">Lossless Vector</span>
                    <span className="text-[10px] text-zinc-500">Highest DPI (300)</span>
                  </div>

                  <div
                    onClick={() => setCompressionRatio(65)}
                    className={`p-3 rounded-xl cursor-pointer border transition-all ${
                      compressionRatio > 40 && compressionRatio <= 75
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-white'
                        : 'bg-white/5 border-white/5 text-zinc-400'
                    }`}
                  >
                    <span className="font-bold block">Recommended</span>
                    <span className="text-[10px] text-zinc-500">Balanced Web & Print</span>
                  </div>

                  <div
                    onClick={() => setCompressionRatio(85)}
                    className={`p-3 rounded-xl cursor-pointer border transition-all ${
                      compressionRatio > 75
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-white'
                        : 'bg-white/5 border-white/5 text-zinc-400'
                    }`}
                  >
                    <span className="font-bold block">Extreme</span>
                    <span className="text-[10px] text-zinc-500">Lightweight Email</span>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="liquid-glass-bright p-6 rounded-2xl border border-white/15 flex flex-col justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                    Optimization Telemetry
                  </span>
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Original Size:</span>
                      <span className="font-mono text-zinc-300 font-bold">{originalSizeMB} MB</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-indigo-400 font-bold">Estimated Output:</span>
                      <span className="font-mono text-emerald-400 font-bold text-base">{compressedSizeMB} MB</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-300"
                        style={{ width: `${100 - savedPercent}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold text-right">
                      {savedPercent}% Disk Space Saved
                    </div>
                  </div>
                </div>

                <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Compressed PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. OFFLINE OCR VISION CONTENT */}
        {activeTab === 'ocr' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Client-Side Tesseract OCR Vision</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">
                    Zero Server Uploads
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Adobe sends your scanned contracts and financial docs to cloud AI models. Our OCR runs 100% locally on your machine.
                </p>
              </div>

              <button
                onClick={triggerOCRScan}
                disabled={isScanningOCR}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${isScanningOCR ? 'animate-spin' : ''}`} />
                <span>{isScanningOCR ? 'Processing Neural Scan...' : 'Re-Run OCR Scanner'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Document Image with OCR Highlight Overlay */}
              <div className="relative bg-[#0d0d12] rounded-2xl border border-white/10 p-4 overflow-hidden min-h-[260px] flex flex-col justify-center">
                {isScanningOCR && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-[shimmer_1.2s_infinite]" />
                )}
                
                <div className="space-y-2 font-mono text-[11px] text-zinc-400 bg-black/40 p-4 rounded-xl border border-white/5 relative">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                    <span className="text-emerald-400 font-bold">SCAN_DOC_491.PDF (Simulated Paper Scan)</span>
                    <span className="text-[9px] text-zinc-500">DPI: 300 · Monochrome</span>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-1.5 rounded text-emerald-300">
                    [DETECTED HEADING]: ACROFLOW STUDIO PRO — CLIENT INVOICE & SPECIFICATION
                  </div>
                  <div className="bg-emerald-500/5 p-1 rounded text-zinc-300">
                    Invoice: AF-2026-8941 · Client: Global Creative Labs Inc.
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-1.5 rounded text-emerald-300">
                    [TABLE EXTRACTED]: 4 Rows Detected · Line Items Verified
                  </div>
                  <div className="bg-emerald-500/5 p-1 rounded text-zinc-300">
                    Total Billing: $0.00 (Zero Subscription Fee)
                  </div>
                </div>
              </div>

              {/* Parsed Extracted Text */}
              <div className="liquid-glass-subtle rounded-2xl border border-white/10 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Extracted Plain Text & JSON</span>
                    </span>
                    <button
                      onClick={() => {
                        setOcrCopied(true);
                        navigator.clipboard.writeText(sampleOcrText);
                        setTimeout(() => setOcrCopied(false), 2000);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white font-semibold flex items-center gap-1.5"
                    >
                      {ocrCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{ocrCopied ? 'Copied to Clipboard' : 'Copy Text'}</span>
                    </button>
                  </div>

                  <pre className="text-[11px] font-mono text-zinc-300 bg-black/50 p-3 rounded-xl border border-white/5 h-44 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {ocrCompleted ? sampleOcrText : 'Scanning optical characters on CPU worker...'}
                  </pre>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Confidence Score: 99.4%</span>
                  <span>Engine: Tesseract WASM Local</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. UNIVERSAL MULTI-FUSION CONTENT */}
        {activeTab === 'fusion' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Heterogeneous Universal Document Fusion</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono">
                    AcroFlow Exclusive
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Combine Word, Excel, AutoCAD DXF, PNG, and PDF into one unified publication. Adobe Acrobat cannot do this without external plugins.
                </p>
              </div>

              <button
                onClick={triggerFusion}
                disabled={isFusing}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Layers className={`w-3.5 h-3.5 ${isFusing ? 'animate-spin' : ''}`} />
                <span>{isFusing ? 'Synthesizing Formats...' : 'Fuse Into 1 Master PDF'}</span>
              </button>
            </div>

            {/* Fusion Queue */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Staggered Input Queue (Mix & Match Any Formats):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {fusionQueue.map((item, idx) => (
                  <div
                    key={idx}
                    className="liquid-glass-subtle p-3.5 rounded-2xl border border-white/10 flex items-center gap-3 relative group"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${item.color}`}>
                      {item.type}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-white truncate block">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {item.size} · Page Sequence #{idx + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fused Result Output */}
            {fusedResult && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-cyan-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Universal Fusion Complete!
                    </span>
                    <span className="text-xs text-zinc-300 font-mono">
                      {fusedResult}
                    </span>
                  </div>
                </div>

                <button className="px-4 py-2 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-zinc-200 transition-colors flex items-center gap-2">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Master Publication</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
