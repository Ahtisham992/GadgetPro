import { useState, useEffect } from 'react';
import useUserStore from '../../store/userStore';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const CHART_COLORS = {
  primary: '#F97316',
  success: '#22C55E',
  info: '#3B82F6',
  warning: '#EAB308',
  purple: '#A855F7',
};

const StatCard = ({ label, value, subtext, accent }) => (
  <div className="card" style={{ padding: '1.5rem' }}>
    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>{label}</div>
    <div style={{ fontSize: '2rem', fontWeight: 800, color: accent || 'var(--color-text)', marginBottom: '0.25rem' }}>{value}</div>
    {subtext && <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{subtext}</div>}
  </div>
);

const DashboardOverview = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const userInfo = useUserStore((state) => state.userInfo);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch('/api/orders', { headers: { Authorization: `Bearer ${userInfo.token}` } }),
          fetch('/api/products?limit=100'),
        ]);
        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setProducts(Array.isArray(productsData.products) ? productsData.products : []);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, [userInfo]);

  if (loading) return <div className="loader" />;

  const revenue = orders.filter(o => o.isPaid).reduce((a, o) => a + o.totalPrice, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => !o.isAccepted).length;
  const completedOrders = orders.filter(o => o.isDelivered).length;

  // Revenue by last 7 days
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const revenueByDay = last7.map(date => {
    const dayStr = date.toISOString().slice(0, 10);
    return orders
      .filter(o => o.isPaid && o.paidAt?.slice(0, 10) === dayStr)
      .reduce((a, o) => a + o.totalPrice, 0);
  });
  const lineData = {
    labels: last7.map(d => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Revenue (PKR)',
      data: revenueByDay,
      fill: true,
      borderColor: CHART_COLORS.primary,
      backgroundColor: 'rgba(249,115,22,0.08)',
      tension: 0.4,
      pointBackgroundColor: CHART_COLORS.primary,
      pointRadius: 5,
    }],
  };

  // Orders by status
  const doughnutData = {
    labels: ['New Orders', 'Pending Delivery', 'Delivered'],
    datasets: [{
      data: [
        orders.filter(o => !o.isAccepted).length,
        orders.filter(o => o.isAccepted && !o.isDelivered).length,
        orders.filter(o => o.isDelivered).length,
      ],
      backgroundColor: [CHART_COLORS.warning, CHART_COLORS.info, CHART_COLORS.success],
      borderWidth: 0,
    }],
  };

  // Top products by number of orders
  const productHits = {};
  orders.forEach(o => {
    o.orderItems?.forEach(item => {
      productHits[item.name] = (productHits[item.name] || 0) + item.qty;
    });
  });
  const topProducts = Object.entries(productHits).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const barData = {
    labels: topProducts.map(([name]) => name.length > 18 ? name.slice(0, 18) + '…' : name),
    datasets: [{
      label: 'Units Sold',
      data: topProducts.map(([, qty]) => qty),
      backgroundColor: [
        CHART_COLORS.primary, CHART_COLORS.success, CHART_COLORS.info,
        CHART_COLORS.warning, CHART_COLORS.purple,
      ],
      borderRadius: 8,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: '#F3F4F6' } } },
  };

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.75rem' }}>Dashboard Overview</h1>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard label="Total Revenue" value={`PKR ${revenue.toLocaleString()}`} subtext="From paid orders" accent={CHART_COLORS.primary} />
        <StatCard label="Total Orders" value={totalOrders} subtext={`${pendingOrders} pending`} accent={CHART_COLORS.info} />
        <StatCard label="Delivered" value={completedOrders} subtext="Completed orders" accent={CHART_COLORS.success} />
        <StatCard label="Products" value={products.length} subtext="In inventory" accent={CHART_COLORS.purple} />
      </div>

      {/* Charts Row 1: Revenue Line */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Revenue — Last 7 Days</div>
        <Line data={lineData} options={chartOptions} height={80} />
      </div>

      {/* Charts Row 2: Doughnut + Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Orders by Status</div>
          <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } }, cutout: '65%' }} />
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Top 5 Products by Units Sold</div>
          {topProducts.length > 0
            ? <Bar data={barData} options={{ ...chartOptions, plugins: { legend: { display: false } } }} height={140} />
            : <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '3rem' }}>No order data yet</div>
          }
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
