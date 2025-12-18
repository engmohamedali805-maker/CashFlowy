
import React, { useState } from 'react';
import { Expense, AlertThresholds } from '../types';
import { CATEGORIES } from './ExpenseInput';

interface CategoryBudgetListProps {
  expenses: Expense[];
  categoryLimits: Record<string, number>;
  currency: string;
  onUpdateCategoryLimit: (category: string, limit: number) => void;
  thresholds: AlertThresholds;
}

// خريطة الأيقونات للأقسام
const CATEGORY_ICONS: Record<string, string> = {
  'سوبر ماركت': '🛒',
  'طعام': '🍔',
  'الجيم': '💪',
  'اتصالات ونت': '🌐',
  'تبرع وصدقه': '🌙',
  'خروجات': '☕',
  'تنقلات': '🚗',
  'شوبينج': '🛍️',
  'أخرى': '📦'
};

export const CategoryBudgetList: React.FC<CategoryBudgetListProps> = ({ 
  expenses, 
  categoryLimits, 
  currency,
  onUpdateCategoryLimit,
  thresholds
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempLimit, setTempLimit] = useState<string>('');

  // حساب الإجماليات لكل قسم
  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const handleStartEdit = (cat: string, currentLimit: number) => {
    setEditingCategory(cat);
    setTempLimit(currentLimit ? currentLimit.toString() : '');
  };

  const handleSaveEdit = (cat: string) => {
    const val = parseFloat(tempLimit);
    if (!isNaN(val) && val >= 0) {
      onUpdateCategoryLimit(cat, val);
    }
    setEditingCategory(null);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 2a1 1 0 011-1h2a1 1 0 011 1v14a1 1 0 01-1 1h-2a1 1 0 01-1-1V2z" />
                </svg>
            </span>
            ميزانيات الأقسام
        </h3>
        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-wider">الشهر الحالي</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {CATEGORIES.map((cat) => {
          const spent = categoryTotals[cat] || 0;
          const limit = categoryLimits[cat] || 0;
          const remaining = limit > 0 ? limit - spent : null;
          const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
          
          let statusColor = 'text-blue-600';
          let barColor = 'bg-blue-500';
          let bgColor = 'bg-white';
          let borderColor = 'border-gray-100';

          if (limit > 0) {
            if (percentage >= 100) {
              statusColor = 'text-red-600';
              barColor = 'bg-red-500';
              bgColor = 'bg-red-50/30';
              borderColor = 'border-red-100';
            } else if (percentage >= thresholds.critical) {
              statusColor = 'text-orange-600';
              barColor = 'bg-orange-500';
            } else if (percentage >= thresholds.warning) {
              statusColor = 'text-yellow-600';
              barColor = 'bg-yellow-400';
            }
          }

          return (
            <div 
              key={cat} 
              className={`${bgColor} border ${borderColor} rounded-2xl p-4 shadow-sm transition-all active:scale-[0.98] duration-200`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl shadow-inner border border-gray-100">
                    {CATEGORY_ICONS[cat] || '📦'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{cat}</h4>
                    {limit > 0 ? (
                        <p className={`text-[11px] font-bold ${remaining !== null && remaining < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                            {remaining !== null 
                                ? (remaining < 0 ? `تخطيت بـ ${Math.abs(remaining).toLocaleString()}` : `متبقي ${remaining.toLocaleString()}`) 
                                : 'ميزانية مفتوحة'} {currency}
                        </p>
                    ) : (
                        <p className="text-[11px] text-gray-400 font-medium">غير محدد</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end">
                    {editingCategory === cat ? (
                        <div className="flex items-center gap-1 animate-[fadeIn_0.2s_ease-out]">
                             <input 
                                type="number" 
                                className="w-20 border-2 border-blue-500 rounded-lg px-2 py-1 text-xs font-black text-center outline-none"
                                value={tempLimit}
                                autoFocus
                                onBlur={() => handleSaveEdit(cat)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(cat)}
                                onChange={(e) => setTempLimit(e.target.value)}
                                placeholder="الحد"
                             />
                        </div>
                    ) : (
                        <button 
                          onClick={() => handleStartEdit(cat, limit)}
                          className="group flex flex-col items-end"
                        >
                            <span className="text-[10px] text-gray-400 font-bold group-hover:text-blue-500 transition-colors uppercase">الميزانية</span>
                            <span className="text-sm font-black text-gray-700">
                                {limit > 0 ? limit.toLocaleString() : '∞'}
                            </span>
                        </button>
                    )}
                </div>
              </div>

              {/* شريط التقدم العصري */}
              {limit > 0 ? (
                <div className="space-y-1.5">
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner border border-gray-50">
                        <div 
                            className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out relative`} 
                            style={{ width: `${percentage}%` }}
                        >
                            {percentage > 10 && (
                                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-gray-400">تم صرف: {spent.toLocaleString()} {currency}</span>
                        <span className={statusColor}>{Math.round(percentage)}%</span>
                    </div>
                </div>
              ) : (
                  spent > 0 && (
                    <div className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
                        <span className="text-[10px] text-gray-500 font-bold">إجمالي المصروف:</span>
                        <span className="text-xs font-black text-gray-700">{spent.toLocaleString()} {currency}</span>
                    </div>
                  )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
