'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/lib/formatters';

interface WegCompareChartProps {
  wertHeute: number;
  wertAufgeteilt: number;
}

export function WegCompareChart({ wertHeute, wertAufgeteilt }: WegCompareChartProps) {
  const data = [
    { name: 'Wert heute', wert: wertHeute },
    { name: 'Wert aufgeteilt', wert: wertAufgeteilt },
  ];

  const COLORS = ['#64748b', '#22c55e'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
