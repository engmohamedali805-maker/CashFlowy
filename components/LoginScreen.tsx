
import React, { useState } from 'react';
import { dataService } from '../services/dataService';

interface LoginScreenProps {
  onLogin: (username: string, state: any, rememberMe: boolean) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      setLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        await dataService.register(username, password);
        onLogin(username, {}, rememberMe);
      } else {
        const state = await dataService.login(username, password);
        onLogin(username, state, rememberMe);
      }
    } catch (err: any) {
      setError(err.message === 'Invalid username or password' ? 'خطأ في البيانات' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 to-blue-600 flex items-center justify-center p-6 text-right font-sans" dir="rtl">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 animate-[fadeIn_0.5s_ease-out]">
        <div className="text-center mb-8">
            <div className="text-5xl mb-4">💸</div>
            <h1 className="text-3xl font-black text-gray-800 mb-2">CashFlowy</h1>
            <p className="text-gray-500 text-sm font-bold">بياناتك الآن في السحاب ☁️</p>
        </div>

        <form onSubmit={handleAction} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2 mr-1">اسم المستخدم</label>
            <input 
              type="text" 
              className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl p-4 outline-none transition-all font-bold text-gray-700 text-right"
              placeholder="مثال: ahmed88"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2 mr-1">كلمة المرور</label>
            <input 
              type="password" 
              className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl p-4 outline-none transition-all font-bold text-gray-700 text-right"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-2 px-1">
            <input 
              type="checkbox" 
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              disabled={loading}
            />
            <label htmlFor="rememberMe" className="text-sm font-bold text-gray-600 cursor-pointer select-none">
              تذكرني على هذا الجهاز
            </label>
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center animate-pulse">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                isRegistering ? 'إنشاء حساب سحابي' : 'دخول'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
            <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-blue-600 text-sm font-bold hover:underline"
                disabled={loading}
            >
                {isRegistering ? 'لديك حساب بالفعل؟ سجل دخولك' : 'ليس لديك حساب؟ اشترك الآن'}
            </button>
        </div>
      </div>
    </div>
  );
};
