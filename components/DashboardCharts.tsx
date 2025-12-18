import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Expense } from '../types';

interface DashboardChartsProps {
  expenses: Expense[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff6b6b', '#6b6bff'];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ expenses }) => {
  // Aggregate data by category
  const dataMap = expenses.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  if (dataMap.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-500 bg-white rounded-xl shadow-sm p-4 text-sm">
        <p>لا توجد بيانات للعرض حالياً</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-2 border-b pb-2">تحليل المصاريف</h3>
      <div className="h-48 w-full flex items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataMap}
              cx="40%" // Moved slightly left to make room for legend on right
              cy="50%"
              innerRadius={40}
              outerRadius={60}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {dataMap.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`${value} ر.ق`, 'القيمة']} />
            <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', right: 0 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};