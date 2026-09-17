import React from 'react';
import { Product, StoreSettings } from '../types.ts';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Sliders } from 'lucide-react';
import { formatNPR } from '../utils/formatters.ts';

interface AppleShowcaseBannerProps {
  products: Product[];
  onSelectProduct: (p: Product) => void;
  storeSettings?: StoreSettings;
}

export const AppleShowcaseBanner: React.FC<AppleShowcaseBannerProps> = ({
  products,
  onSelectProduct,
  storeSettings
}) => {
  // If banner is explicitly disabled by admin in StoreSettings
  if (storeSettings && storeSettings.showLineupBanner === false) {
    return null;
  }

  const visibleProducts = products.filter(p => !p.isHidden);

  // Fallback apple products if no custom lineup configured
  const appleProducts = visibleProducts.filter(
    p => p.brand.toLowerCase() === 'apple' || p.category.toLowerCase() === 'iphone'
  );

  if (visibleProducts.length === 0) return null;

  // 1. Resolve Flagship Hero model controlled from admin
  let flagship: Product | undefined;
  if (storeSettings?.lineupHeroProductId) {
    flagship = visibleProducts.find(p => p.id === storeSettings.lineupHeroProductId);
  }
  if (!flagship) {
    flagship = visibleProducts.find(p => p.isLineupHero);
  }
  if (!flagship) {
    flagship = appleProducts.find(p => p.id === 'apple-iphone-16-pro-max' || p.name.includes('16 Pro Max')) || appleProducts[0] || visibleProducts[0];
  }

  // 2. Resolve Lineup Mini comparison cards controlled from admin
  let lineupCards: Product[] = [];
  if (storeSettings?.lineupProductIds && storeSettings.lineupProductIds.length > 0) {
    lineupCards = storeSettings.lineupProductIds
      .map(id => visibleProducts.find(p => p.id === id))
      .filter((p): p is Product => !!p && p.id !== flagship?.id);
  }

  if (lineupCards.length === 0) {
    const customLineupItems = visibleProducts
      .filter(p => p.isLineupItem && p.id !== flagship?.id)
      .sort((a, b) => (a.lineupOrder || 99) - (b.lineupOrder || 99));
    if (customLineupItems.length > 0) {
      lineupCards = customLineupItems;
    }
  }

  if (lineupCards.length === 0) {
    lineupCards = appleProducts.filter(p => p.id !== flagship?.id).slice(0, 4);
  }

  const title = storeSettings?.lineupTitle || 'Explore the iPhone Lineup';
  const subtitle = storeSettings?.lineupSubtitle || 'Brand new seal pack with 1-Year Apple Nepal Warranty & certified pre-owned phones with testing guarantee. Rates controlled live by Pandey Mobile.';
  const heroBadge = flagship?.lineupBadge || 'Built for Apple Intelligence';
  const heroTagline = flagship?.lineupTagline || 'Titanium • A18 Pro • Camera Control';

  return (
    <div className="bg-[#000000] text-white rounded-3xl overflow-hidden border border-white/10 shadow-2xl p-6 sm:p-10 my-4 space-y-8 font-sans">
      
      {/* Top Banner Header (Apple Style) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{heroBadge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            {title}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#86868b] max-w-sm">
          {subtitle}
        </p>
      </div>

      {/* Flagship Hero Card */}
      {flagship && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-gradient-to-b from-[#161617] to-[#121212] rounded-3xl p-6 sm:p-8 border border-white/10">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              {heroTagline}
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
              {flagship.name}
            </h3>
            <p className="text-sm text-[#a1a1a6] leading-relaxed">
              {flagship.description || 'The ultimate iPhone with 6.9-inch Super Retina XDR display, Grade 5 Titanium, 48MP Fusion camera with 4K 120 fps Dolby Vision, and groundbreaking A18 Pro chip.'}
            </p>

            <div className="pt-2 flex items-baseline space-x-4">
              <span className="text-2xl sm:text-3xl font-black text-white">
                From {formatNPR(flagship.price)}
              </span>
              {flagship.originalPrice && (
                <span className="text-sm text-[#86868b] line-through">
                  {formatNPR(flagship.originalPrice)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onSelectProduct(flagship)}
                className="px-6 py-3 rounded-full bg-white text-black hover:bg-[#e8e8ed] font-bold text-xs sm:text-sm transition-all shadow-lg flex items-center space-x-2 cursor-pointer"
              >
                <span>View Full Specs & Buy</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 flex items-center justify-center p-4">
            <img
              src={flagship.image}
              alt={flagship.name}
              className="max-h-72 sm:max-h-80 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 cursor-pointer"
              onClick={() => onSelectProduct(flagship)}
            />
          </div>
        </div>
      )}

      {/* Mini Lineup Quick Comparison Row */}
      {lineupCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {lineupCards.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectProduct(item)}
              className="bg-[#161617] hover:bg-[#1f1f22] border border-white/10 rounded-2xl p-5 flex flex-col justify-between transition-all cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="h-36 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    {item.lineupBadge || (item.condition === 'New' ? 'Brand New' : 'Pre-Owned')}
                  </span>
                  <h4 className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-xs text-[#86868b] mt-0.5 line-clamp-1">
                    {item.lineupTagline || item.specs?.processor || item.storage || 'Official Nepal Stock'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-sm font-extrabold text-white">
                  {formatNPR(item.price)}
                </span>
                <span className="text-[11px] font-semibold text-white/70 group-hover:text-white flex items-center space-x-0.5">
                  <span>Details</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
