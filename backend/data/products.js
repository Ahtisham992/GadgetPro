const products = [
  {
    name: 'ProVision X1 Smart Glasses',
    image: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&q=80&w=800',
    description: 'Immersive augmented reality smart glasses with built-in voice commands, 4K holographic display, and bone-conduction audio.',
    brand: 'ProVision', category: 'Wearables', price: 155000, countInStock: 10, rating: 4.8, numReviews: 12,
  },
  {
    name: 'AeroBook Pro 16" Minimalist Laptop',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
    description: 'Ultra-thin aluminum chassis with M-Series equivalent chip. Built for creative professionals demanding top-tier performance.',
    brand: 'Aero', category: 'Laptops', price: 345000, countInStock: 7, rating: 4.9, numReviews: 8,
  },
  {
    name: 'Phantom V-Fold Smartphone',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351cb31b?auto=format&fit=crop&q=80&w=800',
    description: 'Next generation foldable smartphone. Zero-gap hinge, under-display camera, and stunning 120Hz OLED inner screen.',
    brand: 'Phantom', category: 'Smartphones', price: 499999, countInStock: 5, rating: 4.7, numReviews: 15,
  },
  {
    name: 'EchoBeat Noise-Canceling Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    description: 'Studio-quality audio meets ultimate silence. 40 hours of battery life with ANC that adapts to your environment.',
    brand: 'EchoBeat', category: 'Audio', price: 45000, countInStock: 11, rating: 4.5, numReviews: 20,
  },
  {
    name: 'Quantum Mechanical Keyboard v2',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800',
    description: 'Premium customizable mechanical keyboard with hot-swappable switches, aerospace aluminum body, and per-key RGB.',
    brand: 'Quantum', category: 'Accessories', price: 32000, countInStock: 25, rating: 4.8, numReviews: 30,
  },
  {
    name: 'Nebula Smart Desktop Lamp',
    image: 'https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?auto=format&fit=crop&q=80&w=800',
    description: 'Syncs with your monitor for dynamic bias lighting or sets the perfect ambient mood with 16 million colors.',
    brand: 'Nebula', category: 'Smart Home', price: 15000, countInStock: 0, rating: 4.3, numReviews: 9,
  },
  // ── 10 New Products ──
  {
    name: 'NovaPad Ultra 12.9" Tablet',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800',
    description: 'Powerhouse tablet with 12.9" Liquid Retina display, M2-class chip, 5G connectivity, and all-day battery life.',
    brand: 'Nova', category: 'Tablets', price: 215000, countInStock: 14, rating: 4.7, numReviews: 18,
  },
  {
    name: 'StellarCam 4K Mirrorless Camera',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
    description: 'Professional 61MP full-frame mirrorless camera with 8-stop IBIS, real-time eye AF, and 4K 120fps video.',
    brand: 'StellarOptics', category: 'Cameras', price: 620000, countInStock: 4, rating: 4.9, numReviews: 6,
  },
  {
    name: 'VortexPad Gaming Mouse',
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&q=80&w=800',
    description: 'Precision gaming mouse with 36K DPI optical sensor, 8 programmable buttons, and 58g carbon-fiber shell.',
    brand: 'Vortex', category: 'Gaming', price: 18500, countInStock: 30, rating: 4.6, numReviews: 42,
  },
  {
    name: 'SonicPods X True Wireless Earbuds',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800',
    description: 'Next-gen ANC earbuds with spatial audio, 36-hour total battery, IPX5 water resistance, and instant pairing.',
    brand: 'SonicPods', category: 'Audio', price: 28000, countInStock: 22, rating: 4.4, numReviews: 55,
  },
  {
    name: 'HyperDrive 2TB NVMe SSD',
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&q=80&w=800',
    description: 'Blazing 7,400MB/s read speeds. PS5-compatible with copper heat spreader and 5-year warranty.',
    brand: 'HyperDrive', category: 'Storage', price: 24000, countInStock: 50, rating: 4.8, numReviews: 67,
  },
  {
    name: 'ZenWatch Pro 48mm Smartwatch',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    description: 'Titanium case with sapphire crystal. Advanced health sensors, 3-day battery, always-on AMOLED, and GPS.',
    brand: 'ZenTech', category: 'Wearables', price: 75000, countInStock: 8, rating: 4.7, numReviews: 23,
  },
  {
    name: 'PixelBook Creator Laptop 14"',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800',
    description: 'OLED touchscreen, Intel Core Ultra 9, 32GB RAM, dedicated GPU and 18-hour battery in a thin & light chassis.',
    brand: 'Pixel', category: 'Laptops', price: 295000, countInStock: 9, rating: 4.6, numReviews: 14,
  },
  {
    name: 'NexPhone S25 Ultra',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
    description: '200MP quad-camera system, titanium frame, 5,000mAh battery with 100W charging. Ultimate Android flagship.',
    brand: 'NexPhone', category: 'Smartphones', price: 385000, countInStock: 12, rating: 4.8, numReviews: 31,
  },
  {
    name: 'ArenaX Pro Gaming Headset',
    image: 'https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&q=80&w=800',
    description: '7.1 surround sound headset with AI noise-canceling mic, 50mm planar drivers, and memory foam ear cups.',
    brand: 'ArenaX', category: 'Gaming', price: 22000, countInStock: 18, rating: 4.5, numReviews: 38,
  },
  {
    name: 'SmartHub Wi-Fi 7 Router',
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?auto=format&fit=crop&q=80&w=800',
    description: 'Wi-Fi 7 tri-band router delivering 19Gbps throughput with 2.5G WAN, advanced parental controls, and AI mesh.',
    brand: 'SmartHub', category: 'Networking', price: 42000, countInStock: 15, rating: 4.5, numReviews: 27,
  },
];

export default products;
