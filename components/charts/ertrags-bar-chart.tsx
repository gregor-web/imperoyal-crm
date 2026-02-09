'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/formatters';

interface ErtragsBarChartProps {
  data: {
    nutzung: string;
    mieteIst: number;
    mieteSoll: number;
  }[];
}

export function ErtragsBarChart({ data }: ErtragsBarChartProps) {
  const chartData = data.map((d) => ({
    name: d.nutzung,
    'IST-Miete': d.mieteIst,
    'SOLL-Miete': d.mieteSoll,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500">
        Keine Ertragsdaten vorhanden
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
        <YAxis
          tick={{ fill: '#64748b' }}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Bar dataKey="IST-Miete" fill="#64748b" radius={[4, 4, 0, 0]} />
        <Bar dataKey="SOLL-Miete" fill="#22c55e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
