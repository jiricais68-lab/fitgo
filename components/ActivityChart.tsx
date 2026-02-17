
import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { DailyActivity } from '../types';

interface ActivityChartProps {
  data: DailyActivity[];
  type: 'calories' | 'sleep' | 'heart-rate' | 'weight' | 'steps';
}

const ActivityChart: React.FC<ActivityChartProps> = ({ data, type }) => {
  const chartData = data.slice(-14);

  if (type === 'heart-rate') {
    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => val.split('-')[2] + '.' + val.split('-')[1]} />
            <YAxis stroke="#94a3b8" fontSize={10} domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Area type="monotone" dataKey="restingHeartRate" stroke="#f43f5e" fillOpacity={1} fill="url(#colorHr)" strokeWidth={2} name="BPM" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'calories') {
    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => val.split('-')[2] + '.' + val.split('-')[1]} />
            <YAxis stroke="#94a3b8" fontSize={10} />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="activeCalories" radius={[4, 4, 0, 0]} name="Kcal">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.activeCalories >= 1000 ? '#f43f5e' : '#fda4af'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'weight') {
    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => val.split('-')[2] + '.' + val.split('-')[1]} />
            <YAxis stroke="#94a3b8" fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Line type="monotone" dataKey="weight" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4, fill: '#06b6d4' }} name="kg" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'steps') {
    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickFormatter={(val) => val.split('-')[2] + '.' + val.split('-')[1]} />
            <YAxis stroke="#94a3b8" fontSize={10} />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="steps" radius={[4, 4, 0, 0]} fill="#8b5cf6" name="Steps" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
};

export default ActivityChart;
