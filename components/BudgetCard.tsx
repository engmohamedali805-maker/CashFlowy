import React from 'react';
import { AlertThresholds, OpeningSavings } from '../types';

interface BudgetCardProps {
  totalIncome: number;
  totalExpenses: number;
  totalObligations: number;
  budgetLimit: number;
  currency: string;
  overBudgetCategories: string[];
  selectedDate: Date;
  thresholds: AlertThresholds;
  openingSavings: OpeningSavings | null;
  totalCumulativeSavings: number; // Opening + All Net Savings YTD
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ 
  totalIncome,
  totalExpenses, 
  totalObligations,
  budgetLimit, 
  currency, 
  overBudgetCategories, 
  thresholds,
  openingSavings,
  totalCumulativeSavings
}) => {
  // Calculations for Expense Budget
  const remaining = Math.max(0, budgetLimit - totalExpenses);
  const percentage = budgetLimit > 0 ? Math.min((totalExpenses / budgetLimit) * 100, 100) : 0;
  const isOverBudget = budgetLimit > 0 && totalExpenses > budgetLimit;
  const overAmount = Math.max(0, totalExpenses - budgetLimit);

  // Calculations for Financial Health (Income/Savings)
  const totalOutflow = totalExpenses + totalObligations;
  const currentMonthNetSavings = totalIncome - totalOutflow;
  const savingsRate = totalIncome > 0 ? (currentMonthNetSavings / totalIncome) * 100 : 0;

  // Visual Logic
  let progressColor = 'bg-white';
  let cardGradient = 'from-blue-600 to-indigo-700';
  let statusText = 'وضعك المالي ممتاز ✨';
  
  if (isOverBudget) {
    cardGradient = 'from-red-600 to-rose-700';
    progressColor = 'bg-white/90';
    statusText = 'تجاوزت الميزانية ⚠️';
  } else if (percentage >= thresholds.critical) {
    cardGradient = 'from-orange-500 to-red-500';
    progressColor = 'bg-white/90';
    statusText = 'مرحلة الخطر 🚨';
  } else if (percentage >= thresholds.warning) {
    cardGradient = 'from-yellow-400 to-orange-500';
    statusText = 'انتبه للمصروف ✋';
  }

  return (
    <div className="space-y-4 mb-6">
      {/* 1. HERO CARD: Budget Status */}
      <div className={`rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-100/50 bg-gradient-to-br ${cardGradient} relative overflow-hidden transition-all duration-500 border border-white/10`}>
        {/* ... (Existing Hero Card Content) ... */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-black/10 rounded-full blur-3xl mix-blend-overlay"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
            <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold border border-white/20 mb-6 inline-flex items-center gap-2 shadow-sm">
                 {statusText}
            </span>
            <div className="mb-8 scale-110">
                <p className="text-sm text-white/70 font-medium mb-1 tracking-wide">{isOverBudget ? 'المبلغ المتجاوز' : 'المتبقي للصرف'}</p>
                <h2 className="text-6xl font-black tracking-tighter drop-shadow-lg flex items-end justify-center gap-2 leading-none">
                    {isOverBudget ? overAmount.toLocaleString() : remaining.toLocaleString()}
                    <span className="text-2xl font-bold text-white/60 mb-1.5">{currency}</span>
                </h2>
            </div>
            <div className="w-full mb-6 relative px-2">
                 <div className="flex justify-between text-[10px] mb-2 text-white/70 font-bold px-0.5">
                    <span>البداية</span>
                    <span>نصف الميزانية</span>
                    <span>الحد الأقصى</span>
                 </div>
                 <div className="w-full bg-black/20 h-4 rounded-full overflow-hidden backdrop-blur-sm border border-white/10 relative shadow-inner">
                      <div className="absolute top-0 bottom-0 right-[75%] w-[1px] bg-white/30 z-20" title="تحذير"></div>
                      <div className="absolute top-0 bottom-0 right-[90%] w-[1px] bg-white/30 z-20" title="خطر"></div>
                      <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${progressColor} relative`}
                          style={{ width: `${percentage}%` }}
                      >
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full animate-[shimmer_2s_infinite]"></div>
                      </div>
                 </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-black/10 rounded-2xl p-3 border border-white/5 backdrop-blur-md">
                    <div className="flex items-center justify-center gap-1.5 mb-1 text-white/70">
                        <div className="w-2 h-2 rounded-full bg-white/50"></div>
                        <p className="text-xs font-bold">تم صرفه</p>
                    </div>
                    <p className="text-xl font-bold tracking-tight">{totalExpenses.toLocaleString()}</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-3 border border-white/20 backdrop-blur-md shadow-sm">
                    <div className="flex items-center justify-center gap-1.5 mb-1 text-white/90">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                        <p className="text-xs font-bold">ميزانية الشهر</p>
                    </div>
                    <p className="text-xl font-bold tracking-tight">{budgetLimit.toLocaleString()}</p>
                </div>
            </div>
        </div>
      </div>

      {/* 2. WEALTH & SAVINGS OVERVIEW (New Section) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
         <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ملخص الثروة والادخار
         </h3>
         
         <div className="grid grid-cols-3 gap-2 text-center divide-x divide-x-reverse divide-gray-100">
             {/* Total Accumulated */}
             <div className="pb-1">
                 <p className="text-[10px] text-gray-400 mb-1">إجمالي الثروة</p>
                 <p className="font-bold text-gray-800 text-sm">{totalCumulativeSavings.toLocaleString()}</p>
                 <p className="text-[9px] text-green-500">تراكمي</p>
             </div>

             {/* Opening Balance */}
             <div className="pb-1">
                 <p className="text-[10px] text-gray-400 mb-1">رصيد افتتاحي</p>
                 <p className="font-bold text-gray-800 text-sm">
                    {openingSavings ? openingSavings.totalOpeningQAR.toLocaleString() : '0'}
                 </p>
                 <p className="text-[9px] text-yellow-600">أصول ثابتة</p>
             </div>

             {/* Current Month */}
             <div className="pb-1">
                 <p className="text-[10px] text-gray-400 mb-1">ادخار الشهر</p>
                 <p className={`font-bold text-sm ${currentMonthNetSavings >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {currentMonthNetSavings > 0 ? '+' : ''}{currentMonthNetSavings.toLocaleString()}
                 </p>
                 <p className="text-[9px] text-gray-400">{Math.round(savingsRate)}%</p>
             </div>
         </div>
      </div>

      {/* Over Budget Categories Chips */}
      {overBudgetCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-[fadeIn_0.5s_ease-out]">
            {overBudgetCategories.map(cat => (
                <span key={cat} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-1 shadow-sm">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {cat}
                </span>
            ))}
        </div>
      )}
    </div>
  );
};