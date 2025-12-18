import React, { useMemo } from 'react';
import { Expense } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => {
  // Group expenses by category
  const groupedExpenses = useMemo(() => {
    const groups: Record<string, Expense[]> = {};
    expenses.forEach(expense => {
      if (!groups[expense.category]) {
        groups[expense.category] = [];
      }
      groups[expense.category].push(expense);
    });
    return groups;
  }, [expenses]);

  // Sort categories by total amount (descending)
  const sortedCategories = useMemo(() => {
    return Object.keys(groupedExpenses).sort((a, b) => {
      const totalA = groupedExpenses[a].reduce((sum, e) => sum + e.amount, 0);
      const totalB = groupedExpenses[b].reduce((sum, e) => sum + e.amount, 0);
      return totalB - totalA;
    });
  }, [groupedExpenses]);

  if (expenses.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 pb-24">
        <p>لا توجد مصاريف مسجلة حتى الآن</p>
        <p className="text-sm">اكتب مصروفك الأول في الخانة بالأسفل</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <h3 className="text-lg font-bold text-gray-800 mb-4 px-1">سجل المعاملات (حسب القسم)</h3>
      
      <div className="space-y-6">
        {sortedCategories.map(category => {
          const categoryExpenses = groupedExpenses[category].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          const totalAmount = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
          const currency = categoryExpenses[0]?.currency || 'QAR';

          return (
            <div key={category} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              {/* Category Header */}
              <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-100">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-blue-600 font-bold text-sm shadow-sm">
                      {category[0]}
                   </div>
                   <div className="flex flex-col">
                       <span className="font-bold text-gray-800 text-sm">{category}</span>
                       <span className="text-[10px] text-gray-500">
                         {categoryExpenses.length} عمليات
                       </span>
                   </div>
                </div>
                <span className="font-bold text-blue-600 text-sm">
                  {totalAmount.toLocaleString()} {currency}
                </span>
              </div>

              {/* Expenses List */}
              <div className="divide-y divide-gray-50">
                {categoryExpenses.map(expense => (
                  <div key={expense.id} className="p-3 hover:bg-gray-50 transition-colors flex justify-between items-center group">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-700 text-sm mb-0.5">{expense.description}</p>
                      <p className="text-xs text-gray-400">{expense.date}</p>
                    </div>
                    <div className="text-right pl-2">
                      <p className="font-bold text-gray-800 text-sm">-{expense.amount}</p>
                      <button 
                        onClick={() => onDelete(expense.id)}
                        className="text-red-400 text-[10px] mt-1 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};