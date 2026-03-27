import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useUserStore from '../../store/userStore';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const userInfo = useUserStore((state) => state.userInfo);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=1000');
        const data = await res.json();
        setProducts(data.products || data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProducts();
  }, [userInfo, navigate]);

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });
        if (!res.ok) throw new Error('Delete failed');
        setProducts(products.filter((product) => product._id !== id));
      } catch (error) {
        console.error(error);
        alert('Could not delete product. You may not be authorized.');
      }
    }
  };

  const updateStockHandler = async (id, newStock, product) => {
    if (newStock === product.countInStock) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ countInStock: newStock }),
      });
      if (res.ok) {
        setProducts(products.map(p => p._id === id ? { ...p, countInStock: newStock } : p));
      } else {
        alert('Failed to update stock');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createHandler = () => {
    navigate('/admin/products/create');
  };

  if (loading) return <div className="loader"></div>;

  const filteredProducts = products.filter((p) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.brand.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Product Inventory Master</h2>
        <div className="mobile-stack-sm mobile-full-width" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search products..." 
            className="form-control mobile-full-width" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '220px' }}
          />
          <button className="btn btn-primary mobile-full-width" onClick={createHandler} style={{ whiteSpace: 'nowrap' }}>
             + Create Product
          </button>
        </div>
      </div>
      <div className="admin-table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <th className="mobile-hide" style={{ padding: '1rem' }}>ID</th>
              <th style={{ padding: '1rem' }}>NAME</th>
              <th style={{ padding: '1rem' }}>PRICE</th>
              <th style={{ padding: '1rem' }}>CATEGORY</th>
              <th style={{ padding: '1rem' }}>BRAND</th>
              <th style={{ padding: '1rem' }}>STOCK</th>
              <th style={{ padding: '1rem' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="mobile-hide" style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>{product._id.substring(0, 8)}...</td>
                <td style={{ padding: '1rem' }}>{product.name}</td>
                <td style={{ padding: '1rem' }}>PKR {product.price.toLocaleString()}</td>
                <td style={{ padding: '1rem' }}>{product.category}</td>
                <td style={{ padding: '1rem' }}>{product.brand}</td>
                <td style={{ padding: '1rem' }}>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ width: '80px', padding: '0.25rem 0.5rem', borderColor: product.countInStock === 0 ? '#ef4444' : 'var(--color-border)' }} 
                    defaultValue={product.countInStock}
                    min="0"
                    onBlur={(e) => updateStockHandler(product._id, Number(e.target.value), product)}
                  />
                </td>
                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <Link 
                    to={`/admin/products/${product._id}/edit`} 
                    className="btn btn-outline"
                    style={{ padding: '0.25rem 0.5rem', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                  >
                    Edit
                  </Link>
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '0.25rem 0.5rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                    onClick={() => deleteHandler(product._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;
