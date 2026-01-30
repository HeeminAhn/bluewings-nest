import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  MemberResponse,
  SignUpRequest,
  ProfileUpdateRequest,
  GradeInfoResponse,
  Post,
  PagedPostResponse,
  PagedCommentResponse,
  LikeResponse,
  PostRequest,
  CommentRequest,
  Comment,
  Match,
  MatchListResponse,
  UpcomingMatchesResponse,
  StandingsResponse,
  UploadImageResponse,
  Notice,
  NoticeListItem,
  PagedNoticeResponse,
  NoticeRequest,
  ChatHistoryResponse,
  PostListItem,
  ReportRequest,
  Category,
  AttendanceResponse,
} from './types';

// 백엔드 URL 생성 (클라이언트 IP 추적을 위해 직접 호출)
const getBackendUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:8080';
  if (process.env.NEXT_PUBLIC_BACKEND_URL) return process.env.NEXT_PUBLIC_BACKEND_URL;
  // 표준 포트(80, 443)로 접속 시 api 서브도메인 사용 (Cloudflare Tunnel)
  const port = window.location.port;
  if (!port || port === '80' || port === '443') {
    return `${window.location.protocol}//api.${window.location.hostname}`;
  }
  // 개발 환경에서는 :8080 사용
  return `${window.location.protocol}//${window.location.hostname}:8080`;
};

// 클라이언트에서는 백엔드 직접 호출, 서버에서는 localhost 사용
const API_BASE_URL = typeof window !== 'undefined' ? `${getBackendUrl()}/api` : 'http://localhost:8080/api';
const BACKEND_URL = typeof window !== 'undefined' ? getBackendUrl() : 'http://localhost:8080';

