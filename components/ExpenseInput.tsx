
import React, { useState } from 'react';
import { Expense } from '../types';

const generateId = () => Math.random().toString(36).substring(2, 9);

interface ExpenseInputProps {
  onAddExpense: (expense: Expense) => void;
  currency: string;
}

export const CATEGORIES = [
  'طعام',
  'سوبر ماركت',
  'تنقلات',
  'خروجات',
  'شوبينج',
  'اتصالات ونت',
  'الجيم',
  'تبرع وصدقه',
  'أخرى'
];

export const ExpenseInput: React.FC<ExpenseInputProps> = ({ onAddExpense, currency }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('طعام');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    const newExpense: Expense = {
      id: generateId(),
      amount: parseFloat(amount),
      currency: currency,
      category: selectedCategory,
      date: new Date().toISOString().split('T')[0],
      description: description || selectedCategory,
      createdAt: Date.now(),
    };

    onAddExpense(newExpense);
    setAmount('');
    setDescription('');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-15px_40px_rgba(0,0,0,0.1)] z-50 p-4 pb-8">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-3 px-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">إضافة مصروف جديد</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                    : 'bg-gray-50 text-gray-500 border-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <div className="relative w-1/3">
              <input
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                className="w-full p-4 rounded-2xl border-2 border-gray-50 focus:border-blue-500 outline-none text-center font-black text-xl bg-gray-50 transition-all"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <span className="absolute -top-2 right-4 bg-white px-1 text-[10px] font-bold text-gray-400">المبلغ</span>
            </div>

            <div className="relative flex-1">
              <input
                type="text"
                placeholder="وصف بسيط..."
                className="w-full p-4 rounded-2xl border-2 border-gray-50 focus:border-blue-500 outline-none text-sm font-bold bg-gray-50 transition-all h-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <span className="absolute -top-2 right-4 bg-white px-1 text-[10px] font-bold text-gray-400">البيان</span>
            </div>

            <button
              type="submit"
              disabled={!amount}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl w-14 flex items-center justify-center shadow-lg shadow-blue-100 active:scale-90 transition-all disabled:opacity-30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
