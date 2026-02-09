'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/formatters';

interface WertentwicklungChartProps {
  heute: number;
  jahr3: number;
  jahr5: number;
  jahr7: number;
  jahr10: number;
}

export function WertentwicklungChart({ heute, jahr3, jahr5, jahr7, jahr10 }: WertentwicklungChartProps) {
  const data = [
    { name: 'Heute', wert: heute },
    { name: '+3 Jahre', wert: jahr3 },
    { name: '+5 Jahre', wert: jahr5 },
    { name: '+7 Jahre', wert: jahr7 },
    { name: '+10 Jahre', wert: jahr10 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="wertGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
        <YAxis
          tick={{ fill: '#64748b' }}
          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <Area
          type="monotone"
          dataKey="wert"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#wertGradient)"
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#1d4ed8' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
