import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Globe, ChevronRight, RefreshCw, MessageCircle, TrendingUp, Menu, X } from 'lucide-react';
import useUserStore from '../store/userStore';

const AdminLayout = () => {
  const { userInfo, logout } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!userInfo || !userInfo.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, exact: true },
    { to: '/admin/products', label: 'Inventory', icon: <Package size={18} /> },
    { to: '/admin/orders', label: 'Orders', icon: <ShoppingCart size={18} /> },
    { to: '/admin/coupons', label: 'Coupons', icon: <Globe size={18} /> },
    { to: '/admin/returns', label: 'Returns', icon: <RefreshCw size={18} /> },
    { to: '/admin/reviews', label: 'Reviews', icon: <MessageCircle size={18} /> },
    { to: '/admin/trending', label: 'Trending', icon: <TrendingUp size={18} /> },
  ];

  const isActive = (item) => item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={16} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>GadgetPro</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', fontWeight: 500 }}>Admin Portal</div>
        </div>
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="admin-mobile-topbar"
          style={{ background: 'var(--color-bg-alt)', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'none', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={18} />
        </button>
      </div>

      <nav style={{ flex: 1, padding: '1rem' }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.75rem', marginBottom: '0.5rem' }}>Main Menu</div>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map(item => {
            const active = isActive(item);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: 600, fontSize: '0.9rem',
                    color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    background: active ? 'var(--color-primary-light)' : 'transparent',
                    transition: 'all 0.15s',
                    border: active ? '1px solid rgba(249,115,22,0.2)' : '1px solid transparent',
                  }}
                  onMouseEnter={e => !active && (e.currentTarget.style.background = 'var(--color-bg-alt)')}
                  onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
                >
                  {item.icon}
                  {item.label}
                  {active && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)', padding: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userInfo.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userInfo.email}</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-muted)', padding: '0.5rem 0.625rem', borderRadius: '8px', border: '1px solid var(--color-border)', flex: 1, justifyContent: 'center', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
          >
            <Globe size={13} /> Store
          </Link>
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-danger)', padding: '0.5rem 0.625rem', borderRadius: '8px', border: '1px solid var(--color-border)', cursor: 'pointer', background: 'transparent', fontFamily: 'inherit', flex: 1, justifyContent: 'center', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-danger)'; e.currentTarget.style.background = 'var(--color-danger-bg)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="admin-wrapper">
      {/* Mobile Overlay */}
      <div className={`admin-sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`admin-sidebar-panel ${sidebarOpen ? 'mobile-open' : ''}`}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile Top Bar */}
        <div className="admin-mobile-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Menu size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={14} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--color-text)' }}>GadgetPro Admin</span>
            </div>
          </div>
          <Link to="/" style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>← Store</Link>
        </div>

        {/* Page Content */}
        <main className="admin-content-panel">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;