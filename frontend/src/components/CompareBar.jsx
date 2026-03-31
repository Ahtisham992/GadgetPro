import { Link } from 'react-router-dom';
import { X, ArrowRight, Columns } from 'lucide-react';
import useCompareStore from '../store/compareStore';

const CompareBar = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompareStore();

  if (compareItems.length === 0) return null;

  return (
    <div className="compare-bar shadow-lg border-t">
      <div className="container flex items-center justify-between py-3">
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-1 no-scrollbar">
          <div className="hidden sm:flex items-center gap-2 mr-2 text-sm font-semibold text-gray-700">
            <Columns size={18} className="text-primary" />
            <span className="hidden md:inline">Compare ({compareItems.length}/4)</span>
          </div>
          
          {compareItems.map((product) => (
            <div key={product._id} className="compare-item-thumb group">
              <img src={product.image} alt={product.name} />
              <button 
                onClick={() => removeFromCompare(product._id)}
                className="compare-item-remove"
                title="Remove"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 ml-4">
          <button 
            onClick={clearCompare}
            className="text-xs font-semibold text-gray-500 hover:text-red-500 transition-colors hidden sm:block"
          >
            Clear All
          </button>
          
          <Link 
            to="/compare" 
            className="btn btn-primary btn-sm flex items-center gap-2 whitespace-nowrap"
            style={{ borderRadius: '8px', padding: '0.625rem 1.25rem' }}
          >
            Compare Now <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CompareBar;
