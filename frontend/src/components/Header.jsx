import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, ChevronDown, Package, Search } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useUserStore from '../store/userStore';

const Header = () => {
  const { cartItems } = useCartStore();
  const { userInfo, logout } = useUserStore();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('search') || '');

  const submitSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) navigate(`/?search=${keyword}`);
    else navigate('/');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setUserDropdown(false);
    navigate('/login');
  };

  const categories = ['Laptops', 'Smartphones', 'Audio', 'Wearables', 'Accessories'];

  return (
    <>
      {/* Announcement bar */}
      <div style={{
        background: 'var(--color-text)',
        color: '#fff',
        textAlign: 'center',
        padding: '0.5rem 1rem',
        fontSize: '0.8125rem',
        fontWeight: 500,
        letterSpacing: '0.01em',
      }}>
        🚀 Free shipping on orders above PKR 100,000 &nbsp;|&nbsp; Secure checkout guaranteed
      </div>

      {/* Main Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        transition: 'box-shadow 0.2s',
        boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
      }}>
        <div className="container">
          <div className="flex items-center justify-between" style={{ height: '64px', gap: '2rem' }}>

            {/* Logo */}
            <Link to="/" style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Package size={18} color="#fff" />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em' }}>
                  GadgetPro
                </span>
              </div>
            </Link>

            {/* Category Nav — hidden on mobile */}
            <nav className="flex items-center gap-6" style={{ display: 'flex' }}>
              {categories.map(cat => (
                <Link
                  key={cat}
                  to={`/category/${cat}`}
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--color-text-muted)',
                    transition: 'color 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => e.target.style.color = 'var(--color-primary)'}
                  onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}
                >
                  {cat}
                </Link>
              ))}
            </nav>

            {/* Search Bar */}
            <form onSubmit={submitSearch} style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{
                  width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem',
                  borderRadius: '20px', border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-alt)', fontSize: '0.875rem',
                  outline: 'none', transition: 'border-color 0.2s',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>

              {/* Cart */}
              <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <button className="btn btn-ghost btn-sm" style={{ padding: '0.5rem', borderRadius: '8px', position: 'relative' }}>
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px', right: '-4px',
                      background: 'var(--color-primary)',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '18px', height: '18px',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {cartCount}
                    </span>
                  )}
                </button>
              </Link>

              {/* User */}
              {userInfo ? (
                <div style={{ position: 'relative' }}>
                  <button
                    className="flex items-center gap-2"
                    onClick={() => setUserDropdown(!userDropdown)}
                    style={{
                      border: '1.5px solid var(--color-border)',
                      borderRadius: '8px',
                      padding: '0.375rem 0.75rem',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                  >
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: 'var(--color-primary)',
                      color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6875rem', fontWeight: 700,
                    }}>
                      {userInfo.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {userInfo.name.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: userDropdown ? 'rotate(180deg)' : 'none' }} />
                  </button>

                  {userDropdown && (
                    <div style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xl)',
                      boxShadow: 'var(--shadow-xl)',
                      minWidth: '200px',
                      overflow: 'hidden',
                      zIndex: 200,
                    }}>
                      <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-alt)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{userInfo.name}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{userInfo.email}</div>
                      </div>
                      <div style={{ padding: '0.5rem' }}>
                        <Link to="/profile" onClick={() => setUserDropdown(false)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-lg)', color: 'var(--color-text)', fontSize: '0.9rem', fontWeight: 500, transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-alt)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <User size={16} /> My Orders
                        </Link>
                        {userInfo.isAdmin && (
                          <Link to="/admin" onClick={() => setUserDropdown(false)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-lg)', color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: 600, transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-light)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <Package size={16} /> Admin Portal
                          </Link>
                        )}
                        <div style={{ height: '1px', background: 'var(--color-border)', margin: '0.5rem 0' }} />
                        <button onClick={handleLogout}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius-lg)', color: 'var(--color-danger)', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', background: 'transparent', border: 'none', fontFamily: 'inherit', width: '100%', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-danger-bg)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login">
                  <button className="btn btn-primary btn-sm">Sign In</button>
                </Link>
              )}
            </div>
          </div>
        </div>
        {/* Backdrop for dropdown */}
        {userDropdown && (
          <div onClick={() => setUserDropdown(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
        )}
      </header>
    </>
  );
};

export default Header;
