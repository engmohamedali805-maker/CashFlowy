
export const dataService = {
  /**
   * جلب البيانات من السحابة باستخدام مفتاح المزامنة (Sync Key)
   */
  async fetchState(syncKey: string) {
    if (!syncKey) return null;
    try {
      const response = await fetch(`/api/data?username=${encodeURIComponent(syncKey)}`);
      
      if (!response.ok) {
        // إذا لم يجد بيانات (404 مثلاً أو مستخدم جديد) لا نعتبره خطأ فادحاً
        if (response.status === 404) return null;
        throw new Error(`Cloud error: ${response.status}`);
      }

      const data = await response.json();
      return data.state;
    } catch (err) {
      console.warn('Network issue fetching data from cloud, using local cache if available.');
      return null;
    }
  },

  /**
   * مزامنة الحالة الكاملة للتطبيق مع قاعدة بيانات Neon
   */
  async syncState(syncKey: string, state: any) {
    if (!syncKey) return;
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'sync', 
          username: syncKey, 
          state 
        }),
      });

      if (!response.ok) {
        throw new Error('Sync failed on server');
      }
      return await response.json();
    } catch (err) {
      console.error('Cloud sync failed - data is saved locally for now');
      throw err;
    }
  },

  /**
   * تسجيل حساب سحابي جديد محمي بكلمة مرور
   */
  async register(username: string, password: string): Promise<void> {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'فشل في إنشاء الحساب السحابي');
    }
  },

  /**
   * تسجيل الدخول واستعادة البيانات السحابية
   */
  async login(username: string, password: string): Promise<any> {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'خطأ في اسم المستخدم أو كلمة المرور');
    }
    
    const data = await response.json();
    return data.state;
  }
};
