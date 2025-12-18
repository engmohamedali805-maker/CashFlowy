
import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(() => {
    const users = localStorage.getItem('app_users');
    return !users; // Show registration if no users exist
  });
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    const usersStr = localStorage.getItem('app_users');
    const users = usersStr ? JSON.parse(usersStr) : {};

    if (isRegistering) {
      if (users[username]) {
        setError('اسم المستخدم موجود بالفعل');
        return;
      }
      users[username] = password;
      localStorage.setItem('app_users', JSON.stringify(users));
      onLogin(username);
    } else {
      if (users[username] === password) {
        onLogin(username);
      } else {
        setError('خطأ في اسم المستخدم أو كلمة المرور');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 to-blue-600 flex items-center justify-center p-6 text-right font-sans" dir="rtl">
      <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 animate-[fadeIn_0.5s_ease-out]">
        <div className="text-center mb-8">
            <div className="text-5xl mb-4">💸</div>
            <h1 className="text-3xl font-black text-gray-800 mb-2">CashFlowy</h1>
            <p className="text-gray-500 text-sm font-bold">إدارة أموالك بذكاء وبساطة</p>
        </div>

        <form onSubmit={handleAction} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2 mr-1">اسم المستخدم</label>
            <input 
              type="text" 
              className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl p-4 outline-none transition-all font-bold text-gray-700"
              placeholder="مثال: ahmed88"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2 mr-1">كلمة المرور</label>
            <input 
              type="password" 
              className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl p-4 outline-none transition-all font-bold text-gray-700"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center animate-bounce">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            {isRegistering ? 'إنشاء حساب جديد' : 'دخول'}
          </button>
        </form>

        <div className="mt-8 text-center">
            <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-blue-600 text-sm font-bold hover:underline"
            >
                {isRegistering ? 'لديك حساب بالفعل؟ سجل دخولك' : 'ليس لديك حساب؟ اشترك الآن'}
            </button>
        </div>
      </div>
    </div>
  );
};
