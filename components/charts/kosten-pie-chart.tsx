'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/formatters';

interface KostenPieChartProps {
  betriebskosten: number;
  instandhaltung: number;
  verwaltung: number;
  ruecklagen: number;
}

const COLORS = ['#3b82f6', '#ef4444', '#eab308', '#8b5cf6'];

export function KostenPieChart({ betriebskosten, instandhaltung, verwaltung, ruecklagen }: KostenPieChartProps) {
  const data = [
    { name: 'Betriebskosten', value: betriebskosten || 0 },
    { name: 'Instandhaltung', value: instandhaltung || 0 },
    { name: 'Verwaltung', value: verwaltung || 0 },
    { name: 'Rücklagen', value: ruecklagen || 0 },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500">
        Keine Kostendaten vorhanden
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
