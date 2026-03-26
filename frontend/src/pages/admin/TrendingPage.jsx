import { useState, useEffect } from 'react';
import useUserStore from '../../store/userStore';
import { TrendingUp, Heart, Star, ShoppingCart, Award } from 'lucide-react';

const RankBadge = ({ rank }) => {
  const colors = ['#F59E0B', '#9CA3AF', '#D97706', 'var(--color-text-muted)'];
  const labels = ['🥇', '🥈', '🥉'];
  return (
    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: colors[Math.min(rank, 3)], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0, fontWeight: 800, color: rank < 3 ? '#fff' : 'var(--color-text-muted)' }}>
      {rank < 3 ? labels[rank] : rank + 1}
    </div>
  );
};

const TrendingCard = ({ title, icon, items, renderItem }) => (
  <div className="card" style={{ padding: '1.5rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
      {icon}
      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{title}</h3>
    </div>
    {items.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No data yet</div>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {items.map((item, i) => renderItem(item, i))}
      </div>
    )}
  </div>
);

const TrendingPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const userInfo = useUserStore(state => state.userInfo);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch('/api/products/trending', { headers: { Authorization: `Bearer ${userInfo.token}` } });
        const json = await res.json();
        setData(json);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchTrending();
  }, [userInfo]);

  if (loading) return <div className="loader" />;
  if (!data) return <p style={{ color: 'var(--color-danger)' }}>Failed to load trending data.</p>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Trending & Insights</h2>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Real-time data on customer demand, popularity, and sales velocity.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        {/* Most Wishlisted */}
        <TrendingCard
          title="Most Wishlisted"
          icon={<Heart size={18} style={{ color: '#EF4444' }} />}
          items={data.mostWishlisted || []}
          renderItem={(item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: 'var(--color-bg-alt)', borderRadius: '10px' }}>
              <RankBadge rank={i} />
              <img src={item.product?.image} alt={item.product?.name} style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '6px', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>PKR {item.product?.price?.toLocaleString()}</div>
              </div>
              <span style={{ flexShrink: 0, fontWeight: 800, fontSize: '0.875rem', color: '#EF4444', background: '#FEF2F2', padding: '0.2rem 0.5rem', borderRadius: '20px' }}>♥ {item.count}</span>
            </div>
          )}
        />

        {/* Most Reviewed */}
        <TrendingCard
          title="Most Reviewed"
          icon={<Star size={18} style={{ color: '#F59E0B' }} />}
          items={data.mostReviewed || []}
          renderItem={(item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: 'var(--color-bg-alt)', borderRadius: '10px' }}>
              <RankBadge rank={i} />
              <img src={item.image} alt={item.name} style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '6px', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>★ {item.rating?.toFixed(1)} avg</div>
              </div>
              <span style={{ flexShrink: 0, fontWeight: 800, fontSize: '0.875rem', color: '#F59E0B', background: '#FFFBEB', padding: '0.2rem 0.5rem', borderRadius: '20px' }}>{item.numReviews} reviews</span>
            </div>
          )}
        />

        {/* Most Ordered */}
        <TrendingCard
          title="Most Ordered"
          icon={<ShoppingCart size={18} style={{ color: 'var(--color-primary)' }} />}
          items={data.mostOrdered || []}
          renderItem={(item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: 'var(--color-bg-alt)', borderRadius: '10px' }}>
              <RankBadge rank={i} />
              <img src={item.image} alt={item.name} style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '6px', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>PKR {item.totalRevenue?.toLocaleString()} revenue</div>
              </div>
              <span style={{ flexShrink: 0, fontWeight: 800, fontSize: '0.875rem', color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '0.2rem 0.5rem', borderRadius: '20px' }}>{item.totalQty} sold</span>
            </div>
          )}
        />
      </div>

      {/* Summary cards at the bottom */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginTop: '1.5rem' }}>
        {[
          { label: 'Products in Wishlists', value: data.mostWishlisted?.[0]?.count ?? 0, sub: `Top: ${data.mostWishlisted?.[0]?.product?.name?.slice(0, 20) ?? '—'}`, icon: <Heart size={20} style={{ color: '#EF4444' }} /> },
          { label: 'Most Reviewed Product', value: data.mostReviewed?.[0]?.numReviews ?? 0, sub: `"${data.mostReviewed?.[0]?.name?.slice(0, 20) ?? '—'}"`, icon: <Star size={20} style={{ color: '#F59E0B' }} /> },
          { label: 'Best Selling Units', value: data.mostOrdered?.[0]?.totalQty ?? 0, sub: `Top: ${data.mostOrdered?.[0]?.name?.slice(0, 20) ?? '—'}`, icon: <Award size={20} style={{ color: 'var(--color-primary)' }} /> },
        ].map(({ label, value, sub, icon }) => (
          <div key={label} className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>{value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingPage;
