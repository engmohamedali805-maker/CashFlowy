
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
        // Login immediately after register
        onLogin(username, {}, rememberMe);
      } else {
        const state = await dataService.login(username, password);
        onLogin(username, state, rememberMe);
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'An error occurred';
      
      // Arabic translations for common errors
      if (msg.includes('User not found') || msg.includes('Account does not exist')) msg = 'هذا الحساب غير موجود';
      if (msg.includes('Incorrect password')) msg = 'كلمة المرور غير صحيحة';
      if (msg.includes('Username already taken')) msg = 'اسم المستخدم مأخوذ بالفعل';
      if (msg.includes('timed out') || msg.includes('fetch')) msg = 'تأكد من اتصالك بالإنترنت';
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 to-blue-600 flex items-center justify-center p-6 text-right font-sans" dir="rtl">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 animate-[fadeIn_0.5s_ease-out] flex flex-col justify-between min-h-[500px]">
        <div>
            <div className="text-center mb-8">
                <div className="text-5xl mb-4">🔐</div>
                <h1 className="text-3xl font-black text-gray-800 mb-2">CashFlowy</h1>
                <p className="text-gray-500 text-sm font-bold">تسجيل الدخول الآمن</p>
            </div>

            <form onSubmit={handleAction} className="space-y-5">
            <div>
                <label className="block text-xs font-black text-gray-400 uppercase mb-2 mr-1">اسم المستخدم</label>
                <input 
                type="text" 
                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl p-4 outline-none transition-all font-bold text-gray-700 text-right"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoCapitalize="none"
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
                حفظ تسجيل الدخول
                </label>
            </div>

            {error && <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-xl text-center border border-red-100">{error}</div>}

            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>جاري الاتصال بالقاعدة...</span>
                    </>
                ) : (
                    isRegistering ? 'إنشاء حساب جديد' : 'دخول'
                )}
            </button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-4">
                <button 
                    onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                    }}
                    className="text-blue-600 text-sm font-bold hover:underline"
                    disabled={loading}
                >
                    {isRegistering ? 'لديك حساب بالفعل؟ سجل دخولك' : 'مستخدم جديد؟ إنشاء حساب'}
                </button>
            </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-50 text-center">
             <a 
                href="https://github.com/engmohamedali805-maker/CashFlowy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-gray-300 font-bold hover:text-blue-500 transition-colors inline-flex items-center gap-1"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                Open Source (GitHub)
            </a>
        </div>
      </div>
    </div>
  );
};
