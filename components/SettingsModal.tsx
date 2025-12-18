
import React, { useState, useEffect, useRef } from 'react';
import { AlertThresholds } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: AlertThresholds;
  onSave: (newThresholds: AlertThresholds, newCurrency: string) => void;
  currentCurrency: string;
  onLogout: () => void;
  username: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  thresholds, 
  onSave, 
  currentCurrency,
  onLogout,
  username
}) => {
  const [warning, setWarning] = useState(thresholds.warning);
  const [critical, setCritical] = useState(thresholds.critical);
  const [currency, setCurrency] = useState(currentCurrency);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setWarning(thresholds.warning);
      setCritical(thresholds.critical);
      setCurrency(currentCurrency);
    }
  }, [isOpen, thresholds, currentCurrency]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ warning, critical }, currency);
    onClose();
  };

  const handleExportData = () => {
    const userKey = `data_${username}`;
    const data = localStorage.getItem(userKey);
    if (!data) return alert('لا توجد بيانات لتصديرها');

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CashFlowy_Backup_${username}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (confirm('هل أنت متأكد؟ سيؤدي هذا لاستبدال جميع البيانات الحالية بالبيانات الموجودة في الملف.')) {
          const userKey = `data_${username}`;
          localStorage.setItem(userKey, JSON.stringify(json));
          alert('تم استيراد البيانات بنجاح. سيتم إعادة تحميل التطبيق.');
          window.location.reload();
        }
      } catch (err) {
        alert('فشل استيراد الملف. تأكد من أنه ملف بصيغة JSON صحيحة.');
      }
    };
    reader.readAsText(file);
  };

  const currencies = [
      { code: 'QAR', name: 'ريال قطري (QAR)', flag: '🇶🇦' },
      { code: 'SAR', name: 'ريال سعودي (SAR)', flag: '🇸🇦' },
      { code: 'AED', name: 'درهم إماراتي (AED)', flag: '🇦🇪' },
      { code: 'EGP', name: 'جنيه مصري (EGP)', flag: '🇪🇬' },
      { code: 'USD', name: 'دولار أمريكي ($)', flag: '🇺🇸' },
      { code: 'EUR', name: 'يورو (€)', flag: '🇪🇺' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-xl animate-[fadeIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-gray-800">إعداداتك</h2>
            <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                @{username}
            </div>
        </div>
        
        <div className="space-y-6 mb-8">
          
          {/* Currency Selection */}
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2 mr-1">
              العملة الأساسية
            </label>
            <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full border-2 border-gray-50 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 bg-gray-50 font-bold text-gray-700"
            >
                {currencies.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                ))}
            </select>
          </div>

          <hr className="border-gray-50" />

          {/* Thresholds */}
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 mr-1">
                  التحذير (أصفر) %
                </label>
                <input 
                  type="number" 
                  value={warning} 
                  onChange={(e) => setWarning(Number(e.target.value))}
                  className="w-full border-2 border-gray-50 rounded-2xl px-4 py-3 focus:border-yellow-400 outline-none font-bold text-gray-800 bg-gray-50"
                  min="1" max="100"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 mr-1">
                  الخطر (أحمر) %
                </label>
                <input 
                  type="number" 
                  value={critical} 
                  onChange={(e) => setCritical(Number(e.target.value))}
                  className="w-full border-2 border-gray-50 rounded-2xl px-4 py-3 focus:border-orange-500 outline-none font-bold text-gray-800 bg-gray-50"
                  min="1" max="100"
                />
              </div>
          </div>

          <hr className="border-gray-50" />

          {/* Data Management Section */}
          <div className="space-y-3">
             <label className="block text-xs font-black text-gray-400 uppercase mb-1 mr-1">إدارة البيانات (Backup)</label>
             <div className="grid grid-cols-2 gap-3">
                 <button 
                    onClick={handleExportData}
                    className="flex flex-col items-center justify-center gap-1 bg-emerald-50 text-emerald-600 p-3 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-colors"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    <span className="text-[10px] font-black">تصدير (Backup)</span>
                 </button>
                 <button 
                    onClick={handleImportClick}
                    className="flex flex-col items-center justify-center gap-1 bg-indigo-50 text-indigo-600 p-3 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-colors"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM9.293 3.293a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 6.414V14a1 1 0 11-2 0V6.414L7.707 7.707a1 1 0 01-1.414-1.414l3-3z" clipRule="evenodd" /></svg>
                    <span className="text-[10px] font-black">استيراد (Restore)</span>
                 </button>
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json"
                    onChange={handleFileImport}
                 />
             </div>
          </div>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            حفظ التغييرات
          </button>
          <div className="flex gap-2">
            <button 
                onClick={onLogout}
                className="flex-1 bg-red-50 text-red-600 py-4 rounded-2xl font-black hover:bg-red-100 transition-all active:scale-95 text-sm"
            >
                تسجيل الخروج
            </button>
            <button 
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-black hover:bg-gray-200 transition-all active:scale-95 text-sm"
            >
                إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
