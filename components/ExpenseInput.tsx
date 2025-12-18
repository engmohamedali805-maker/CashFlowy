
import React, { useState } from 'react';
import { Expense } from '../types';

const generateId = () => Math.random().toString(36).substring(2, 9);

interface ExpenseInputProps {
  onAddExpense: (expense: Expense) => void;
  currency: string;
}

export const CATEGORIES = [
  'سوبر ماركت',
  'طعام',
  'الجيم',
  'اتصالات ونت',
  'تبرع وصدقه',
  'خروجات',
  'تنقلات',
  'شوبينج',
  'أخرى'
];

export const ExpenseInput: React.FC<ExpenseInputProps> = ({ onAddExpense, currency }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('أخرى');

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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50 p-4 pb-6">
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-3">
        {/* Category Chips Selection */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            placeholder="المبلغ"
            className="w-1/3 p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold text-lg"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="وصف (اختياري)..."
            className="flex-1 p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            type="submit"
            disabled={!amount}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 font-bold transition-colors disabled:opacity-50 shadow-md"
          >
            إضافة
          </button>
        </div>
      </form>
    </div>
  );
};
