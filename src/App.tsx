import React, { useState, useEffect, useCallback } from 'react';
import {
  Product,
  RateListItem,
  RepairBooking,
  PhoneValuationRequest,
  StoreSettings,
  UpcomingModel
} from './types.ts';
import { DataStorageService } from './services/dataStorage.ts';
import { AuthService } from './services/authService.ts';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { ProductSection } from './components/ProductSection.tsx';
import { RepairSection } from './components/RepairSection.tsx';
import { WhyPandeySection } from './components/WhyPandeySection.tsx';
import { Footer } from './components/Footer.tsx';
import { FloatingWhatsApp } from './components/FloatingWhatsApp.tsx';
import { PhoneValuationModal } from './components/PhoneValuationModal.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { PriceListModal } from './components/PriceListModal.tsx';
import { RepairBookingModal } from './components/RepairBookingModal.tsx';
import { PreOrderBookingModal } from './components/PreOrderBookingModal.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { AdminLoginPage } from './components/AdminLoginPage.tsx';
import { UpcomingModelPopup } from './components/UpcomingModelPopup.tsx';
import { PreBookingModal } from './components/PreBookingModal.tsx';
import { UpcomingModelsPage } from './components/UpcomingModelsPage.tsx';
import { VersionService } from './services/versionService.ts';
import { AppUpdateNotification } from './components/AppUpdateNotification.tsx';

type ViewMode = 'store' | 'admin-login' | 'admin' | 'upcoming';

