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
export async function createThread() {
  return post<ThreadResponse>(API_ENDPOINTS.assistantThread);
}

export async function sendQuery(data: QueryRequest) {
  return post<QueryResponse>(API_ENDPOINTS.assistantQuery, data);
}
