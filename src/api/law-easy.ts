/**
 * Law Easy API
 */
import { get, post } from './client';
import { API_ENDPOINTS } from './config';

// 타입 정의
export interface SummaryCard {
card_id: number;
title: string;
content: string;
simple_terms: Array<{
    term: string;
    easy: string;
}>;
}

export interface LawSummaryResponse {
  law_id: string;
  title?: string;
  start_date?: string;
  summary: SummaryCard[];
  compare?: {
    before: string;
    after: string;
  } | null;
  original_link?: string;
  card_cover_url?: string;
  one_line_summary?: string | null;
  responsible_ministry?: string | null;
  markdown?: string | null;
  original_content?: string | null;
  cards?: SummaryCard[];
  cached: boolean;
  generated_at?: string;
  model_used?: string;
}

export interface LawListItem {
  law_id: string;
  title: string;
  start_date: string;
  short_desc: string;
  category: string;
  card_cover_url?: string;
  responsible_ministry?: string;
  one_line_summary?: string | null;
}

export interface LawListResponse {
  items: LawListItem[];
  total: number;
}

export interface LawCardsResponse {
  law_id: string;
  images: string[];
  cached: boolean;
  total_cards: number;
}

// API 함수들
export async function getLawList(params?: {
  category?: string;
  page?: number;
  size?: number;
}) {
  return get<LawListResponse>(API_ENDPOINTS.laws, params);
}

export async function getLawDetail(lawId: string) {
  return get<LawSummaryResponse>(API_ENDPOINTS.lawDetail(lawId));
}

export async function summarizeLaw(data: {
  law_id: string;
  title?: string;
  content?: string;
  compare_version?: boolean;
}) {
  return post<LawSummaryResponse>(API_ENDPOINTS.lawSummarize, data);
}

export async function getLawCards(lawId: string) {
  return get<LawCardsResponse>(API_ENDPOINTS.lawCards(lawId));
}