class ApiService {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private getAuthHeader(): HeadersInit {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: '네트워크 오류가 발생했습니다.',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 인증 API
  async signUp(request: SignUpRequest): Promise<ApiResponse<MemberResponse>> {
    return this.request<MemberResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async login(request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async checkEmail(email: string): Promise<ApiResponse<{ available: boolean }>> {
    return this.request<{ available: boolean }>(
      `/auth/check-email?email=${encodeURIComponent(email)}`
    );
  }

  async checkNickname(nickname: string): Promise<ApiResponse<{ available: boolean }>> {
    return this.request<{ available: boolean }>(
      `/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`
    );
  }

  // 회원 API
  async getMyProfile(): Promise<ApiResponse<MemberResponse>> {
    return this.request<MemberResponse>('/members/me');
  }

  async updateMyProfile(request: ProfileUpdateRequest): Promise<ApiResponse<MemberResponse>> {
    return this.request<MemberResponse>('/members/me', {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  async getMyGradeInfo(): Promise<ApiResponse<GradeInfoResponse>> {
    return this.request<GradeInfoResponse>('/members/me/grade');
  }

  async checkAttendance(): Promise<ApiResponse<AttendanceResponse>> {
    return this.request<AttendanceResponse>('/members/me/attendance', {
      method: 'POST',
    });
  }

  async getMemberProfile(id: number): Promise<ApiResponse<MemberResponse>> {
    return this.request<MemberResponse>(`/members/${id}`);
  }

  async withdrawMember(): Promise<ApiResponse<void>> {
    return this.request<void>('/members/me', {
      method: 'DELETE',
    });
  }

  // ============ 카테고리 API ============

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request<Category[]>('/categories');
  }

  // ============ 게시글 API ============

  async getPosts(page = 0, size = 20, categoryId?: number): Promise<ApiResponse<PagedPostResponse>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (categoryId) params.append('categoryId', categoryId.toString());
    return this.request<PagedPostResponse>(`/posts?${params.toString()}`);
  }

  async searchPosts(keyword: string, page = 0, size = 20, categoryId?: number): Promise<ApiResponse<PagedPostResponse>> {
    const params = new URLSearchParams();
    params.append('keyword', keyword);
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (categoryId) params.append('categoryId', categoryId.toString());
    return this.request<PagedPostResponse>(`/posts/search?${params.toString()}`);
  }

  async getPopularPosts(period: 'DAILY' | 'WEEKLY' | 'MONTHLY' = 'DAILY', limit = 5): Promise<ApiResponse<PostListItem[]>> {
    return this.request<PostListItem[]>(`/posts/popular?period=${period}&limit=${limit}`);
  }

  async getPost(id: number, skipViewCount = false): Promise<ApiResponse<Post>> {
    const query = skipViewCount ? '?skipViewCount=true' : '';
    return this.request<Post>(`/posts/${id}${query}`);
  }

  async getPostsByMember(memberId: number, page = 0, size = 20): Promise<ApiResponse<PagedPostResponse>> {
    return this.request<PagedPostResponse>(`/posts/member/${memberId}?page=${page}&size=${size}`);
  }

  async createPost(request: PostRequest): Promise<ApiResponse<Post>> {
    return this.request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updatePost(id: number, request: PostRequest): Promise<ApiResponse<Post>> {
    return this.request<Post>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async deletePost(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleLike(postId: number): Promise<ApiResponse<LikeResponse>> {
    return this.request<LikeResponse>(`/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  // ============ 댓글 API ============

  async getComments(postId: number, page = 0, size = 20): Promise<ApiResponse<PagedCommentResponse>> {
    return this.request<PagedCommentResponse>(`/posts/${postId}/comments?page=${page}&size=${size}`);
  }

  async createComment(postId: number, request: CommentRequest): Promise<ApiResponse<Comment>> {
    return this.request<Comment>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateComment(postId: number, commentId: number, request: CommentRequest): Promise<ApiResponse<Comment>> {
    return this.request<Comment>(`/posts/${postId}/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async deleteComment(postId: number, commentId: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  // ============ 경기 정보 API ============

  async getMatches(season?: string): Promise<ApiResponse<MatchListResponse>> {
    const query = season ? `?season=${season}` : '';
    return this.request<MatchListResponse>(`/matches${query}`);
  }

  async getMatchesByMonth(year: number, month: number): Promise<ApiResponse<MatchListResponse>> {
    return this.request<MatchListResponse>(`/matches?year=${year}&month=${month}`);
  }

  async getUpcomingMatches(): Promise<ApiResponse<UpcomingMatchesResponse>> {
    return this.request<UpcomingMatchesResponse>('/matches/upcoming');
  }

  async getMatch(id: number): Promise<ApiResponse<Match>> {
    return this.request<Match>(`/matches/${id}`);
  }

  async getStandings(season?: string): Promise<ApiResponse<StandingsResponse>> {
    const query = season ? `?season=${season}` : '';
    return this.request<StandingsResponse>(`/matches/standings${query}`);
  }

  // ============ 이미지 업로드 API ============

  async uploadImage(file: File): Promise<ApiResponse<UploadImageResponse>> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/images/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await response.json();
      return data as ApiResponse<UploadImageResponse>;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: '이미지 업로드 중 오류가 발생했습니다.',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  async uploadImages(files: File[]): Promise<ApiResponse<UploadImageResponse[]>> {
    const token = this.getToken();
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const response = await fetch(`${API_BASE_URL}/images/upload/multiple`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await response.json();
      return data as ApiResponse<UploadImageResponse[]>;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: '이미지 업로드 중 오류가 발생했습니다.',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  getImageUrl(filePath: string): string {
    return `${BACKEND_URL}/uploads${filePath}`;
  }

  // ============ 공지사항 API ============

  async getNotices(page = 0, size = 20): Promise<ApiResponse<PagedNoticeResponse>> {
    return this.request<PagedNoticeResponse>(`/notices?page=${page}&size=${size}`);
  }

  async searchNotices(keyword: string, page = 0, size = 20): Promise<ApiResponse<PagedNoticeResponse>> {
    return this.request<PagedNoticeResponse>(
      `/notices/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`
    );
  }

  async getPinnedNotices(): Promise<ApiResponse<NoticeListItem[]>> {
    return this.request<NoticeListItem[]>('/notices/pinned');
  }

  async getNotice(id: number): Promise<ApiResponse<Notice>> {
    return this.request<Notice>(`/notices/${id}`);
  }

  async createNotice(request: NoticeRequest): Promise<ApiResponse<Notice>> {
    return this.request<Notice>('/notices', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateNotice(id: number, request: NoticeRequest): Promise<ApiResponse<Notice>> {
    return this.request<Notice>(`/notices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async deleteNotice(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/notices/${id}`, {
      method: 'DELETE',
    });
  }

  // ============ 채팅 API ============

  async getChatHistory(beforeId?: number, limit = 100): Promise<ApiResponse<ChatHistoryResponse>> {
    const params = new URLSearchParams();
    if (beforeId) params.append('beforeId', beforeId.toString());
    params.append('limit', limit.toString());
    return this.request<ChatHistoryResponse>(`/chat/history?${params.toString()}`);
  }

  getChatWebSocketUrl(): string {
    const token = this.getToken();
    // WebSocket은 백엔드 직접 연결 (프록시 우회)
    const wsBackend = BACKEND_URL.replace('http', 'ws');
    return `${wsBackend}/ws/chat?token=${token}`;
  }

  // ============ 신고 API ============

  async reportMember(request: ReportRequest): Promise<ApiResponse<void>> {
    return this.request<void>('/reports', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const api = new ApiService();
