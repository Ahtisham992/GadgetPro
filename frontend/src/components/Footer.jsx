import { Link } from 'react-router-dom';
import { Package, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ background: 'var(--color-text)', color: '#E5E7EB', marginTop: 'auto' }}>
      <div className="container" style={{ padding: '4rem 1.5rem 2rem' }}>
        <div className="grid grid-cols-4" style={{ gap: '3rem', marginBottom: '3rem' }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={18} color="#fff" />
              </div>
              <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>GadgetPro</span>
            </div>
            <p style={{ color: '#9CA3AF', lineHeight: 1.7, fontSize: '0.875rem' }}>
              Pakistan's premium destination for cutting-edge tech gadgets and electronics. Authentic products, fast delivery.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{ color: '#fff', marginBottom: '1.25rem', fontSize: '0.9375rem', fontWeight: 700 }}>Shop</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['Laptops', 'Smartphones', 'Audio', 'Wearables', 'Accessories'].map(item => (
                <li key={item}>
                  <Link to={`/?category=${item}`} style={{ color: '#9CA3AF', fontSize: '0.875rem', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.target.style.color = 'var(--color-primary)'}
                    onMouseLeave={e => e.target.style.color = '#9CA3AF'}
                  >{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 style={{ color: '#fff', marginBottom: '1.25rem', fontSize: '0.9375rem', fontWeight: 700 }}>Help</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['My Orders', 'Track Package', 'Return Policy', 'Warranty', 'FAQs'].map(item => (
                <li key={item}>
                  <Link to="/profile" style={{ color: '#9CA3AF', fontSize: '0.875rem', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.target.style.color = 'var(--color-primary)'}
                    onMouseLeave={e => e.target.style.color = '#9CA3AF'}
                  >{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#fff', marginBottom: '1.25rem', fontSize: '0.9375rem', fontWeight: 700 }}>Contact</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>
                <MapPin size={14} style={{ marginTop: '3px', flexShrink: 0, color: 'var(--color-primary)' }} />
                Plot 47, Technology Park, Karachi, Pakistan
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>
                <Phone size={14} style={{ flexShrink: 0, color: 'var(--color-primary)' }} />
                +92 321 000 0000
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9CA3AF', fontSize: '0.875rem' }}>
                <Mail size={14} style={{ flexShrink: 0, color: 'var(--color-primary)' }} />
                hello@gadgetpro.pk
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid #374151', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: '#6B7280', fontSize: '0.8125rem', margin: 0 }}>
            © {new Date().getFullYear()} GadgetPro. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
              <span key={item} style={{ color: '#6B7280', fontSize: '0.8125rem', cursor: 'pointer' }}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
