// 회원 등급
export type MemberGrade = 'ROOKIE' | 'SUPPORTER' | 'FANATIC' | 'ULTRAS' | 'LEGEND';

// 회원 정보
export interface Member {
  id: number;
  email: string;
  nickname: string;
  grade: MemberGrade;
  createdAt: string;
}

// 활동 통계
export interface ActivityStats {
  postCount: number;
  commentCount: number;
  likeCount: number;
  attendanceCount: number;
  lastAttendanceDate: string | null;
}

// 등급 상세 정보
export interface GradeDetail {
  name: MemberGrade;
  displayName: string;
  requiredPoints: number;
  colorCode: string;
  description: string;
}

// 등급 정보 응답 (백엔드 GradeInfoResponse와 일치)
export interface GradeInfoResponse {
  currentGrade: GradeDetail;
  nextGrade: GradeDetail | null;
  currentPoints: number;
  pointsToNextGrade: number | null;
  activityStats: ActivityStats;
}

// 회원 역할
export type MemberRole = 'USER' | 'ADMIN';

// 회원 응답 (프로필) - 백엔드 MemberResponse와 일치
export interface MemberResponse {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  bio: string | null;
  grade: GradeInfoResponse;
  totalPoints: number;
  role: MemberRole;
  createdAt: string;
  lastLoginAt: string | null;
}

// 로그인 응답
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  refreshExpiresIn: number;
  member: MemberResponse;
}

// 토큰 갱신 응답
export interface TokenRefreshResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

// 회원가입 요청
export interface SignUpRequest {
  email: string;
  password: string;
  nickname: string;
}

// 로그인 요청
export interface LoginRequest {
  email: string;
  password: string;
}

// 프로필 수정 요청
export interface ProfileUpdateRequest {
  nickname?: string;
  bio?: string;
  profileImageUrl?: string;
}

// API 응답 wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
  timestamp: string;
}

// 등급별 정보
export const GRADE_INFO: Record<MemberGrade, {
  name: string;
  color: string;
  minPoints: number;
}> = {
  ROOKIE: { name: '신입 서포터', color: 'gray', minPoints: 0 },
  SUPPORTER: { name: '블루 서포터', color: 'sky', minPoints: 100 },
  FANATIC: { name: '블루 파나틱', color: 'blue', minPoints: 500 },
  ULTRAS: { name: '블루 울트라스', color: 'indigo', minPoints: 1500 },
  LEGEND: { name: '빅버드 레전드', color: 'amber', minPoints: 5000 },
};

// ============ 커뮤니티 타입 ============

// 카테고리
export interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
}

// 작성자 정보
export interface AuthorInfo {
  id: number;
  nickname: string;
  grade: MemberGrade;
  profileImageUrl: string | null;
}

// 게시글 이미지
export interface PostImage {
  id: number;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  displayOrder: number;
}

// 이미지 업로드 응답
export interface UploadImageResponse {
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
}

