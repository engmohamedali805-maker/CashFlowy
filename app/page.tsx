
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Expense, BudgetMap, Income, Obligation, ObligationPayment, OpeningSavings, Debt } from '@/types';
import { ExpenseInput } from '@/components/ExpenseInput';
import { BudgetCard } from '@/components/BudgetCard';
import { DashboardCharts } from '@/components/DashboardCharts';
import { ExpenseList } from '@/components/ExpenseList';
import { SettingsModal } from '@/components/SettingsModal';
import { IncomeManager } from '@/components/IncomeManager';
import { ObligationManager } from '@/components/ObligationManager';
import { SavingsManager } from '@/components/SavingsManager';
import { DebtManager } from '@/components/DebtManager';
import { CategoryBudgetList } from '@/components/CategoryBudgetList';
import { dataService } from '@/services/dataService';

export default function App() {
  const [syncKey, setSyncKey] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'income' | 'obligations' | 'savings' | 'debts'>('dashboard');
  const [currency, setCurrency] = useState('QAR');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [obligationPayments, setObligationPayments] = useState<ObligationPayment[]>([]);
  const [openingSavings, setOpeningSavings] = useState<OpeningSavings | null>(null);
  const [budgets, setBudgets] = useState<BudgetMap>({});
  const [debts, setDebts] = useState<Debt[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);

  // Initialize sync key
  useEffect(() => {
    const key = localStorage.getItem('cashflowy_sync_key') || Math.random().toString(36).substring(2, 10).toUpperCase();
    setSyncKey(key);
    localStorage.setItem('cashflowy_sync_key', key);
  }, []);

  // Fetch from DB
  useEffect(() => {
    if (!syncKey) return;
    const load = async () => {
      setIsLoading(true);
      const cloudState = await dataService.fetchState(syncKey);
      if (cloudState) {
        setExpenses(cloudState.expenses || []);
        setIncomes(cloudState.incomes || []);
        setObligations(cloudState.obligations || []);
        setObligationPayments(cloudState.obligationPayments || []);
        setBudgets(cloudState.budgets || {});
        setDebts(cloudState.debts || []);
        setOpeningSavings(cloudState.openingSavings);
      }
      setIsLoading(false);
    };
    load();
  }, [syncKey]);

  const currentMonthKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
  
  const activeBudget = useMemo(() => {
    return budgets[currentMonthKey] || {
      limit: 0,
      currency: currency,
      categoryLimits: {},
      alertThresholds: { warning: 75, critical: 90 }
    };
  }, [budgets, currentMonthKey, currency]);

  const totalBudgetFromCategories = useMemo(() => {
    const limits = activeBudget.categoryLimits || {};
    return Object.values(limits).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);
  }, [activeBudget.categoryLimits]);

  const handleAddExpense = async (e: Expense) => {
    setExpenses(prev => [e, ...prev]);
    await dataService.syncTransaction(syncKey, { ...e, type: 'expense' });
  };

  const handleAddIncome = async (i: Income) => {
    setIncomes(prev => [...prev, i]);
    await dataService.syncTransaction(syncKey, { ...i, type: 'income' });
  };

  const updateCategoryLimit = async (category: string, limit: number) => {
    const newBudget = {
      ...activeBudget,
      categoryLimits: { ...(activeBudget.categoryLimits || {}), [category]: limit }
    };
    setBudgets(prev => ({ ...prev, [currentMonthKey]: newBudget }));
    await dataService.syncBudget(syncKey, currentMonthKey, newBudget);
  };

  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonthKey));
  const currentMonthIncomes = incomes.filter(i => i.date.startsWith(currentMonthKey));
  const totalSpentExpenses = currentMonthExpenses.reduce((sum, item) => sum + item.amount, 0);
  const totalIncomeMonth = currentMonthIncomes.reduce((sum, item) => sum + item.amount, 0);

  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

  return (
    <div className="min-h-screen bg-gray-50 text-right font-sans mb-32 pb-10" dir="rtl">
      {/* Header and UI remains same, logic updated to talk to API */}
      <div className="max-w-lg mx-auto">
        <header className="p-4 bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
           <div className="flex justify-between items-center mb-3">
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-blue-600">CashFlowy</h1>
                <span className="text-[10px] text-gray-400 font-bold">فلوسك تحت السيطرة (سحابة Neon)</span>
              </div>
              <button onClick={() => setShowSettings(true)} className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">⚙️</button>
           </div>
           <div className="flex bg-gray-100 p-1 rounded-xl gap-1 overflow-x-auto no-scrollbar">
            {['dashboard', 'income', 'obligations', 'debts', 'savings'].map((v) => (
              <button 
                key={v}
                onClick={() => setCurrentView(v as any)}
                className={`flex-1 py-2 px-3 text-[11px] font-black rounded-lg transition-all ${currentView === v ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
              >
                {v === 'dashboard' ? 'الرئيسية' : v === 'income' ? 'الدخل' : v === 'obligations' ? 'الالتزامات' : v === 'debts' ? 'الديون' : 'المدخرات'}
              </button>
            ))}
          </div>
        </header>

        <main className="p-4 space-y-4">
          {isLoading ? (
            <div className="py-20 text-center animate-pulse">جاري الاتصال بقاعدة بيانات Neon...</div>
          ) : (
            <>
              {currentView === 'dashboard' && (
                <>
                  <BudgetCard 
                    totalIncome={totalIncomeMonth}
                    totalExpenses={totalSpentExpenses}
                    totalObligations={obligationPayments.filter(p => p.monthKey === currentMonthKey).reduce((s, p) => s + p.amountPaid, 0)}
                    budgetLimit={totalBudgetFromCategories}
                    currency={currency}
                    overBudgetCategories={[]}
                    selectedDate={selectedDate}
                    thresholds={activeBudget.alertThresholds}
                    openingSavings={openingSavings}
                    totalCumulativeSavings={0}
                  />
                  <CategoryBudgetList 
                    expenses={currentMonthExpenses}
                    categoryLimits={activeBudget.categoryLimits || {}}
                    currency={currency}
                    onUpdateCategoryLimit={updateCategoryLimit}
                    thresholds={activeBudget.alertThresholds}
                  />
                  <DashboardCharts expenses={currentMonthExpenses} />
                  <ExpenseList expenses={currentMonthExpenses} onDelete={async (id) => {
                    setExpenses(prev => prev.filter(e => e.id !== id));
                    await dataService.deleteTransaction(syncKey, id);
                  }} />
                </>
              )}
              {currentView === 'income' && <IncomeManager incomes={currentMonthIncomes} onAddIncome={handleAddIncome} onDeleteIncome={(id) => dataService.deleteTransaction(syncKey, id)} currency={currency} />}
              {/* Add other managers similarly */}
            </>
          )}
        </main>
        
        {currentView === 'dashboard' && !isLoading && (
          <ExpenseInput onAddExpense={handleAddExpense} currency={currency} />
        )}
        
        <SettingsModal 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)}
          thresholds={activeBudget.alertThresholds}
          currentCurrency={currency}
          onSave={(t, c) => setCurrency(c)}
          username={syncKey}
          onSyncKeyChange={setSyncKey}
        />
      </div>
    </div>
  );
}
