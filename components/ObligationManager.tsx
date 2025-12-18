import React, { useState, useEffect } from 'react';
import { Obligation, ObligationPayment } from '../types';

interface ObligationManagerProps {
  obligations: Obligation[];
  payments: ObligationPayment[];
  onAddObligation: (ob: Obligation) => void;
  onTogglePayment: (obligationId: string, amount: number) => void;
  onDeleteObligation: (id: string) => void;
  currency: string;
  selectedDate: Date; // To filter and default the date picker
}

export const ObligationManager: React.FC<ObligationManagerProps> = ({ 
  obligations, 
  payments, 
  onAddObligation, 
  onTogglePayment,
  onDeleteObligation,
  currency,
  selectedDate
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  
  // Helper to format date as YYYY-MM-DD
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const [dateInput, setDateInput] = useState(formatDateForInput(new Date()));

  // Update date input when global selected date changes
  useEffect(() => {
    // Determine if we should update the input (e.g., if the user switched months)
    const currentInputDate = new Date(dateInput);
    if (currentInputDate.getMonth() !== selectedDate.getMonth() || currentInputDate.getFullYear() !== selectedDate.getFullYear()) {
         // Default to the 1st of the selected month, or today if it matches the selected month
         const today = new Date();
         if (today.getMonth() === selectedDate.getMonth() && today.getFullYear() === selectedDate.getFullYear()) {
             setDateInput(formatDateForInput(today));
         } else {
             const firstOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
             // Adjust for timezone offset issue in simpler way: set hours to noon
             firstOfMonth.setHours(12, 0, 0, 0); 
             setDateInput(firstOfMonth.toISOString().split('T')[0]);
         }
    }
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !dateInput) return;

    const newOb: Obligation = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      amount: parseFloat(amount),
      currency,
      dueDate: dateInput,
      category: 'General',
      active: true,
    };

    onAddObligation(newOb);
    setName('');
    setAmount('');
    // Keep the date as is for easier multiple entries
  };

  // Sort by Date
  const sortedObligations = [...obligations].sort((a, b) => {
    const isPaidA = payments.some(p => p.obligationId === a.id);
    const isPaidB = payments.some(p => p.obligationId === b.id);
    if (isPaidA === isPaidB) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    return isPaidA ? 1 : -1;
  });

  const totalRequired = obligations.reduce((sum, o) => sum + o.amount, 0);
  const totalPaid = payments.filter(p => obligations.find(o => o.id === p.obligationId)).reduce((sum, p) => sum + p.amountPaid, 0);

  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const selectedMonthName = monthNames[selectedDate.getMonth()];

  return (
    <div className="space-y-6 pb-24">
      {/* Summary Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-md">
         <div className="flex justify-between items-start mb-2">
            <div>
                <p className="text-indigo-100 text-xs">التزامات شهر {selectedMonthName}</p>
                <p className="text-2xl font-bold">{totalRequired.toLocaleString()} {currency}</p>
            </div>
            <div className="text-left">
                <p className="text-indigo-100 text-xs">المدفوع</p>
                <p className="text-xl font-bold">{totalPaid.toLocaleString()} {currency}</p>
            </div>
         </div>
         <div className="w-full bg-black/20 rounded-full h-2 mt-2">
             <div 
                className="bg-white/80 h-2 rounded-full transition-all duration-500"
                style={{ width: `${totalRequired > 0 ? (totalPaid/totalRequired)*100 : 0}%` }}
             ></div>
         </div>
      </div>

      {/* Add Form */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 text-sm">إضافة التزام بتاريخ محدد</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="الاسم (مثال: إيجار، قسط)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded-lg text-sm w-full outline-none focus:ring-2 focus:ring-indigo-200"
              required
            />
             <input
              type="number"
              placeholder="المبلغ"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border p-2 rounded-lg text-sm w-full outline-none focus:ring-2 focus:ring-indigo-200"
              required
            />
          </div>
          
          <div className="flex flex-col gap-1">
             <label className="text-xs text-gray-500 font-bold">تاريخ الاستحقاق:</label>
             <input 
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="border p-2 rounded-lg text-sm w-full outline-none focus:ring-2 focus:ring-indigo-200 bg-gray-50"
                required
             />
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm shadow-md active:scale-95"
          >
            حفظ الالتزام
          </button>
        </form>
      </div>

      {/* List */}
      <div className="space-y-3">
        {sortedObligations.length === 0 ? (
             <p className="text-center text-gray-400 py-4 text-sm">لا توجد التزامات مسجلة في {selectedMonthName}</p>
        ) : (
            sortedObligations.map(ob => {
                const isPaid = payments.some(p => p.obligationId === ob.id);
                const dateObj = new Date(ob.dueDate);
                const day = dateObj.getDate();
                const month = monthNames[dateObj.getMonth()];

                return (
                    <div key={ob.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${isPaid ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-indigo-100 shadow-sm'}`}>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => onTogglePayment(ob.id, ob.amount)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isPaid ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-indigo-500'}`}
                            >
                                {isPaid && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </button>
                            <div>
                                <p className={`font-bold text-sm ${isPaid ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{ob.name}</p>
                                <p className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                                    {day} {month}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-gray-700 text-sm">{ob.amount.toLocaleString()} {currency}</p>
                            <button onClick={() => onDeleteObligation(ob.id)} className="text-[10px] text-red-400 hover:text-red-600 block mt-1 ml-auto">حذف</button>
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};