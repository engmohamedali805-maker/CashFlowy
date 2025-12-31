
export const dataService = {
  // جلب البيانات باستخدام مفتاح المزامنة
  async fetchState(syncKey: string) {
    if (!syncKey) return null;
    try {
      const response = await fetch(`/api/data?username=${encodeURIComponent(syncKey)}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.state;
    } catch (err) {
      console.warn('Network issue fetching data from cloud');
      return null;
    }
  },

  // حفظ المزامنة
  async syncState(syncKey: string, state: any) {
    if (!syncKey) return;
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync', username: syncKey, state }),
      });
    } catch (err) {
      console.error('Cloud sync failed');
    }
  },

  // تسجيل حساب جديد
  async register(username: string, password: string): Promise<void> {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', username, password }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'فشل في إنشاء الحساب');
    }
  },

  // تسجيل الدخول
  async login(username: string, password: string): Promise<any> {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'خطأ في الدخول');
    }
    const data = await response.json();
    return data.state;
  }
};
