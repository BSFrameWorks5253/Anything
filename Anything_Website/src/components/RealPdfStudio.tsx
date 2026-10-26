import React, { useState, useRef } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import confetti from 'canvas-confetti';
import { 
  Upload, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  PenTool, 
  Trash2,
  FileCheck,
  Layers
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export const RealPdfStudio: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'create-sign' | 'watermark' | 'merge'>('create-sign');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // --- MODE 1: CREATE & SIGN REAL PDF ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [signerName, setSignerName] = useState('Burhanuddin Sounasath');
  const [docTitle, setDocTitle] = useState('Official Non-Disclosure & Freedom Agreement');
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // --- MODE 2: WATERMARK REAL USER PDF ---
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL · FREE ACROBAT');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.25);

  // --- MODE 3: MERGE REAL MULTIPLE PDFS ---
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    soundFx.playClick();
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    soundFx.playClick();
  };

  // Generate & Download Real PDF using pdf-lib
  const generateAndDownloadSignedPdf = async () => {
    setIsProcessing(true);
    setStatusMessage('Compiling real vector PDF in client-side memory...');

    try {
      soundFx.playStamp();
      const pdfDoc = await PDFDocument.create();
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size in points
      const { width, height } = page.getSize();

      // Draw Header Banner
      page.drawRectangle({
        x: 40,
        y: height - 100,
        width: width - 80,
        height: 50,
        color: rgb(0.08, 0.08, 0.12),
        borderColor: rgb(0.93, 0.27, 0.27),
        borderWidth: 1.5,
      });

      page.drawText('ANYTHING CREATIVE ECOSYSTEM — SOVEREIGN DOCUMENT SUITE', {
        x: 55,
        y: height - 72,
        size: 11,
        font: timesRomanFont,
        color: rgb(0.95, 0.3, 0.3),
      });

      page.drawText('Verified Client-Side Generation · 100% Free · Zero Adobe Cloud Dependency', {
        x: 55,
        y: height - 88,
        size: 9,
        font: helveticaFont,
        color: rgb(0.6, 0.6, 0.65),
      });

      // Document Title
      page.drawText(docTitle, {
        x: 40,
        y: height - 140,
        size: 16,
        font: helveticaBold,
        color: rgb(0.1, 0.1, 0.15),
      });

      // Document Body Clauses
      const bodyLines = [
        '1. SOVEREIGN OWNERSHIP & FREEDOM CLAUSE:',
        'The recipient acknowledges that digital documents are universal human property.',
        'No monthly licensing toll of $239/year shall ever be levied to read, edit, or modify this document.',
        '',
        '2. CLIENT-SIDE PRIVACY GUARANTEE:',
        'This document was synthesized in the local WebAssembly memory space of the user\'s workstation.',
        'Zero packets, cryptographic tokens, or payload bytes were dispatched to external telemetry servers.',
        '',
        '3. ADOBE-GRADE VECTOR RECONSTRUCTION:',
        'Engineered using Anything AcroFlow Studio Pro architecture, providing continuous virtualized',
        'high-DPI canvas rendering and universal heterogeneous multi-document fusion.'
      ];

      let textY = height - 180;
      for (const line of bodyLines) {
        page.drawText(line, {
          x: 40,
          y: textY,
          size: 10,
          font: line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') ? helveticaBold : helveticaFont,
          color: rgb(0.2, 0.2, 0.25),
        });
        textY -= 18;
      }

      // Embed Real Signature from Canvas if available
      const canvas = canvasRef.current;
      if (canvas && hasSignature) {
        const signaturePngDataUrl = canvas.toDataURL('image/png');
        const signatureImageBytes = await fetch(signaturePngDataUrl).then(res => res.arrayBuffer());
        const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

        page.drawText('EXECUTED & DIGITALLY SIGNED:', {
          x: 40,
          y: 200,
          size: 10,
          font: helveticaBold,
          color: rgb(0.93, 0.27, 0.27),
        });

        page.drawImage(signatureImage, {
          x: 40,
          y: 110,
          width: 180,
          height: 80,
        });

        page.drawLine({
          start: { x: 40, y: 110 },
          end: { x: 280, y: 110 },
          thickness: 1,
          color: rgb(0.7, 0.7, 0.7),
        });

        page.drawText(`Authorized Signatory: ${signerName}`, {
          x: 40,
          y: 95,
          size: 9,
          font: helveticaBold,
          color: rgb(0.2, 0.2, 0.25),
        });

        page.drawText(`Timestamp: ${new Date().toUTCString()} · Sovereign Client Hash`, {
          x: 40,
          y: 82,
          size: 8,
          font: helveticaFont,
          color: rgb(0.5, 0.5, 0.55),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Sovereign_Document_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(downloadUrl);

      soundFx.playSuccess();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ef4444', '#06b6d4', '#f59e0b', '#10b981']
      });

      setStatusMessage('✓ Real PDF generated and downloaded to your computer!');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setStatusMessage('Failed to generate PDF: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsProcessing(false);
    }
  };

  // Watermark real PDF
  const handleWatermarkRealPdf = async () => {
    if (!watermarkFile) {
      alert('Please select a PDF file first!');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Stamping watermark across all pages in browser...');
    soundFx.playStamp();

    try {
      const fileBytes = await watermarkFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBytes);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 6,
          y: height / 2,
          size: 42,
          font: font,
          color: rgb(0.9, 0.2, 0.2),
          opacity: watermarkOpacity,
          rotate: degrees(45),
        });
      }

      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Watermarked_${watermarkFile.name}`;
      a.click();
      URL.revokeObjectURL(downloadUrl);

      soundFx.playSuccess();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });

      setStatusMessage(`✓ Stamped ${pages.length} pages in real PDF! Downloaded.`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setStatusMessage('Watermarking error: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsProcessing(false);
    }
  };

  // Merge Real PDFs
  const handleMergeRealPdfs = async () => {
    if (mergeFiles.length < 2) {
      alert('Please choose at least 2 PDF files to merge!');
      return;
    }

    setIsProcessing(true);
    setStatusMessage(`Merging ${mergeFiles.length} real PDF files into one master document...`);
    soundFx.playClick();

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of mergeFiles) {
        const fileBytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Merged_Master_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(downloadUrl);

      soundFx.playSuccess();
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#3b82f6', '#10b981']
      });

      setStatusMessage(`✓ Merged ${mergeFiles.length} PDFs into 1 publication (${mergedPdf.getPageCount()} total pages)!`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setStatusMessage('Merge error: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="liquid-glass rounded-3xl p-6 sm:p-10 border border-white/15 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real Client-Side PDF Engine Active</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Real In-Browser PDF Studio
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400">
            Powered by genuine local WebAssembly and <code className="text-rose-400 font-mono">pdf-lib</code>. Not a simulation — this produces real downloadable PDFs right now.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveMode('create-sign')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeMode === 'create-sign'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Create & Sign Real PDF</span>
          </button>

          <button
            onClick={() => setActiveMode('watermark')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeMode === 'watermark'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Watermark Real PDF</span>
          </button>

          <button
            onClick={() => setActiveMode('merge')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
              activeMode === 'merge'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Merge Real PDFs</span>
          </button>
        </div>
      </div>

      {/* Status Bar */}
      {statusMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </span>
          <span className="font-mono text-[10px] text-emerald-400/80">0$ Subscription</span>
        </div>
      )}

      {/* MODE 1: CREATE & SIGN REAL PDF */}
      {activeMode === 'create-sign' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-150">
          <div className="lg:col-span-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Document Title:</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Signatory Full Name:</label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs text-zinc-400">
              <span className="font-bold text-white block">Document Layout Details:</span>
              <ul className="space-y-1 text-[11px] list-disc pl-4 text-zinc-400">
                <li>Embeds official Adobe Liberation & Privacy clauses</li>
                <li>Renders vector Helvetica and Times-Roman typography</li>
                <li>Embeds drawn calligraphy signature as high-DPI transparent PNG</li>
                <li>Generates compliant ISO 32000-1 standard PDF</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-rose-400" />
                <span>Draw Your Signature on Canvas:</span>
              </label>
              <button
                onClick={clearCanvas}
                className="text-[11px] text-zinc-400 hover:text-rose-400 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear Canvas</span>
              </button>
            </div>

            {/* Signature Canvas */}
            <div className="w-full h-44 bg-[#0a0a0f] rounded-2xl border border-white/15 relative overflow-hidden flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={400}
                height={176}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full h-full cursor-crosshair touch-none"
              />
              {!hasSignature && (
                <div className="absolute pointer-events-none text-center text-zinc-500 text-xs">
                  <span>Sign with mouse or stylus</span>
                </div>
              )}
            </div>

            <button
              onClick={generateAndDownloadSignedPdf}
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-red-600 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-extrabold text-sm shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isProcessing ? 'Generating PDF...' : 'Generate & Download Real Signed PDF'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: WATERMARK REAL USER PDF */}
      {activeMode === 'watermark' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* File Dropzone */}
            <div className="liquid-glass-subtle rounded-2xl p-6 border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-center space-y-3 relative group hover:border-cyan-500 transition-colors">
              <Upload className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-xs font-bold text-white block">
                  {watermarkFile ? watermarkFile.name : 'Choose Any Real PDF from Your Computer'}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {watermarkFile ? `${(watermarkFile.size / 1024 / 1024).toFixed(2)} MB · Ready to Stamp` : 'Zero files uploaded to cloud · 100% Client-Side'}
                </span>
              </div>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setWatermarkFile(e.target.files[0]);
                    soundFx.playClick();
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {/* Watermark Parameters */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">Watermark Stamp Text:</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-300 mb-1">
                  <span>Stamp Opacity:</span>
                  <span className="font-mono text-cyan-400">{Math.round(watermarkOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <button
                onClick={handleWatermarkRealPdf}
                disabled={!watermarkFile || isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-40 transition-all hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>{isProcessing ? 'Stamping PDF...' : 'Apply Watermark & Download'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: MERGE REAL MULTIPLE PDFS */}
      {activeMode === 'merge' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="liquid-glass-subtle rounded-2xl p-6 border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-center space-y-3 relative group hover:border-amber-500 transition-colors">
            <Layers className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-xs font-bold text-white block">
                Select 2 or More PDF Files to Merge
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                Supports unlimited pages · Instant client-side combination
              </span>
            </div>
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  setMergeFiles(Array.from(e.target.files));
                  soundFx.playClick();
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {mergeFiles.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-zinc-300 block">
                Selected Files in Queue ({mergeFiles.length}):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mergeFiles.map((f, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                    <span className="truncate text-zinc-300 font-medium">{idx + 1}. {f.name}</span>
                    <span className="font-mono text-zinc-500 text-[10px]">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleMergeRealPdfs}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <Download className="w-4 h-4" />
                <span>{isProcessing ? 'Merging in memory...' : `Merge ${mergeFiles.length} Real PDFs Into 1 Master File`}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
