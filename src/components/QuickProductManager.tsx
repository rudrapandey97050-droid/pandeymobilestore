import React, { useState, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Search,
  Check,
  X,
  Smartphone,
  Headphones,
  Save,
  Tag,
  Upload,
  Palette,
  Image as ImageIcon,
  Images,
  Layers,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  DollarSign,
  AlertCircle,
  Camera,
  Cpu,
  Zap,
  Apple,
  Clock
} from 'lucide-react';
import { Product, ProductCondition, ProductAvailability } from '../types.ts';
import { DataStorageService } from '../services/dataStorage.ts';
import { formatNPR } from '../utils/formatters.ts';

interface QuickProductManagerProps {
  products: Product[];
  onProductsChange: () => void;
}

// Supported brands mandated by requirements:
const SUPPORTED_BRANDS = [
  { id: 'Apple', name: 'Apple / iPhone', icon: 'Apple' },
  { id: 'Samsung', name: 'Samsung', icon: 'Layers' },
  { id: 'Vivo', name: 'Vivo', icon: 'Camera' },
  { id: 'POCO', name: 'POCO', icon: 'Zap' },
  { id: 'HONOR', name: 'HONOR', icon: 'Cpu' },
  { id: 'Redmi', name: 'Redmi', icon: 'Smartphone' },
  { id: 'Accessories', name: 'Accessories', icon: 'Headphones' }
];

const STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB'];
const RAM_OPTIONS = ['4GB', '6GB', '8GB', '12GB', '16GB'];
const AVAILABILITY_OPTIONS: ProductAvailability[] = ['In Stock', 'Available', 'Limited Stock', 'Out of Stock', 'Pre-Order'];
const WARRANTY_PRESETS = [
  '1 Year Official Brand Warranty',
  '6 Months Store Warranty',
  '3 Months Testing Warranty',
  '15 Days Store Replacement Warranty',
  '7 Days Testing Guarantee'
];
const COLOR_PRESETS = [
  'Natural Titanium', 'Black Titanium', 'White Titanium', 'Blue Titanium',
  'Midnight Black', 'Phantom Black', 'Titanium Gray', 'Starlight',
  'Emerald Green', 'Ocean Blue', 'Lilac', 'Silver', 'Gold', 'Sunset Orange'
];

