
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, unit, icon, colorClass }) => {
  return (
    <div className={`p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4 ${colorClass}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-slate-800 tracking-tight">{value}</span>
        <span className="text-slate-400 text-xs font-bold">{unit}</span>
      </div>
    </div>
  );
};

export default StatCard;
