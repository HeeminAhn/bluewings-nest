/**
 * 서버 컴포넌트에서 사용하는 API 유틸리티
 * 클라이언트 API (api.ts)와 분리하여 SSR에서 직접 백엔드 호출
 */

import type {
  Post,
  PagedPostResponse,
  Category,
  Notice,
  PagedNoticeResponse,
  StandingsResponse,
  MatchListResponse,
  PagedCommentResponse,
} from './types';

// 서버 환경에서 백엔드 URL (Docker: http://backend:8080, 로컬: http://localhost:8080)
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
}

/**
 * 서버 컴포넌트용 fetch 유틸리티
 */
export async function serverFetch<T>(
  endpoint: string,
  options?: RequestInit & { next?: NextFetchRequestConfig }
): Promise<T | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      console.error(`[server-api] ${endpoint} failed with status ${response.status}`);
      return null;
    }

    const data: ApiResponse<T> = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error(`[server-api] ${endpoint} error:`, error);
    return null;
  }
}

// ============ 게시글 API ============

export async function getPosts(
  page = 0,
  size = 20,
  categoryId?: number
): Promise<PagedPostResponse | null> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (categoryId) params.append('categoryId', String(categoryId));

  return serverFetch<PagedPostResponse>(`/posts?${params}`, {
    next: { revalidate: 60 }, // 1분 캐시
  });
}

export async function searchPosts(
  keyword: string,
  page = 0,
  size = 20,
  categoryId?: number
): Promise<PagedPostResponse | null> {
  const params = new URLSearchParams({
    keyword,
    page: String(page),
    size: String(size),
  });
  if (categoryId) params.append('categoryId', String(categoryId));

  return serverFetch<PagedPostResponse>(`/posts/search?${params}`, {
    next: { revalidate: 60 },
  });
}

export async function getPost(id: number): Promise<Post | null> {
  return serverFetch<Post>(`/posts/${id}`, {
    next: { revalidate: 30 }, // 30초 캐시 (조회수는 약간 지연됨)
  });
}

export async function getPostsByMember(
  memberId: number,
  page = 0,
  size = 20
): Promise<PagedPostResponse | null> {
  return serverFetch<PagedPostResponse>(
    `/posts/member/${memberId}?page=${page}&size=${size}`,
    { next: { revalidate: 60 } }
  );
}

export async function getComments(
  postId: number,
  page = 0,
  size = 100
): Promise<PagedCommentResponse | null> {
  return serverFetch<PagedCommentResponse>(
    `/posts/${postId}/comments?page=${page}&size=${size}`,
    { next: { revalidate: 30 } }
  );
}

// ============ 카테고리 API ============

export async function getCategories(): Promise<Category[] | null> {
  return serverFetch<Category[]>('/categories', {
    next: { revalidate: 86400 }, // 하루 캐시
  });
}

// ============ 공지사항 API ============

export async function getNotices(
  page = 0,
  size = 20
): Promise<PagedNoticeResponse | null> {
  return serverFetch<PagedNoticeResponse>(`/notices?page=${page}&size=${size}`, {
    next: { revalidate: 60 },
  });
}

export async function searchNotices(
  keyword: string,
  page = 0,
  size = 20
): Promise<PagedNoticeResponse | null> {
  const params = new URLSearchParams({
    keyword,
    page: String(page),
    size: String(size),
  });

  return serverFetch<PagedNoticeResponse>(`/notices/search?${params}`, {
    next: { revalidate: 60 },
  });
}

export async function getNotice(id: number): Promise<Notice | null> {
  return serverFetch<Notice>(`/notices/${id}`, {
    next: { revalidate: 30 }, // 30초 캐시
  });
}

// ============ 경기 정보 API ============

export async function getStandings(season?: string): Promise<StandingsResponse | null> {
  const query = season ? `?season=${season}` : '';
  return serverFetch<StandingsResponse>(`/matches/standings${query}`, {
    next: { revalidate: 3600 }, // 1시간 캐시
  });
}

export async function getMatchesByMonth(
  year: number,
  month: number
): Promise<MatchListResponse | null> {
  return serverFetch<MatchListResponse>(`/matches?year=${year}&month=${month}`, {
    next: { revalidate: 3600 },
  });
}
