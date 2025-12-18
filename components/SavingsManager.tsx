import React, { useState, useEffect } from 'react';
import { OpeningSavings } from '../types';

interface SavingsManagerProps {
  openingSavings: OpeningSavings | null;
  onUpdateOpeningSavings: (data: OpeningSavings) => void;
  currency: string;
}

export const SavingsManager: React.FC<SavingsManagerProps> = ({ 
  openingSavings, 
  onUpdateOpeningSavings,
  currency 
}) => {
  const [cashUSD, setCashUSD] = useState(openingSavings?.cashUSD?.toString() || '');
  const [goldGrams, setGoldGrams] = useState(openingSavings?.goldGrams?.toString() || '');
  const [goldPrice, setGoldPrice] = useState(openingSavings?.goldPricePerGramQAR?.toString() || '250');
  
  // Default exchange rates logic
  const getDefaultRate = (curr: string) => {
      switch(curr) {
          case 'QAR': return 3.65;
          case 'SAR': return 3.75;
          case 'AED': return 3.67;
          case 'EGP': return 50.0; // Example approximate
          case 'EUR': return 0.92;
          case 'USD': return 1.0;
          default: return 1.0;
      }
  };

  const [usdRate, setUsdRate] = useState(
      openingSavings?.usdToQarRate?.toString() || getDefaultRate(currency).toString()
  );

  // Update default rate suggestion if currency changes and no prior custom rate was set
  useEffect(() => {
     if (!openingSavings) {
         setUsdRate(getDefaultRate(currency).toString());
     }
  }, [currency, openingSavings]);

  // Calculate live values
  const rate = parseFloat(usdRate) || 0;
  const cashLocal = (parseFloat(cashUSD) || 0) * rate;
  const goldLocal = (parseFloat(goldGrams) || 0) * (parseFloat(goldPrice) || 0);
  const totalLocal = cashLocal + goldLocal;

  const handleSave = () => {
    const newData: OpeningSavings = {
      year: new Date().getFullYear(),
      cashUSD: parseFloat(cashUSD) || 0,
      usdToQarRate: parseFloat(usdRate) || getDefaultRate(currency),
      goldGrams: parseFloat(goldGrams) || 0,
      goldPricePerGramQAR: parseFloat(goldPrice) || 0,
      totalOpeningQAR: totalLocal // Stored as "QAR" in type but represents Local Currency effectively
    };
    onUpdateOpeningSavings(newData);
    alert('تم تحديث الرصيد الافتتاحي بنجاح');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Hero Card: Total Opening Wealth */}
      <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
         
         <div className="relative z-10 text-center">
             <p className="text-yellow-100 font-bold mb-1 text-sm">إجمالي الرصيد الافتتاحي (بداية السنة)</p>
             <h2 className="text-4xl font-black tracking-tight mb-4">
                 {totalLocal.toLocaleString()} <span className="text-xl font-medium">{currency}</span>
             </h2>
             
             <div className="flex justify-center gap-4 text-xs font-bold text-yellow-900 bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                 <div className="flex items-center gap-1">
                     <span className="w-2 h-2 rounded-full bg-green-300"></span>
                     <span>نقد: {cashLocal.toLocaleString()}</span>
                 </div>
                 <div className="w-[1px] bg-yellow-900/20"></div>
                 <div className="flex items-center gap-1">
                     <span className="w-2 h-2 rounded-full bg-yellow-300"></span>
                     <span>ذهب: {goldLocal.toLocaleString()}</span>
                 </div>
             </div>
         </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 flex items-start gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p>هذا الرصيد لا يُعتبر دخلاً شهرياً، بل هو أساس لحساب إجمالي ثروتك ومدخراتك التراكمية.</p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-6">
         <h3 className="font-bold text-gray-800 border-b pb-2">إعداد الأصول الافتتاحية</h3>
         
         {/* Cash Section */}
         <div className="space-y-3">
             <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-gray-600 flex items-center gap-2">
                    <span className="text-green-600">💵</span> نقد / عملات (دولار أمريكي)
                </label>
                <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg">
                    <label className="text-[10px] text-gray-500">سعر الصرف:</label>
                    <input 
                        type="number"
                        value={usdRate}
                        onChange={(e) => setUsdRate(e.target.value)}
                        className="w-16 bg-white border rounded px-1 text-xs font-bold text-center outline-none focus:ring-1 focus:ring-green-500"
                    />
                </div>
             </div>
             
             <div className="flex gap-3">
                 <div className="flex-1">
                    <input 
                        type="number" 
                        value={cashUSD}
                        onChange={(e) => setCashUSD(e.target.value)}
                        placeholder="المبلغ بالدولار $"
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                    />
                 </div>
                 <div className="bg-gray-50 px-3 py-2 rounded-xl border flex flex-col items-center justify-center min-w-[80px]">
                     <span className="text-[10px] text-gray-400">القيمة ({currency})</span>
                     <span className="font-bold text-gray-700">{cashLocal.toLocaleString()}</span>
                 </div>
             </div>
         </div>

         {/* Gold Section */}
         <div className="space-y-3 pt-2 border-t border-dashed">
             <label className="text-sm font-bold text-gray-600 flex items-center gap-2">
                 <span className="text-yellow-600">🏆</span> سبائك / ذهب (عيار 24)
             </label>
             <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="text-[10px] text-gray-400 block mb-1">الوزن (جرام)</label>
                    <input 
                        type="number" 
                        value={goldGrams}
                        onChange={(e) => setGoldGrams(e.target.value)}
                        placeholder="جرام"
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-500 outline-none"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] text-gray-400 block mb-1">سعر الجرام ({currency})</label>
                    <input 
                        type="number" 
                        value={goldPrice}
                        onChange={(e) => setGoldPrice(e.target.value)}
                        placeholder="سعر اليوم"
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-500 outline-none"
                    />
                 </div>
             </div>
             <div className="bg-yellow-50 p-3 rounded-xl flex justify-between items-center">
                 <span className="text-xs text-yellow-700 font-bold">قيمة الذهب:</span>
                 <span className="font-bold text-yellow-800">{goldLocal.toLocaleString()} {currency}</span>
             </div>
         </div>

         <button 
            onClick={handleSave}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-lg"
         >
            حفظ وتحديث الرصيد
         </button>
      </div>
    </div>
  );
};