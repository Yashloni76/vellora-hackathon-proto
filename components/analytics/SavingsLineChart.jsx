"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { savingsData as dummySavingsData } from "@/data/dummy";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#111311', border: '1px solid #1f2b1f', padding: '8px 12px', borderRadius: '8px' }}>
        <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>{label}</p>
        <p style={{ color: '#00ff88', fontSize: '14px', fontWeight: 600, margin: 0 }}>
          ₹{payload[0].value.toLocaleString()} saved
        </p>
      </div>
    )
  }
  return null
}

export default function SavingsLineChart({ savingsData, velocityView, setVelocityView }) {
  const data = savingsData && savingsData.length > 0 ? savingsData : dummySavingsData;

  return (
    <div className="card bg-[#111311] border border-border-dark p-8 relative overflow-hidden group h-full flex flex-col">
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Savings Velocity</h2>
          <p className="text-muted text-[11px] font-medium uppercase tracking-widest">
            Net accumulation over the selected arc
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div style={{ display: 'flex', gap: '4px' }}>
            {['daily', 'weekly', 'monthly'].map(view => (
              <button
                key={view}
                onClick={() => setVelocityView(view)}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  borderRadius: '6px',
                  border: '1px solid',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  background: velocityView === view ? '#00ff88' : 'transparent',
                  color: velocityView === view ? '#0a0a0a' : '#6b7280',
                  borderColor: velocityView === view ? '#00ff88' : '#1f2b1f',
                  transition: 'all 0.2s'
                }}
              >
                {view}
              </button>
            ))}
          </div>
          <div className="px-2 py-1 bg-[#00ff8815] border border-[#00ff8830] rounded text-[9px] text-[#00ff88] font-bold tracking-widest animate-pulse uppercase">
            Real-time
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 600 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#00ff88" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSavings)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
