import React, { useState } from 'react';
import {
  Smartphone,
  RefreshCw,
  Layers,
  FileSpreadsheet,
  Wrench,
  Settings,
  LogOut,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Store,
  ChevronRight,
  UserCheck,
  Sparkles,
  Key,
  Trash2
} from 'lucide-react';
import { Product, RateListItem, RepairBooking, PhoneValuationRequest, StoreSettings } from '../types.ts';
import { AuthService } from '../services/authService.ts';
import { DataStorageService } from '../services/dataStorage.ts';
import { VersionService } from '../services/versionService.ts';
import { ValuationsManager } from './admin/ValuationsManager.tsx';
import { QuickProductManager } from './QuickProductManager.tsx';
import { ExcelPriceListManager } from './admin/ExcelPriceListManager.tsx';
import { RepairBookingsManager } from './admin/RepairBookingsManager.tsx';
import { StoreSettingsManager } from './admin/StoreSettingsManager.tsx';
import { UpcomingModelsManager } from './admin/UpcomingModelsManager.tsx';
import { SecurityPinManager } from './admin/SecurityPinManager.tsx';
import { LineupManager } from './admin/LineupManager.tsx';

interface AdminPanelProps {
  onBackToStore: () => void;
  onLogout: () => void;
  products: Product[];
  rateList: RateListItem[];
  bookings: RepairBooking[];
  valuations: PhoneValuationRequest[];
  storeSettings: StoreSettings;
  onDataRefresh: () => void;
}

