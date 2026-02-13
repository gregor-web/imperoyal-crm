'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/lib/formatters';

interface ExitBarChartProps {
  heute: number;
  jahr3: number;
  jahr7: number;
  jahr10: number;
}

export function ExitBarChart({ heute, jahr3, jahr7, jahr10 }: ExitBarChartProps) {
  const data = [
    { name: 'Heute', wert: heute },
    { name: '+3 Jahre', wert: jahr3 },
    { name: '+7 Jahre', wert: jahr7 },
    { name: '+10 Jahre', wert: jahr10 },
  ];

  const getColor = (index: number) => {
    const colors = ['#64748b', '#3b82f6', '#8b5cf6', '#22c55e'];
    return colors[index];
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
        <YAxis
          tick={{ fill: '#64748b' }}
          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value) || 0)}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <Bar dataKey="wert" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={getColor(index)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