export const App: React.FC = () => {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [rateList, setRateList] = useState<RateListItem[]>([]);
  const [bookings, setBookings] = useState<RepairBooking[]>([]);
  const [valuations, setValuations] = useState<PhoneValuationRequest[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => DataStorageService.getStoreSettings());
  const [upcomingSlug, setUpcomingSlug] = useState<string | undefined>(undefined);

  // Determine initial view from URL
  const determineViewFromUrl = useCallback((): { mode: ViewMode; slug?: string } => {
    if (typeof window === 'undefined') return { mode: 'store' };
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    const isAdminUrl = path === '/admin' || path.startsWith('/admin/') || hash === '#admin' || search.includes('view=admin') || search.includes('admin=true');
    const isLoginUrl = path === '/login' || path === '/admin/login' || hash === '#login';
    const isUpcomingUrl = path === '/upcoming-models' || path.startsWith('/upcoming-models/') || hash === '#upcoming' || search.includes('view=upcoming');

    if (isAdminUrl) {
      return { mode: AuthService.isAuthenticated() ? 'admin' : 'admin-login' };
    }
    if (isLoginUrl) {
      return { mode: AuthService.isAuthenticated() ? 'admin' : 'admin-login' };
    }
    if (isUpcomingUrl) {
      const match = path.match(/\/upcoming-models\/([a-z0-9-]+)/i);
      return { mode: 'upcoming', slug: match ? match[1] : undefined };
    }
    return { mode: 'store' };
  }, []);

  // Navigation / View state
  const initialView = determineViewFromUrl();
  const [viewMode, setViewMode] = useState<ViewMode>(initialView.mode);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isValuationModalOpen, setIsValuationModalOpen] = useState(false);
  const [valuationInitialMode, setValuationInitialMode] = useState<'sell' | 'exchange'>('sell');
  const [valuationTargetProduct, setValuationTargetProduct] = useState<Product | undefined>(undefined);

  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [isPriceListModalOpen, setIsPriceListModalOpen] = useState(false);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [repairInitialService, setRepairInitialService] = useState<string | undefined>(undefined);
  const [repairInitialTab, setRepairInitialTab] = useState<'book' | 'track'>('book');
  const [repairInitialTrackingCode, setRepairInitialTrackingCode] = useState<string | undefined>(undefined);
  const [selectedOrderProduct, setSelectedOrderProduct] = useState<Product | null>(null);

  // Pre-Booking Modal State for Upcoming Models
  const [preBookingModel, setPreBookingModel] = useState<UpcomingModel | null>(null);
  const [isPreBookingModalOpen, setIsPreBookingModalOpen] = useState(false);

  // Load data on mount
  const refreshData = () => {
    setProducts(DataStorageService.getProducts());
    setRateList(DataStorageService.getRateList());
    setBookings(DataStorageService.getRepairBookings());
    setValuations(DataStorageService.getValuationRequests());
    setStoreSettings(DataStorageService.getStoreSettings());
  };

  useEffect(() => {
    refreshData();

    // 1. Initialize version auto-detection & background update polling
    const cleanupVersionService = VersionService.init();

    // 2. Real-time multi-tab state synchronization
    const unsubscribeDataSync = DataStorageService.subscribeToUpdates(() => {
      refreshData();
    });

    // Verify session in background if admin session is saved
    if (AuthService.isAuthenticated()) {
      AuthService.verifySession().then((isValid) => {
        if (!isValid && viewMode === 'admin') {
          setViewMode('admin-login');
        }
      });
    }

    // Listen for browser navigation (back/forward, URL changes)
    const handleLocationChange = () => {
      const { mode, slug } = determineViewFromUrl();
      setViewMode(mode);
      setUpcomingSlug(slug);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    return () => {
      cleanupVersionService();
      unsubscribeDataSync();
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [determineViewFromUrl, viewMode]);

  // Sync browser URL when viewMode changes
  const navigateTo = (mode: ViewMode, slug?: string) => {
    setViewMode(mode);
    setUpcomingSlug(slug);
    if (mode === 'admin') {
      window.history.pushState(null, '', '/admin');
    } else if (mode === 'admin-login') {
      window.history.pushState(null, '', '/admin/login');
    } else if (mode === 'upcoming') {
      window.history.pushState(null, '', slug ? `/upcoming-models/${slug}` : '/upcoming-models');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.history.pushState(null, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handlers
  const handleOpenPreBooking = (model?: UpcomingModel) => {
    if (model) {
      setPreBookingModel(model);
    } else {
      const activeModels = DataStorageService.getUpcomingModels().filter(m => m.isActive);
      setPreBookingModel(activeModels[0] || null);
    }
    setIsPreBookingModalOpen(true);
  };

  const handleOpenValuation = (mode: 'sell' | 'exchange' = 'sell', target?: Product) => {
    setValuationInitialMode(mode);
    setValuationTargetProduct(target);
    setIsValuationModalOpen(true);
  };

  const handleExchangeWithProduct = (prod: Product) => {
    handleOpenValuation('exchange', prod);
  };

  const handleOpenRepair = (serviceName?: string, initialTab: 'book' | 'track' = 'book', initialCode?: string) => {
    setRepairInitialService(serviceName);
    setRepairInitialTab(initialTab);
    setRepairInitialTrackingCode(initialCode);
    setIsRepairModalOpen(true);
  };

  const scrollToProducts = () => {
    if (viewMode !== 'store') {
      navigateTo('store');
      setTimeout(() => {
        const el = document.getElementById('products-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
    const el = document.getElementById('products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Admin Login View
  if (viewMode === 'admin-login') {
    return (
      <AdminLoginPage
        onLoginSuccess={() => {
          navigateTo('admin');
        }}
        onBackToStore={() => {
          navigateTo('store');
        }}
      />
    );
  }

  // 2. Admin Panel View (Protected)
  if (viewMode === 'admin') {
    if (!AuthService.isAuthenticated()) {
      return (
        <AdminLoginPage
          onLoginSuccess={() => {
            navigateTo('admin');
          }}
          onBackToStore={() => {
            navigateTo('store');
          }}
        />
      );
    }

    return (
      <>
        <AppUpdateNotification onManualRefresh={refreshData} />
        <AdminPanel
          onBackToStore={() => navigateTo('store')}
          onLogout={() => {
            navigateTo('store');
          }}
          products={products}
          rateList={rateList}
          bookings={bookings}
          valuations={valuations}
          storeSettings={storeSettings}
          onDataRefresh={refreshData}
        />
      </>
    );
  }

  // 3. Dedicated Upcoming Models Page View
  if (viewMode === 'upcoming') {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
        <AppUpdateNotification onManualRefresh={refreshData} />
        <Navbar
          storeSettings={storeSettings}
          onOpenValuationModal={() => handleOpenValuation('sell')}
          onOpenRepairModal={() => handleOpenRepair()}
          onOpenRateListModal={() => setIsPriceListModalOpen(true)}
          onNavigateToUpcoming={() => navigateTo('upcoming')}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            navigateTo('store');
          }}
          onScrollToProducts={scrollToProducts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onForceRefresh={refreshData}
        />

        <UpcomingModelsPage
          initialSlug={upcomingSlug}
          onOpenPreBooking={handleOpenPreBooking}
          onBackToStore={() => navigateTo('store')}
        />

        <Footer
          storeSettings={storeSettings}
          onOpenValuationModal={() => handleOpenValuation('sell')}
          onOpenRepairModal={() => handleOpenRepair()}
          onOpenRateListModal={() => setIsPriceListModalOpen(true)}
        />

        <FloatingWhatsApp whatsappNumber={storeSettings.whatsapp} />

        {/* Pre-Booking Modal */}
        <PreBookingModal
          isOpen={isPreBookingModalOpen}
          onClose={() => setIsPreBookingModalOpen(false)}
          model={preBookingModel}
          onSuccess={refreshData}
        />
      </div>
    );
  }

  // 4. Visitor Storefront View
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      <AppUpdateNotification onManualRefresh={refreshData} />
      
      {/* Automatic Upcoming Model Popup (Triggers after 2-3s on visitor first arrival) */}
      <UpcomingModelPopup
        onOpenPreBooking={handleOpenPreBooking}
        onNavigateToUpcoming={(slug?: string) => navigateTo('upcoming', slug)}
      />

      {/* Navbar (Visitor mode - no admin controls visible) */}
      <Navbar
        storeSettings={storeSettings}
        onOpenValuationModal={() => handleOpenValuation('sell')}
        onOpenRepairModal={() => handleOpenRepair()}
        onOpenRateListModal={() => setIsPriceListModalOpen(true)}
        onNavigateToUpcoming={() => navigateTo('upcoming')}
        onSelectCategory={setSelectedCategory}
        onScrollToProducts={scrollToProducts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onForceRefresh={refreshData}
      />

      {/* Hero Section */}
      <Hero
        storeSettings={storeSettings}
        onOpenValuationModal={() => handleOpenValuation('sell')}
        onOpenRepairModal={() => handleOpenRepair()}
        onOpenRateListModal={() => setIsPriceListModalOpen(true)}
        onScrollToProducts={scrollToProducts}
      />

      {/* Products Catalog Section */}
      <ProductSection
        products={products}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onSelectProduct={(p) => setSelectedDetailProduct(p)}
        onExchangeWithThis={handleExchangeWithProduct}
        onOrderProduct={(p) => setSelectedOrderProduct(p)}
        searchQuery={searchQuery}
        storeSettings={storeSettings}
      />

      {/* Express Repair Section */}
      <RepairSection
        onOpenRepairModal={handleOpenRepair}
      />

      {/* Why Pandey Mobile Store Section */}
      <WhyPandeySection
        storeSettings={storeSettings}
        onOpenValuationModal={() => handleOpenValuation('sell')}
      />

      {/* Footer (Visitor mode - no admin controls visible) */}
      <Footer
        storeSettings={storeSettings}
        onOpenValuationModal={() => handleOpenValuation('sell')}
        onOpenRepairModal={() => handleOpenRepair()}
        onOpenRateListModal={() => setIsPriceListModalOpen(true)}
      />

      {/* WhatsApp Quick Chat */}
      <FloatingWhatsApp whatsappNumber={storeSettings.whatsapp} />

      {/* MODALS */}

      {/* 1. Pre-Booking Modal for Upcoming Models */}
      <PreBookingModal
        isOpen={isPreBookingModalOpen}
        onClose={() => setIsPreBookingModalOpen(false)}
        model={preBookingModel}
        onSuccess={refreshData}
      />

      {/* 2. Mobile Valuation & Exchange Modal */}
      <PhoneValuationModal
        isOpen={isValuationModalOpen}
        onClose={() => setIsValuationModalOpen(false)}
        products={products}
        initialType={valuationInitialMode}
        selectedTargetProduct={valuationTargetProduct}
        onSuccess={refreshData}
      />

      {/* 3. Product Detail Modal */}
      <ProductDetailModal
        product={selectedDetailProduct}
        onClose={() => setSelectedDetailProduct(null)}
        onExchangeWithThis={handleExchangeWithProduct}
        onOrderProduct={(p) => {
          setSelectedDetailProduct(null);
          setSelectedOrderProduct(p);
        }}
      />

      {/* 4. Rate Sheet Modal */}
      {isPriceListModalOpen && (
        <PriceListModal
          rateList={rateList}
          onClose={() => setIsPriceListModalOpen(false)}
          onOpenValuationModal={() => {
            setIsPriceListModalOpen(false);
            handleOpenValuation('sell');
          }}
        />
      )}

      {/* 5. Repair Booking Modal */}
      {isRepairModalOpen && (
        <RepairBookingModal
          initialService={repairInitialService}
          initialTab={repairInitialTab}
          initialTrackingCode={repairInitialTrackingCode}
          storeSettings={storeSettings}
          onClose={() => setIsRepairModalOpen(false)}
          onSuccess={refreshData}
        />
      )}

      {/* 6. Pre-Order / Hold Modal */}
      <PreOrderBookingModal
        product={selectedOrderProduct}
        onClose={() => setSelectedOrderProduct(null)}
        onSuccess={refreshData}
      />

    </div>
  );
};
