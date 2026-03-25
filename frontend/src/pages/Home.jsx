import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';

const CATEGORIES = ['All', 'Laptops', 'Smartphones', 'Audio', 'Wearables', 'Accessories'];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [pageStats, setPageStats] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeCategory = searchParams.get('category') || 'All';
  const keyword = searchParams.get('search') || '';
  const currentPage = Number(searchParams.get('page')) || 1;

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => v ? newParams.set(k, v) : newParams.delete(k));
    setSearchParams(newParams);
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `/api/products?page=${currentPage}&limit=12`;
        if (keyword) url += `&keyword=${keyword}`;
        
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        setProducts(data.products || []);
        setPageStats({ page: data.page, pages: data.pages, total: data.total });
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, currentPage]);

  const filtered = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  const features = [
    { icon: <Truck size={24} />, title: 'Free Shipping', desc: 'On all orders above PKR 100,000' },
    { icon: <ShieldCheck size={24} />, title: 'Secure Payment', desc: '100% secure transaction' },
    { icon: <RefreshCw size={24} />, title: 'Easy Returns', desc: '30-day return policy' },
    { icon: <Headphones size={24} />, title: 'Expert Support', desc: 'Dedicated 24/7 support' },
  ];

  return (
    <>
      {/* ──── Hero ──── */}
      {!keyword && (
      <section style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F172A 100%)',
        padding: '5rem 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '-100px', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div className="container fade-in">
          <div className="grid grid-cols-2" style={{ gap: '4rem', alignItems: 'center' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)',
                color: 'var(--color-primary)', borderRadius: '20px',
                padding: '0.25rem 0.875rem', fontSize: '0.8125rem', fontWeight: 600,
                marginBottom: '1.5rem',
              }}>
                ⚡ New 2026 Collection Just Dropped
              </div>
              <h1 style={{ color: '#fff', fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
                The Future of <br />
                <span style={{ color: 'var(--color-primary)' }}>Tech</span>, Today.
              </h1>
              <p style={{ color: '#94A3B8', fontSize: '1.0625rem', lineHeight: 1.75, maxWidth: '460px', marginBottom: '2.5rem' }}>
                Discover Pakistan's most premium collection of cutting-edge gadgets — laptops, smartphones, wearables, and more.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a href="#products">
                  <button className="btn btn-primary btn-lg">Shop Now</button>
                </a>
                <Link to="/profile">
                  <button className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}>
                    My Orders
                  </button>
                </Link>
              </div>
            </div>

            {/* Hero Image / Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {products.filter(p=>p.image).slice(0, 1).map(p => (
                <Link key={p._id} to={`/product/${p._id}`} style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '20px',
                  padding: '2rem',
                  display: 'flex', alignItems: 'center', gap: '1.5rem',
                  transition: 'border-color 0.2s',
                }}
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

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { val: '10K+', label: 'Happy Customers' },
                  { val: '500+', label: 'Premium Products' },
                  { val: '99%', label: 'Satisfaction Rate' },
                  { val: '24/7', label: 'Customer Support' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '1rem',
                    textAlign: 'center',
                  }}>
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

      {/* ──── Features Bar ──── */}
      <section style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="grid grid-cols-4" style={{ gap: 0 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                padding: '1.25rem 0',
                borderRight: i < features.length - 1 ? '1px solid var(--color-border)' : 'none',
                paddingRight: i < features.length - 1 ? '1.5rem' : '0',
                paddingLeft: i > 0 ? '1.5rem' : '0',
              }}>
                <div style={{ color: 'var(--color-primary)', flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: '0.125rem' }}>{f.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Products ──── */}
      <section id="products" style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Our Products</h2>
          </div>

          {/* Category Filter Chips */}
          <div id="products-section" style={{ display: 'flex', gap: '0.625rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '20px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  border: '1.5px solid',
                  fontFamily: 'inherit',
                  borderColor: activeCategory === cat ? 'var(--color-primary)' : 'var(--color-border)',
                  background: activeCategory === cat ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: activeCategory === cat ? '#fff' : 'var(--color-text-muted)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <div className="skeleton" style={{ height: '220px' }} />
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    <div className="skeleton" style={{ height: '12px', width: '40%' }} />
                    <div className="skeleton" style={{ height: '16px', width: '90%' }} />
                    <div className="skeleton" style={{ height: '16px', width: '70%' }} />
                    <div className="skeleton" style={{ height: '20px', width: '50%', marginTop: '0.5rem' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
              No products found {keyword ? `matching "${keyword}"` : 'in this category'}.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4">
                {filtered.map(p => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              
              {/* Pagination Controls */}
              {pageStats.pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                  <button 
                    disabled={pageStats.page === 1}
                    onClick={() => updateParams({ page: pageStats.page - 1 })}
                    className="btn btn-outline btn-sm"
                  >
                    Prev
                  </button>
                  {[...Array(pageStats.pages).keys()].map(x => (
                    <button
                      key={x + 1}
                      onClick={() => updateParams({ page: x + 1 })}
                      className="btn btn-sm"
                      style={{
                        background: pageStats.page === x + 1 ? 'var(--color-primary)' : 'var(--color-bg-alt)',
                        color: pageStats.page === x + 1 ? '#fff' : 'var(--color-text)',
                        border: 'none',
                      }}
                    >
                      {x + 1}
                    </button>
                  ))}
                  <button 
                    disabled={pageStats.page === pageStats.pages}
                    onClick={() => updateParams({ page: pageStats.page + 1 })}
                    className="btn btn-outline btn-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ──── Newsletter ──── */}
      <section style={{ background: 'var(--color-text)', padding: '4rem 0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
          <h2 style={{ color: '#fff', marginBottom: '0.75rem' }}>Stay in the Loop</h2>
          <p style={{ color: '#94A3B8', marginBottom: '2rem' }}>Get exclusive deals, early access to new products, and tech news delivered to your inbox.</p>
          <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '440px', margin: '0 auto' }}>
            <input
              type="email"
              placeholder="Enter your email address"
              className="form-control"
              style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
            />
            <button className="btn btn-primary" style={{ flexShrink: 0 }}>Subscribe</button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
