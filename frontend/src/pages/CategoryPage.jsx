import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { ChevronRight } from 'lucide-react';

const CategoryPage = () => {
  const { cat } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/products?limit=100');
        if (!res.ok) throw new Error();
        const data = await res.json();
        const activeProducts = data.products || [];
        setProducts(activeProducts.filter(p => p.category === cat));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [cat]);

  return (
    <div className="container fade-in" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        <Link to="/" style={{ color: 'var(--color-text-muted)', transition: 'color 0.15s' }}
          onMouseEnter={e => e.target.style.color = 'var(--color-primary)'}
          onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}
        >Home</Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{cat}</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{cat}</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
          {loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '320px', borderRadius: '16px' }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📭</div>
          <h3 style={{ marginBottom: '0.75rem' }}>No products in {cat}</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Check back soon or browse other categories.</p>
          <Link to="/"><button className="btn btn-primary">Browse All Products</button></Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
