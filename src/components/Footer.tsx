import React, { useState } from 'react';
import { Smartphone, MapPin, Phone, ShieldCheck, Mail, Clock, Search, RefreshCw } from 'lucide-react';
import { StoreSettings } from '../types.ts';
import { VersionService } from '../services/versionService.ts';

interface FooterProps {
  storeSettings: StoreSettings;
  onOpenValuationModal: () => void;
  onOpenRepairModal: (serviceName?: string, initialTab?: 'book' | 'track') => void;
  onOpenRateListModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  storeSettings,
  onOpenValuationModal,
  onOpenRepairModal,
  onOpenRateListModal
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleHardRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      VersionService.forceHardRefresh(true);
    }, 200);
  };
  return (
    <footer className="bg-slate-950 text-white pt-12 pb-8 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-bold">
                <img
                  src="https://1000logos.net/wp-content/uploads/2017/02/Apple-Logo.png"
                  alt="Apple Logo"
                  className="w-4 h-4 object-contain brightness-0 invert"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-base font-bold font-serif">{storeSettings.storeName}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              {storeSettings.tagline}. Leading destination for new smartphones, certified used iPhones, mobile repairs, and transparent exchange in Butwal, Nepal.
            </p>
            <div className="text-xs text-slate-400 space-y-1.5 pt-1">
              <p className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{storeSettings.address}, {storeSettings.city}</span>
              </p>
              <p className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{storeSettings.phone1} / {storeSettings.phone2}</span>
              </p>
              <p className="flex items-center space-x-2 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Sun – Fri: 9:30 AM – 8:00 PM</span>
              </p>
            </div>
          </div>

          {/* Quick Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Quick Services & Tracking</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onOpenRepairModal(undefined, 'track')}
                  className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer text-left flex items-center space-x-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Track Smartphone Repair Status</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenRepairModal(undefined, 'book')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Schedule Smartphone Repair Lab
                </button>
              </li>
              <li>
                <button onClick={onOpenValuationModal} className="hover:text-white transition-colors cursor-pointer text-left">
                  Mobile Valuation & Exchange
                </button>
              </li>
              <li>
                <button onClick={onOpenRateListModal} className="hover:text-white transition-colors cursor-pointer text-left">
                  Live Used Smartphone Price List
                </button>
              </li>
              <li>
                <a href="#products-section" className="hover:text-white transition-colors">
                  Browse Smartphones & Accessories
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Pandey Mobile Store. All rights reserved. Traffic Chowk, Butwal, Nepal.</p>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleHardRefresh}
              disabled={isRefreshing}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5 py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
              title="ब्राउजर क्यास हटाई नयाँ अपडेट लोड गर्नुहोस् (Clear Cache & Refresh App)"
            >
              <RefreshCw className={`w-3 h-3 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>रिफ्रेस तथा नयाँ क्यास लोड (v{VersionService.getCurrentVersion()})</span>
            </button>

            <p className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Trusted Mobile Services</span>
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};
