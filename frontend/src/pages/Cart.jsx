import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useUserStore from '../store/userStore';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';

const Cart = () => {
  const { cartItems } = useCartStore();
  const navigate = useNavigate();

  const addToCart = useCartStore(s => s.addToCart);
  const removeFromCart = useCartStore(s => s.removeFromCart);

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100000 ? 0 : 1500;
  const taxPrice = Number((0.15 * itemsPrice).toFixed(0));
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🛒</div>
          <h2 style={{ marginBottom: '0.875rem' }}>Your cart is empty</h2>
          <p style={{ marginBottom: '2rem' }}>Looks like you haven't added anything yet.</p>
          <Link to="/">
            <button className="btn btn-primary btn-lg">
              <ShoppingBag size={18} /> Continue Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ padding: '2.5rem 1.5rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Shopping Cart <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>({cartItems.length} item{cartItems.length > 1 ? 's' : ''})</span></h2>

      <div className="sidebar-layout">
        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cartItems.map(item => (
            <div key={item.product} style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.25rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              boxShadow: 'var(--shadow-card)',
              flexWrap: 'wrap',
            }}>
              <style>{`
                @media (max-width: 640px) {
                  .cart-item-info { flex: 1 1 100% !important; order: 1; }
                  .cart-item-controls { flex: 1; border: none !important; background: var(--color-surface) !important; }
                  .cart-item-remove { order: 2; }
                }
              `}</style>
              <Link to={`/product/${item.product}`}>
                <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '12px', background: 'var(--color-bg-alt)', padding: '0.5rem', flexShrink: 0 }} />
              </Link>

              <div className="cart-item-info" style={{ flex: 1, minWidth: 0 }}>
                <Link to={`/product/${item.product}`} style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.9375rem', display: 'block', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </Link>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{item.brand}</div>
                <div style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '1.0625rem' }}>
                  PKR {(item.price * item.qty).toLocaleString()}
                </div>
              </div>

              {/* Qty Controls */}
              <div className="cart-item-controls" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '0.25rem' }}>
                <button
                  onClick={() => item.qty > 1 ? addToCart(item, item.qty - 1) : removeFromCart(item.product)}
                  style={{ width: '30px', height: '30px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: 'var(--color-text-muted)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Minus size={14} />
                </button>
                <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 700, fontSize: '0.9375rem' }}>{item.qty}</span>
                <button
                  onClick={() => item.qty < Math.min(item.countInStock, 10) ? addToCart(item, item.qty + 1) : null}
                  disabled={item.qty >= Math.min(item.countInStock, 10)}
                  style={{ width: '30px', height: '30px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: 'var(--color-text-muted)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Remove */}
              <button
                className="cart-item-remove"
                onClick={() => removeFromCart(item.product)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-text-light)', padding: '0.5rem', borderRadius: '8px', transition: 'color 0.15s, background 0.15s', display: 'flex' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-danger-bg)'; e.currentTarget.style.color = 'var(--color-danger)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-light)'; }}
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}

          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: 500 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >
            ← Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="cart-summary" style={{ position: 'relative' }}>
          <style>{`
            @media (min-width: 1025px) {
              .cart-summary { position: sticky !important; top: 90px !important; }
            }
          `}</style>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem' }}>Order Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
              {[
                { label: `Subtotal (${cartItems.reduce((a, i) => a + i.qty, 0)} items)`, val: `PKR ${itemsPrice.toLocaleString()}` },
                { label: 'Shipping', val: shippingPrice === 0 ? <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Free</span> : `PKR ${shippingPrice.toLocaleString()}` },
                { label: 'Tax (15%)', val: `PKR ${taxPrice.toLocaleString()}` },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  <span>{row.label}</span>
                  <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{row.val}</span>
                </div>
              ))}
            </div>

            <div style={{ height: '1px', background: 'var(--color-border)', margin: '1rem 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-primary)' }}>PKR {totalPrice.toLocaleString()}</span>
            </div>

            {shippingPrice === 0 && (
              <div style={{ background: 'var(--color-success-bg)', border: '1px solid #A7F3D0', borderRadius: '10px', padding: '0.625rem 0.875rem', fontSize: '0.8125rem', color: '#065F46', marginBottom: '1.25rem', fontWeight: 500 }}>
                🎉 You qualify for free shipping!
              </div>
            )}

            <button
              className="btn btn-primary btn-block btn-lg"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
