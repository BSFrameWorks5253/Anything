import React from 'react';
import { Sparkles } from 'lucide-react';

export const FormatMarquee: React.FC = () => {
  const formats = [
    { ext: '.PDF', name: 'Adobe Standard Document', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { ext: '.DOCX', name: 'Microsoft Word Document', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { ext: '.XLSX', name: 'Microsoft Excel Spreadsheet', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { ext: '.DXF', name: 'AutoCAD Vector Blueprint', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { ext: '.PNG', name: 'Lossless High-DPI Image', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { ext: '.WEBP', name: 'Modern Compressed Graphic', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { ext: '.SVG', name: 'Scalable Vector Graphic', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
    { ext: '.CSV', name: 'Raw Tabular Dataset', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
    { ext: '.ZIP', name: 'Multi-Page Archive Package', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' }
  ];

  return (
    <div className="w-full py-8 overflow-hidden relative border-y border-white/5 bg-black/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 mb-3 flex items-center justify-between text-xs text-zinc-500 font-mono">
        <span className="flex items-center gap-1.5 text-zinc-400">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Universal Heterogeneous Input Matrix</span>
        </span>
        <span className="hidden sm:inline">100% Client-Side Direct3D & WASM Rendering</span>
      </div>

      <div className="flex gap-4 animate-[marquee_25s_linear_infinite] whitespace-nowrap">
        {[...formats, ...formats, ...formats].map((fmt, idx) => (
          <div
            key={idx}
            className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl border ${fmt.color} backdrop-blur-md shadow-sm shrink-0`}
          >
            <span className="font-mono font-black text-sm">{fmt.ext}</span>
            <span className="text-zinc-300 text-xs font-medium">{fmt.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
