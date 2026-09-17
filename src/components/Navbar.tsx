import React, { useState, useRef } from 'react';
import {
  Apple,
  Search,
  ShoppingBag,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Smartphone,
  Shield,
  Wrench,
  FileSpreadsheet,
  RefreshCw,
  PhoneCall,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { StoreSettings } from '../types.ts';

interface NavbarProps {
  storeSettings: StoreSettings;
  onOpenValuationModal: () => void;
  onOpenRepairModal: (serviceName?: string, initialTab?: 'book' | 'track') => void;
  onOpenRateListModal: () => void;
  onNavigateToUpcoming?: (slug?: string) => void;
  onSelectCategory?: (id: string) => void;
  onScrollToProducts?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onForceRefresh?: () => void;
}

type TabKey = 'store' | 'iphone' | 'samsung' | 'android' | 'preowned' | 'tradein' | 'repair' | 'rates';

export const Navbar: React.FC<NavbarProps> = ({
  storeSettings,
  onOpenValuationModal,
  onOpenRepairModal,
  onOpenRateListModal,
  onNavigateToUpcoming,
  onSelectCategory,
  onScrollToProducts,
  searchQuery,
  onSearchChange,
  onForceRefresh
}) => {
  const [activeTab, setActiveTab] = useState<TabKey | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (tab: TabKey) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveTab(tab);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveTab(null);
    }, 150);
  };

  const handleAction = (options: {
    category?: string;
    search?: string;
    modal?: 'valuation' | 'repair' | 'ratelist' | 'upcoming';
    repairTab?: 'book' | 'track';
  }) => {
    setActiveTab(null);
    setMobileMenuOpen(false);
    setSearchOpen(false);

    if (options.modal === 'upcoming') {
      if (onNavigateToUpcoming) {
        onNavigateToUpcoming();
      }
      return;
    }
    if (options.category && onSelectCategory) {
      onSelectCategory(options.category);
    }
    if (options.search !== undefined) {
      onSearchChange(options.search);
    }
    if (options.modal === 'valuation') {
      onOpenValuationModal();
      return;
    }
    if (options.modal === 'repair') {
      onOpenRepairModal(undefined, options.repairTab || 'book');
      return;
    }
    if (options.modal === 'ratelist') {
      onOpenRateListModal();
      return;
    }
    if (onScrollToProducts) {
      onScrollToProducts();
    }
  };

  return (
    <>
      {/* Apple-style Top Strip / Announcement */}
      {storeSettings.showBannerNotice && storeSettings.bannerNotice && (
        <div className="bg-[#1d1d1f] text-[#a1a1a6] text-[12px] font-normal py-2 px-4 border-b border-[#333336]">
          <div className="max-w-[1024px] mx-auto flex items-center justify-between">
            <span className="truncate flex-1 text-center text-[#e8e8ed]">
              {storeSettings.bannerNotice}
            </span>
            <div className="hidden md:flex items-center space-x-3 text-[11px] text-[#86868b]">
              <span>Traffic Chowk, Butwal</span>
              <span>•</span>
              <a href={`tel:${storeSettings.phone1}`} className="text-[#e8e8ed] hover:underline">
                {storeSettings.phone1}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Apple Exact Global Nav Bar (44px height, dark blur background, SF-pro style typography) */}
      <header
        className="sticky top-0 z-50 bg-[rgba(22,22,23,0.85)] backdrop-blur-xl border-b border-white/[0.08] transition-colors"
        onMouseLeave={handleMouseLeave}
      >
        <div className="max-w-[1024px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-11 text-[12px] tracking-[-0.01em]">
            
            {/* Apple Logo / Store Home */}
            <button
              onClick={() => {
                setActiveTab(null);
                if (onSelectCategory) onSelectCategory('All');
                onSearchChange('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-white/80 hover:text-white transition-opacity shrink-0 flex items-center space-x-2 cursor-pointer group"
              title="Pandey Mobile Store"
            >
              <img
                src="https://1000logos.net/wp-content/uploads/2017/02/Apple-Logo.png"
                alt="Apple Logo"
                className="w-4 h-4 object-contain brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
                referrerPolicy="no-referrer"
              />
              <span className="font-semibold tracking-tight text-[13px] text-white hidden sm:inline">
                Pandey Mobile
              </span>
            </button>

            {/* Desktop Navigation Items (Exact Apple Layout) */}
            <nav className="hidden md:flex items-center justify-between flex-1 max-w-[720px] mx-6">
              
              {/* iPhone */}
              <button
                onMouseEnter={() => handleMouseEnter('iphone')}
                onClick={() => handleAction({ category: 'Apple', search: '' })}
                className={`py-2 px-2 transition-colors cursor-pointer ${
                  activeTab === 'iphone' ? 'text-white' : 'text-white/80 hover:text-white'
                }`}
              >
                iPhone
              </button>

              {/* Samsung */}
              <button
                onMouseEnter={() => handleMouseEnter('samsung')}
                onClick={() => handleAction({ category: 'Samsung', search: '' })}
                className={`py-2 px-2 transition-colors cursor-pointer ${
                  activeTab === 'samsung' ? 'text-white' : 'text-white/80 hover:text-white'
                }`}
              >
                Samsung
              </button>

              {/* Android */}
              <button
                onMouseEnter={() => handleMouseEnter('android')}
                onClick={() => handleAction({ category: 'Xiaomi', search: '' })}
                className={`py-2 px-2 transition-colors cursor-pointer ${
                  activeTab === 'android' ? 'text-white' : 'text-white/80 hover:text-white'
                }`}
              >
                Android
              </button>

              {/* Pre-Owned */}
              <button
                onMouseEnter={() => handleMouseEnter('preowned')}
                onClick={() => handleAction({ category: 'Pre-Owned', search: '' })}
                className={`py-2 px-2 transition-colors cursor-pointer ${
                  activeTab === 'preowned' ? 'text-white' : 'text-white/80 hover:text-white'
                }`}
              >
                Pre-Owned
              </button>

              {/* Trade In */}
              <button
                onMouseEnter={() => handleMouseEnter('tradein')}
                onClick={() => handleAction({ modal: 'valuation' })}
                className={`py-2 px-2 transition-colors cursor-pointer ${
                  activeTab === 'tradein' ? 'text-white' : 'text-white/80 hover:text-white'
                }`}
              >
                Trade In
              </button>

              {/* Repair */}
              <button
                onMouseEnter={() => handleMouseEnter('repair')}
                onClick={() => handleAction({ modal: 'repair' })}
                className={`py-2 px-2 transition-colors cursor-pointer ${
                  activeTab === 'repair' ? 'text-white' : 'text-white/80 hover:text-white'
                }`}
              >
                Repair
              </button>

              {/* Rate Sheet */}
              <button
                onMouseEnter={() => handleMouseEnter('rates')}
                onClick={() => handleAction({ modal: 'ratelist' })}
                className={`py-2 px-2 transition-colors cursor-pointer ${
                  activeTab === 'rates' ? 'text-white' : 'text-white/80 hover:text-white'
                }`}
              >
                Rate Sheet
              </button>

              {/* Upcoming Models */}
              <button
                onClick={() => handleAction({ modal: 'upcoming' })}
                className="py-1.5 px-2.5 transition-all cursor-pointer text-amber-300 hover:text-amber-200 font-semibold flex items-center space-x-1 rounded-full bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Upcoming</span>
              </button>

            </nav>

            {/* Right Icons: Refresh, Search & WhatsApp */}
            <div className="flex items-center space-x-3.5 shrink-0 text-white/80">
              
              {/* Fresh Reload / Clear Cache & Load Latest Button */}
              <button
                type="button"
                onClick={() => {
                  setIsRefreshing(true);
                  if (onForceRefresh) onForceRefresh();
                  // Force hard refresh after brief animation
                  setTimeout(async () => {
                    if (typeof window !== 'undefined') {
                      if ('caches' in window) {
                        try {
                          const keys = await window.caches.keys();
                          await Promise.all(keys.map(k => window.caches.delete(k)));
                        } catch (e) {}
                      }
                      sessionStorage.setItem('pms_fresh_update_time', Date.now().toString());
                      const u = new URL(window.location.href);
                      u.searchParams.set('_t', Date.now().toString());
                      window.location.replace(u.toString());
                    }
                  }, 300);
                }}
                disabled={isRefreshing}
                className="hover:text-white transition-colors cursor-pointer flex items-center space-x-1 py-1 px-1.5 rounded-lg hover:bg-white/10 text-white/75 hover:text-white"
                title="नयाँ अपडेट र डाटा तुरुन्तै रिफ्रेस गर्नुहोस् (Force Refresh & Load Latest Functions)"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
                <span className="text-[11px] font-medium hidden sm:inline text-slate-300">रिफ्रेस</span>
              </button>

              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="hover:text-white transition-colors cursor-pointer"
                title="Search phones"
              >
                <Search className="w-3.5 h-3.5" />
              </button>

              <a
                href={`https://wa.me/${storeSettings.whatsapp}?text=${encodeURIComponent('Hello Pandey Mobile Store, I have an inquiry.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors cursor-pointer flex items-center space-x-1"
                title="WhatsApp Inquiry"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
              </a>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden hover:text-white cursor-pointer ml-1"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* APPLE MEGA-MENUS (EXACT 3-COLUMN STRUCTURE MATCHING APPLE.COM SCREENSHOT) */}
        {/* ========================================================================= */}

        {/* 1. STORE TAB MEGA-MENU */}
        {activeTab === 'store' && (
          <div
            className="bg-[#161617] border-b border-[#333336] text-white shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200 z-50 overflow-hidden"
            onMouseEnter={() => handleMouseEnter('store')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-[1024px] mx-auto pt-10 pb-16 px-6 sm:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                
                {/* Column 1: Explore */}
                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">Explore Store</p>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => handleAction({ category: 'All', search: '' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Shop the Latest
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Apple', search: '' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      iPhone Collection
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Samsung', search: '' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Samsung Galaxy
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Pre-Owned', search: '' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Certified Pre-Owned
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Accessories', search: '' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Accessories
                    </button>
                  </div>
                </div>

                {/* Column 2: Quick Links */}
                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">Quick Links</p>
                  <div className="space-y-2 text-[13px] font-semibold text-[#e8e8ed]">
                    <button
                      onClick={() => handleAction({ modal: 'ratelist' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Live Rate Sheet
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'valuation' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Trade In Valuation
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'repair' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Repair Status & Booking
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'All', search: '' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      All In-Stock Mobile Phones
                    </button>
                  </div>
                </div>

                {/* Column 3: Shop Special Stores */}
                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">Shop Special Stores</p>
                  <div className="space-y-2 text-[13px] font-semibold text-[#e8e8ed]">
                    <button
                      onClick={() => handleAction({ category: 'Pre-Owned', search: '' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Certified Refurbished
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'All', search: 'Gaming' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Gaming & Flagship Zone
                    </button>
                    <div className="pt-3 border-t border-[#333336] text-[12px] text-[#86868b] space-y-1">
                      <p className="text-emerald-400 font-medium">Genuine Nepal VAT Bill & Warranty</p>
                      <p>Store Location: Traffic Chowk, Butwal</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* 2. iPHONE TAB MEGA-MENU (EXACT CLONE OF USER SCREENSHOT) */}
        {activeTab === 'iphone' && (
          <div
            className="bg-[#161617] border-b border-[#333336] text-white shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200 z-50 overflow-hidden"
            onMouseEnter={() => handleMouseEnter('iphone')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-[1024px] mx-auto pt-10 pb-16 px-6 sm:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                
                {/* Column 1: Explore iPhone */}
                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">Explore iPhone</p>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => handleAction({ category: 'Apple', search: '' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Explore All iPhone
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Apple', search: 'iPhone 16 Pro' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      iPhone 16 Pro
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Apple', search: 'iPhone 16' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      iPhone 16
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Apple', search: 'iPhone 15' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      iPhone 15
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Apple', search: 'iPhone 14' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      iPhone 14 & 13
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Pre-Owned', search: 'iPhone' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Certified Pre-Owned
                    </button>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#333336] space-y-2">
                    <button
                      onClick={() => handleAction({ category: 'Apple', search: '' })}
                      className="block text-[12px] font-semibold text-[#86868b] hover:text-[#e8e8ed] transition-colors cursor-pointer"
                    >
                      Compare iPhone
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'valuation' })}
                      className="block text-[12px] font-semibold text-[#86868b] hover:text-[#e8e8ed] transition-colors cursor-pointer"
                    >
                      Switch from Android
                    </button>
                  </div>
                </div>

                {/* Column 2: Shop iPhone */}
                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">Shop iPhone</p>
                  <div className="space-y-2 text-[13px] font-semibold text-[#e8e8ed]">
                    <button
                      onClick={() => handleAction({ category: 'Apple', search: '' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Shop iPhone
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Apple', search: 'Case' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      iPhone Accessories
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'valuation' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Apple Trade In
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'ratelist' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Ways to Buy (Rate Sheet)
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'valuation' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Personal Setup & Valuation
                    </button>
                  </div>
                </div>

                {/* Column 3: More from iPhone */}
                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">More from iPhone</p>
                  <div className="space-y-2 text-[13px] font-semibold text-[#e8e8ed]">
                    <button
                      onClick={() => handleAction({ modal: 'repair' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      iPhone Support & Display Repair
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'repair' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Battery Health Replacement
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'repair' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      AppleCare & 15-Day Store Warranty
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Apple', search: '' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      iOS 18 & Siri Setup
                    </button>
                    <div className="pt-3 border-t border-[#333336] text-[12px] text-[#86868b] space-y-1">
                      <p className="text-emerald-400 font-medium">IMEI Verified & 100% Genuine</p>
                      <a
                        href={`https://wa.me/${storeSettings.whatsapp}?text=${encodeURIComponent('Hello Pandey Mobile Store, I want to inquire about iPhone.')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:underline block pt-1"
                      >
                        Chat with Apple Specialist →
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* 3. SAMSUNG TAB MEGA-MENU */}
        {activeTab === 'samsung' && (
          <div
            className="bg-[#161617] border-b border-[#333336] text-white shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200 z-50 overflow-hidden"
            onMouseEnter={() => handleMouseEnter('samsung')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-[1024px] mx-auto pt-10 pb-16 px-6 sm:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                
                {/* Column 1: Explore Galaxy */}
                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">Explore Galaxy</p>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => handleAction({ category: 'Samsung', search: '' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Explore All Galaxy
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Samsung', search: 'S25' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Galaxy S25 Ultra
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Samsung', search: 'S24' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Galaxy S24 Series with AI
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Samsung', search: 'Fold' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Galaxy Z Fold & Flip
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Samsung', search: 'A55' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Galaxy A-Series 5G
                    </button>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#333336] space-y-2">
                    <button
                      onClick={() => handleAction({ category: 'Samsung', search: '' })}
                      className="block text-[12px] font-semibold text-[#86868b] hover:text-[#e8e8ed] transition-colors cursor-pointer"
                    >
                      Compare Galaxy Models
                    </button>
                  </div>
                </div>

                {/* Column 2: Shop Galaxy */}
                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">Shop Galaxy</p>
                  <div className="space-y-2 text-[13px] font-semibold text-[#e8e8ed]">
                    <button
                      onClick={() => handleAction({ category: 'Samsung', search: '' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Shop All Galaxy Stock
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Samsung', search: 'Charger' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Original 25W & 45W Adapters
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'valuation' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Samsung Trade In (Exchange)
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'ratelist' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Galaxy Used Rate List
                    </button>
                  </div>
                </div>

                {/* Column 3: More from Galaxy */}
                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">More from Samsung</p>
                  <div className="space-y-2 text-[13px] font-semibold text-[#e8e8ed]">
                    <button
                      onClick={() => handleAction({ modal: 'repair' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Dynamic AMOLED Display Lab
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'repair' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Genuine Battery Replacement
                    </button>
                    <div className="pt-3 border-t border-[#333336] text-[12px] text-[#86868b] space-y-1">
                      <p className="text-emerald-400 font-medium">1-Year Official Nepal Warranty</p>
                      <p>Instant Exchange at Traffic Chowk</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* 4. ANDROID TAB MEGA-MENU (DIRECT BRAND BUTTONS & SELECTION) */}
        {activeTab === 'android' && (
          <div
            className="bg-[#161617] border-b border-[#333336] text-white shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200 z-50 overflow-hidden"
            onMouseEnter={() => handleMouseEnter('android')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-[1024px] mx-auto pt-10 pb-16 px-6 sm:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                
                {/* Column 1: Explore Android Brands */}
                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">Explore Android Brands</p>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => handleAction({ category: 'Android', search: '' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      All Android Phones
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Samsung', search: '' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Samsung
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Vivo', search: '' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Vivo
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'POCO', search: '' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      POCO
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'HONOR', search: '' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      HONOR
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Redmi', search: '' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Redmi / Xiaomi
                    </button>
                  </div>
                </div>

                {/* Column 2: Direct Brand Buttons / Quick Navigation */}
                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">Shop by Brand</p>
                  <div className="space-y-2 text-[13px] font-semibold text-[#e8e8ed]">
                    <button
                      onClick={() => handleAction({ category: 'Samsung', search: '' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Samsung Galaxy Series
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Vivo', search: '' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Vivo V-Series & Y-Series
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'POCO', search: '' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      POCO X & F Performance Series
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'HONOR', search: '' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      HONOR Magic & X-Series
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Redmi', search: '' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Redmi Note & Number Series
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Pre-Owned', search: '' })}
                      className="block text-amber-400 hover:text-amber-300 transition-colors text-left cursor-pointer pt-1"
                    >
                      Pre-Owned & Used Android Stock
                    </button>
                  </div>
                </div>

                {/* Column 3: Android Exchange & Support */}
                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">Android Services</p>
                  <div className="space-y-2 text-[13px] font-semibold text-[#e8e8ed]">
                    <button
                      onClick={() => handleAction({ modal: 'valuation' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Exchange Any Android Phone
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'ratelist' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Live Android Price List
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'repair' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Display & Battery Repair
                    </button>
                    <div className="pt-3 border-t border-[#333336] text-[12px] text-[#86868b] space-y-1">
                      <p className="text-emerald-400 font-medium">100% Genuine Nepal Official Stock</p>
                      <p>Instant Exchange at Traffic Chowk, Butwal</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* 5. PRE-OWNED TAB MEGA-MENU */}
        {activeTab === 'preowned' && (
          <div
            className="bg-[#161617] border-b border-[#333336] text-white shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200 z-50 overflow-hidden"
            onMouseEnter={() => handleMouseEnter('preowned')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-[1024px] mx-auto pt-10 pb-16 px-6 sm:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                
                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">Explore Pre-Owned</p>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => handleAction({ category: 'Pre-Owned', search: '' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Explore All Pre-Owned
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Pre-Owned', search: 'iPhone 15' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Pre-Owned iPhone 15 & 15 Pro
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Pre-Owned', search: 'iPhone 14' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Pre-Owned iPhone 14 & 13
                    </button>
                    <button
                      onClick={() => handleAction({ category: 'Pre-Owned', search: 'Samsung' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Pre-Owned Galaxy Flagships
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">Shop & Valuation</p>
                  <div className="space-y-2 text-[13px] font-semibold text-[#e8e8ed]">
                    <button
                      onClick={() => handleAction({ modal: 'ratelist' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Live Second-Hand Price Sheet
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'valuation' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Sell Your Phone (Instant Cash)
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'valuation' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Exchange Old for Upgraded Model
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">Pandey Assurance</p>
                  <div className="space-y-2 text-[13px] font-semibold text-[#e8e8ed]">
                    <p className="text-emerald-400 font-semibold">7-Day Testing & Replacement</p>
                    <p className="text-[#86868b]">100% IMEI & Bill Verification</p>
                    <p className="text-[#86868b]">Battery Health 85%+ Tested</p>
                    <div className="pt-3 border-t border-[#333336] text-[12px]">
                      <a
                        href={`https://wa.me/${storeSettings.whatsapp}?text=${encodeURIComponent('Hello Pandey Mobile Store, I want to inquire about used phone rates.')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:underline block"
                      >
                        Ask Rate on WhatsApp →
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* 6. TRADE IN TAB MEGA-MENU */}
        {activeTab === 'tradein' && (
          <div
            className="bg-[#161617] border-b border-[#333336] text-white shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200 z-50 overflow-hidden"
            onMouseEnter={() => handleMouseEnter('tradein')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-[1024px] mx-auto pt-10 pb-16 px-6 sm:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                
                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">Apple Trade In</p>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => handleAction({ modal: 'valuation' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Instant Valuation Calculator
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'valuation' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Sell for Instant Cash
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'valuation' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Exchange & Upgrade
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">How It Works</p>
                  <div className="space-y-2 text-[13px] font-medium text-[#86868b]">
                    <p className="text-white font-semibold">1. Select your device & condition</p>
                    <p className="text-white font-semibold">2. Get competitive market estimation</p>
                    <p className="text-white font-semibold">3. Visit store or swap on the spot</p>
                  </div>
                </div>

                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">Trade-In Hub</p>
                  <div className="space-y-2 text-[13px] font-semibold text-[#e8e8ed]">
                    <button
                      onClick={() => handleAction({ modal: 'valuation' })}
                      className="block text-amber-400 hover:underline text-left cursor-pointer font-bold"
                    >
                      Launch Trade In Calculator →
                    </button>
                    <p className="text-[12px] text-[#86868b]">
                      Physical inspection counter open daily 9:00 AM to 8:30 PM at Traffic Chowk, Butwal.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* 7. REPAIR TAB MEGA-MENU */}
        {activeTab === 'repair' && (
          <div
            className="bg-[#161617] border-b border-[#333336] text-white shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200 z-50 overflow-hidden"
            onMouseEnter={() => handleMouseEnter('repair')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-[1024px] mx-auto pt-10 pb-16 px-6 sm:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                
                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">Express Repair Lab</p>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => handleAction({ modal: 'repair', repairTab: 'track' })}
                      className="flex items-center space-x-2 text-[24px] sm:text-[26px] font-bold text-emerald-400 hover:text-emerald-300 leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      <span>Track Repair Status</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Live</span>
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'repair', repairTab: 'book' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Schedule Online Repair
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'repair', repairTab: 'book' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      iPhone Display & OLED Lab
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'repair', repairTab: 'book' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Original Battery Replacement
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'repair', repairTab: 'book' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      IC & Motherboard Specialist
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">Lab Services</p>
                  <div className="space-y-2 text-[13px] font-semibold text-[#e8e8ed]">
                    <button
                      onClick={() => handleAction({ modal: 'repair' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Water Damage Ultrasonic Cleaning
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'repair' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Camera Lens & Back Glass Replacement
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'repair' })}
                      className="block hover:text-white transition-colors text-left cursor-pointer"
                    >
                      Charging Port & Mic Low Volume Fix
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">Lab Guarantee</p>
                  <div className="space-y-2 text-[13px] font-semibold text-[#e8e8ed]">
                    <p className="text-emerald-400 font-semibold">No Fix No Fee Guarantee</p>
                    <p className="text-[#86868b]">Up to 90 Days Service Warranty</p>
                    <p className="text-[#86868b]">Certified Master Technicians</p>
                    <div className="pt-3 border-t border-[#333336] text-[12px]">
                      <a
                        href={`tel:${storeSettings.technicianPhone || storeSettings.phone1}`}
                        className="text-white hover:underline block"
                      >
                        Call Lab Hotline: {storeSettings.technicianPhone || storeSettings.phone1}
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* 8. RATE SHEET TAB MEGA-MENU */}
        {activeTab === 'rates' && (
          <div
            className="bg-[#161617] border-b border-[#333336] text-white shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200 z-50 overflow-hidden"
            onMouseEnter={() => handleMouseEnter('rates')}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-[1024px] mx-auto pt-10 pb-16 px-6 sm:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                
                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">Live Rate Sheets</p>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => handleAction({ modal: 'ratelist' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Open Live Rate Sheet
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'ratelist' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Used iPhone Rate List
                    </button>
                    <button
                      onClick={() => handleAction({ modal: 'ratelist' })}
                      className="block text-[24px] sm:text-[26px] font-semibold text-[#e8e8ed] hover:text-white leading-[1.25] tracking-tight text-left cursor-pointer transition-colors"
                    >
                      Samsung Galaxy Rates
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">Grading Standards</p>
                  <div className="space-y-2 text-[12px] text-[#86868b]">
                    <p><span className="text-emerald-400 font-bold">Grade A:</span> Mint, zero scratches, full box</p>
                    <p><span className="text-indigo-400 font-bold">Grade B:</span> Minor marks, 100% genuine parts</p>
                    <p><span className="text-amber-400 font-bold">Grade C:</span> Budget value, thoroughly tested</p>
                  </div>
                </div>

                <div>
                  <p className="text-[12px] text-[#86868b] font-normal mb-3">Daily Updates</p>
                  <div className="space-y-2 text-[13px] font-semibold text-[#e8e8ed]">
                    <button
                      onClick={() => handleAction({ modal: 'ratelist' })}
                      className="block text-indigo-300 hover:underline text-left cursor-pointer"
                    >
                      View All Models in Sheet →
                    </button>
                    <p className="text-[12px] text-[#86868b]">
                      Prices calibrated with current Butwal market exchange standards.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Search Bar Overlay */}
        {searchOpen && (
          <div className="bg-[#161617] border-b border-[#333336] px-4 py-4 animate-in fade-in duration-150">
            <div className="max-w-[700px] mx-auto relative flex items-center">
              <Search className="w-4 h-4 text-[#86868b] absolute left-3" />
              <input
                type="text"
                autoFocus
                placeholder="Search for iPhone, Samsung, chargers, or repairs..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchOpen(false);
                    if (onScrollToProducts) onScrollToProducts();
                  }
                }}
                className="w-full bg-[#1d1d1f] text-white text-sm pl-10 pr-10 py-2.5 rounded-xl border border-[#333336] focus:outline-hidden focus:border-white/40 placeholder-[#86868b]"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 text-[#86868b] hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Full Screen Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#161617] border-t border-[#333336] px-6 py-6 space-y-5 text-white min-h-[calc(100vh-44px)] animate-in slide-in-from-top-2 duration-200">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#86868b] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search store..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-[#1d1d1f] text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#333336]"
              />
            </div>

            {/* Mobile Nav Links */}
            <div className="space-y-4 text-[17px] font-semibold tracking-tight border-b border-[#333336] pb-6">
              <button
                onClick={() => handleAction({ category: 'All', search: '' })}
                className="block w-full text-left py-1 hover:text-neutral-400"
              >
                Store
              </button>
              <button
                onClick={() => handleAction({ category: 'Apple', search: '' })}
                className="block w-full text-left py-1 hover:text-neutral-400"
              >
                iPhone
              </button>
              <button
                onClick={() => handleAction({ category: 'Samsung', search: '' })}
                className="block w-full text-left py-1 hover:text-neutral-400"
              >
                Samsung
              </button>
              
              {/* Android with sub-brands */}
              <div className="py-1">
                <button
                  onClick={() => handleAction({ category: 'Android', search: '' })}
                  className="block w-full text-left font-semibold hover:text-neutral-400"
                >
                  Android
                </button>
                <div className="pl-3 pt-2 grid grid-cols-2 gap-2 text-[14px] text-[#86868b]">
                  <button
                    onClick={() => handleAction({ category: 'Samsung', search: '' })}
                    className="text-left hover:text-white py-0.5"
                  >
                    • Samsung
                  </button>
                  <button
                    onClick={() => handleAction({ category: 'Vivo', search: '' })}
                    className="text-left hover:text-white py-0.5"
                  >
                    • Vivo
                  </button>
                  <button
                    onClick={() => handleAction({ category: 'POCO', search: '' })}
                    className="text-left hover:text-white py-0.5"
                  >
                    • POCO
                  </button>
                  <button
                    onClick={() => handleAction({ category: 'HONOR', search: '' })}
                    className="text-left hover:text-white py-0.5"
                  >
                    • HONOR
                  </button>
                  <button
                    onClick={() => handleAction({ category: 'Redmi', search: '' })}
                    className="text-left hover:text-white py-0.5"
                  >
                    • Redmi / Xiaomi
                  </button>
                  <button
                    onClick={() => handleAction({ category: 'Android', search: '' })}
                    className="text-left text-indigo-400 hover:text-indigo-300 py-0.5"
                  >
                    • All Android →
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleAction({ category: 'Pre-Owned', search: '' })}
                className="block w-full text-left py-1 text-amber-400"
              >
                Pre-Owned
              </button>
              <button
                onClick={() => handleAction({ modal: 'valuation' })}
                className="block w-full text-left py-1 hover:text-neutral-400"
              >
                Trade In (Exchange)
              </button>
              <div className="py-1 space-y-1">
                <button
                  onClick={() => handleAction({ modal: 'repair', repairTab: 'book' })}
                  className="block w-full text-left font-medium hover:text-neutral-400"
                >
                  Book Phone Repair
                </button>
                <button
                  onClick={() => handleAction({ modal: 'repair', repairTab: 'track' })}
                  className="block w-full text-left text-emerald-400 hover:text-emerald-300 font-bold pl-3 text-[14px]"
                >
                  🔍 Track Repair Status (Live)
                </button>
              </div>
              <button
                onClick={() => handleAction({ modal: 'ratelist' })}
                className="block w-full text-left py-1 hover:text-neutral-400"
              >
                Rate Sheet
              </button>
              <button
                onClick={() => handleAction({ modal: 'upcoming' })}
                className="w-full text-left py-2 px-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 font-bold flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Upcoming Models & Pre-Booking</span>
              </button>

              {/* Quick Mobile Refresh & Clear Cache */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsRefreshing(true);
                  if (onForceRefresh) onForceRefresh();
                  setTimeout(async () => {
                    if (typeof window !== 'undefined') {
                      if ('caches' in window) {
                        try {
                          const keys = await window.caches.keys();
                          await Promise.all(keys.map(k => window.caches.delete(k)));
                        } catch (e) {}
                      }
                      sessionStorage.setItem('pms_fresh_update_time', Date.now().toString());
                      const u = new URL(window.location.href);
                      u.searchParams.set('_t', Date.now().toString());
                      window.location.replace(u.toString());
                    }
                  }, 300);
                }}
                className="w-full text-left py-2 px-3 bg-white/5 border border-white/10 rounded-xl text-slate-200 font-medium flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <RefreshCw className={`w-4 h-4 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="text-xs font-semibold">नयाँ अपडेट रिफ्रेस गर्नुहोस् (Refresh App)</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                  Clear Cache
                </span>
              </button>
            </div>

            {/* Quick Contact */}
            <div className="pt-2 text-xs text-[#86868b] space-y-2">
              <p className="text-white font-semibold">{storeSettings.storeName}</p>
              <p>{storeSettings.address}, {storeSettings.city}</p>
              <p>Hotline: {storeSettings.phone1}</p>
              <a
                href={`https://wa.me/${(storeSettings.whatsapp || storeSettings.phone1 || '').replace(/\D/g, '').startsWith('977') ? (storeSettings.whatsapp || storeSettings.phone1 || '').replace(/\D/g, '') : `977${(storeSettings.whatsapp || storeSettings.phone1 || '').replace(/\D/g, '')}`}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block pt-2 text-emerald-400 font-bold"
              >
                WhatsApp Direct Chat →
              </a>
            </div>

          </div>
        )}

      </header>

      {/* Backdrop overlay for desktop when mega menu is open */}
      {activeTab && (
        <div
          className="fixed inset-0 top-11 bg-black/40 backdrop-blur-xs z-30 pointer-events-none transition-opacity duration-300"
          aria-hidden="true"
        />
      )}
    </>
  );
};
