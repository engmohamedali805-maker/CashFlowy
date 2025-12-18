
export const dataService = {
  async register(username: string, password: string) {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', username, password, state: {} }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async login(username: string, password: string) {
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed');
    return data.state;
  },

  async fetchState(username: string) {
    const response = await fetch(`/api/data?username=${encodeURIComponent(username)}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.state;
  },

  async syncState(username: string, state: any) {
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync', username, state }),
      });
    } catch (err) {
      console.error('Cloud sync failed', err);
    }
  }
};
