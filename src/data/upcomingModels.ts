import { UpcomingModel, PopupSettings } from '../types.ts';

export const initialPopupSettings: PopupSettings = {
  isEnabled: true,
  delaySeconds: 2,
  mode: 'single',
  heading: 'COMING SOON / UPCOMING FLAGSHIP',
  subheading: 'Official Pre-Booking Now Open at Pandey Mobile Store'
};

export const initialUpcomingModels: UpcomingModel[] = [
  {
    id: 'up-iphone-18-pro-max',
    slug: 'iphone-18-pro-max',
    brand: 'Apple',
    name: 'iPhone 18 Pro Max',
    model: 'iPhone 18 Pro Max',
    tagline: 'Titanium Redefined. Next-Gen Apple Intelligence.',
    badge: 'COMING SOON',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80'
    ],
    expectedLaunchDate: 'Expected Autumn 2026',
    expectedPrice: 224999,
    expectedPriceText: 'Expected Rs. 2,24,999 onwards',
    description: 'Experience the revolutionary Apple A20 Pro Bionic architecture, custom vapor chamber thermal cooling, 48MP triple telephoto periscope zoom, and next-generation Siri Apple Intelligence with ultra-low latency.',
    keyFeatures: [
      'Next-Gen A20 Pro 2nm Chipset',
      'Under-Display Face ID & ProMotion 120Hz',
      'Upgraded 48MP Quad-Prism 10x Optical Telephoto',
      'Aerospace Grade 5 Thermal Titanium Frame',
      'Fast MagSafe 35W & Qi2 Wireless Charging'
    ],
    specs: [
      { label: 'Display', value: '6.9" Super Retina XDR OLED, 3000 nits, Ceramic Shield Gen 2' },
      { label: 'Processor', value: 'Apple A20 Pro (2nm) 6-Core CPU + 6-Core GPU' },
      { label: 'Rear Cameras', value: '48MP Main (OIS) + 48MP Ultra-Wide + 48MP Periscope Telephoto' },
      { label: 'Front Camera', value: '18MP TrueDepth HDR with AutoFocus' },
      { label: 'Battery', value: '4,850 mAh with Smart Battery Intelligence' },
      { label: 'Charging', value: '45W Wired USB-C 3.2 Gen 2 & 25W MagSafe' },
      { label: 'Durability', value: 'IP68 Water Resistance (6m up to 30 mins)' }
    ],
    availableColors: ['Desert Titanium', 'Natural Titanium', 'Deep Cosmic Blue', 'Black Titanium'],
    storageVariants: ['256GB', '512GB', '1TB', '2TB'],
    isFeaturedInPopup: true,
    displayOrder: 1,
    isActive: true,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-15T00:00:00.000Z'
  },
  {
    id: 'up-samsung-galaxy-s26-ultra',
    slug: 'samsung-galaxy-s26-ultra',
    brand: 'Samsung',
    name: 'Samsung Galaxy S26 Ultra 5G',
    model: 'Galaxy S26 Ultra 5G',
    tagline: 'Galaxy AI with Embedded S-Pen & 200MP Master Sensor.',
    badge: 'PRE-BOOKING OPEN',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1200&q=80'
    ],
    expectedLaunchDate: 'Expected Early 2027',
    expectedPrice: 199999,
    expectedPriceText: 'Expected Rs. 1,99,999 onwards',
    description: 'The pinnacle of Android craftsmanship with Snapdragon 8 Elite Gen 2, Gorilla Glass Armor antireflective display, integrated S-Pen, and advanced multimodal Galaxy AI suite.',
    keyFeatures: [
      'Snapdragon 8 Elite Gen 2 (4.47GHz Extreme)',
      '6.8" Dynamic AMOLED 2X, 3200 nits peak',
      '200MP ISOCELL HP2+ Sensor with AI ISP',
      '5,000 mAh Dual-Cell with 65W Super Fast Charging',
      'Integrated Bluetooth S-Pen with Air Gestures'
    ],
    specs: [
      { label: 'Display', value: '6.8" QHD+ Dynamic AMOLED 2X, 1-120Hz LTPO, Anti-Reflective Armor' },
      { label: 'Processor', value: 'Qualcomm Snapdragon 8 Elite Gen 2 (3nm)' },
      { label: 'Rear Cameras', value: '200MP (OIS) + 50MP Ultra-Wide + 50MP 5x Telephoto + 10MP 3x Zoom' },
      { label: 'Front Camera', value: '24MP Dual Pixel PDAF' },
      { label: 'Battery', value: '5,000 mAh' },
      { label: 'Charging', value: '65W Wired + 15W Fast Wireless 2.0' },
      { label: 'OS & AI', value: 'One UI 8.0 with 7 Years OS Upgrades & Galaxy AI' }
    ],
    availableColors: ['Titanium Gray', 'Titanium Black', 'Titanium Violet', 'Titanium Yellow'],
    storageVariants: ['256GB / 12GB RAM', '512GB / 16GB RAM', '1TB / 16GB RAM'],
    isFeaturedInPopup: true,
    displayOrder: 2,
    isActive: true,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-15T00:00:00.000Z'
  }
];
