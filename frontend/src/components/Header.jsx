import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, ChevronDown, Package, Search, Heart } from 'lucide-react';
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
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const submitSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) navigate(`/?search=${keyword}`);
    else navigate('/');
    setShowMobileSearch(false);
    setMobileOpen(false);
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
    setMobileOpen(false);
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

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 700, background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowMobileSearch(false)}>
          <div style={{ background: 'var(--color-surface)', padding: '1rem', boxShadow: 'var(--shadow-md)' }} onClick={e => e.stopPropagation()}>
            <form onSubmit={submitSearch} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                autoFocus
                style={{ flex: 1, padding: '0.625rem 1rem', borderRadius: '10px', border: '1.5px solid var(--color-primary)', background: 'var(--color-bg-alt)', fontSize: '0.9375rem', outline: 'none', fontFamily: 'inherit' }}
              />
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
              <button type="button" onClick={() => setShowMobileSearch(false)} style={{ background: 'var(--color-bg-alt)', border: 'none', borderRadius: '8px', padding: '0 0.75rem', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Nav Overlay */}
      <div className={`mobile-nav-overlay ${mobileOpen ? 'active' : ''}`} onClick={() => setMobileOpen(false)} />

      {/* Mobile Nav Drawer */}
      <div className={`mobile-nav-drawer ${mobileOpen ? 'open' : ''}`}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={15} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text)' }}>GadgetPro</span>
          </Link>
          <button onClick={() => setMobileOpen(false)} style={{ background: 'var(--color-bg-alt)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Mobile Search */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
          <form onSubmit={submitSearch} style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search products..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '20px', border: '1.5px solid var(--color-border)', background: 'var(--color-bg-alt)', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }}
            />
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          </form>
        </div>

        {/* Mobile Categories */}
        <div style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem' }}>Categories</div>
          {categories.map(cat => (
            <Link
              key={cat}
              to={`/category/${cat}`}
              onClick={() => setMobileOpen(false)}
              style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--color-border)', fontWeight: 500, color: 'var(--color-text)', fontSize: '0.9375rem' }}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Mobile User Section */}
        <div style={{ padding: '1rem 1.25rem', marginTop: 'auto', borderTop: '1px solid var(--color-border)' }}>
          {userInfo ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0.875rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, flexShrink: 0 }}>
                  {userInfo.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{userInfo.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{userInfo.email}</div>
                </div>
              </div>
              <Link to="/wishlist" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-lg)', color: 'var(--color-text)', fontWeight: 500, marginBottom: '0.5rem' }}>
                <Heart size={16} /> My Wishlist
              </Link>
              <Link to="/profile" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-lg)', color: 'var(--color-text)', fontWeight: 500, marginBottom: '0.5rem' }}>
                <User size={16} /> My Orders
              </Link>
              {userInfo.isAdmin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-lg)', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                  <Package size={16} /> Admin Portal
                </Link>
              )}
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-lg)', color: 'var(--color-danger)', fontWeight: 500, background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'inherit', fontSize: '0.9375rem' }}>
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-outline btn-block">Sign In</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary btn-block">Create Account</Link>
            </div>
          )}
        </div>
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
          <div className="flex items-center justify-between" style={{ height: '64px', gap: '1.25rem' }}>

            {/* Mobile: Hamburger */}
            <button
              className="header-mobile-btn"
              onClick={() => setMobileOpen(true)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.375rem', borderRadius: '8px', color: 'var(--color-text)', flexShrink: 0 }}
            >
              <Menu size={22} />
            </button>

            {/* Logo */}
            <Link to="/" style={{ flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={18} color="#fff" />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.03em' }}>
                  GadgetPro
                </span>
              </div>
            </Link>

            {/* Desktop Category Nav */}
            <nav className="header-desktop-nav items-center gap-6" style={{ flex: 1 }}>
              {categories.map(cat => (
                <Link
                  key={cat}
                  to={`/category/${cat}`}
                  style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)', transition: 'color 0.15s', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => e.target.style.color = 'var(--color-primary)'}
                  onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}
                >
                  {cat}
                </Link>
              ))}
            </nav>

            {/* Desktop Search Bar */}
            <form onSubmit={submitSearch} className="header-search-wrap header-desktop-nav" style={{ flex: 1, maxWidth: '380px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Search products..."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '20px', border: '1px solid var(--color-border)', background: 'var(--color-bg-alt)', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>

              {/* Mobile Search Icon */}
              <button
                onClick={() => setShowMobileSearch(true)}
                className="header-mobile-btn"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', color: 'var(--color-text)', display: 'flex', alignItems: 'center' }}
              >
                <Search size={20} />
              </button>

              <Link to="/wishlist" className="header-mobile-btn" style={{ display: 'flex', alignItems: 'center' }}>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', color: 'var(--color-text)' }}>
                  <Heart size={20} />
                </button>
              </Link>

              {/* Wishlist */}
              <Link to="/wishlist" className="header-desktop-nav" style={{ display: 'flex', alignItems: 'center' }}>
                <button className="btn btn-ghost btn-sm" style={{ padding: '0.5rem', borderRadius: '8px', color: 'var(--color-text)' }}>
                  <Heart size={20} />
                </button>
              </Link>

              {/* Cart */}
              <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <button className="btn btn-ghost btn-sm" style={{ padding: '0.5rem', borderRadius: '8px', position: 'relative' }}>
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--color-primary)', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.6875rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {cartCount}
                    </span>
                  )}
                </button>
              </Link>

              {/* Desktop User */}
              {userInfo ? (
                <div style={{ position: 'relative' }} className="header-desktop-nav">
                  <button
                    className="flex items-center gap-2"
                    onClick={() => setUserDropdown(!userDropdown)}
                    style={{ border: '1.5px solid var(--color-border)', borderRadius: '8px', padding: '0.375rem 0.75rem', background: 'transparent', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                  >
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700 }}>
                      {userInfo.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {userInfo.name.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: userDropdown ? 'rotate(180deg)' : 'none' }} />
                  </button>

                  {userDropdown && (
                    <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', minWidth: '200px', overflow: 'hidden', zIndex: 200 }}>
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
                <Link to="/login" className="header-desktop-nav">
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