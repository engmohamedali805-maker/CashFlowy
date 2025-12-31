
import React, { useState, useEffect, useMemo } from 'react';
import { Expense, BudgetMap, Income, Obligation, ObligationPayment, OpeningSavings, Debt } from './types';
import { ExpenseInput } from './components/ExpenseInput';
import { BudgetCard } from './components/BudgetCard';
import { DashboardCharts } from './components/DashboardCharts';
import { ExpenseList } from './components/ExpenseList';
import { SettingsModal } from './components/SettingsModal';
import { IncomeManager } from './components/IncomeManager';
import { ObligationManager } from './components/ObligationManager';
import { SavingsManager } from './components/SavingsManager';
import { DebtManager } from './components/DebtManager';
import { CategoryBudgetList } from './components/CategoryBudgetList';
import { dataService } from './services/dataService';

const DEFAULT_USER = 'guest_user';

const App: React.FC = () => {
  const [currentUser] = useState<string>(DEFAULT_USER);
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
    const localData = localStorage.getItem(`data_${DEFAULT_USER}`);
    if (localData) {
      applyState(JSON.parse(localData));
      setIsLoading(false);
    }
    
    const syncFromCloud = async () => {
      try {
        const state = await dataService.fetchState(DEFAULT_USER);
        if (state && Object.keys(state).length > 0) applyState(state);
      } catch (e) {
        console.warn("Cloud sync unavailable");
      } finally {
        setIsLoading(false);
      }
    };
    syncFromCloud();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const stateToSync = {
      expenses, incomes, obligations, obligationPayments, openingSavings, budgets, debts, currency
    };
    
    localStorage.setItem(`data_${DEFAULT_USER}`, JSON.stringify(stateToSync));

    const timer = setTimeout(async () => {
      setIsSyncing(true);
      try {
        await dataService.syncState(DEFAULT_USER, stateToSync);
      } catch (e) {
        console.error("Cloud sync failed");
      } finally {
        setIsSyncing(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [expenses, incomes, obligations, obligationPayments, openingSavings, budgets, debts, currency, isLoading]);

  const currentMonthKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
  
  const activeBudget = useMemo(() => {
    return budgets[currentMonthKey] || {
      limit: 2000,
      currency: currency,
      categoryLimits: {},
      alertThresholds: { warning: 75, critical: 90 }
    };
  }, [budgets, currentMonthKey, currency]);

  const updateCategoryLimit = (category: string, limit: number) => {
    setBudgets(prev => ({
      ...prev,
      [currentMonthKey]: {
        ...activeBudget,
        categoryLimits: {
          ...activeBudget.categoryLimits,
          [category]: limit
        }
      }
    }));
  };

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

  const handleMonthChange = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

  return (
    <div className="min-h-screen bg-gray-50 text-right font-sans mb-32" dir="rtl">
      <div className={`fixed top-0 left-0 right-0 h-0.5 z-[100] transition-opacity duration-300 ${isSyncing ? 'opacity-100' : 'opacity-0'}`}>
        <div className="h-full bg-blue-500 animate-[shimmer_1.5s_infinite]"></div>
      </div>

      <div className="max-w-lg mx-auto">
        <header className="p-4 bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-blue-600 flex items-center gap-1 leading-none">
                <span>CashFlowy</span>
                <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-orange-400 animate-pulse' : 'bg-emerald-400'}`}></span>
              </h1>
              <span className="text-[10px] text-gray-400 font-bold mr-0.5 mt-0.5">فلوسك تحت السيطرة</span>
            </div>
            <button onClick={() => setShowSettings(true)} className="w-9 h-9 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 shadow-sm active:scale-90 transition-all">⚙️</button>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1 overflow-x-auto no-scrollbar">
            {['dashboard', 'income', 'obligations', 'debts', 'savings'].map((v) => (
              <button 
                key={v}
                onClick={() => setCurrentView(v as any)}
                className={`flex-1 py-2 px-3 text-[11px] font-black rounded-lg whitespace-nowrap transition-all ${currentView === v ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
              >
                {v === 'dashboard' ? 'الرئيسية' : v === 'income' ? 'الدخل' : v === 'obligations' ? 'الالتزامات' : v === 'debts' ? 'الديون' : 'المدخرات'}
              </button>
            ))}
          </div>
        </header>

        {/* عداد الشهور */}
        <div className="px-4 py-2 mt-2">
            <div className="bg-white rounded-2xl p-2 flex items-center justify-between shadow-sm border border-gray-100">
                <button 
                    onClick={() => handleMonthChange(-1)} 
                    className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-blue-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </button>
                <div className="text-center flex flex-col items-center">
                    <span className="text-sm font-black text-gray-800">{monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}</span>
                    <button 
                        onClick={() => setSelectedDate(new Date())}
                        className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter"
                    >
                        العودة لليوم
                    </button>
                </div>
                <button 
                    onClick={() => handleMonthChange(1)} 
                    className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-blue-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>

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
              
              {/* استعادة ميزانيات الأقسام */}
              <CategoryBudgetList 
                expenses={currentMonthExpenses}
                categoryLimits={activeBudget.categoryLimits}
                currency={currency}
                onUpdateCategoryLimit={updateCategoryLimit}
                thresholds={activeBudget.alertThresholds}
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

        {currentView === 'dashboard' && (
          <ExpenseInput 
            onAddExpense={(e) => {
                // Ensure expense date matches the month of the selected view if it's not today
                const today = new Date();
                const expenseDate = (selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear())
                    ? today.toISOString().split('T')[0]
                    : new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).toISOString().split('T')[0];
                
                setExpenses(prev => [{ ...e, date: expenseDate }, ...prev]);
            }} 
            currency={currency} 
          />
        )}

        <SettingsModal 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)}
          thresholds={activeBudget.alertThresholds}
          currentCurrency={currency}
          onSave={(t, c) => { setCurrency(c); }}
          username={currentUser}
        />
      </div>
    </div>
  );
};

export default App;
