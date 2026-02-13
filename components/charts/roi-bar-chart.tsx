'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { formatPercent } from '@/lib/formatters';

interface RoiBarChartProps {
  roiHeute: number;
  roiOptimiert: number;
  roiMitWeg?: number;
}

export function RoiBarChart({ roiHeute, roiOptimiert, roiMitWeg }: RoiBarChartProps) {
  const data = [
    { name: 'ROI heute', roi: roiHeute },
    { name: 'ROI optimiert', roi: roiOptimiert },
    ...(roiMitWeg ? [{ name: 'ROI + WEG', roi: roiMitWeg }] : []),
  ];

  const COLORS = ['#64748b', '#3b82f6', '#22c55e'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
        <YAxis
          tick={{ fill: '#64748b' }}
          tickFormatter={(value) => `${value.toFixed(1)}%`}
          domain={[0, 'auto']}
        />
        <Tooltip
          formatter={(value) => formatPercent(Number(value) || 0)}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        />
        <ReferenceLine y={4} stroke="#ef4444" strokeDasharray="3 3" label="Min 4%" />
        <Bar dataKey="roi" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