// 게시글
export interface Post {
  id: number;
  title: string;
  content: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  author: AuthorInfo;
  category?: Category;
  images: PostImage[];
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

// 게시글 목록 아이템
export interface PostListItem {
  id: number;
  title: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  author: AuthorInfo;
  category?: Category;
  createdAt: string;
}

// 페이지네이션 게시글 응답
export interface PagedPostResponse {
  posts: PostListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 댓글 이미지
export interface CommentImage {
  id: number;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  displayOrder: number;
}

// 댓글
export interface Comment {
  id: number;
  content: string;
  author: AuthorInfo;
  parentId: number | null;
  replies: Comment[];
  replyCount: number;
  images: CommentImage[];
  createdAt: string;
  updatedAt: string;
}

// 페이지네이션 댓글 응답
export interface PagedCommentResponse {
  comments: Comment[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 좋아요 응답
export interface LikeResponse {
  postId: number;
  isLiked: boolean;
  likeCount: number;
}

// 이미지 요청 (게시글 작성/수정 시)
export interface ImageRequest {
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
}

// 게시글 작성/수정 요청
export interface PostRequest {
  title: string;
  content: string;
  categoryId: number;
  images?: ImageRequest[];
}

// 댓글 작성/수정 요청
export interface CommentRequest {
  content: string;
  parentId?: number;
  images?: ImageRequest[];
}

// ============ 경기 정보 타입 ============

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
export type MatchResult = 'WIN' | 'DRAW' | 'LOSE';

// 경기 정보
export interface Match {
  id: number;
  matchDate: string;
  matchTime: string | null;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  stadium: string | null;
  competition: string;
  season: string;
  matchDay: number | null;
  status: MatchStatus;
  isHomeGame: boolean;
  result: MatchResult | null;
}

// 경기 목록 응답
export interface MatchListResponse {
  matches: Match[];
  season: string;
}

// 다가오는/최근 경기 응답
export interface UpcomingMatchesResponse {
  upcoming: Match[];
  recent: Match[];
}

// 리그 순위
export interface LeagueStanding {
  position: number;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  isSuwon: boolean;
}

// 순위표 응답
export interface StandingsResponse {
  season: string;
  standings: LeagueStanding[];
  suwonPosition: number | null;
}

// ============ 공지사항 타입 ============

// 공지사항 작성자 정보
export interface NoticeAuthorInfo {
  id: number;
  nickname: string;
  grade: MemberGrade;
  profileImageUrl: string | null;
}

// 공지사항 이미지
export interface NoticeImage {
  id: number;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  displayOrder: number;
}

// 공지사항 상세
export interface Notice {
  id: number;
  title: string;
  content: string;
  viewCount: number;
  isPinned: boolean;
  author: NoticeAuthorInfo;
  images: NoticeImage[];
  createdAt: string;
  updatedAt: string;
}

// 공지사항 목록 아이템
export interface NoticeListItem {
  id: number;
  title: string;
  viewCount: number;
  isPinned: boolean;
  author: NoticeAuthorInfo;
  createdAt: string;
}

// 페이지네이션 공지사항 응답
export interface PagedNoticeResponse {
  notices: NoticeListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 공지사항 작성/수정 요청
export interface NoticeRequest {
  title: string;
  content: string;
  isPinned?: boolean;
  images?: ImageRequest[];
}

// ============ 채팅 타입 ============

// 채팅 메시지
export interface ChatMessage {
  id: number;
  memberId: number;
  nickname: string;
  profileImageUrl: string | null;
  grade: MemberGrade;
  content: string;
  createdAt: string;
}

// 채팅 히스토리 응답
export interface ChatHistoryResponse {
  messages: ChatMessage[];
  hasMore: boolean;
}

// WebSocket 브로드캐스트 메시지
export interface ChatBroadcastMessage {
  type: 'MESSAGE' | 'JOIN' | 'LEAVE';
  message?: ChatMessage;
  nickname?: string;
  onlineCount?: number;
}

// ============ 신고 타입 ============

// 신고 사유 (백엔드 ReportReason과 일치)
export type ReportReason =
  | 'SPAM'           // 스팸/도배
  | 'HARASSMENT'     // 욕설/비방
  | 'INAPPROPRIATE'  // 부적절한 콘텐츠
  | 'ADVERTISING'    // 광고/홍보
  | 'IMPERSONATION'  // 사칭
  | 'OTHER';         // 기타

// 콘텐츠 타입 (신고 대상)
export type ReportContentType = 'POST' | 'COMMENT' | 'CHAT';

// 신고 요청
export interface ReportRequest {
  reportedMemberId: number;
  reason: ReportReason;
  description?: string;
  contentType?: ReportContentType;
  contentId?: number;
}

// 신고 사유 표시 정보
export const REPORT_REASON_INFO: Record<ReportReason, string> = {
  SPAM: '스팸/도배',
  HARASSMENT: '욕설/비방',
  INAPPROPRIATE: '부적절한 콘텐츠',
  ADVERTISING: '광고/홍보',
  IMPERSONATION: '사칭',
  OTHER: '기타',
};

// ============ 출석체크 타입 ============

// 포츈쿠키 응답
export interface FortuneCookieResponse {
  message: string;
  category: string;
}

// 출석체크 응답
export interface AttendanceResponse {
  attendanceCount: number;
  lastAttendanceDate: string;
  earnedPoints: number;
  totalPoints: number;
  message: string;
  fortuneCookie: FortuneCookieResponse | null;
}
