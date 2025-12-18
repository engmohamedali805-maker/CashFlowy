
import React, { useState, useEffect, useMemo } from 'react';
import { Expense, Budget, AlertThresholds, BudgetMap, Income, Obligation, ObligationPayment, OpeningSavings, Debt } from './types';
import { ExpenseInput } from './components/ExpenseInput';
import { BudgetCard } from './components/BudgetCard';
import { DashboardCharts } from './components/DashboardCharts';
import { ExpenseList } from './components/ExpenseList';
import { CategoryBudgetList } from './components/CategoryBudgetList';
import { SettingsModal } from './components/SettingsModal';
import { YearlyReportModal } from './components/YearlyReportModal';
import { IncomeManager } from './components/IncomeManager';
import { ObligationManager } from './components/ObligationManager';
import { SavingsManager } from './components/SavingsManager';
import { DebtManager } from './components/DebtManager';
import { LoginScreen } from './components/LoginScreen';

const App: React.FC = () => {
  // --- Auth State with Persistence ---
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('app_session_user') || sessionStorage.getItem('app_session_user');
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!(localStorage.getItem('app_session_user') || sessionStorage.getItem('app_session_user'));
  });

  // --- View State ---
  type View = 'dashboard' | 'income' | 'obligations' | 'savings' | 'debts';
  const [currentView, setCurrentView] = useState<View>('dashboard');

  // --- Global Settings State ---
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('app_currency') || 'QAR';
  });

  useEffect(() => {
    localStorage.setItem('app_currency', currency);
  }, [currency]);

  // --- Data States ---
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [obligationPayments, setObligationPayments] = useState<ObligationPayment[]>([]);
  const [openingSavings, setOpeningSavings] = useState<OpeningSavings | null>(null);
  const [budgets, setBudgets] = useState<BudgetMap>({});
  const [debts, setDebts] = useState<Debt[]>([]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [showYearlyReport, setShowYearlyReport] = useState(false);

  // --- Persistence ---
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      const userKey = `data_${currentUser}`;
      const saved = localStorage.getItem(userKey);
      if (saved) {
        const data = JSON.parse(saved);
        setExpenses(data.expenses || []);
        setIncomes(data.incomes || []);
        setObligations(data.obligations || []);
        setObligationPayments(data.obligationPayments || []);
        setOpeningSavings(data.openingSavings || null);
        setBudgets(data.budgets || {});
        setDebts(data.debts || []);
      }
    }
  }, [isLoggedIn, currentUser]);

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      const userKey = `data_${currentUser}`;
      const dataToSave = {
        expenses,
        incomes,
        obligations,
        obligationPayments,
        openingSavings,
        budgets,
        debts
      };
      localStorage.setItem(userKey, JSON.stringify(dataToSave));
    }
  }, [expenses, incomes, obligations, obligationPayments, openingSavings, budgets, debts, isLoggedIn, currentUser]);

  // --- Helpers ---
  const formatMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthKey = formatMonthKey(selectedDate);

  const defaultBudget: Budget = {
    limit: 2000,
    currency: currency,
    categoryLimits: {
      'سوبر ماركت': 200,
      'طعام': 800,
      'الجيم': 200,
      'اتصالات ونت': 0,
      'تبرع وصدقه': 150,
      'خروجات': 400,
      'تنقلات': 150,
      'شوبينج': 400
    },
    alertThresholds: { warning: 75, critical: 90 }
  };

  // --- Derived Data ---
  const activeBudget = useMemo(() => {
    return budgets[currentMonthKey] || defaultBudget;
  }, [budgets, currentMonthKey, currency]);

  const currentMonthExpenses = useMemo(() => {
    return expenses.filter(e => e.date.startsWith(currentMonthKey));
  }, [expenses, currentMonthKey]);

  const currentMonthIncomes = useMemo(() => {
    return incomes.filter(i => i.date.startsWith(currentMonthKey));
  }, [incomes, currentMonthKey]);

  const currentMonthObligations = useMemo(() => {
    return obligations.filter(o => o.dueDate && o.dueDate.startsWith(currentMonthKey));
  }, [obligations, currentMonthKey]);

  const currentMonthPayments = useMemo(() => {
      return obligationPayments.filter(p => p.monthKey === currentMonthKey || currentMonthObligations.some(o => o.id === p.obligationId));
  }, [obligationPayments, currentMonthKey, currentMonthObligations]);

  const totalSpentExpenses = currentMonthExpenses.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = currentMonthIncomes.reduce((sum, item) => sum + item.amount, 0);
  
  const totalPaidObligations = currentMonthPayments
    .filter(p => currentMonthObligations.some(o => o.id === p.obligationId))
    .reduce((sum, item) => sum + item.amountPaid, 0);

  const totalCumulativeSavings = useMemo(() => {
     const allIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
     const allExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
     const allObligations = obligationPayments.reduce((sum, p) => sum + p.amountPaid, 0);
     const pendingDebtsValue = debts.filter(d => !d.isReturned).reduce((sum, d) => sum + d.amount, 0);
     
     // Wealth = Income - Spent - (Outflow to others which is still yours but not in hand)
     // Actually, wealth includes money lent but not returned.
     const netOperations = allIncome - (allExpense + allObligations);
     const startBalance = openingSavings ? openingSavings.totalOpeningQAR : 0;
     return startBalance + netOperations; // Note: debts lent reduce current cash but are part of wealth
  }, [incomes, expenses, obligationPayments, openingSavings, debts]);

  const calculatedTotalBudget = useMemo(() => {
      const values = Object.values(activeBudget.categoryLimits) as number[];
      const sum = values.reduce((a, b) => a + b, 0);
      return sum > 0 ? sum : activeBudget.limit;
  }, [activeBudget]);

  const overBudgetCategories = useMemo(() => {
    const totals = currentMonthExpenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(activeBudget.categoryLimits).filter(cat => {
      const limit = activeBudget.categoryLimits[cat];
      return limit > 0 && (totals[cat] || 0) > limit;
    });
  }, [currentMonthExpenses, activeBudget]);

  // --- Handlers ---
  const handleAddExpense = (expense: Expense) => setExpenses(prev => [expense, ...prev]);
  const handleDeleteExpense = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));
  
  const handleAddIncome = (income: Income) => setIncomes(prev => [income, ...prev]);
  const handleDeleteIncome = (id: string) => setIncomes(prev => prev.filter(i => i.id !== id));

  const handleAddObligation = (ob: Obligation) => setObligations(prev => [...prev, ob]);
  const handleDeleteObligation = (id: string) => {
    setObligations(prev => prev.filter(o => o.id !== id));
    setObligationPayments(prev => prev.filter(p => p.obligationId !== id));
  };
  const handleTogglePayment = (obligationId: string, amount: number) => {
      const existing = obligationPayments.find(p => p.obligationId === obligationId && p.monthKey === currentMonthKey);
      if (existing) {
          setObligationPayments(prev => prev.filter(p => p.id !== existing.id));
      } else {
          const newPayment: ObligationPayment = {
              id: Math.random().toString(36).substring(2, 9),
              obligationId,
              monthKey: currentMonthKey,
              amountPaid: amount,
              datePaid: new Date().toISOString()
          };
          setObligationPayments(prev => [...prev, newPayment]);
      }
  };

  const handleAddDebt = (debt: Debt) => setDebts(prev => [debt, ...prev]);
  const handleDeleteDebt = (id: string) => setDebts(prev => prev.filter(d => d.id !== id));
  const handleToggleDebtReturn = (id: string) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, isReturned: !d.isReturned } : d));
  };

  const updateBudgetForMonth = (updater: (prevBudget: Budget) => Budget) => {
      setBudgets(prev => {
          const startingBudget = prev[currentMonthKey] || activeBudget;
          return { ...prev, [currentMonthKey]: updater(startingBudget) };
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('app_session_user');
    sessionStorage.removeItem('app_session_user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowSettings(false);
    window.location.reload();
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={(user, rememberMe) => {
        if (rememberMe) {
            localStorage.setItem('app_session_user', user);
        } else {
            sessionStorage.setItem('app_session_user', user);
        }
        setCurrentUser(user);
        setIsLoggedIn(true);
    }} />;
  }

  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const currentMonthName = monthNames[selectedDate.getMonth()];
  const currentYear = selectedDate.getFullYear();

  return (
    <div className="min-h-screen bg-gray-50 text-right font-sans" dir="rtl">
      <div className="max-w-lg mx-auto min-h-screen flex flex-col">
        
        {/* Header */}
        <header className="p-4 bg-white shadow-sm sticky top-0 z-40">
             <div className="flex justify-between items-center mb-3">
                <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-l from-indigo-700 to-blue-600 flex items-center gap-1">
                   <span>CashFlowy</span>
                   <span className="text-xl">💸</span>
                </h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowYearlyReport(true)} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-2 rounded-full hover:bg-indigo-100 font-bold">
                      تقرير السنة
                    </button>
                    <button onClick={() => setShowSettings(true)} className="p-2 text-gray-500 bg-gray-50 rounded-full hover:bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                    </button>
                </div>
             </div>

             {/* Month Navigation */}
             <div className="flex items-center justify-between bg-gray-100 rounded-xl p-1 mb-3">
                <button onClick={() => setSelectedDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-2 hover:bg-white rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
                <span className="font-bold text-gray-800">{currentMonthName} {currentYear}</span>
                <button onClick={() => setSelectedDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-2 hover:bg-white rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                </button>
             </div>

             {/* Tab Navigation */}
             <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto no-scrollbar gap-1">
                 <button onClick={() => setCurrentView('dashboard')} className={`flex-1 py-2 px-4 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${currentView === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>الرئيسية</button>
                 <button onClick={() => setCurrentView('income')} className={`flex-1 py-2 px-4 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${currentView === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}>الدخل</button>
                 <button onClick={() => setCurrentView('obligations')} className={`flex-1 py-2 px-4 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${currentView === 'obligations' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>الالتزامات</button>
                 <button onClick={() => setCurrentView('debts')} className={`flex-1 py-2 px-4 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${currentView === 'debts' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}>الديون</button>
                 <button onClick={() => setCurrentView('savings')} className={`flex-1 py-2 px-4 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${currentView === 'savings' ? 'bg-white text-yellow-600 shadow-sm' : 'text-gray-500'}`}>المدخرات</button>
             </div>
        </header>

        <main className="flex-1 p-4">
          {currentView === 'dashboard' && (
            <>
              <BudgetCard 
                totalIncome={totalIncome}
                totalExpenses={totalSpentExpenses}
                totalObligations={totalPaidObligations}
                budgetLimit={calculatedTotalBudget}
                currency={currency}
                overBudgetCategories={overBudgetCategories}
                selectedDate={selectedDate}
                thresholds={activeBudget.alertThresholds}
                openingSavings={openingSavings}
                totalCumulativeSavings={totalCumulativeSavings}
              />
              
              <DashboardCharts expenses={currentMonthExpenses} />

              <CategoryBudgetList 
                expenses={currentMonthExpenses}
                categoryLimits={activeBudget.categoryLimits}
                currency={currency}
                onUpdateCategoryLimit={(c, l) => updateBudgetForMonth(prev => ({ ...prev, categoryLimits: { ...prev.categoryLimits, [c]: l } }))}
                thresholds={activeBudget.alertThresholds}
              />
              <ExpenseList expenses={currentMonthExpenses} onDelete={handleDeleteExpense} />
            </>
          )}

          {currentView === 'income' && (
              <IncomeManager 
                incomes={currentMonthIncomes}
                onAddIncome={handleAddIncome}
                onDeleteIncome={handleDeleteIncome}
                currency={currency}
              />
          )}

          {currentView === 'obligations' && (
              <ObligationManager 
                obligations={currentMonthObligations}
                payments={obligationPayments}
                onAddObligation={handleAddObligation}
                onTogglePayment={handleTogglePayment}
                onDeleteObligation={handleDeleteObligation}
                currency={currency}
                selectedDate={selectedDate}
              />
          )}

          {currentView === 'debts' && (
              <DebtManager 
                 debts={debts}
                 onAddDebt={handleAddDebt}
                 onDeleteDebt={handleDeleteDebt}
                 onToggleReturn={handleToggleDebtReturn}
                 currency={currency}
              />
          )}

          {currentView === 'savings' && (
              <SavingsManager 
                 openingSavings={openingSavings}
                 onUpdateOpeningSavings={setOpeningSavings}
                 currency={currency}
              />
          )}
        </main>

        {currentView === 'dashboard' && (
             <ExpenseInput onAddExpense={handleAddExpense} currency={currency} />
        )}

        <SettingsModal 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)}
          thresholds={activeBudget.alertThresholds}
          currentCurrency={currency}
          onSave={(t, newCurrency) => {
              setCurrency(newCurrency);
              updateBudgetForMonth(prev => ({ ...prev, alertThresholds: t }));
          }}
          onLogout={handleLogout}
          username={currentUser || ''}
        />

        <YearlyReportModal 
          isOpen={showYearlyReport}
          onClose={() => setShowYearlyReport(false)}
          expenses={expenses}
          incomes={incomes}
          obligationPayments={obligationPayments}
          budgets={budgets}
          openingSavings={openingSavings}
          debts={debts}
          currentDate={new Date()}
        />
      </div>
    </div>
  );
};
export default App;
