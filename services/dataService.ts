
export const dataService = {
  // Fetches the entire application state for a given sync key
  async fetchState(syncKey: string) {
    if (!syncKey) return null;
    try {
      const res = await fetch(`/api/data?username=${encodeURIComponent(syncKey)}`);
      if (!res.ok) throw new Error('فشل جلب البيانات من السحابة');
      const data = await res.json();
      return data.state;
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  // Syncs the entire state (used by App.tsx)
  async syncState(username: string, state: any) {
    return fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, state }),
    });
  },

  // Registers a new user account (used by LoginScreen.tsx)
  async register(username: string, password: string) {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, action: 'register' }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Registration failed');
    }
    return res.json();
  },

  // Logs into an existing account (used by LoginScreen.tsx)
  async login(username: string, password: string) {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, action: 'login' }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Login failed');
    }
    const data = await res.json();
    return data.state;
  },

  // Syncs an individual transaction
  async syncTransaction(username: string, transaction: any) {
    return fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, action: 'sync_transaction', payload: transaction }),
    });
  },

  // Deletes an individual transaction
  async deleteTransaction(username: string, id: string) {
    return fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, action: 'delete_transaction', payload: { id } }),
    });
  },

  // Syncs budget limits for a month
  async syncBudget(username: string, monthKey: string, budgetData: any) {
    return fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username, 
        action: 'sync_budget', 
        payload: { monthKey, limit: budgetData.limit, categoryLimits: budgetData.categoryLimits } 
      }),
    });
  }
};
