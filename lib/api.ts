const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

interface ApiError {
  detail: string;
}

export class ApiClient {
  static async register(data: {
    email: string;
    full_name: string;
    password: string;
  }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err: ApiError = await res.json();
      throw new Error(err.detail ?? 'Registration failed');
    }
    return res.json();
  }

  static async login(email: string, password: string) {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: form
    });
    if (!res.ok) {
      const err: ApiError = await res.json();
      throw new Error(err.detail ?? 'Login failed');
    }
    return res.json() as Promise<{access_token: string; refresh_token: string; token_type: string}>;
  }
}