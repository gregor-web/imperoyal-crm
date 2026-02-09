'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/formatters';

interface ErtragsPieChartProps {
  wohnen: number;
  gewerbe: number;
  stellplatz: number;
}

const COLORS = ['#22c55e', '#3b82f6', '#8b5cf6'];

export function ErtragsPieChart({ wohnen, gewerbe, stellplatz }: ErtragsPieChartProps) {
  const data = [
    { name: 'Wohnen', value: wohnen || 0 },
    { name: 'Gewerbe', value: gewerbe || 0 },
    { name: 'Stellplatz', value: stellplatz || 0 },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500">
        Keine Ertragsdaten vorhanden
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
