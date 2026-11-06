/**
 * Centralized API client for communicating with /api/* backend endpoints
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

export const apiClient = {
  getAuthHeader(): Record<string, string> {
    try {
      const token = localStorage.getItem('hps_auth_token');
      if (token) {
        return { Authorization: `Bearer ${token}` };
      }
    } catch {
      // ignore localstorage errors
    }
    return {};
  },

  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
      });

      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      const rawText = await res.text();
      const isHtml = contentType.includes('text/html') || rawText.trim().startsWith('<');

      if (isHtml) {
        return {
          success: false,
          error: `Endpoint returned HTML (${res.status}). Serverless function or route may be unavailable.`,
          status: res.status,
        };
      }

      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        return {
          success: false,
          error: 'Invalid JSON response from server.',
          status: res.status,
        };
      }

      if (!res.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${res.status}: ${res.statusText}`,
          status: res.status,
        };
      }

      return {
        success: true,
        data: data as T,
        status: res.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network request failed',
        status: 0,
      };
    }
  },

  async post<T>(url: string, body: any): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
        body: JSON.stringify(body),
      });

      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      const rawText = await res.text();
      const isHtml = contentType.includes('text/html') || rawText.trim().startsWith('<');

      if (isHtml) {
        return {
          success: false,
          error: `Endpoint returned HTML (${res.status}). Serverless function or route may be unavailable.`,
          status: res.status,
        };
      }

      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        return {
          success: false,
          error: 'Invalid JSON response from server.',
          status: res.status,
        };
      }

      if (!res.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${res.status}: ${res.statusText}`,
          status: res.status,
        };
      }

      return {
        success: true,
        data: data as T,
        status: res.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network request failed',
        status: 0,
      };
    }
  },

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
      });

      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      const rawText = await res.text();
      const isHtml = contentType.includes('text/html') || rawText.trim().startsWith('<');

      if (isHtml) {
        return {
          success: false,
          error: `Endpoint returned HTML (${res.status}). Serverless function or route may be unavailable.`,
          status: res.status,
        };
      }

      let data: any = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        return {
          success: false,
          error: 'Invalid JSON response from server.',
          status: res.status,
        };
      }

      if (!res.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${res.status}: ${res.statusText}`,
          status: res.status,
        };
      }

      return {
        success: true,
        data: data as T,
        status: res.status,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network request failed',
        status: 0,
      };
    }
  },
};
