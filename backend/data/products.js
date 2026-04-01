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
  // ── 5 New Smartphones ──
  {
    name: 'Galaxy S24 Ultra',
    image: 'https://images.unsplash.com/photo-1707018318181-ed1184a28293?auto=format&fit=crop&q=80&w=800',
    description: 'AI-integrated flagship with 200MP camera, built-in S-Pen, and Snapdragon 8 Gen 3 for Galaxy.',
    brand: 'Samsung', category: 'Smartphones', price: 425000, countInStock: 15, rating: 4.9, numReviews: 45,
    specs: { ram: '12GB', storage: '512GB', screen: '6.8" AMOLED', processor: 'Snapdragon 8 Gen 3' }
  },
  {
    name: 'iPhone 15 Pro Max',
    image: 'https://images.unsplash.com/photo-1696429158300-843187c34091?auto=format&fit=crop&q=80&w=800',
    description: 'Titanium design with A17 Pro chip, USB-C, and advanced pro camera system with 5x Telephoto.',
    brand: 'Apple', category: 'Smartphones', price: 465000, countInStock: 10, rating: 4.8, numReviews: 38,
    specs: { ram: '8GB', storage: '256GB', screen: '6.7" Super Retina', processor: 'A17 Pro' }
  },
  {
    name: 'Google Pixel 8 Pro',
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800',
    description: 'The best of Google AI with Tensor G3, fully upgraded cameras, and 7 years of OS updates.',
    brand: 'Google', category: 'Smartphones', price: 315000, countInStock: 8, rating: 4.6, numReviews: 22,
    specs: { ram: '12GB', storage: '128GB', screen: '6.7" OLED', processor: 'Tensor G3' }
  },
  {
    name: 'OnePlus 12 5G',
    image: 'https://images.unsplash.com/photo-1708453479155-913a80695029?auto=format&fit=crop&q=80&w=800',
    description: 'Smooth Beyond Belief. Fast charging 100W, Snapdragon 8 Gen 3, and Hasselblad Camera.',
    brand: 'OnePlus', category: 'Smartphones', price: 295000, countInStock: 12, rating: 4.7, numReviews: 19,
    specs: { ram: '16GB', storage: '512GB', screen: '6.8" 120Hz', processor: 'Snapdragon 8 Gen 3' }
  },
  {
    name: 'Sony Xperia 1 V',
    image: 'https://images.unsplash.com/photo-1599950753725-ea5d8aba0d29?auto=format&fit=crop&q=80&w=800',
    description: 'Professional video and photography in a smartphone with 4K HDR 120Hz display and Exmor T sensor.',
    brand: 'Sony', category: 'Smartphones', price: 340000, countInStock: 5, rating: 4.5, numReviews: 14,
    specs: { ram: '12GB', storage: '256GB', screen: '6.5" 4K OLED', processor: 'Snapdragon 8 Gen 2' }
  },
  // ── 5 New Laptops ──
  {
    name: 'MacBook Pro 14" (M3 Max)',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
    description: 'Extreme performance for pro workflows. M3 Max chip, 36GB Unified Memory, and Liquid Retina XDR.',
    brand: 'Apple', category: 'Laptops', price: 950000, countInStock: 4, rating: 4.9, numReviews: 10,
    specs: { ram: '36GB', processor: 'M3 Max', storage: '1TB', screen: '14.2" XDR' }
  },
  {
    name: 'Dell XPS 15 9530',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800',
    description: 'Masterfully crafted for performance. Intel Core i9, 3.5K OLED Touch, and NVIDIA RTX 4070.',
    brand: 'Dell', category: 'Laptops', price: 680000, countInStock: 6, rating: 4.7, numReviews: 15,
    specs: { ram: '32GB', processor: 'Core i9-13900H', storage: '1TB', screen: '15.6" OLED' }
  },
  {
    name: 'Asus ROG Zephyrus G14',
    image: 'https://images.unsplash.com/photo-1537498425277-c283d32ef9db?auto=format&fit=crop&q=80&w=800',
    description: 'Powerful 14-inch gaming laptop. Ryzen 9, RTX 4080, and Nebula HDR Display.',
    brand: 'ASUS', category: 'Laptops', price: 540000, countInStock: 8, rating: 4.8, numReviews: 25,
    specs: { ram: '16GB', processor: 'Ryzen 9 7940HS', storage: '1TB', screen: '14" 165Hz' }
  },
  {
    name: 'HP Spectre x360 16"',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800',
    description: 'Ultimate 2-in-1 experience. 4K OLED, Intel Core Ultra 7, and premium versatile design.',
    brand: 'HP', category: 'Laptops', price: 475000, countInStock: 10, rating: 4.6, numReviews: 12,
    specs: { ram: '32GB', processor: 'Core Ultra 7', storage: '1TB', screen: '16" 4K OLED' }
  },
  {
    name: 'Lenovo ThinkPad X1 Carbon Gen 12',
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800',
    description: 'The gold standard in business laptops. Ultra-light carbon fiber, superb keyboard, and high security.',
    brand: 'Lenovo', category: 'Laptops', price: 510000, countInStock: 12, rating: 4.7, numReviews: 20,
    specs: { ram: '32GB', processor: 'Core Ultra 7', storage: '1TB', screen: '14" OLED' }
  },
  // ── 5 New Monitors ──
  {
    name: 'Samsung Odyssey Neo G9',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
    description: '49-inch curved gaming monitor with Quantum Mini-LED, 240Hz, and 1ms response time.',
    brand: 'Samsung', category: 'Monitors', price: 450000, countInStock: 5, rating: 4.8, numReviews: 30,
    specs: { screen: '49" Ultra-Wide', processor: '240Hz Refesh' }
  },
  {
    name: 'LG UltraGear 27" 4K OLED',
    image: 'https://images.unsplash.com/photo-1547119957-637f8679db1e?auto=format&fit=crop&q=80&w=800',
    description: 'World-class gaming immersion. 4K resolution, 240Hz refresh, and near-instant response time.',
    brand: 'LG', category: 'Monitors', price: 295000, countInStock: 10, rating: 4.9, numReviews: 18,
    specs: { screen: '27" 4K OLED', processor: '240Hz' }
  },
  {
    name: 'Dell UltraSharp 32 4K USB-C Hub',
    image: 'https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?auto=format&fit=crop&q=80&w=800',
    description: 'The ultimate professional productivity monitor with IPS Black technology and high color accuracy.',
    brand: 'Dell', category: 'Monitors', price: 245000, countInStock: 15, rating: 4.7, numReviews: 22,
    specs: { screen: '31.5" 4K IPS Black', processor: '60Hz' }
  },
  {
    name: 'Asus ProArt PA32UCG-K',
    image: 'https://images.unsplash.com/photo-1551645120-d70bfe84c826?auto=format&fit=crop&q=80&w=800',
    description: 'Professional HDR monitor for video creators. Mini-LED, 1600 nits peak, 120Hz, and Dolby Vision.',
    brand: 'ASUS', category: 'Monitors', price: 820000, countInStock: 3, rating: 4.9, numReviews: 5,
    specs: { screen: '32" 4K Mini-LED', processor: '120Hz' }
  },
  {
    name: 'Xiaomi Mi Curved Gaming Monitor 34"',
    image: 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?auto=format&fit=crop&q=80&w=800',
    description: 'High-performance ultra-wide curved screen with 144Hz refresh rate and WQHD resolution.',
    brand: 'Xiaomi', category: 'Monitors', price: 125000, countInStock: 20, rating: 4.5, numReviews: 40,
    specs: { screen: '34" WQHD Curved', processor: '144Hz' }
  },
  // ── 5 New Earbuds (Audio) ──
  {
    name: 'Sony WF-1000XM5',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800',
    description: 'The best noise cancelling earbuds. Industry-leading ANC and breathtaking sound quality.',
    brand: 'Sony', category: 'Audio', price: 65000, countInStock: 25, rating: 4.8, numReviews: 80,
    specs: { battery: '24 Hours', color: 'Black' }
  },
  {
    name: 'Apple AirPods Pro (2nd Gen)',
    image: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&q=80&w=800',
    description: 'Magic like you’ve never heard. Active Noise Cancellation, Transparency mode, and Spatial Audio.',
    brand: 'Apple', category: 'Audio', price: 58000, countInStock: 30, rating: 4.9, numReviews: 120,
    specs: { battery: '30 Hours', color: 'White' }
  },
  {
    name: 'Bose QuietComfort Ultra Earbuds',
    image: 'https://images.unsplash.com/photo-1546435770-a3e4265da3ec?auto=format&fit=crop&q=80&w=800',
    description: 'Breakthrough spatial audio for more immersive listening. World-class quiet.',
    brand: 'Bose', category: 'Audio', price: 72000, countInStock: 15, rating: 4.7, numReviews: 45,
    specs: { battery: '24 Hours', color: 'Midnight' }
  },
  {
    name: 'Sennheiser Momentum True Wireless 4',
    image: 'https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&q=80&w=800',
    description: 'Discover the future of high-fidelity audio with Auracast support and lossless sound.',
    brand: 'Sennheiser', category: 'Audio', price: 78000, countInStock: 10, rating: 4.6, numReviews: 14,
    specs: { battery: '30 Hours', color: 'Graphite' }
  },
  {
    name: 'Samsung Galaxy Buds3 Pro',
    image: 'https://images.unsplash.com/photo-1600250395178-40fe752e5189?auto=format&fit=crop&q=80&w=800',
    description: 'The ultimate audio experience. AI-powered sound customization and immersive 360 audio.',
    brand: 'Samsung', category: 'Audio', price: 48000, countInStock: 40, rating: 4.5, numReviews: 60,
    specs: { battery: '26 Hours', color: 'Silver' }
  },
];

export default products;
