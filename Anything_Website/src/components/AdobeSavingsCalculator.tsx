import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { DollarSign, Users, Calendar, Sparkles, ShieldCheck } from 'lucide-react';
import { soundFx } from '../utils/audio';

export const AdobeSavingsCalculator: React.FC = () => {
  const [seats, setSeats] = useState(5);
  const [years, setYears] = useState(3);
  const [plan, setPlan] = useState<'standard' | 'pro' | 'creative-cloud'>('pro');

  const planRates = {
    standard: { name: 'Adobe Acrobat Standard', monthly: 12.99, yearly: 155.88 },
    pro: { name: 'Adobe Acrobat DC Pro', monthly: 19.99, yearly: 239.88 },
    'creative-cloud': { name: 'Creative Cloud All Apps', monthly: 59.99, yearly: 719.88 }
  };

  const selectedRate = planRates[plan];
  const totalAdobeCost = (selectedRate.yearly * seats * years).toFixed(2);
  const anythingCost = 0.00;
  const netSavings = totalAdobeCost;

  const triggerCelebration = () => {
    soundFx.playSuccess();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#f59e0b', '#06b6d4', '#10b981']
    });
  };

  return (
    <div className="liquid-glass rounded-3xl p-6 sm:p-10 border border-white/15 shadow-2xl relative overflow-hidden">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Adobe Tax Calculator</span>
        </div>
        <h3 className="text-2xl sm:text-4xl font-black text-white">
          How Much Are You Throwing Away?
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400">
          Calculate the true cost of Adobe subscriptions across your workstation, studio, or enterprise team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Sliders Left */}
        <div className="lg:col-span-7 space-y-6">
          {/* Plan Selector */}
          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-2">Select Adobe Plan to Compare:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'standard', label: 'Acrobat Standard', price: '$12.99/mo' },
                { id: 'pro', label: 'Acrobat DC Pro', price: '$19.99/mo' },
                { id: 'creative-cloud', label: 'CC All Apps', price: '$59.99/mo' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setPlan(p.id as 'standard' | 'pro' | 'creative-cloud');
                    soundFx.playClick();
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    plan === p.id
                      ? 'bg-rose-500/20 border-rose-500/50 text-white shadow-lg shadow-rose-500/20'
                      : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="font-bold text-xs block">{p.label}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{p.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Seats Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Workstation Seats / Licenses:</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold text-sm">{seats} Users</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>1 Freelancer</span>
              <span>25 Studio</span>
              <span>50 Team</span>
            </div>
          </div>

          {/* Years Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Subscription Duration:</span>
              </span>
              <span className="font-mono text-amber-400 font-bold text-sm">{years} {years === 1 ? 'Year' : 'Years'}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>1 Year</span>
              <span>5 Years</span>
              <span>10 Years</span>
            </div>
          </div>
        </div>

        {/* Results Banner Right */}
        <div className="lg:col-span-5 liquid-glass-bright rounded-3xl p-6 border border-rose-500/30 flex flex-col justify-between gap-6 shadow-2xl relative">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400 font-bold">
                Adobe Extortion Invoice
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">{seats} seats · {years} yrs</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Total Paid to Adobe:</span>
                <span className="font-mono text-red-400 font-bold line-through text-base">
                  ${totalAdobeCost}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Anything Suite Cost:</span>
                <span className="font-mono text-emerald-400 font-bold text-base">
                  ${anythingCost.toFixed(2)}
                </span>
              </div>

              <div className="pt-3 border-t border-white/10">
                <span className="text-xs text-zinc-400 block mb-1">Your Guaranteed Pocket Savings:</span>
                <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  +${netSavings}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={triggerCelebration}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-red-600 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-extrabold text-xs shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
            >
              <DollarSign className="w-4 h-4" />
              <span>Celebrate Freedom (Save ${netSavings})</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-emerald-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Free for Commercial Use Forever</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
