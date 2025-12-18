import React, { useState } from 'react';
import { Income } from '../types';

interface IncomeManagerProps {
  incomes: Income[];
  onAddIncome: (income: Income) => void;
  onDeleteIncome: (id: string) => void;
  currency: string;
}

export const IncomeManager: React.FC<IncomeManagerProps> = ({ incomes, onAddIncome, onDeleteIncome, currency }) => {
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<Income['type']>('salary');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !amount) return;

    const newIncome: Income = {
      id: Math.random().toString(36).substring(2, 9),
      source,
      amount: parseFloat(amount),
      currency,
      date: new Date().toISOString(),
      type,
    };

    onAddIncome(newIncome);
    setSource('');
    setAmount('');
  };

  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);

  return (
    <div className="space-y-6 pb-24">
      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-center">
        <h2 className="text-emerald-800 font-bold mb-1">إجمالي الدخل هذا الشهر</h2>
        <p className="text-3xl font-bold text-emerald-600">{totalIncome.toLocaleString()} {currency}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">إضافة دخل جديد</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="المصدر (مثال: راتب)"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="border p-2 rounded-lg text-sm w-full outline-none focus:ring-2 focus:ring-emerald-200"
              required
            />
             <input
              type="number"
              placeholder="المبلغ"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border p-2 rounded-lg text-sm w-full outline-none focus:ring-2 focus:ring-emerald-200"
              required
            />
          </div>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value as Income['type'])}
            className="w-full border p-2 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <option value="salary">راتب شهري</option>
            <option value="freelance">عمل حر / إضافي</option>
            <option value="gift">هدية / مكافأة</option>
            <option value="other">أخرى</option>
          </select>
          <button 
            type="submit" 
            className="w-full bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            إضافة دخل
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-gray-700 px-1">سجل الدخل</h3>
        {incomes.length === 0 ? (
            <p className="text-center text-gray-400 py-4 text-sm">لا يوجد دخل مسجل لهذا الشهر</p>
        ) : (
            incomes.map(inc => (
            <div key={inc.id} className="bg-white p-3 rounded-xl shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        {inc.type === 'salary' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        {inc.type !== 'salary' && <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
                    </div>
                    <div>
                        <p className="font-bold text-gray-800 text-sm">{inc.source}</p>
                        <p className="text-xs text-gray-400">{new Date(inc.date).toLocaleDateString('ar-EG')}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-bold text-emerald-600 text-sm">+{inc.amount.toLocaleString()}</p>
                    <button onClick={() => onDeleteIncome(inc.id)} className="text-red-400 text-xs hover:text-red-600">حذف</button>
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );
};