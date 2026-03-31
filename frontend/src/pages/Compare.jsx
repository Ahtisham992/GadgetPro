import { Link } from 'react-router-dom';
import { X, ShoppingCart, ArrowLeft, Info } from 'lucide-react';
import useCompareStore from '../store/compareStore';
import useCartStore from '../store/cartStore';
import { useToast } from '../context/ToastContext';

const Compare = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompareStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const toast = useToast();

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast(`${product.name} added to cart`, 'success');
  };

  if (compareItems.length === 0) {
    return (
      <div className="container py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info size={40} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">No products to compare</h2>
          <p className="text-gray-600 mb-8">Add components or gadgets from the store to see them side-by-side.</p>
          <Link to="/" className="btn btn-primary">Go to Store</Link>
        </div>
      </div>
    );
  }

  const specsRows = [
    { label: 'Price', key: 'price', format: (v) => `PKR ${v?.toLocaleString()}` },
    { label: 'Brand', key: 'brand' },
    { label: 'Category', key: 'category' },
    { label: 'Processor', specKey: 'processor' },
    { label: 'RAM', specKey: 'ram' },
    { label: 'Storage', specKey: 'storage' },
  ];

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/" className="btn btn-ghost btn-sm">
            <ArrowLeft size={18} /> Back
          </Link>
          <h1 className="text-3xl font-bold">Compare Products</h1>
        </div>
        <button onClick={clearCompare} className="text-sm font-semibold text-red-500 hover:underline">
          Clear All
        </button>
      </div>

      <div className="compare-matrix-wrapper shadow-xl rounded-2xl border bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="compare-matrix">
            <thead>
              <tr>
                <th className="spec-label-col">Product</th>
                {compareItems.map((product) => (
                  <th key={product._id} className="product-col">
                    <div className="relative pt-4 px-2">
                      <button 
                        onClick={() => removeFromCompare(product._id)}
                        className="absolute top-0 right-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={18} />
                      </button>
                      <Link to={`/product/${product._id}`}>
                        <img src={product.image} alt={product.name} className="w-32 h-32 object-contain mx-auto mb-4" />
                        <div className="text-sm font-bold text-gray-900 line-clamp-2 min-h-[40px] px-2">
                          {product.name}
                        </div>
                      </Link>
                    </div>
                  </th>
                ))}
                {/* Filler slots if less than 4 */}
                {[...Array(Math.max(0, 4 - compareItems.length))].map((_, i) => (
                  <th key={`empty-${i}`} className="product-col empty">
                    <div className="flex flex-col items-center justify-center h-full text-gray-300 py-10">
                      <Info size={32} strokeWidth={1} />
                      <span className="text-xs mt-2 italic">Slot Available</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specsRows.map((row) => (
                <tr key={row.label}>
                  <td className="spec-label">{row.label}</td>
                  {compareItems.map((product) => {
                    const value = row.specKey ? product.specs?.[row.specKey] : product[row.key];
                    return (
                      <td key={`${product._id}-${row.label}`} className="spec-value">
                        {row.format ? row.format(value) : (value || '-')}
                      </td>
                    );
                  })}
                  {[...Array(Math.max(0, 4 - compareItems.length))].map((_, i) => (
                    <td key={`empty-td-${i}`} className="spec-value empty"></td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="spec-label">Action</td>
                {compareItems.map((product) => (
                  <td key={`action-${product._id}`} className="spec-value align-middle">
                    <button 
                      onClick={() => handleAddToCart(product)}
                      disabled={product.countInStock === 0}
                      className="btn btn-primary btn-sm w-full py-2 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={14} /> Buy
                    </button>
                  </td>
                ))}
                {[...Array(Math.max(0, 4 - compareItems.length))].map((_, i) => (
                  <td key={`empty-action-${i}`} className="spec-value empty"></td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Compare;
