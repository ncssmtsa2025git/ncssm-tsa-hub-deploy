const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface LoginResponse {
  admin_token: string;
}

export interface AdminLoginRequest {
  password: string;
}

class AuthService {
  private static instance: AuthService;
  private readonly TOKEN_KEY = 'admin_token';

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(password: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Invalid credentials');
    }

    const data: LoginResponse = await response.json();
    return data.admin_token;
  }

  /** Google sign-in URL for officers (the API sends them back to /login#admin_token=...). */
  async googleLoginUrl(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/auth/login?purpose=admin`);
    if (!response.ok) throw new Error('Could not start Google sign-in');
    const data: { auth_url: string } = await response.json();
    return data.auth_url;
  }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Admin tokens expire after 60 minutes; treat an expired one as logged out
  // instead of letting every request fail silently.
  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;
    try {
      const { exp } = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (typeof exp === 'number' && exp * 1000 <= Date.now()) {
        this.removeToken();
        return null;
      }
    } catch {}
    return token;
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'X-Admin-Token': token,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(describeError(error.detail) || `API Error: ${response.statusText}`);
    }

    return response.json();
  }
}

export const authService = AuthService.getInstance();

/** FastAPI errors are a string, or a list of field problems for invalid input. */
export function describeError(detail: unknown): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d: { loc?: unknown[]; msg?: string }) => {
        const field = d.loc?.[d.loc.length - 1];
        const msg = (d.msg || 'invalid').replace(/^Value error, /, '');
        return typeof field === 'string' && field !== 'body' ? `${field}: ${msg}` : msg;
      })
      .join('; ');
  }
  return '';
}