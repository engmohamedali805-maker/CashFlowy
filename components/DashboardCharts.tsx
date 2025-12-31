
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Expense } from '../types';

interface DashboardChartsProps {
  expenses: Expense[];
}

interface ChartData {
  name: string;
  value: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#71717a'];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ expenses }) => {
  const dataMap = expenses.reduce((acc: ChartData[], curr: Expense) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, []);

  if (dataMap.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 bg-white rounded-2xl shadow-sm p-4 text-xs font-bold border border-gray-100">
        <p>لا توجد تحليلات كافية لهذا الشهر</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm mb-6 border border-gray-100">
      <h3 className="text-sm font-black text-gray-800 mb-4 border-r-4 border-blue-500 pr-3">توزيـع المصاريف</h3>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataMap}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={8}
              dataKey="value"
              stroke="none"
            >
              {dataMap.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', direction: 'rtl', textAlign: 'right' }}
              itemStyle={{ fontSize: '12px', fontWeight: '900' }}
            />
            <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                iconType="circle"
                wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
