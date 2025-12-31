
export const dataService = {
  // جلب البيانات باستخدام مفتاح المزامنة
  async fetchState(syncKey: string) {
    try {
      const response = await fetch(`/api/data?username=${encodeURIComponent(syncKey)}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.state;
    } catch (err) {
      console.warn('Network issue fetching data');
      return null;
    }
  },

  // حفظ المزامنة
  async syncState(syncKey: string, state: any) {
    try {
      // إرسال كـ POST لتحديث البيانات أو إنشائها (Upsert)
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync', username: syncKey, state }),
      });
    } catch (err) {
      console.error('Cloud sync failed silently');
    }
  },

  // إضافة تسجيل حساب جديد لإصلاح الأخطاء في LoginScreen
  async register(username: string, password: string): Promise<void> {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', username, password }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }
  },

  // إضافة تسجيل الدخول لإصلاح الأخطاء في LoginScreen
  async login(username: string, password: string): Promise<any> {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }
    const data = await response.json();
    return data.state;
  }
};