type AdminTab = 'valuations' | 'upcoming' | 'products' | 'lineup' | 'rateList' | 'repairs' | 'settings' | 'security';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onBackToStore,
  onLogout,
  products,
  rateList,
  bookings,
  valuations,
  storeSettings,
  onDataRefresh
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('valuations');
  const session = AuthService.getLocalSession();

  const handleLogout = async () => {
    await AuthService.logout();
    onLogout();
  };

  const newValuationsCount = valuations.filter(v => v.status === 'New').length;
  const pendingRepairsCount = bookings.filter(b => b.status === 'New' || b.status === ('Pending' as any)).length;
  const preBookings = DataStorageService.getPreBookings();
  const newPreBookingsCount = preBookings.filter(b => b.status === 'New').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 text-white flex flex-col shrink-0 border-r border-slate-800">
        
        {/* Brand & Admin Badge */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 text-white flex items-center justify-center font-bold shadow-md">
              <img
                src="https://1000logos.net/wp-content/uploads/2017/02/Apple-Logo.png"
                alt="Apple Logo"
                className="w-4 h-4 object-contain brightness-0 invert"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold font-serif leading-tight text-white">Pandey Store</h2>
              <span className="text-[10px] text-emerald-400 font-bold tracking-wide flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>AUTHORIZED ADMIN</span>
              </span>
            </div>
          </div>
        </div>

        {/* Logged-in admin pill */}
        {session && (
          <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center space-x-2 text-[11px] text-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <div className="truncate">
              <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Logged In As</span>
              <span className="font-semibold text-white truncate block">{session.email}</span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 flex-1">
          
          {/* Mobile Valuation Tab (PRIMARY) */}
          <button
            onClick={() => setActiveTab('valuations')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'valuations'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Smartphone className="w-4 h-4" />
              <span>Mobile Valuation</span>
            </div>
            {newValuationsCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full shadow-xs">
                {newValuationsCount} New
              </span>
            )}
          </button>

          {/* Upcoming Models / Pre-Booking */}
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Upcoming Models / Pre-Book</span>
            </div>
            {newPreBookingsCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full shadow-xs">
                {newPreBookingsCount} New
              </span>
            )}
          </button>

          {/* Products Catalog */}
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'products'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Layers className="w-4 h-4" />
              <span>Products Catalog</span>
            </div>
            <span className="text-[10px] text-slate-400">{products.length}</span>
          </button>

          {/* Lineup Showcase Control */}
          <button
            onClick={() => setActiveTab('lineup')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'lineup'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Lineup Showcase</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
              Lineup
            </span>
          </button>

          {/* Rate Sheet / Nepal Price List */}
          <button
            onClick={() => setActiveTab('rateList')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'rateList'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Rate Sheet / Pricing</span>
            </div>
            <span className="text-[10px] text-slate-400">{rateList.length}</span>
          </button>

          {/* Repair Bookings */}
          <button
            onClick={() => setActiveTab('repairs')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'repairs'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Wrench className="w-4 h-4" />
              <span>Repair Bookings</span>
            </div>
            {pendingRepairsCount > 0 && (
              <span className="px-2 py-0.5 bg-rose-500 text-white font-black text-[10px] rounded-full shadow-xs">
                {pendingRepairsCount}
              </span>
            )}
          </button>

          {/* Settings & Backup */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Settings className="w-4 h-4" />
              <span>Web Settings & Backup</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-800 text-indigo-300 border border-slate-700">1-Click</span>
          </button>

          {/* Admin Security & PIN Reset */}
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'security'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Admin PIN & Security</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 font-mono font-bold">
              PIN
            </span>
          </button>

        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <button
            type="button"
            onClick={onBackToStore}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 flex items-center space-x-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Visitor Website</span>
          </button>

          <button
            id="admin-logout-btn"
            type="button"
            onClick={handleLogout}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-600/20 border border-rose-950 hover:border-rose-800 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out (End Session)</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-xs">
          <div>
            <h1 className="text-lg font-black text-slate-900 font-serif">
              {activeTab === 'valuations' && 'Mobile Valuation & Exchange Manager'}
              {activeTab === 'upcoming' && 'Upcoming Models & Pre-Booking Management'}
              {activeTab === 'products' && 'Smartphone Inventory & Catalog'}
              {activeTab === 'rateList' && 'Used iPhone & Market Rate Sheet'}
              {activeTab === 'repairs' && 'Repair Service Appointments'}
              {activeTab === 'settings' && 'Web Settings, Full Backup & Data Restore'}
              {activeTab === 'security' && 'Admin Security & 4-Digit PIN Reset'}
            </h1>
            <p className="text-xs text-slate-500">
              Traffic Chowk, Butwal, Nepal • Store Administration Console
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('के तपाई सबै डेमो / Pre-Owned फोनहरू हटाई नयाँ अपडेट लोड (Hard Refresh) गर्न चाहनुहुन्छ?')) {
                  DataStorageService.removePreOwnedProducts();
                  onDataRefresh();
                  VersionService.forceHardRefresh(true);
                }
              }}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5 border border-rose-300 shadow-xs cursor-pointer"
              title="डेमो फोनहरू हटाउनुहोस् र क्यास हटाई रिफ्रेस गर्नुहोस्"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>डेमो हटाई रिफ्रेस (Clean & Refresh)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onDataRefresh();
                VersionService.forceHardRefresh(true);
              }}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5 border border-amber-300 shadow-xs cursor-pointer"
              title="ब्राउजर क्यास हटाई नयाँ फाइलहरू र अपडेट लोड गर्नुहोस्"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
              <span>क्यास हटाई रिफ्रेस (Hard Reload)</span>
            </button>
            <button
              type="button"
              onClick={onBackToStore}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <span>View Storefront</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors flex items-center space-x-1 border border-rose-200 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Tab Content */}
        <div className="p-6 flex-1 space-y-6">
          {activeTab === 'valuations' && (
            <ValuationsManager
              valuations={valuations}
              onValuationsChange={onDataRefresh}
            />
          )}

          {activeTab === 'upcoming' && (
            <UpcomingModelsManager
              onRefresh={onDataRefresh}
            />
          )}

          {activeTab === 'products' && (
            <QuickProductManager
              products={products}
              onProductsChange={onDataRefresh}
            />
          )}

          {activeTab === 'lineup' && (
            <LineupManager
              products={products}
              storeSettings={storeSettings}
              onDataRefresh={onDataRefresh}
            />
          )}

          {activeTab === 'rateList' && (
            <ExcelPriceListManager
              rateList={rateList}
              onRateListChange={onDataRefresh}
            />
          )}

          {activeTab === 'repairs' && (
            <RepairBookingsManager
              bookings={bookings}
              onBookingsChange={onDataRefresh}
            />
          )}

          {activeTab === 'settings' && (
            <StoreSettingsManager
              settings={storeSettings}
              onSettingsChange={onDataRefresh}
            />
          )}

          {activeTab === 'security' && (
            <SecurityPinManager
              onPinChanged={onDataRefresh}
            />
          )}
        </div>

      </main>

    </div>
  );
};

