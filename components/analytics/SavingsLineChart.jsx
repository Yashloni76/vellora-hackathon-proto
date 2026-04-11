"use client";

import { 
  ComposedChart, 
  Area, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#111311',
        border: '1px solid #1f2b1f',
        padding: '10px 14px',
        borderRadius: '8px'
      }}>
        <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 6px' }}>{label}</p>
        {payload.map((p, i) => (
          p.value !== null && p.value !== undefined ? (
            <p key={i} style={{ color: p.color, fontSize: '13px', fontWeight: 600, margin: '2px 0' }}>
              {p.name}: ₹{Number(p.value).toLocaleString()}
            </p>
          ) : null
        ))}
      </div>
    )
  }
  return null
}
export default function SavingsLineChart({ savingsData = [] }) {
  return (
    <div className="card bg-[#111311] border border-border-dark p-8 relative overflow-hidden group h-full flex flex-col">
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Wealth Accumulation Arc</h2>
          <p className="text-muted text-[11px] font-medium uppercase tracking-widest">
            CUMULATIVE SAVINGS GROWTH OVER TIME
          </p>
        </div>
        <div className="px-2 py-1 bg-[#00ff8815] border border-[#00ff8830] rounded text-[9px] text-[#00ff88] font-bold tracking-widest animate-pulse uppercase">
          Real-time
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
        <span style={{ color: '#00ff88', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="w-2 h-2 rounded-full bg-[#00ff88]" /> Cumulative Savings
        </span>
        <span style={{ color: '#ff4444', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="w-2 h-0.5 bg-[#ff4444]" /> Monthly Expense
        </span>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={savingsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              yAxisId="savings"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 600 }}
              domain={[0, 'auto']}
            />
            <YAxis 
              yAxisId="expense"
              orientation="right"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 600 }}
              domain={[0, 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              yAxisId="savings"
              type="monotone" 
              dataKey="amount" 
              name="Cumulative Savings"
              stroke="#00ff88" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSavings)" 
              animationDuration={1500}
            />
            <Line
              yAxisId="expense"
              type="monotone"
              dataKey="spent"
              stroke="#ff4444"
              strokeWidth={2}
              dot={{ fill: '#ff4444', r: 3 }}
              strokeDasharray="5 5"
              name="Monthly Expense"
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
