'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/formatters';

interface CashflowBarChartProps {
  mieteIst: number;
  mieteOpt: number;
  kapitaldienst: number;
  kosten: number;
}

export function CashflowBarChart({ mieteIst, mieteOpt, kapitaldienst, kosten }: CashflowBarChartProps) {
  const data = [
    {
      name: 'IST',
      Mieteinnahmen: mieteIst,
      Kapitaldienst: -kapitaldienst,
      Kosten: -kosten,
    },
    {
      name: 'Optimiert',
      Mieteinnahmen: mieteOpt,
      Kapitaldienst: -kapitaldienst,
      Kosten: -kosten,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
        <YAxis
          tick={{ fill: '#64748b' }}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(Math.abs(value))}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Bar dataKey="Mieteinnahmen" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Kapitaldienst" fill="#ef4444" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Kosten" fill="#eab308" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
