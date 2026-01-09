import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { PickleballEvent } from '../types';

interface AdminChartProps {
  events: PickleballEvent[];
}

export const AdminChart: React.FC<AdminChartProps> = ({ events }) => {
  // Transform data for chart: Photos per event
  const data = events.slice(0, 5).map(event => ({
    name: event.title.split(' ')[0], // Take first word for label brevity
    fotos: event.photos.length,
    engagement: Math.floor(Math.random() * 100) + 20 // Simulated view count
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{fontSize: 12, fill: '#64748b'}} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{fontSize: 12, fill: '#64748b'}} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{fill: '#f1f5f9'}}
            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
          />
          <Bar dataKey="fotos" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
