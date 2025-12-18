
import React, { useState } from 'react';
import { Debt } from '../types';

interface DebtManagerProps {
  debts: Debt[];
  onAddDebt: (debt: Debt) => void;
  onDeleteDebt: (id: string) => void;
  onToggleReturn: (id: string) => void;
  currency: string;
}

export const DebtManager: React.FC<DebtManagerProps> = ({ 
  debts, 
  onAddDebt, 
  onDeleteDebt, 
  onToggleReturn,
  currency 
}) => {
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [lentDate, setLentDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName || !amount || !lentDate) return;

    const newDebt: Debt = {
      id: Math.random().toString(36).substring(2, 9),
      personName,
      amount: parseFloat(amount),
      currency,
      lentDate,
      dueDate: dueDate || lentDate,
      isReturned: false,
    };

    onAddDebt(newDebt);
    setPersonName('');
    setAmount('');
    setDueDate('');
  };

  const pendingDebts = debts.filter(d => !d.isReturned);
  const returnedDebts = debts.filter(d => d.isReturned);
  const totalPending = pendingDebts.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6 pb-24">
      {/* Summary Header */}
      <div className="bg-gradient-to-br from-fuchsia-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-fuchsia-100 text-sm font-bold mb-1">إجمالي ديونك عند الناس</p>
        <h2 className="text-4xl font-black mb-1">{totalPending.toLocaleString()} <span className="text-lg font-medium">{currency}</span></h2>
        <p className="text-xs text-white/70">هذه الأموال تدخل ضمن صافي ثروتك التراكمية.</p>
      </div>

      {/* Add Debt Form */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-purple-50">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
           <span className="bg-purple-100 p-1 rounded-lg text-purple-600">✍️</span> تسجيل سلفية جديدة
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="اسم الشخص"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-200 outline-none"
              required
            />
            <input
              type="number"
              placeholder="المبلغ"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-200 outline-none font-bold"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold mr-1">تاريخ السلف</label>
                <input
                    type="date"
                    value={lentDate}
                    onChange={(e) => setLentDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-xs bg-gray-50 focus:ring-2 focus:ring-purple-200 outline-none"
                    required
                />
             </div>
             <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold mr-1">تاريخ الاسترداد المتوقع</label>
                <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-xs bg-gray-50 focus:ring-2 focus:ring-purple-200 outline-none"
                />
             </div>
          </div>
          <button 
            type="submit" 
            className="w-full bg-purple-600 text-white font-black py-3 rounded-xl hover:bg-purple-700 transition-all active:scale-95 shadow-md"
          >
            حفظ الدَيْن
          </button>
        </form>
      </div>

      {/* Pending List */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-700 px-1">ديون قيد الانتظار</h3>
        {pendingDebts.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-dashed text-gray-400 text-sm">لا توجد ديون مسجلة حالياً</div>
        ) : (
            pendingDebts.map(debt => {
                const isOverdue = debt.dueDate && new Date(debt.dueDate) < new Date() && !debt.isReturned;
                return (
                    <div key={debt.id} className={`bg-white p-4 rounded-2xl shadow-sm border ${isOverdue ? 'border-red-100 bg-red-50/10' : 'border-gray-50'} flex justify-between items-center transition-all`}>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => onToggleReturn(debt.id)}
                                className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 hover:bg-purple-100 transition-colors"
                                title="تحديد كَمُحصّل"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <div>
                                <h4 className="font-black text-gray-800 text-sm">{debt.personName}</h4>
                                <div className="flex gap-2 items-center mt-1">
                                    <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-bold">بدأ: {debt.lentDate}</span>
                                    {debt.dueDate && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {isOverdue ? 'متأخر' : 'استحقاق'}: {debt.dueDate}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-gray-800">{debt.amount.toLocaleString()} {currency}</p>
                            <button onClick={() => onDeleteDebt(debt.id)} className="text-[10px] text-red-400 hover:text-red-600 font-bold mt-1">حذف</button>
                        </div>
                    </div>
                );
            })
        )}
      </div>

      {/* Returned List (Collapsible/Simpler) */}
      {returnedDebts.length > 0 && (
          <div className="space-y-3 opacity-60">
             <h3 className="font-bold text-gray-400 px-1 text-sm">ديون تم تحصيلها</h3>
             {returnedDebts.map(debt => (
                 <div key={debt.id} className="bg-gray-100 p-3 rounded-xl flex justify-between items-center grayscale">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="font-bold text-gray-600 text-sm line-through">{debt.personName}</span>
                    </div>
                    <div className="text-right">
                        <span className="font-bold text-gray-600 text-sm">{debt.amount.toLocaleString()} {currency}</span>
                        <button onClick={() => onDeleteDebt(debt.id)} className="block text-[10px] text-gray-400 hover:text-red-400 mt-1">مسح</button>
                    </div>
                 </div>
             ))}
          </div>
      )}
    </div>
  );
};
