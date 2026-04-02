import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { ShieldCheck, Truck, RefreshCw, Headphones, Filter, X, ChevronDown, ChevronUp, Search } from 'lucide-react';

const CATEGORIES = ['All', 'Laptops', 'Smartphones', 'Audio', 'Wearables', 'Accessories'];
const BRANDS = ['Apple', 'Samsung', 'Dell', 'HP', 'Sony', 'Asus', 'Microsoft'];
const RAM_OPTIONS = ['4GB', '8GB', '16GB', '32GB', '64GB'];
const PROCESSORS = ['Intel i5', 'Intel i7', 'Intel i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Apple M1', 'Apple M2', 'Apple M3'];
const PRODUCT_REFRESH_MS = 60_000; // refresh product list every 60 s

const Home = () => {
  const [products, setProducts] = useState([]);
  const [pageStats, setPageStats] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Scroll Lock when filter is open
  useEffect(() => {
    if (isFilterOpen) {
      document.body.classList.add('filter-open');
    } else {
      document.body.classList.remove('filter-open');
    }
  }, [isFilterOpen]);
  const timerRef = useRef(null);

  const activeCategory = searchParams.get('category') || 'All';
  const keyword = searchParams.get('search') || '';
  const currentPage = Number(searchParams.get('page')) || 1;
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const brandParam = searchParams.get('brand') || '';
  const ramParam = searchParams.get('ram') || '';
  const processorParam = searchParams.get('processor') || '';

  const selectedBrands = useMemo(() => brandParam ? brandParam.split(',') : [], [brandParam]);
  const selectedRam = useMemo(() => ramParam ? ramParam.split(',') : [], [ramParam]);
  const selectedProcessors = useMemo(() => processorParam ? processorParam.split(',') : [], [processorParam]);

  // ✅ Fixed: was referencing undefined `setCategory`
  const updateParams = useCallback((updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        if (v.length > 0) newParams.set(k, v.join(','));
        else newParams.delete(k);
      } else if (v) {
        newParams.set(k, v);
      } else {
        newParams.delete(k);
      }
    });

    // Reset to page 1 when changing filters
    const filterKeys = ['category', 'search', 'brand', 'ram', 'processor', 'minPrice', 'maxPrice'];
    if (Object.keys(updates).some(k => filterKeys.includes(k))) {
      newParams.delete('page');
    }

    setSearchParams(newParams);
    setIsFilterOpen(false); // Close drawer on mobile after filter
    if (Object.keys(updates).some(k => filterKeys.includes(k))) {
      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [searchParams, setSearchParams]);

  const fetchProducts = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      let url = `/api/products?page=${currentPage}&limit=12`;
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
      if (activeCategory && activeCategory !== 'All') url += `&category=${encodeURIComponent(activeCategory)}`;
      if (selectedBrands.length > 0) url += `&brand=${encodeURIComponent(selectedBrands.join(','))}`;
      if (selectedRam.length > 0) url += `&ram=${encodeURIComponent(selectedRam.join(','))}`;
      if (selectedProcessors.length > 0) url += `&processor=${encodeURIComponent(selectedProcessors.join(','))}`;
      if (minPrice) url += `&minPrice=${minPrice}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProducts(data.products || []);
      setPageStats({ page: data.page, pages: data.pages, total: data.total });
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [keyword, currentPage, activeCategory, brandParam, ramParam, processorParam, minPrice, maxPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ✅ Fix #5: auto-refresh product list to show new stock/products
  useEffect(() => {
    timerRef.current = setInterval(() => fetchProducts(true), PRODUCT_REFRESH_MS);
    return () => clearInterval(timerRef.current);
  }, [fetchProducts]);

  const features = [
    { icon: <Truck size={24} />, title: 'Free Shipping', desc: 'On all orders above PKR 100,000' },
    { icon: <ShieldCheck size={24} />, title: 'Secure Payment', desc: '100% secure transaction' },
    { icon: <RefreshCw size={24} />, title: 'Easy Returns', desc: '30-day return policy' },
    { icon: <Headphones size={24} />, title: 'Expert Support', desc: 'Dedicated 24/7 support' },
  ];

  return (
    <>
      {/* ── Hero ── */}
      {!keyword && (
        <section className="mobile-hero-padding" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)', padding: '5rem 0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-100px', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: '-80px', left: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div className="container fade-in">
            <div className="grid grid-cols-2 mobile-hero-content" style={{ gap: '3rem', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', color: 'var(--color-primary)', borderRadius: '20px', padding: '0.25rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                  ⚡ New 2026 Collection Just Dropped
                </div>
                <h1 style={{ color: '#fff', fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
                  The Future of <br /><span style={{ color: 'var(--color-primary)' }}>Tech</span>, Today.
                </h1>
                <p className="mobile-hero-text" style={{ color: '#94A3B8', fontSize: '1.0625rem', lineHeight: 1.75, maxWidth: '460px', marginBottom: '2.5rem' }}>
                  Discover Pakistan's most premium collection of cutting-edge gadgets — laptops, smartphones, wearables, and more.
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'inherit' }}>
                  <a href="#products"><button className="btn btn-primary btn-lg">Shop Now</button></a>
                  <Link to="/profile"><button className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>My Orders</button></Link>
                </div>

                {/* ── Android App Download ── */}
                <a
                  href="https://github.com/Ahtisham992/GadgetPro/releases/download/v1.0.0/app-release.apk"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                    marginTop: '1.25rem',
                    background: 'rgba(61,220,132,0.08)',
                    border: '1px solid rgba(61,220,132,0.25)',
                    borderRadius: '14px',
                    padding: '0.7rem 1.25rem',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    width: 'fit-content',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(61,220,132,0.16)'; e.currentTarget.style.borderColor = 'rgba(61,220,132,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(61,220,132,0.08)'; e.currentTarget.style.borderColor = 'rgba(61,220,132,0.25)'; }}
                >
                  {/* Android logo SVG */}
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.523 15.341C17.523 15.7812 17.166 16.1382 16.7258 16.1382C16.2856 16.1382 15.9286 15.7812 15.9286 15.341V10.2236C15.9286 9.78338 16.2856 9.42638 16.7258 9.42638C17.166 9.42638 17.523 9.78338 17.523 10.2236V15.341Z" fill="#3DDC84"/>
                    <path d="M8.07143 15.341C8.07143 15.7812 7.71443 16.1382 7.27422 16.1382C6.83401 16.1382 6.47701 15.7812 6.47701 15.341V10.2236C6.47701 9.78338 6.83401 9.42638 7.27422 9.42638C7.71443 9.42638 8.07143 9.78338 8.07143 10.2236V15.341Z" fill="#3DDC84"/>
                    <path d="M9.6665 19.5371C9.6665 19.9773 9.3095 20.3343 8.86929 20.3343C8.42908 20.3343 8.07208 19.9773 8.07208 19.5371V14.4197C8.07208 13.9795 8.42908 13.6225 8.86929 13.6225C9.3095 13.6225 9.6665 13.9795 9.6665 14.4197V19.5371Z" fill="#3DDC84"/>
                    <path d="M15.9286 19.5371C15.9286 19.9773 15.5716 20.3343 15.1314 20.3343C14.6912 20.3343 14.3342 19.9773 14.3342 19.5371V14.4197C14.3342 13.9795 14.6912 13.6225 15.1314 13.6225C15.5716 13.6225 15.9286 13.9795 15.9286 14.4197V15.341V19.5371Z" fill="#3DDC84"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M8.46429 9.42638H15.5357C16.3963 9.42638 17.0952 10.1252 17.0952 10.9858V16.1033C17.0952 16.9639 16.3963 17.6628 15.5357 17.6628H8.46429C7.60367 17.6628 6.90476 16.9639 6.90476 16.1033V10.9858C6.90476 10.1252 7.60367 9.42638 8.46429 9.42638Z" fill="#3DDC84"/>
                    <path d="M14.8095 9.42638H9.19048L8.12207 5.66748L9.66667 4.95238L11.0127 7.79258L12.9873 7.79258L14.3333 4.95238L15.8779 5.66748L14.8095 9.42638Z" fill="#3DDC84"/>
                    <circle cx="9.19048" cy="5.09524" r="0.761905" fill="#3DDC84"/>
                    <circle cx="14.8095" cy="5.09524" r="0.761905" fill="#3DDC84"/>
                  </svg>
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: '#3DDC84', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', lineHeight: 1 }}>Get it on</div>
                    <div style={{ fontSize: '0.9375rem', color: '#fff', fontWeight: 700, lineHeight: 1.3, marginTop: '0.15rem' }}>Android APK</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3DDC84" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '0.25rem', opacity: 0.7 }}>
                    <path d="M12 2v14M5 9l7 7 7-7"/>
                    <line x1="5" y1="22" x2="19" y2="22"/>
                  </svg>
                </a>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {products.filter(p => p.image).slice(0, 1).map(p => (
                  <Link key={p._id} to={`/product/${p._id}`} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                  >
                    <img src={p.image} alt={p.name} style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', padding: '0.5rem' }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '0.25rem' }}>{p.brand}</div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '0.375rem' }}>{p.name}</div>
                      <div style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '1.0625rem' }}>PKR {p.price?.toLocaleString()}</div>
                    </div>
                  </Link>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { val: '10K+', label: 'Happy Customers' },
                    { val: '500+', label: 'Premium Products' },
                    { val: '99%', label: 'Satisfaction Rate' },
                    { val: '24/7', label: 'Customer Support' },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                      <div style={{ color: 'var(--color-primary)', fontSize: '1.375rem', fontWeight: 800 }}>{s.val}</div>
                      <div style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 500, marginTop: '0.2rem' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Products Section ── */}
      <section id="products" style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="section-head" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">Explore Our Premium Tech</h2>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Precision-engineered gadgets for the modern world</p>
          </div>

          {/* Mobile Filter Toggle */}
          <button className="filter-mobile-toggle" onClick={() => setIsFilterOpen(true)}>
            <Filter size={20} />
            <span>Filters & Specifications</span>
            {(selectedBrands.length > 0 || selectedRam.length > 0 || selectedProcessors.length > 0 || maxPrice || activeCategory !== 'All') && (
              <span style={{ marginLeft: 'auto', background: 'var(--color-primary)', color: '#fff', fontSize: '0.7rem', padding: '0.1rem 0.5rem', borderRadius: '10px' }}>Active</span>
            )}
          </button>

          {/* Backdrop */}
          <div className={`filter-backdrop ${isFilterOpen ? 'active' : ''}`} onClick={() => setIsFilterOpen(false)} />

          <div id="products-section" className="home-layout-grid" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2.5rem', alignItems: 'start' }}>
            {/* ── Sidebar Filters ── */}
            <aside className={`filter-sidebar ${isFilterOpen ? 'active' : ''}`}>
              <button className="filter-close-btn" onClick={() => setIsFilterOpen(false)}>
                <X size={20} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                <Filter size={18} color="var(--color-primary)" />
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Advanced Filters</span>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <div className="filter-title">Price Range</div>
                <div className="price-slider-container">
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={maxPrice || 1000000}
                    onChange={(e) => updateParams({ maxPrice: e.target.value })}
                    className="range-slider"
                  />
                  <div className="range-values">
                    <span>PKR 0</span>
                    <span>PKR {Number(maxPrice || 1000000).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="filter-group">
                <div className="filter-title">Category</div>
                <div className="filter-list">
                  {CATEGORIES.map(cat => (
                    <label key={cat} className="filter-checkbox-item">
                      <input
                        type="checkbox"
                        checked={activeCategory === cat}
                        onChange={() => updateParams({ category: cat === 'All' ? '' : cat })}
                      />
                      <span style={{ color: activeCategory === cat ? 'var(--color-text)' : 'inherit', fontWeight: activeCategory === cat ? 600 : 400 }}>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="filter-group">
                <div className="filter-title">Brands</div>
                <div className="filter-list">
                  {BRANDS.map(b => (
                    <label key={b} className="filter-checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(b)}
                        onChange={() => {
                          const newBrands = selectedBrands.includes(b)
                            ? selectedBrands.filter(x => x !== b)
                            : [...selectedBrands, b];
                          updateParams({ brand: newBrands });
                        }}
                      />
                      <span>{b}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* RAM Specifications */}
              <div className="filter-group">
                <div className="filter-title">RAM Size</div>
                <div className="filter-list">
                  {RAM_OPTIONS.map(ram => (
                    <label key={ram} className="filter-checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedRam.includes(ram)}
                        onChange={() => {
                          const newRam = selectedRam.includes(ram)
                            ? selectedRam.filter(x => x !== ram)
                            : [...selectedRam, ram];
                          updateParams({ ram: newRam });
                        }}
                      />
                      <span>{ram}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Processor */}
              <div className="filter-group">
                <div className="filter-title">Processor</div>
                <div className="filter-list">
                  {PROCESSORS.map(proc => (
                    <label key={proc} className="filter-checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedProcessors.includes(proc)}
                        onChange={() => {
                          const newProc = selectedProcessors.includes(proc)
                            ? selectedProcessors.filter(x => x !== proc)
                            : [...selectedProcessors, proc];
                          updateParams({ processor: newProc });
                        }}
                      />
                      <span>{proc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {(selectedBrands.length > 0 || selectedRam.length > 0 || selectedProcessors.length > 0 || maxPrice || activeCategory !== 'All') && (
                <button
                  onClick={() => setSearchParams({})}
                  className="btn btn-ghost btn-sm btn-block"
                  style={{ marginTop: '1rem', border: '1px dashed var(--color-border)' }}
                >
                  <X size={14} style={{ marginRight: '0.5rem' }} /> Clear All Filters
                </button>
              )}
            </aside>

            {/* ── Product Feed ── */}
            <div className="product-feed">
              {loading ? (
                <div className="grid grid-cols-3 grid-cols-2-sm" style={{ gap: '1.5rem' }}>
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                      <div className="skeleton" style={{ height: '220px' }} />
                      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        <div className="skeleton" style={{ height: '12px', width: '40%' }} />
                        <div className="skeleton" style={{ height: '16px', width: '90%' }} />
                        <div className="skeleton" style={{ height: '20px', width: '50%', marginTop: '0.5rem' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-xl)', border: '2px dashed var(--color-border)' }}>
                  <div style={{ background: 'var(--color-surface)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                    <Filter size={32} color="var(--color-text-muted)" />
                  </div>
                  <h3 style={{ marginBottom: '0.5rem' }}>No Products Found</h3>
                  <p style={{ color: 'var(--color-text-muted)', maxWidth: '300px', margin: '0 auto' }}>
                    Try adjusting your filters or search keywords to find what you're looking for.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 grid-cols-2-sm" style={{ gap: '1.5rem' }}>
                    {products.map(p => <ProductCard key={p._id} product={p} />)}
                  </div>

                  {pageStats.pages > 1 && (
                    <div className="pagination-wrap">
                      <button disabled={pageStats.page === 1} onClick={() => updateParams({ page: String(pageStats.page - 1) })} className="btn btn-outline btn-sm">Prev</button>
                      {[...Array(pageStats.pages).keys()].map(x => (
                        <button key={x + 1} onClick={() => updateParams({ page: String(x + 1) })} className="btn btn-sm"
                          style={{ background: pageStats.page === x + 1 ? 'var(--color-primary)' : 'var(--color-surface)', color: pageStats.page === x + 1 ? '#fff' : 'var(--color-text)', border: pageStats.page === x + 1 ? 'none' : '1px solid var(--color-border)' }}>
                          {x + 1}
                        </button>
                      ))}
                      <button disabled={pageStats.page === pageStats.pages} onClick={() => updateParams({ page: String(pageStats.page + 1) })} className="btn btn-outline btn-sm">Next</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section style={{ background: 'var(--color-text)', padding: '4rem 0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
          <h2 style={{ color: '#fff', marginBottom: '0.75rem' }}>Stay in the Loop</h2>
          <p style={{ color: '#94A3B8', marginBottom: '2rem' }}>Get exclusive deals, early access to new products, and tech news delivered to your inbox.</p>
          <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '440px', margin: '0 auto' }}>
            <input type="email" placeholder="Enter your email address" className="form-control"
              style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }} />
            <button className="btn btn-primary" style={{ flexShrink: 0 }}>Subscribe</button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;