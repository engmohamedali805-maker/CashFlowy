
import React, { useState, useEffect, useRef } from 'react';
import { AlertThresholds } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: AlertThresholds;
  onSave: (newThresholds: AlertThresholds, newCurrency: string) => void;
  currentCurrency: string;
  username: string;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  thresholds, 
  onSave, 
  currentCurrency,
  username,
  onLogout
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
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-xl animate-[fadeIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto no-scrollbar">
        <h2 className="text-xl font-black text-gray-800 mb-6">الإعدادات</h2>
        
        <div className="space-y-6">
          {/* Account Section */}
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex justify-between items-center">
             <div>
                <label className="block text-[10px] font-black text-blue-600 uppercase mb-1">الحساب الحالي</label>
                <p className="font-bold text-blue-900 text-sm">{username}</p>
             </div>
             <button onClick={() => { if(confirm('هل أنت متأكد من تسجيل الخروج؟')) { onLogout(); onClose(); } }} className="bg-white text-red-500 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm border border-red-100 hover:bg-red-50">
                خروج
             </button>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2 mr-1">العملة</label>
            <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full border-2 border-gray-50 rounded-2xl px-4 py-3 bg-gray-50 font-bold text-gray-700 outline-none"
            >
                <option value="QAR">🇶🇦 ريال قطري</option>
                <option value="EGP">🇪🇬 جنيه مصري</option>
                <option value="USD">🇺🇸 دولار أمريكي</option>
                <option value="SAR">🇸🇦 ريال سعودي</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 mr-1">تنبيه التحذير %</label>
                <input type="number" value={warning} onChange={(e) => setWarning(Number(e.target.value))} className="w-full border-2 border-gray-50 rounded-2xl p-3 bg-gray-50 font-bold"/>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 mr-1">تنبيه الخطر %</label>
                <input type="number" value={critical} onChange={(e) => setCritical(Number(e.target.value))} className="w-full border-2 border-gray-50 rounded-2xl p-3 bg-gray-50 font-bold"/>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button onClick={handleExportData} className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl text-[10px] font-black border border-emerald-100">تحميل نسخة احتياطية</button>
             <button onClick={() => fileInputRef.current?.click()} className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl text-[10px] font-black border border-indigo-100">استعادة من ملف</button>
             <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    // Just update local storage for safety, reload handles state
                    localStorage.setItem(`data_${username}`, ev.target?.result as string);
                    window.location.reload();
                };
                reader.readAsText(file);
             }} />
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button onClick={handleSave} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 active:scale-95 transition-all">حفظ التغييرات</button>
          <button onClick={onClose} className="w-full bg-gray-100 text-gray-700 py-3 rounded-2xl font-black text-sm">إغلاق</button>
        </div>

        <div className="mt-6 text-center">
            <a 
                href="https://github.com/engmohamedali805-maker/CashFlowy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-gray-400 font-bold hover:text-blue-500 transition-colors flex items-center justify-center gap-1"
            >
                <span>Github Repository</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
        </div>
      </div>
    </div>
  );
};
