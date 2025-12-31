
import React, { useState, useEffect, useRef } from 'react';
import { AlertThresholds } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: AlertThresholds;
  onSave: (newThresholds: AlertThresholds, newCurrency: string) => void;
  currentCurrency: string;
  username: string; // This is the Sync Key
  onSyncKeyChange: (newKey: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  thresholds, 
  onSave, 
  currentCurrency,
  username,
  onSyncKeyChange
}) => {
  const [warning, setWarning] = useState(thresholds.warning);
  const [critical, setCritical] = useState(thresholds.critical);
  const [currency, setCurrency] = useState(currentCurrency);
  const [newKey, setNewKey] = useState(username);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setWarning(thresholds.warning);
      setCritical(thresholds.critical);
      setCurrency(currentCurrency);
      setNewKey(username);
    }
  }, [isOpen, thresholds, currentCurrency, username]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ warning, critical }, currency);
    if (newKey !== username && newKey.trim() !== '') {
        if (confirm('هل تريد تغيير مفتاح المزامنة؟ سيتم تحميل البيانات الخاصة بالمفتاح الجديد.')) {
            onSyncKeyChange(newKey.trim());
        }
    }
    onClose();
  };

  const copySyncKey = () => {
    navigator.clipboard.writeText(username);
    alert('تم نسخ مفتاح المزامنة. احفظه في مكان آمن!');
  };

  const handleExportData = () => {
    const userKey = `data_${username}`;
    const data = localStorage.getItem(userKey);
    if (!data) return alert('لا توجد بيانات لتصديرها');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CashFlowy_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-xl animate-[fadeIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto no-scrollbar">
        <h2 className="text-xl font-black text-gray-800 mb-6">الإعدادات والمزامنة</h2>
        
        <div className="space-y-6">
          {/* Sync Key Section */}
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
             <label className="block text-[10px] font-black text-blue-600 uppercase mb-2">مفتاح المزامنة الخاص بك</label>
             <div className="flex gap-2">
                <input 
                    type="text"
                    readOnly={!showKeyInput}
                    value={showKeyInput ? newKey : username}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="flex-1 bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs font-black text-blue-800 outline-none"
                />
                {!showKeyInput ? (
                    <button onClick={copySyncKey} className="bg-blue-600 text-white p-2 rounded-xl">📋</button>
                ) : null}
             </div>
             <p className="text-[9px] text-blue-400 mt-2 font-bold">
                استخدم هذا المفتاح على أي جهاز آخر لفتح بياناتك.
             </p>
             <button 
                onClick={() => setShowKeyInput(!showKeyInput)} 
                className="text-[10px] text-blue-600 font-black mt-2 underline"
             >
                {showKeyInput ? 'إلغاء' : 'إدخال مفتاح جهاز آخر'}
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
      </div>
    </div>
  );
};
