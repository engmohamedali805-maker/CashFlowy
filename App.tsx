
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Expense, Budget, BudgetMap, Income, Obligation, ObligationPayment, OpeningSavings, Debt } from './types';
import { ExpenseInput } from './components/ExpenseInput';
import { BudgetCard } from './components/BudgetCard';
import { DashboardCharts } from './components/DashboardCharts';
import { ExpenseList } from './components/ExpenseList';
import { SettingsModal } from './components/SettingsModal';
import { IncomeManager } from './components/IncomeManager';
import { ObligationManager } from './components/ObligationManager';
import { SavingsManager } from './components/SavingsManager';
import { DebtManager } from './components/DebtManager';
import { LoginScreen } from './components/LoginScreen';
import { dataService } from './services/dataService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('app_session_user') || sessionStorage.getItem('app_session_user');
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!currentUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      const localKey = `data_${currentUser}`;
      const localData = localStorage.getItem(localKey);
      if (localData) {
        applyState(JSON.parse(localData));
      }

      const initLoad = async () => {
        setIsLoading(true);
        try {
          const state = await dataService.fetchState(currentUser);
          if (state) applyState(state);
        } catch (e) {
          console.warn("Cloud fetch failed, using local data.");
        }
        setIsLoading(false);
      };
      initLoad();
    }
  }, [isLoggedIn, currentUser]);

  const applyState = (state: any) => {
    if (!state) return;
    if (state.expenses) setExpenses(state.expenses);
    if (state.incomes) setIncomes(state.incomes);
    if (state.obligations) setObligations(state.obligations);
    if (state.obligationPayments) setObligationPayments(state.obligationPayments);
    if (state.openingSavings) setOpeningSavings(state.openingSavings);
    if (state.budgets) setBudgets(state.budgets);
    if (state.debts) setDebts(state.debts);
    if (state.currency) setCurrency(state.currency);
  };

  useEffect(() => {
    if (!isLoggedIn || !currentUser || isLoading) return;

    const stateToSync = {
      expenses, incomes, obligations, obligationPayments, openingSavings, budgets, debts, currency
    };
    
    localStorage.setItem(`data_${currentUser}`, JSON.stringify(stateToSync));

    const timer = setTimeout(async () => {
      setIsSyncing(true);
      try {
        await dataService.syncState(currentUser, stateToSync);
      } catch (e) {
        console.error("Cloud sync failed", e);
      } finally {
        setIsSyncing(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [expenses, incomes, obligations, obligationPayments, openingSavings, budgets, debts, currency]);

  const currentMonthKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
  
  const activeBudget = useMemo(() => {
    return budgets[currentMonthKey] || {
      limit: 2000,
      currency: currency,
      categoryLimits: {},
      alertThresholds: { warning: 75, critical: 90 }
    };
  }, [budgets, currentMonthKey, currency]);

  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonthKey));
  const currentMonthIncomes = incomes.filter(i => i.date.startsWith(currentMonthKey));
  const totalSpentExpenses = currentMonthExpenses.reduce((sum, item) => sum + item.amount, 0);
  const totalIncomeMonth = currentMonthIncomes.reduce((sum, item) => sum + item.amount, 0);

  const totalCumulativeWealth = useMemo(() => {
    const opening = openingSavings ? openingSavings.totalOpeningQAR : 0;
    const allIncomes = incomes.reduce((sum, i) => sum + i.amount, 0);
    const allExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const allObligationsPaid = obligationPayments.reduce((sum, p) => sum + p.amountPaid, 0);
    return (opening + allIncomes) - (allExpenses + allObligationsPaid);
  }, [openingSavings, incomes, expenses, obligationPayments]);

  const handleLogout = () => {
    localStorage.removeItem('app_session_user');
    sessionStorage.removeItem('app_session_user');
    window.location.reload();
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={(user, state, remember) => {
      if (remember) localStorage.setItem('app_session_user', user);
      else sessionStorage.setItem('app_session_user', user);
      applyState(state);
      setCurrentUser(user);
      setIsLoggedIn(true);
    }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-right font-sans mb-32" dir="rtl">
      <div className={`fixed top-0 left-0 right-0 h-1 z-[100] transition-opacity duration-300 ${isSyncing ? 'opacity-100' : 'opacity-0'}`}>
        <div className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-[shimmer_1.5s_infinite]"></div>
      </div>

      <div className="max-w-lg mx-auto">
        <header className="p-4 bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-blue-600 flex items-center gap-1 leading-none">
                <span>CashFlowy</span>
                <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-orange-400 animate-pulse' : 'bg-emerald-400'}`}></span>
              </h1>
              <span className="text-[10px] text-gray-400 font-bold mr-0.5 mt-0.5">فلوسك تحت السيطرة</span>
            </div>
            <div className="flex gap-2">
               <button onClick={() => setShowSettings(true)} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100 shadow-sm active:scale-90 transition-all">⚙️</button>
            </div>
          </div>
          
          <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 overflow-x-auto no-scrollbar">
            {['dashboard', 'income', 'obligations', 'debts', 'savings'].map((v) => (
              <button 
                key={v}
                onClick={() => setCurrentView(v as any)}
                className={`flex-1 py-2.5 px-4 text-xs font-black rounded-xl whitespace-nowrap transition-all ${currentView === v ? 'bg-white text-blue-600 shadow-md ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-800'}`}
              >
                {v === 'dashboard' ? 'الرئيسية' : v === 'income' ? 'الدخل' : v === 'obligations' ? 'الالتزامات' : v === 'debts' ? 'الديون' : 'المدخرات'}
              </button>
            ))}
          </div>
        </header>

        {isLoading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-gray-600 font-black text-lg">جاري استرجاع بياناتك...</p>
          </div>
        ) : (
          <main className="p-4 space-y-4">
            {currentView === 'dashboard' && (
              <>
                <BudgetCard 
                  totalIncome={totalIncomeMonth}
                  totalExpenses={totalSpentExpenses}
                  totalObligations={obligationPayments.filter(p => p.monthKey === currentMonthKey).reduce((s, p) => s + p.amountPaid, 0)}
                  budgetLimit={activeBudget.limit}
                  currency={currency}
                  overBudgetCategories={[]}
                  selectedDate={selectedDate}
                  thresholds={activeBudget.alertThresholds}
                  openingSavings={openingSavings}
                  totalCumulativeSavings={totalCumulativeWealth}
                />
                <DashboardCharts expenses={currentMonthExpenses} />
                <ExpenseList expenses={currentMonthExpenses} onDelete={(id) => setExpenses(prev => prev.filter(e => e.id !== id))} />
              </>
            )}
            {currentView === 'income' && <IncomeManager incomes={currentMonthIncomes} onAddIncome={(i) => setIncomes(prev => [...prev, i])} onDeleteIncome={(id) => setIncomes(prev => prev.filter(x => x.id !== id))} currency={currency} />}
            {currentView === 'obligations' && <ObligationManager obligations={obligations} payments={obligationPayments} onAddObligation={(o) => setObligations(prev => [...prev, o])} onTogglePayment={(id, amt) => {
               const existing = obligationPayments.find(p => p.obligationId === id && p.monthKey === currentMonthKey);
               if (existing) setObligationPayments(prev => prev.filter(p => p.id !== existing.id));
               else setObligationPayments(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), obligationId: id, monthKey: currentMonthKey, amountPaid: amt, datePaid: new Date().toISOString() }]);
            }} onDeleteObligation={(id) => setObligations(prev => prev.filter(x => x.id !== id))} currency={currency} selectedDate={selectedDate} />}
            {currentView === 'debts' && <DebtManager debts={debts} onAddDebt={(d) => setDebts(prev => [...prev, d])} onDeleteDebt={(id) => setDebts(prev => prev.filter(x => x.id !== id))} onToggleReturn={(id) => setDebts(prev => prev.map(x => x.id === id ? {...x, isReturned: !x.isReturned} : x))} currency={currency} />}
            {currentView === 'savings' && <SavingsManager openingSavings={openingSavings} onUpdateOpeningSavings={setOpeningSavings} currency={currency} />}
          </main>
        )}

        {currentView === 'dashboard' && !isLoading && (
          <ExpenseInput 
            onAddExpense={(e) => setExpenses(prev => [e, ...prev])} 
            currency={currency} 
          />
        )}

        <SettingsModal 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)}
          thresholds={activeBudget.alertThresholds}
          currentCurrency={currency}
          onSave={(t, c) => { setCurrency(c); }}
          onLogout={handleLogout}
          username={currentUser || ''}
        />
      </div>
    </div>
  );
};
export default App;
