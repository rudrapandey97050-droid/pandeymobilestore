import React from 'react';
import {
  Smartphone,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { StoreSettings } from '../types.ts';

interface HeroProps {
  storeSettings: StoreSettings;
  onOpenValuationModal: () => void;
  onOpenRepairModal: () => void;
  onOpenRateListModal: () => void;
  onScrollToProducts: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  storeSettings,
  onOpenValuationModal,
  onOpenRepairModal,
  onOpenRateListModal,
  onScrollToProducts
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white pt-8 pb-16 px-4 sm:px-6 lg:px-8">
      
      {/* Subtle geometric pattern background */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="max-w-3xl space-y-6">
          
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1.5 rounded-full text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Butwal's Most Trusted Smartphone Destination</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif tracking-tight leading-[1.15]">
            Buy, Sell & Exchange <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-indigo-300 to-teal-300">
              Smartphones with Warranty
            </span>
          </h1>

          {/* Main Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onScrollToProducts}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2"
            >
              <Smartphone className="w-4 h-4 text-white" />
              <span>Browse Phones</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenRateListModal}
              className="px-5 py-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm rounded-xl border border-slate-700 transition-colors"
            >
              Live Rate Sheet
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
