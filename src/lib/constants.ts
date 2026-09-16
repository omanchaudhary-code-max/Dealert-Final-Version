export const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Living',
  'Beauty',
  'Sports',
  'Lifestyle',
  'Mobiles',
  'Laptops',
  'Audio',
  'Gaming',
  'Televisions',
  'Shoes',
  'Books',
  'Cameras',
  'Kitchen Appliances'
] as const;

export interface MockProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  currentPrice: number;
  originalPrice: number;
  discountPercentage: number;
  category: string;
  sellerName: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  sellerUrl: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  priceHistory: { date: string; price: number }[];
  updatedAt: string;
}

export const INITIAL_PRODUCTS: MockProduct[] = [
  {
    id: "prod-macbook-m3",
    name: "Apple MacBook Air M3 (13-inch, 2024)",
    description: "Apple M3 chip with 8-core CPU and 10-core GPU, 8GB Unified Memory, 256GB SSD storage. Retina display with True Tone, silent fanless design.",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60",
    currentPrice: 155000,
    originalPrice: 175000,
    discountPercentage: 11,
    category: "Laptops",
    sellerName: "Oliz Store",
    rating: 4.8,
    reviewsCount: 142,
    inStock: true,
    sellerUrl: "https://www.daraz.com.np/products/apple-macbook-air-m3-i12345.html",
    minPrice: 150000,
    maxPrice: 175000,
    avgPrice: 162500,
    priceHistory: [
      { date: "May 20", price: 175000 },
      { date: "May 25", price: 172000 },
      { date: "Jun 01", price: 170000 },
      { date: "Jun 05", price: 165000 },
      { date: "Jun 10", price: 158000 },
      { date: "Jun 19", price: 155000 }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-iphone-15",
    name: "Apple iPhone 15 Pro Max (256GB)",
    description: "Titanium design, A17 Pro chip, customizable Action button, the most powerful iPhone camera system, and USB-C support.",
    imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop&q=60",
    currentPrice: 194000,
    originalPrice: 204000,
    discountPercentage: 5,
    category: "Smartphones",
    sellerName: "Evo Store",
    rating: 4.9,
    reviewsCount: 208,
    inStock: true,
    sellerUrl: "https://www.daraz.com.np/products/apple-iphone-15-pro-max-i23456.html",
    minPrice: 192000,
    maxPrice: 204000,
    avgPrice: 198000,
    priceHistory: [
      { date: "May 20", price: 204000 },
      { date: "May 25", price: 202000 },
      { date: "Jun 01", price: 200000 },
      { date: "Jun 05", price: 197000 },
      { date: "Jun 10", price: 195000 },
      { date: "Jun 19", price: 194000 }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-samsung-a55",
    name: "Samsung Galaxy A55 5G (8GB/256GB)",
    description: "6.6-inch FHD+ Super AMOLED 120Hz display, Exynos 1480 processor, 50MP OIS camera, 5000mAh battery with 25W fast charging.",
    imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=60",
    currentPrice: 58999,
    originalPrice: 64999,
    discountPercentage: 9,
    category: "Mobiles",
    sellerName: "Samsung Official",
    rating: 4.6,
    reviewsCount: 114,
    inStock: true,
    sellerUrl: "https://www.daraz.com.np/products/samsung-galaxy-a55-i98765.html",
    minPrice: 57000,
    maxPrice: 64999,
    avgPrice: 61000,
    priceHistory: [
      { date: "May 20", price: 64999 },
      { date: "May 25", price: 62999 },
      { date: "Jun 01", price: 61000 },
      { date: "Jun 05", price: 59999 },
      { date: "Jun 19", price: 58999 }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-sony-wh1000xm5",
    name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    description: "Industry-leading noise cancellation, exceptional sound quality with the Integrated Processor V1, crystal-clear hands-free calling.",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
    currentPrice: 42000,
    originalPrice: 48000,
    discountPercentage: 12,
    category: "Audio",
    sellerName: "Sony Nepal",
    rating: 4.7,
    reviewsCount: 95,
    inStock: true,
    sellerUrl: "https://www.daraz.com.np/products/sony-wh-1000xm5-i34567.html",
    minPrice: 40000,
    maxPrice: 48000,
    avgPrice: 43500,
    priceHistory: [
      { date: "May 20", price: 48000 },
      { date: "May 25", price: 46000 },
      { date: "Jun 01", price: 45000 },
      { date: "Jun 05", price: 43000 },
      { date: "Jun 10", price: 42500 },
      { date: "Jun 19", price: 42000 }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-samsung-qled",
    name: "Samsung 55\" QLED 4K Smart TV",
    description: "Quantum Processor Lite 4K, 100% Color Volume with Quantum Dot, Dual LED backlighting, Smart TV Hub with built-in voice assistants.",
    imageUrl: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=500&auto=format&fit=crop&q=60",
    currentPrice: 110000,
    originalPrice: 135000,
    discountPercentage: 18,
    category: "Televisions",
    sellerName: "Him Electronics",
    rating: 4.6,
    reviewsCount: 64,
    inStock: true,
    sellerUrl: "https://www.daraz.com.np/products/samsung-55-qled-4k-tv-i45678.html",
    minPrice: 108000,
    maxPrice: 135000,
    avgPrice: 121000,
    priceHistory: [
      { date: "May 20", price: 135000 },
      { date: "May 25", price: 128000 },
      { date: "Jun 01", price: 122000 },
      { date: "Jun 05", price: 115000 },
      { date: "Jun 10", price: 112000 },
      { date: "Jun 19", price: 110000 }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-dell-xps13",
    name: "Dell XPS 13 9340 Laptop (2024)",
    description: "Intel Core Ultra 7 processor, 16GB LPDDR5X RAM, 512GB SSD, 13.4-inch FHD+ InfinityEdge display, Windows 11 Home.",
    imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=60",
    currentPrice: 168000,
    originalPrice: 188000,
    discountPercentage: 10,
    category: "Laptops",
    sellerName: "LDS Nepal",
    rating: 4.5,
    reviewsCount: 37,
    inStock: true,
    sellerUrl: "https://www.daraz.com.np/products/dell-xps-13-i56789.html",
    minPrice: 165000,
    maxPrice: 188000,
    avgPrice: 174000,
    priceHistory: [
      { date: "May 20", price: 188000 },
      { date: "May 25", price: 185000 },
      { date: "Jun 01", price: 180000 },
      { date: "Jun 05", price: 175000 },
      { date: "Jun 10", price: 170000 },
      { date: "Jun 19", price: 168000 }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-ps5-slim",
    name: "PlayStation 5 Slim Console (Disc Edition)",
    description: "Ultra-high speed SSD, ray tracing, 4K-TV gaming, HDR technology, tempest 3D AudioTech, DualSense wireless controller included.",
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=60",
    currentPrice: 74999,
    originalPrice: 84999,
    discountPercentage: 12,
    category: "Gaming",
    sellerName: "Gaming Hub NP",
    rating: 4.9,
    reviewsCount: 156,
    inStock: true,
    sellerUrl: "https://www.daraz.com.np/products/ps5-slim-disc-edition-i87654.html",
    minPrice: 72000,
    maxPrice: 84999,
    avgPrice: 78500,
    priceHistory: [
      { date: "May 20", price: 84999 },
      { date: "May 25", price: 81999 },
      { date: "Jun 01", price: 78000 },
      { date: "Jun 19", price: 74999 }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-nike-pegasus",
    name: "Nike Air Zoom Pegasus 40 Running Shoes",
    description: "Responsive cushioning in the Pegasus provides an energized ride for everyday road running. Engineered mesh upper for breathable comfort.",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60",
    currentPrice: 14500,
    originalPrice: 18500,
    discountPercentage: 21,
    category: "Fashion",
    sellerName: "Nike Nepal Store",
    rating: 4.7,
    reviewsCount: 88,
    inStock: true,
    sellerUrl: "https://www.daraz.com.np/products/nike-air-zoom-pegasus-40-i76543.html",
    minPrice: 14000,
    maxPrice: 18500,
    avgPrice: 16000,
    priceHistory: [
      { date: "May 20", price: 18500 },
      { date: "May 25", price: 16800 },
      { date: "Jun 01", price: 15500 },
      { date: "Jun 19", price: 14500 }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-air-fryer",
    name: "Philips XXL Digital Airfryer (7.3L)",
    description: "Rapid Air technology, 90% less fat frying, digital touchscreen with 7 presets, Keep Warm mode, dishwasher safe parts.",
    imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=60",
    currentPrice: 24999,
    originalPrice: 32999,
    discountPercentage: 24,
    category: "Kitchen Appliances",
    sellerName: "Philips Official",
    rating: 4.8,
    reviewsCount: 142,
    inStock: true,
    sellerUrl: "https://www.daraz.com.np/products/philips-xxl-digital-airfryer-i65432.html",
    minPrice: 24000,
    maxPrice: 32999,
    avgPrice: 28000,
    priceHistory: [
      { date: "May 20", price: 32999 },
      { date: "May 25", price: 29999 },
      { date: "Jun 01", price: 27500 },
      { date: "Jun 19", price: 24999 }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-skincare-serum",
    name: "The Ordinary Niacinamide 10% + Zinc 1% (30ml)",
    description: "High-strength vitamin and mineral blemish formula. Reduces the appearance of skin blemishes and congestion.",
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60",
    currentPrice: 1850,
    originalPrice: 2450,
    discountPercentage: 24,
    category: "Beauty",
    sellerName: "Beauty Corner NP",
    rating: 4.9,
    reviewsCount: 310,
    inStock: true,
    sellerUrl: "https://www.daraz.com.np/products/the-ordinary-niacinamide-i54321.html",
    minPrice: 1750,
    maxPrice: 2450,
    avgPrice: 2100,
    priceHistory: [
      { date: "May 20", price: 2450 },
      { date: "May 25", price: 2200 },
      { date: "Jun 01", price: 1999 },
      { date: "Jun 19", price: 1850 }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-smart-lamp",
    name: "Xiaomi Smart LED Desk Lamp 1S",
    description: "Optical design with no flicker, 4 lighting modes, works with Google Assistant & Apple HomeKit, minimalist aluminum body.",
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60",
    currentPrice: 4999,
    originalPrice: 6499,
    discountPercentage: 23,
    category: "Home & Living",
    sellerName: "Mi Store Nepal",
    rating: 4.7,
    reviewsCount: 76,
    inStock: true,
    sellerUrl: "https://www.daraz.com.np/products/xiaomi-smart-desk-lamp-i43210.html",
    minPrice: 4800,
    maxPrice: 6499,
    avgPrice: 5600,
    priceHistory: [
      { date: "May 20", price: 6499 },
      { date: "May 25", price: 5800 },
      { date: "Jun 01", price: 5300 },
      { date: "Jun 19", price: 4999 }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-fuji-xt5",
    name: "Fujifilm X-T5 Mirrorless Camera with 18-55mm Lens",
    description: "40.2MP APS-C X-Trans CMOS 5 HR Sensor, 5-axis in-body image stabilization, 4K/60p video, retro design with dedicated analog dials.",
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60",
    currentPrice: 225000,
    originalPrice: 245000,
    discountPercentage: 8,
    category: "Cameras",
    sellerName: "Photo Hub",
    rating: 4.8,
    reviewsCount: 29,
    inStock: true,
    sellerUrl: "https://www.daraz.com.np/products/fujifilm-x-t5-camera-i67890.html",
    minPrice: 220000,
    maxPrice: 245000,
    avgPrice: 232000,
    priceHistory: [
      { date: "May 20", price: 245000 },
      { date: "May 25", price: 240000 },
      { date: "Jun 01", price: 235000 },
      { date: "Jun 05", price: 230000 },
      { date: "Jun 10", price: 228000 },
      { date: "Jun 19", price: 225000 }
    ],
    updatedAt: new Date().toISOString()
  }
];
