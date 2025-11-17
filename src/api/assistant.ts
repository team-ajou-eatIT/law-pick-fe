/**
 * Assistant API
 */
import { post } from './client';
import { API_ENDPOINTS } from './config';

// 타입 정의
export interface ThreadResponse {
  thread_id: string;
}

export interface QueryRequest {
  message: string;
  thread_id: string;
  debug?: boolean;
}

export interface Document {
  source: string;
  preview: string;
  metadata: Record<string, unknown>;
}

export interface QueryResponse {
  thread_id: string;
  answer: string;
  route: string;
  document_lack: boolean;
  documents: Document[];
  used_web_search: boolean;
  latency_ms: number;
  debug: unknown;
}

// API 함수들
const LEGACY_THREAD_ENDPOINT = '/assistant/threads';
const LEGACY_QUERY_ENDPOINT = '/assistant/query';

async function postWithFallback<T>(
  endpoint: string,
  fallbackEndpoint: string,
  body?: unknown
) {
  const primaryResponse = await post<T>(endpoint, body);

  if (
    primaryResponse.data ||
    primaryResponse.status === 0 ||
    (primaryResponse.status >= 200 && primaryResponse.status < 400) ||
    fallbackEndpoint === endpoint
  ) {
    return primaryResponse;
  }

  // 404/405는 구버전 백엔드일 가능성이 높으므로 레거시 엔드포인트로 재시도
  if (primaryResponse.status === 404 || primaryResponse.status === 405) {
    console.warn(
      `[assistant-api] ${endpoint} 호출 실패(${primaryResponse.status}) → ${fallbackEndpoint} 으로 재시도`
    );
    const fallbackResponse = await post<T>(fallbackEndpoint, body);
    if (!fallbackResponse.error && primaryResponse.error) {
      fallbackResponse.error = primaryResponse.error;
    }
    return fallbackResponse;
  }

  return primaryResponse;
}

export async function createThread() {
  return postWithFallback<ThreadResponse>(
    API_ENDPOINTS.assistantThread,
    LEGACY_THREAD_ENDPOINT
  );
}

export async function sendQuery(data: QueryRequest) {
  return postWithFallback<QueryResponse>(
    API_ENDPOINTS.assistantQuery,
    LEGACY_QUERY_ENDPOINT,
    data
  );
}