export const QuickProductManager: React.FC<QuickProductManagerProps> = ({
  products,
  onProductsChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState<'All' | 'New' | 'Pre-Owned' | 'Lineup'>('All');
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form Fields
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('');
  const [name, setName] = useState('');
  const [condition, setCondition] = useState<ProductCondition>('New');
  const [conditionGrade, setConditionGrade] = useState('Brand New Sealed');
  const [batteryHealth, setBatteryHealth] = useState('');
  const [price, setPrice] = useState<string>('');
  const [originalPrice, setOriginalPrice] = useState<string>('');
  const [storage, setStorage] = useState('128GB');
  const [customStorage, setCustomStorage] = useState('');
  const [ram, setRam] = useState('8GB');
  const [customRam, setCustomRam] = useState('');
  const [color, setColor] = useState('Midnight Black');
  const [customColor, setCustomColor] = useState('');
  const [warranty, setWarranty] = useState('1 Year Official Brand Warranty');
  const [customWarranty, setCustomWarranty] = useState('');
  const [availability, setAvailability] = useState<ProductAvailability>('In Stock');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isLineupItem, setIsLineupItem] = useState(false);
  const [isLineupHero, setIsLineupHero] = useState(false);
  const [lineupTagline, setLineupTagline] = useState('');
  const [lineupBadge, setLineupBadge] = useState('');

  // Photos state
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [primaryPhotoIndex, setPrimaryPhotoIndex] = useState<number>(0);
  const [urlInput, setUrlInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Color-specific images mapping state
  const [colorImages, setColorImages] = useState<Record<string, string>>({});
  const [activeColorInput, setActiveColorInput] = useState('');
  const [colorImgUrlInput, setColorImgUrlInput] = useState('');
  const colorFileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate display name when brand and model change if not customized
  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    if (!name || name === `${brand} ${model}`.trim()) {
      setName(`${brand} ${newModel}`.trim());
    }
  };

  const handleBrandSelect = (newBrand: string) => {
    setBrand(newBrand);
    if (model) {
      setName(`${newBrand} ${model}`.trim());
    }
  };

  // Open Create Form
  const openCreateModal = () => {
    setEditingProductId(null);
    setBrand('Apple');
    setModel('');
    setName('');
    setCondition('New');
    setConditionGrade('Brand New Sealed');
    setBatteryHealth('');
    setPrice('');
    setOriginalPrice('');
    setStorage('128GB');
    setCustomStorage('');
    setRam('8GB');
    setCustomRam('');
    setColor('Midnight Black');
    setCustomColor('');
    setWarranty('1 Year Official Brand Warranty');
    setCustomWarranty('');
    setAvailability('In Stock');
    setDescription('');
    setIsFeatured(false);
    setIsBestSeller(false);
    setIsHidden(false);
    setIsLineupItem(false);
    setIsLineupHero(false);
    setLineupTagline('');
    setLineupBadge('');
    setUploadedPhotos([]);
    setPrimaryPhotoIndex(0);
    setUrlInput('');
    setColorImages({});
    setActiveColorInput('');
    setColorImgUrlInput('');
    setUploadError(null);
    setIsModalOpen(true);
  };

  // Open Edit Form
  const openEditModal = (p: Product) => {
    setEditingProductId(p.id);
    setBrand(p.brand || 'Apple');
    setModel(p.model || '');
    setName(p.name || '');
    setCondition(p.condition || 'New');
    setConditionGrade(p.conditionGrade || (p.condition === 'New' ? 'Brand New Sealed' : 'Grade A'));
    setBatteryHealth(p.batteryHealth || '');
    setPrice(p.price ? p.price.toString() : '');
    setOriginalPrice(p.originalPrice ? p.originalPrice.toString() : '');
    
    if (STORAGE_OPTIONS.includes(p.storage || '')) {
      setStorage(p.storage || '128GB');
      setCustomStorage('');
    } else {
      setStorage('Other');
      setCustomStorage(p.storage || '');
    }

    if (RAM_OPTIONS.includes(p.ram || '')) {
      setRam(p.ram || '8GB');
      setCustomRam('');
    } else {
      setRam('Other');
      setCustomRam(p.ram || '');
    }

    if (COLOR_PRESETS.includes(p.color || '')) {
      setColor(p.color || 'Midnight Black');
      setCustomColor('');
    } else {
      setColor('Other');
      setCustomColor(p.color || '');
    }

    if (WARRANTY_PRESETS.includes(p.warranty || '')) {
      setWarranty(p.warranty || '1 Year Official Brand Warranty');
      setCustomWarranty('');
    } else {
      setWarranty('Other');
      setCustomWarranty(p.warranty || '');
    }

    setAvailability(p.availability || 'In Stock');
    setDescription(p.description || '');
    setIsFeatured(Boolean(p.isFeatured));
    setIsBestSeller(Boolean(p.isBestSeller));
    setIsHidden(Boolean(p.isHidden));
    setIsLineupItem(Boolean(p.isLineupItem));
    setIsLineupHero(Boolean(p.isLineupHero));
    setLineupTagline(p.lineupTagline || '');
    setLineupBadge(p.lineupBadge || '');

    // Consolidate photos
    const photos: string[] = [];
    if (p.image) photos.push(p.image);
    if (p.images && Array.isArray(p.images)) {
      p.images.forEach(img => {
        if (img && !photos.includes(img)) photos.push(img);
      });
    }
    if (p.additionalImages && Array.isArray(p.additionalImages)) {
      p.additionalImages.forEach(img => {
        if (img && !photos.includes(img)) photos.push(img);
      });
    }

    setUploadedPhotos(photos);
    setPrimaryPhotoIndex(0);
    setUrlInput('');
    setColorImages(p.colorImages ? { ...p.colorImages } : {});
    setActiveColorInput('');
    setColorImgUrlInput('');
    setUploadError(null);
    setIsModalOpen(true);
  };

  // Handle Photo File Upload (supports multi-selection)
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select valid image files (JPG, PNG, WEBP).');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          setUploadedPhotos(prev => [...prev, dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Add photo via Image URL
  const handleAddImageUrl = () => {
    if (!urlInput.trim()) return;
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://') && !urlInput.startsWith('data:image')) {
      setUploadError('Please enter a valid image URL starting with http:// or https://');
      return;
    }
    setUploadedPhotos(prev => [...prev, urlInput.trim()]);
    setUrlInput('');
    setUploadError(null);
  };

  // Remove individual photo
  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (primaryPhotoIndex >= updated.length) {
        setPrimaryPhotoIndex(Math.max(0, updated.length - 1));
      } else if (primaryPhotoIndex === index) {
        setPrimaryPhotoIndex(0);
      }
      return updated;
    });
  };

  // Set primary / cover photo
  const handleSetPrimaryPhoto = (index: number) => {
    setPrimaryPhotoIndex(index);
  };

  // Color-specific image handlers
  const handleAddColorImage = (colorName: string, imageUrl: string) => {
    const trimmedColor = colorName.trim();
    const trimmedUrl = imageUrl.trim();
    if (!trimmedColor || !trimmedUrl) return;
    setColorImages(prev => ({
      ...prev,
      [trimmedColor]: trimmedUrl
    }));
    // Also include in uploadedPhotos if not present
    if (!uploadedPhotos.includes(trimmedUrl)) {
      setUploadedPhotos(prev => [...prev, trimmedUrl]);
    }
  };

  const handleRemoveColorImage = (colorName: string) => {
    setColorImages(prev => {
      const next = { ...prev };
      delete next[colorName];
      return next;
    });
  };

  const handleColorFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetColor: string) => {
    const file = e.target.files?.[0];
    if (!file || !targetColor) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        handleAddColorImage(targetColor, result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Delete product
  const handleDeleteProduct = (id: string, prodName: string) => {
    if (window.confirm(`Are you sure you want to delete "${prodName}"?\nThis product will be permanently removed.`)) {
      DataStorageService.deleteProduct(id);
      onProductsChange();
    }
  };

  // Toggle Visibility
  const handleToggleVisibility = (id: string) => {
    DataStorageService.toggleProductVisibility(id);
    onProductsChange();
  };

  // Toggle Lineup Showcase Inclusion
  const handleToggleLineup = (id: string) => {
    DataStorageService.toggleProductLineup(id);
    onProductsChange();
  };

  // Quick Price Edit
  const handleQuickPriceChange = (id: string, currentPrice: number) => {
    const input = window.prompt('Enter new selling price in NPR:', currentPrice.toString());
    if (input !== null) {
      const num = parseFloat(input);
      if (!isNaN(num) && num >= 0) {
        DataStorageService.updateProduct(id, { price: num });
        onProductsChange();
      } else {
        alert('Invalid price entered');
      }
    }
  };

  // Save product (Add or Edit)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = parseFloat(price);
    if (!name.trim()) {
      alert('Please enter a product name or model.');
      return;
    }
    if (isNaN(numPrice) || numPrice < 0) {
      alert('Please enter a valid positive price.');
      return;
    }

    const finalStorage = storage === 'Other' ? (customStorage.trim() || '128GB') : storage;
    const finalRam = ram === 'Other' ? (customRam.trim() || '8GB') : ram;
    const finalColor = color === 'Other' ? (customColor.trim() || 'Standard') : color;
    const finalWarranty = warranty === 'Other' ? (customWarranty.trim() || 'Store Warranty') : warranty;

    // Determine primary photo
    let primaryImage = '';
    if (uploadedPhotos.length > 0) {
      primaryImage = uploadedPhotos[primaryPhotoIndex] || uploadedPhotos[0];
    } else {
      primaryImage = 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80';
    }

    const productPayload = {
      name: name.trim(),
      brand,
      model: model.trim() || undefined,
      category: brand,
      condition,
      conditionGrade: condition === 'New' ? 'Brand New Sealed' : conditionGrade,
      batteryHealth: (condition === 'Used' || condition === 'Pre-Owned') ? batteryHealth.trim() || undefined : undefined,
      price: numPrice,
      originalPrice: originalPrice.trim() ? parseFloat(originalPrice) : undefined,
      image: primaryImage,
      images: uploadedPhotos,
      storage: finalStorage,
      ram: finalRam,
      color: finalColor,
      colorImages: Object.keys(colorImages).length > 0 ? colorImages : undefined,
      warranty: finalWarranty,
      availability,
      description: description.trim() || undefined,
      isFeatured,
      isBestSeller,
      isHidden,
      isLineupItem: isLineupHero ? true : isLineupItem,
      isLineupHero,
      lineupTagline: lineupTagline.trim() || undefined,
      lineupBadge: lineupBadge.trim() || undefined
    };

    if (editingProductId) {
      DataStorageService.updateProduct(editingProductId, productPayload);
      if (isLineupHero) {
        DataStorageService.setProductLineupHero(editingProductId);
      }
    } else {
      const newProd = DataStorageService.addProduct(productPayload);
      if (isLineupHero && newProd) {
        DataStorageService.setProductLineupHero(newProd.id);
      }
    }

    setIsModalOpen(false);
    onProductsChange();
  };

  // Filter products for admin table/cards
  const filteredProducts = products.filter(p => {
    // Search
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchModel = p.model ? p.model.toLowerCase().includes(q) : false;
      const matchStorage = p.storage ? p.storage.toLowerCase().includes(q) : false;
      const matchColor = p.color ? p.color.toLowerCase().includes(q) : false;
      if (!matchName && !matchBrand && !matchModel && !matchStorage && !matchColor) return false;
    }

    // Brand filter
    if (selectedBrandFilter !== 'All') {
      if (p.brand.toLowerCase() !== selectedBrandFilter.toLowerCase()) return false;
    }

    // Condition & Lineup filter
    if (conditionFilter !== 'All') {
      if (conditionFilter === 'Lineup' && !p.isLineupItem) return false;
      if (conditionFilter === 'New' && p.condition !== 'New') return false;
      if (conditionFilter === 'Pre-Owned' && p.condition === 'New') return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Stats */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-[11px] uppercase tracking-wider">
              Product Management System
            </span>
            <span className="text-xs text-slate-400">• Traffic Chowk Inventory</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 font-serif mt-1">Smartphones & Inventory Catalog</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {products.length} products listed ({products.filter(p => !p.isHidden).length} active on visitor store, {products.filter(p => p.isHidden).length} hidden).
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {products.some(p => p.condition === 'Pre-Owned' || p.condition === 'Used') && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('के तपाई सबै डेमो / Pre-Owned फोनहरू क्याटलगबाट हटाउन चाहनुहुन्छ? (Are you sure you want to remove all demo/used phones?)')) {
                  DataStorageService.removePreOwnedProducts();
                  onProductsChange();
                }
              }}
              className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-all flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
              title="Remove fake/demo pre-owned products"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>डेमो उत्पादन हटाउनुहोस् (Remove Demo)</span>
            </button>
          )}

          <button
            id="admin-add-product-btn"
            type="button"
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Smartphone</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by brand, model, storage, or color..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Brand Filter */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <select
            value={selectedBrandFilter}
            onChange={(e) => setSelectedBrandFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white cursor-pointer"
          >
            <option value="All">All Brands ({products.length})</option>
            {SUPPORTED_BRANDS.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({products.filter(p => p.brand.toLowerCase() === b.id.toLowerCase()).length})
              </option>
            ))}
          </select>

          {/* Condition Filter */}
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value as any)}
            className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white cursor-pointer"
          >
            <option value="All">All Conditions</option>
            <option value="Lineup">📱 In Lineup Showcase ({products.filter(p => p.isLineupItem).length})</option>
            <option value="New">Brand New Sealed ({products.filter(p => p.condition === 'New').length})</option>
            <option value="Pre-Owned">Pre-Owned / Used ({products.filter(p => p.condition !== 'New').length})</option>
          </select>
        </div>
      </div>

      {/* Products Display (Grid & Quick Controls) */}
      {products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Smartphone className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">No products available in inventory</h3>
            <p className="text-xs text-slate-500">
              No smartphones have been added yet. Click the button below to add your first smartphone to the store catalog.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors inline-flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Smartphone</span>
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3">
          <p className="text-sm font-bold text-slate-700">No products match your search or filter criteria.</p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setSelectedBrandFilter('All'); setConditionFilter('All'); }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((prod) => {
            const isPreOwned = prod.condition === 'Used' || prod.condition === 'Pre-Owned' || prod.condition === 'Refurbished';
            const photosCount = (prod.images?.length || (prod.image ? 1 : 0));

            return (
              <div
                key={prod.id}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  prod.isHidden ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                {/* Top Image & Status Overlays */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={prod.image || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'}
                    alt={prod.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Badges Left */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                    {prod.isLineupHero ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-700 text-white flex items-center space-x-1 shadow-xs">
                        <Sparkles className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                        <span>Flagship Hero</span>
                      </span>
                    ) : prod.isLineupItem ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white flex items-center space-x-1 shadow-xs">
                        <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                        <span>Lineup</span>
                      </span>
                    ) : null}
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      isPreOwned ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
                    }`}>
                      {isPreOwned ? 'Pre-Owned' : 'Brand New'}
                    </span>
                    {isPreOwned && prod.batteryHealth && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/90 text-white">
                        🔋 {prod.batteryHealth}
                      </span>
                    )}
                  </div>

                  {/* Badges Right */}
                  <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1 z-10">
                    {prod.isHidden ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-600 text-white flex items-center space-x-1 shadow-xs">
                        <EyeOff className="w-3 h-3" />
                        <span>Hidden</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white flex items-center space-x-1 shadow-xs">
                        <Eye className="w-3 h-3" />
                        <span>Visible</span>
                      </span>
                    )}

                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      prod.availability === 'Out of Stock' ? 'bg-rose-600 text-white' : 'bg-slate-900/80 text-white'
                    }`}>
                      {prod.availability || 'In Stock'}
                    </span>

                    {photosCount > 1 && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-white flex items-center space-x-1">
                        <Images className="w-3 h-3" />
                        <span>{photosCount} Photos</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-extrabold text-indigo-600 uppercase tracking-wider">{prod.brand}</span>
                      <span>{prod.storage || '128GB'} • {prod.ram ? `${prod.ram} RAM` : 'Standard'}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{prod.name}</h4>

                    {prod.color && (
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        Color: <span className="font-medium text-slate-700">{prod.color}</span>
                      </div>
                    )}

                    {/* Price and quick edit */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-base font-black text-indigo-700">{formatNPR(prod.price)}</span>
                        {prod.originalPrice && prod.originalPrice > prod.price && (
                          <span className="text-xs text-slate-400 line-through">{formatNPR(prod.originalPrice)}</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleQuickPriceChange(prod.id, prod.price)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-0.5 p-1 rounded hover:bg-indigo-50 cursor-pointer"
                        title="Quick change price"
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>Change Price</span>
                      </button>
                    </div>

                    <div className="mt-1 text-[11px] text-slate-500 flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{prod.warranty || 'Store Warranty'}</span>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    <div className="flex items-center space-x-1">
                      {/* Hide/Show Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(prod.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer ${
                          prod.isHidden
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title={prod.isHidden ? 'Click to Show on Storefront' : 'Click to Hide from Storefront'}
                      >
                        {prod.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{prod.isHidden ? 'Show' : 'Hide'}</span>
                      </button>

                      {/* Lineup Showcase Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleLineup(prod.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer ${
                          prod.isLineupItem
                            ? 'bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                        title={prod.isLineupItem ? 'In Showcase Lineup (Click to remove)' : 'Add to Showcase Lineup'}
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${prod.isLineupItem ? 'text-purple-600 fill-purple-500' : 'text-slate-400'}`} />
                        <span>{prod.isLineupHero ? 'Hero' : prod.isLineupItem ? 'Lineup' : '+ Lineup'}</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => openEditModal(prod)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                        title="Edit all product specs and photos"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs transition-colors cursor-pointer"
                        title="Delete product permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-serif">
                    {editingProductId ? 'Edit Smartphone' : 'Add New Smartphone'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingProductId ? 'Update specifications, pricing, and photo gallery' : 'Create new product entry for store catalog'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* SECTION 1: Brand & Model Selection */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                  1. Select Brand & Model
                </label>

                {/* Brand Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {SUPPORTED_BRANDS.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleBrandSelect(b.id)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                        brand === b.id
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 ring-2 ring-indigo-600'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {b.id === 'Apple' && <Apple className="w-4 h-4" />}
                      {b.id === 'Samsung' && <Layers className="w-4 h-4" />}
                      {b.id === 'Vivo' && <Camera className="w-4 h-4" />}
                      {b.id === 'POCO' && <Zap className="w-4 h-4" />}
                      {b.id === 'HONOR' && <Cpu className="w-4 h-4" />}
                      {b.id === 'Redmi' && <Smartphone className="w-4 h-4" />}
                      {b.id === 'Accessories' && <Headphones className="w-4 h-4" />}
                      <span>{b.name}</span>
                    </button>
                  ))}
                </div>

                {/* Model & Name Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Model Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter phone model (e.g. iPhone 16 Pro Max)"
                      value={model}
                      onChange={(e) => handleModelChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Display Title / Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter full display title"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Photos Upload & Primary Cover Photo */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                      2. Product Photos & Cover Image
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Upload multiple photos from your device or paste image URLs. Click any photo to set it as Primary Cover.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {uploadedPhotos.length} Photo{uploadedPhotos.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Upload Buttons & URL Input */}
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* File Upload Trigger */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileUpload(e.target.files)}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Device Photos</span>
                  </button>

                  {/* URL Input */}
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      placeholder="Or paste image URL (https://...)"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {uploadError && (
                  <p className="text-xs font-semibold text-rose-600 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{uploadError}</span>
                  </p>
                )}

                {/* Photo Thumbnails & Primary Selection */}
                {uploadedPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                    {uploadedPhotos.map((photo, idx) => {
                      const isPrimary = primaryPhotoIndex === idx;
                      return (
                        <div
                          key={idx}
                          className={`relative rounded-xl overflow-hidden border-2 transition-all group bg-white ${
                            isPrimary ? 'border-indigo-600 ring-2 ring-indigo-600/30' : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <div className="h-24 bg-slate-100 flex items-center justify-center overflow-hidden">
                            <img
                              src={photo}
                              alt={`Upload ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Primary Cover Badge */}
                          {isPrimary && (
                            <div className="absolute top-1 left-1 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                              PRIMARY
                            </div>
                          )}

                          {/* Action Overlay */}
                          <div className="p-1.5 bg-white border-t border-slate-100 flex items-center justify-between text-[10px]">
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryPhoto(idx)}
                              className={`font-bold px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                                isPrimary
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {isPrimary ? 'Cover' : 'Set Cover'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="text-rose-600 hover:bg-rose-50 p-1 rounded transition-colors cursor-pointer"
                              title="Delete this photo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl text-center space-y-1">
                    <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">No photos uploaded yet</p>
                    <p className="text-[11px] text-slate-400">Click "Upload Device Photos" or enter photo URLs above.</p>
                  </div>
                )}
              </div>

              {/* SECTION 3: Condition & Warranty */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                  3. Condition & Warranty
                </label>

                {/* Condition Toggle: New vs Pre-Owned */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCondition('New');
                      setConditionGrade('Brand New Sealed');
                      setBatteryHealth('');
                    }}
                    className={`p-3 rounded-xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                      condition === 'New'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/30'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 ${
                      condition === 'New' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                    }`}>
                      {condition === 'New' && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">Brand New (Sealed Pack)</span>
                      <span className="text-[11px] text-slate-500">Official company warranty, brand new box sealed.</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCondition('Pre-Owned');
                      setConditionGrade('Grade A (Flawless)');
                    }}
                    className={`p-3 rounded-xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                      condition !== 'New'
                        ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-600/30'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 ${
                      condition !== 'New' ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'
                    }`}>
                      {condition !== 'New' && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">Pre-Owned / Certified Used</span>
                      <span className="text-[11px] text-slate-500">Tested by store technicians with testing guarantee.</span>
                    </div>
                  </button>
                </div>

                {/* If Pre-Owned: Grade & Battery Health */}
                {condition !== 'New' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Condition Grade</label>
                      <select
                        value={conditionGrade}
                        onChange={(e) => setConditionGrade(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                      >
                        <option value="Flawless (Grade A+)">Flawless (Grade A+)</option>
                        <option value="Like New (Grade A)">Like New (Grade A)</option>
                        <option value="Excellent (Grade B+)">Excellent (Grade B+)</option>
                        <option value="Good Condition (Grade B)">Good Condition (Grade B)</option>
                        <option value="Fair / Minor Scratches">Fair / Minor Scratches</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Battery Health (Optional)</label>
                      <input
                        type="text"
                        placeholder="Enter percentage (100%, 95%, etc.)"
                        value={batteryHealth}
                        onChange={(e) => setBatteryHealth(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Warranty Selection */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Warranty Term</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={warranty}
                      onChange={(e) => setWarranty(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                    >
                      {WARRANTY_PRESETS.map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                      <option value="Other">Custom Warranty...</option>
                    </select>

                    {warranty === 'Other' && (
                      <input
                        type="text"
                        placeholder="Enter custom warranty duration"
                        value={customWarranty}
                        onChange={(e) => setCustomWarranty(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 4: Storage, RAM, Color, Pricing, Stock */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                  4. Hardware Specs, Pricing & Stock
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  
                  {/* Storage */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Storage Capacity *</label>
                    <div className="space-y-1.5">
                      <select
                        value={storage}
                        onChange={(e) => setStorage(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                      >
                        {STORAGE_OPTIONS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                        <option value="Other">Other Custom Storage</option>
                      </select>
                      {storage === 'Other' && (
                        <input
                          type="text"
                          placeholder="Enter storage capacity (32GB, 2TB, etc.)"
                          value={customStorage}
                          onChange={(e) => setCustomStorage(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      )}
                    </div>
                  </div>

                  {/* RAM */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">RAM Capacity</label>
                    <div className="space-y-1.5">
                      <select
                        value={ram}
                        onChange={(e) => setRam(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                      >
                        {RAM_OPTIONS.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                        <option value="Other">Other Custom RAM</option>
                      </select>
                      {ram === 'Other' && (
                        <input
                          type="text"
                          placeholder="Enter RAM capacity (24GB, etc.)"
                          value={customRam}
                          onChange={(e) => setCustomRam(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      )}
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Color Variant</label>
                    <div className="space-y-1.5">
                      <select
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                      >
                        {COLOR_PRESETS.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                        <option value="Other">Other Color...</option>
                      </select>
                      {color === 'Other' && (
                        <input
                          type="text"
                          placeholder="Enter custom color name"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      )}
                    </div>
                  </div>

                </div>

                {/* Color-wise Image Mapping Section */}
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                        <Palette className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-indigo-950">Color-Wise Image Upload (कलर अनुसार फोटो)</h4>
                        <p className="text-[11px] text-indigo-700">Assign dedicated photo for each color. Visitors will see the image switch when they click on that color.</p>
                      </div>
                    </div>
                    {Object.keys(colorImages).length > 0 && (
                      <span className="text-[10px] font-extrabold bg-indigo-200/70 text-indigo-800 px-2 py-0.5 rounded-full">
                        {Object.keys(colorImages).length} colors mapped
                      </span>
                    )}
                  </div>

                  {/* Add mapping row */}
                  <div className="bg-white p-3 rounded-xl border border-indigo-100 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                    <input
                      type="text"
                      placeholder="Color name (e.g. Desert Titanium, Natural Titanium)"
                      value={activeColorInput}
                      onChange={(e) => setActiveColorInput(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex-1"
                    />

                    {/* Quick populate button from selected color */}
                    <button
                      type="button"
                      onClick={() => setActiveColorInput(color === 'Other' ? (customColor.trim() || '') : color)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg border border-indigo-200 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Use "{color === 'Other' ? (customColor.trim() || 'Custom') : color}"
                    </button>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="url"
                        placeholder="Image URL..."
                        value={colorImgUrlInput}
                        onChange={(e) => setColorImgUrlInput(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-36 sm:w-44"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (activeColorInput.trim() && colorImgUrlInput.trim()) {
                            handleAddColorImage(activeColorInput, colorImgUrlInput);
                            setColorImgUrlInput('');
                          }
                        }}
                        disabled={!activeColorInput.trim() || !colorImgUrlInput.trim()}
                        className="px-2.5 py-1.5 bg-indigo-600 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={colorFileInputRef}
                        className="hidden"
                        onChange={(e) => handleColorFileUpload(e, activeColorInput.trim() || (color === 'Other' ? customColor.trim() : color))}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!activeColorInput.trim()) {
                            setActiveColorInput(color === 'Other' ? (customColor.trim() || 'Default') : color);
                          }
                          colorFileInputRef.current?.click();
                        }}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer whitespace-nowrap"
                        title="Upload device photo directly from computer/phone for this color"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                      </button>
                    </div>
                  </div>

                  {/* Existing color mappings list */}
                  {Object.keys(colorImages).length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                      {Object.entries(colorImages).map(([cName, cImg]) => (
                        <div
                          key={cName}
                          className="flex items-center space-x-2.5 p-2 bg-white rounded-xl border border-indigo-200 shadow-xs"
                        >
                          <img
                            src={cImg}
                            alt={cName}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-slate-50 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{cName}</p>
                            <p className="text-[10px] text-slate-400 truncate">{cImg.substring(0, 32)}...</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveColorImage(cName)}
                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                            title={`Remove ${cName} photo`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing & Stock Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (NPR) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rs.</span>
                      <input
                        type="number"
                        required
                        min="0"
                        step="100"
                        placeholder="Enter selling price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Original / MRP (Optional)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rs.</span>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        placeholder="Enter original MRP"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Stock / Availability *</label>
                    <select
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                    >
                      {AVAILABILITY_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Additional Details & Visibility Settings */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Description / Notes (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Key specifications, box contents, condition notes, etc."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                {/* Feature / Visibility Toggles */}
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Feature on Homepage</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                      className="rounded text-amber-500"
                    />
                    <span>Mark as Best Seller</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-bold text-amber-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isHidden}
                      onChange={(e) => setIsHidden(e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <span>Hide from Storefront (Draft)</span>
                  </label>
                </div>

                {/* Lineup Showcase Settings */}
                <div className="pt-3 border-t border-slate-200 bg-purple-50/60 p-4 rounded-xl border border-purple-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-black uppercase tracking-wider text-purple-950">
                        Lineup Showcase (Storefront Banner)
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200/70 text-purple-800 font-bold">
                      Apple / Flagship Banner
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-start space-x-2.5 text-xs font-bold text-slate-800 cursor-pointer bg-white p-2.5 rounded-lg border border-purple-200/60 shadow-2xs">
                      <input
                        type="checkbox"
                        checked={isLineupItem}
                        onChange={(e) => {
                          setIsLineupItem(e.target.checked);
                          if (!e.target.checked) setIsLineupHero(false);
                        }}
                        className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 mt-0.5 cursor-pointer"
                      />
                      <div>
                        <div className="text-slate-900">Include in Lineup Showcase</div>
                        <div className="text-[10px] text-slate-500 font-normal">Shows in the homepage lineup banner</div>
                      </div>
                    </label>

                    <label className="flex items-start space-x-2.5 text-xs font-bold text-slate-800 cursor-pointer bg-white p-2.5 rounded-lg border border-purple-200/60 shadow-2xs">
                      <input
                        type="checkbox"
                        checked={isLineupHero}
                        onChange={(e) => {
                          setIsLineupHero(e.target.checked);
                          if (e.target.checked) setIsLineupItem(true);
                        }}
                        className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 mt-0.5 cursor-pointer"
                      />
                      <div>
                        <div className="text-purple-900 flex items-center space-x-1.5">
                          <span>Set as Flagship Hero</span>
                          <span className="text-[9px] px-1 bg-amber-100 text-amber-800 rounded font-black">HERO</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-normal">Large featured presentation item</div>
                      </div>
                    </label>
                  </div>

                  {isLineupItem && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Lineup Highlights / Tagline
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Titanium • A18 Pro chip • Camera Control"
                          value={lineupTagline}
                          onChange={(e) => setLineupTagline(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Lineup Badge Label
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. All-New, Best Value, Pro Power"
                          value={lineupBadge}
                          onChange={(e) => setLineupBadge(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Footer Actions */}
              <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="admin-save-product-submit-btn"
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProductId ? 'Save Changes' : 'Add to Inventory'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
