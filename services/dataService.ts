
export const dataService = {
  /**
   * Helper to fetch with timeout and handle errors
   */
  async request(url: string, options: RequestInit = {}) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 15000); // 15 second timeout for slower networks

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
         throw new Error("Server Misconfigured (API Route Not Found)");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server Error: ${response.status}`);
      }

      return data;
    } catch (err: any) {
      clearTimeout(id);
      if (err.name === 'AbortError') {
        throw new Error("Connection timed out. Please check your internet.");
      }
      throw err;
    }
  },

  /**
   * Fetch user state from Cloud DB
   */
  async fetchState(username: string) {
    if (!username) return null;
    const data = await this.request(`/api/data?username=${encodeURIComponent(username)}`);
    return data.state;
  },

  /**
   * Sync state to Cloud DB
   */
  async syncState(username: string, state: any) {
    if (!username) return;
    await this.request('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'sync', 
        username, 
        state 
      }),
    });
  },

  /**
   * Create new account
   */
  async register(username: string, password: string): Promise<void> {
    await this.request('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', username, password }),
    });
  },

  /**
   * Login to account
   */
  async login(username: string, password: string): Promise<any> {
    const data = await this.request('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password }),
    });
    return data.state;
  }
};
