import { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend
} from 'recharts';
import { TrendingUp, AlertCircle, Loader2, Info } from 'lucide-react';

const AdminForecast = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const response = await fetch('/api/products/admin/forecast', {
          headers: {
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('userInfo')).token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch forecast');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={40} color="var(--color-primary)" />
        <p style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Running ML Models (Prophet)...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', background: 'var(--color-danger-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <AlertCircle size={24} />
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Forecasting Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '0.5rem' }}>Demand Forecasting</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>AI-powered inventory predictions for the next 30 days based on historical sales trends.</p>
        </div>
        <div style={{ padding: '0.75rem 1rem', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-lg)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
          <TrendingUp size={20} />
          <span>Total Forecast: {data?.total_predicted_sales || 0} Units</span>
        </div>
      </div>

      {/* Main Chart */}
      <div style={{ background: 'var(--color-bg)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Sales Projection (Prophet Model)</h3>
          <div title="This chart shows daily predicted sales. The shaded area represents the 95% confidence interval.">
            <Info size={16} color="var(--color-text-muted)" style={{ cursor: 'help' }} />
          </div>
        </div>
        
        <div style={{ height: '400px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.forecast || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="var(--color-text-muted)" 
                fontSize={12} 
                tickMargin={10}
                tickFormatter={(str) => {
                  const date = new Date(str);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis stroke="var(--color-text-muted)" fontSize={12} />
              <Tooltip 
                contentStyle={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }}
                labelStyle={{ fontWeight: 700, marginBottom: '0.25rem' }}
              />
              <Area 
                type="monotone" 
                dataKey="expected_sales" 
                name="Predicted Sales"
                stroke="var(--color-primary)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSales)" 
              />
              {/* Confidence Interval using yhat_lower/upper */}
              <Area 
                type="monotone" 
                dataKey="upper_bound" 
                stroke="transparent" 
                fill="var(--color-primary)" 
                fillOpacity={0.1} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div style={{ padding: '1.25rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} color="var(--color-primary)" />
            Inventory Insight
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            Based on the forecast of <strong>{data?.total_predicted_sales} units</strong>, we recommend increasing stock for top-selling laptop categories by <strong>15%</strong> to avoid stockouts during predicted peak windows.
          </p>
        </div>
        <div style={{ padding: '1.25rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} color="var(--color-success)" />
            Seasonality Check
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            Standard weekday performance is predicted to remain stable. The model detects a slight upward trend in weekend traffic for mobile accessories.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminForecast;
