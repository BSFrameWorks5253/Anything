import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  X, 
  ShieldCheck, 
  Sparkles, 
  DollarSign
} from 'lucide-react';
import { AdobeIcon } from './Icons';
import { adobeComparisonData } from '../data/apps';

export const AcrobatComparison: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'cost' | 'privacy'>('all');

  const filteredData = adobeComparisonData.filter(item => {
    if (activeCategory === 'cost') return item.feature.includes('Price') || item.feature.includes('Limit') || item.feature.includes('Signature');
    if (activeCategory === 'privacy') return item.feature.includes('Cloud') || item.feature.includes('Account') || item.feature.includes('OCR');
    return true;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 relative">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-3">
          <AdobeIcon className="w-3.5 h-3.5" />
          <span>The Sovereign Truth</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
          Adobe Acrobat Pro <span className="text-zinc-500">vs</span> Anything Suite
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          Why are professionals and creators moving away from Adobe Acrobat's subscription model? Here is the honest breakdown.
        </p>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            All Features
          </button>
          <button
            onClick={() => setActiveCategory('cost')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'cost'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            Cost & Limits
          </button>
          <button
            onClick={() => setActiveCategory('privacy')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'privacy'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            Privacy & Offline
          </button>
        </div>
      </div>

      {/* Side-By-Side Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Annual Savings Banner */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="liquid-glass-bright p-6 rounded-3xl border border-rose-500/20 relative overflow-hidden space-y-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-rose-500/20">
              <DollarSign className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 block mb-1">
                Zero Monthly Invoices
              </span>
              <h3 className="text-2xl font-black text-white leading-tight">
                Save $239.88 – $719.88 Every Single Year
              </h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Adobe Acrobat charges every user every single month, threatening to lock access to their own contracts, blueprints, and invoices if payment lapses. Anything gives you permanent desktop autonomy.
            </p>

            <div className="space-y-3 pt-4 border-t border-white/10 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Adobe Acrobat Pro (1 Year):</span>
                <span className="font-mono text-red-400 line-through font-bold">$239.88</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Adobe Creative Cloud (1 Year):</span>
                <span className="font-mono text-red-400 line-through font-bold">$719.88</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-sm">
                <span className="font-bold text-white">Anything Ecosystem:</span>
                <span className="font-mono text-emerald-400 font-black text-base">$0.00 Forever</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-[11px] text-emerald-300 font-medium">
                  Guaranteed: Free for commercial, personal, and educational use forever.
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Comparison Table */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-8 liquid-glass rounded-3xl p-4 sm:p-6 shadow-2xl border-white/10 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400 font-mono text-[11px]">
                  <th className="py-4 px-3 uppercase tracking-wider font-bold">Feature / Capability</th>
                  <th className="py-4 px-3 uppercase tracking-wider font-bold text-cyan-400 bg-white/5 rounded-t-xl">
                    Anything Suite (Free)
                  </th>
                  <th className="py-4 px-3 uppercase tracking-wider font-bold text-rose-400">
                    Adobe Acrobat DC Pro
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-3 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        {row.highlight && (
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                        <span>{row.feature}</span>
                      </div>
                    </td>

                    <td className="py-4 px-3 bg-white/5 font-semibold text-emerald-300">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{row.anything}</span>
                      </div>
                    </td>

                    <td className="py-4 px-3 text-zinc-400">
                      <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span className="line-through opacity-75">{row.adobe}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
