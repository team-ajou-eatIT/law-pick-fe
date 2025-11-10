/**
 * API 클라이언트
 */
import { API_BASE_URL } from './config';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * 공통 fetch 래퍼 함수
 */
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return {
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    return {
      data,
      status: response.status,
    };
  } catch (error) {
    console.error('API 호출 오류:', error);
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
}

/**
 * GET 요청
 */
export async function get<T>(
  endpoint: string,
  params?: Record<string, string | number | undefined>
): Promise<ApiResponse<T>> {
  const queryString = params
    ? '?' + new URLSearchParams(
        Object.entries(params)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)])
      ).toString()
    : '';

  return apiClient<T>(`${endpoint}${queryString}`, {
    method: 'GET',
  });
}

/**
 * POST 요청
 */
export async function post<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT 요청
 */
export async function put<T>(
  endpoint: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE 요청
 */
export async function del<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiClient<T>(endpoint, {
    method: 'DELETE',
  });
}


