import React, { useMemo, useState } from 'react';
import { Expense, BudgetMap, YearlyStats, Income, ObligationPayment, OpeningSavings } from '../types';

interface YearlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  incomes: Income[];
  obligationPayments: ObligationPayment[];
  budgets: BudgetMap;
  openingSavings: OpeningSavings | null;
  currentDate: Date;
}

export const YearlyReportModal: React.FC<YearlyReportModalProps> = ({ 
  isOpen, 
  onClose, 
  expenses, 
  incomes,
  obligationPayments,
  budgets,
  openingSavings,
  currentDate 
}) => {
  const [copyFeedback, setCopyFeedback] = useState(false);

  const stats: YearlyStats | null = useMemo(() => {
    if (!isOpen) return null;

    const currentYear = currentDate.getFullYear();
    const currentMonthIndex = currentDate.getMonth(); 
    
    // Filter YTD data
    const ytdExpenses = expenses.filter(e => new Date(e.date).getFullYear() === currentYear && new Date(e.date) <= currentDate);
    const ytdIncomes = incomes.filter(i => new Date(i.date).getFullYear() === currentYear && new Date(i.date) <= currentDate);
    const ytdPayments = obligationPayments.filter(p => p.monthKey.startsWith(`${currentYear}-`));

    const currency = ytdExpenses[0]?.currency || 'QAR';

    // Aggregates
    const totalSpentExpenses = ytdExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalObligationsPaid = ytdPayments.reduce((sum, p) => sum + p.amountPaid, 0);
    const totalSpent = totalSpentExpenses + totalObligationsPaid;
    const totalIncome = ytdIncomes.reduce((sum, i) => sum + i.amount, 0);
    
    const totalSaved = totalIncome - totalSpent; // Net Savings from operations
    const openingBalance = openingSavings ? openingSavings.totalOpeningQAR : 0;
    const totalWealth = totalSaved + openingBalance;

    const savingsRate = totalIncome > 0 ? (totalSaved / totalIncome) * 100 : 0;
    const avgMonthlySavings = totalSaved / (currentMonthIndex + 1);

    // Monthly breakdown
    const monthlyData: Record<number, { inc: number, out: number }> = {};
    for (let i = 0; i <= currentMonthIndex; i++) {
        monthlyData[i] = { inc: 0, out: 0 };
    }
    ytdIncomes.forEach(i => {
        const m = new Date(i.date).getMonth();
        if(monthlyData[m]) monthlyData[m].inc += i.amount;
    });
    ytdExpenses.forEach(e => {
        const m = new Date(e.date).getMonth();
        if(monthlyData[m]) monthlyData[m].out += e.amount;
    });
    ytdPayments.forEach(p => {
        const m = parseInt(p.monthKey.split('-')[1]) - 1;
        if(monthlyData[m]) monthlyData[m].out += p.amountPaid;
    });

    let bestMonth = null;
    let worstMonth = null;
    let maxNet = -Infinity;
    let minNet = Infinity;

    Object.entries(monthlyData).forEach(([monthIdx, data]) => {
        const net = data.inc - data.out;
        const monthName = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"][parseInt(monthIdx)];
        if (net > maxNet) { maxNet = net; bestMonth = { name: monthName, net }; }
        if (net < minNet) { minNet = net; worstMonth = { name: monthName, net }; }
    });

    // Top Categories
    const categoryTotals: Record<string, number> = {};
    ytdExpenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    const topCategories = Object.entries(categoryTotals)
        .map(([name, amount]) => ({
            name,
            amount,
            percentage: totalSpentExpenses > 0 ? (amount / totalSpentExpenses) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

    const recommendations: string[] = [];
    if (savingsRate < 10) recommendations.push("معدل ادخارك منخفض (أقل من 10%).");
    if (savingsRate > 30) recommendations.push("ممتاز! معدل ادخارك صحي جداً.");
    if (openingBalance === 0) recommendations.push("لم تقم بإضافة رصيد افتتاحي (ذهب/نقد) بعد.");

    return {
        totalIncome,
        totalSpent,
        totalSaved,
        openingSavings: openingBalance,
        totalWealth,
        savingsRate,
        avgMonthlySavings,
        topCategories,
        worstMonth,
        bestMonth,
        trend: 'stable',
        recommendations,
        currency
    };
  }, [isOpen, expenses, incomes, obligationPayments, openingSavings, currentDate]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!stats) return;
    const text = `
تقرير السنة المالي (${currentDate.getFullYear()})
---
رصيد افتتاحي: ${stats.openingSavings.toLocaleString()}
إجمالي الدخل: ${stats.totalIncome.toLocaleString()}
إجمالي المصروفات: ${stats.totalSpent.toLocaleString()}
صافي الادخار (عمليات): ${stats.totalSaved.toLocaleString()}
إجمالي الثروة الحالية: ${stats.totalWealth.toLocaleString()}
`.trim();
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-[slideUp_0.3s_ease-out] flex flex-col">
        
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
            <div>
                <h2 className="text-xl font-bold text-gray-800">تقرير السنة المالي</h2>
                <p className="text-xs text-gray-500">تحليل الثروة والمصاريف</p>
            </div>
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">X</button>
        </div>

        {!stats ? (
            <div className="p-10 text-center text-gray-500">لا توجد بيانات كافية.</div>
        ) : (
            <div className="p-5 space-y-6">
                
                {/* Wealth Summary Card */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 rounded-xl text-white shadow-lg">
                    <p className="text-emerald-100 text-sm mb-1">إجمالي الثروة (الرصيد الافتتاحي + الادخار)</p>
                    <div className="text-4xl font-bold mb-4">{stats.totalWealth.toLocaleString()} <span className="text-lg opacity-80">{stats.currency}</span></div>
                    
                    <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-3">
                        <div>
                             <span className="text-xs text-emerald-200 block">رصيد افتتاحي</span>
                             <span className="font-bold">{stats.openingSavings.toLocaleString()}</span>
                        </div>
                        <div>
                             <span className="text-xs text-emerald-200 block">صافي ادخار السنة</span>
                             <span className="font-bold">{stats.totalSaved > 0 ? '+' : ''}{stats.totalSaved.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Operations Summary */}
                <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">الدخل السنوي</span>
                        <span className="font-bold text-gray-800">{stats.totalIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">المصروفات والالتزامات</span>
                        <span className="font-bold text-red-600">-{stats.totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between mt-2">
                        <span className="font-bold text-gray-700">الصافي</span>
                        <span className={`font-bold ${stats.totalSaved >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats.totalSaved.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Best/Worst Months (Existing logic) */}
                <div className="grid grid-cols-2 gap-3">
                    {stats.bestMonth && (
                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                            <p className="text-[10px] text-emerald-600 font-bold uppercase">أفضل شهر</p>
                            <p className="font-bold text-gray-800">{stats.bestMonth.name}</p>
                            <p className="text-xs text-emerald-600">+{stats.bestMonth.net.toLocaleString()}</p>
                        </div>
                    )}
                    {stats.worstMonth && (
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                            <p className="text-[10px] text-red-600 font-bold uppercase">أقل شهر</p>
                            <p className="font-bold text-gray-800">{stats.worstMonth.name}</p>
                            <p className="text-xs text-red-600">{stats.worstMonth.net.toLocaleString()}</p>
                        </div>
                    )}
                </div>

                {/* Recommendations */}
                <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">ملاحظات</h3>
                    <ul className="space-y-2">
                        {stats.recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-gray-700 flex gap-2">
                                <span className="text-blue-500">•</span> {rec}
                            </li>
                        ))}
                    </ul>
                </div>

                <button 
                    onClick={handleCopy}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${copyFeedback ? 'bg-green-600 text-white' : 'bg-gray-800 text-white'}`}
                >
                    {copyFeedback ? 'تم النسخ' : 'نسخ ملخص التقرير'}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};