// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error?: {
    code: string
    message: string
  }
}

export interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}

// Auth Types
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  member: Member
}

// Member Types
export type MemberRole = 'USER' | 'ADMIN'
export type MemberGrade = 'ROOKIE' | 'SUPPORTER' | 'FANATIC' | 'ULTRAS' | 'LEGEND'

export interface Member {
  id: number
  email: string
  nickname: string
  bio?: string
  profileImageUrl?: string
  role: MemberRole
  grade: MemberGrade
  isActive: boolean
  isBlocked: boolean
  blockedReason?: string
  blockedAt?: string
  blockedUntil?: string
  reportCount: number
  createdAt: string
  lastLoginAt?: string
  activityStats?: {
    totalPosts: number
    totalComments: number
    totalPoints: number
    attendanceCount: number
  }
}

// Category Types
export interface Category {
  id: number
  name: string
  description?: string
  displayOrder: number
  isActive: boolean
  color: string
  createdAt: string
  updatedAt: string
}

// 사용 가능한 카테고리 색상
export const CATEGORY_COLORS = [
  { value: 'gray', label: '회색', class: 'bg-gray-100 text-gray-700' },
  { value: 'blue', label: '파랑', class: 'bg-blue-100 text-blue-700' },
  { value: 'green', label: '초록', class: 'bg-green-100 text-green-700' },
  { value: 'purple', label: '보라', class: 'bg-purple-100 text-purple-700' },
  { value: 'orange', label: '주황', class: 'bg-orange-100 text-orange-700' },
  { value: 'yellow', label: '노랑', class: 'bg-yellow-100 text-yellow-700' },
  { value: 'pink', label: '분홍', class: 'bg-pink-100 text-pink-700' },
  { value: 'red', label: '빨강', class: 'bg-red-100 text-red-700' },
  { value: 'indigo', label: '남색', class: 'bg-indigo-100 text-indigo-700' },
  { value: 'teal', label: '청록', class: 'bg-teal-100 text-teal-700' },
  { value: 'cyan', label: '하늘', class: 'bg-cyan-100 text-cyan-700' },
] as const

// Post Types
export interface Post {
  id: number
  title: string
  content: string
  authorId: number
  authorNickname: string
  categoryId?: number
  categoryName?: string
  viewCount: number
  likeCount: number
  commentCount: number
  images?: PostImage[]
  createdAt: string
  updatedAt: string
}

export interface PostImage {
  filePath: string
  originalName: string
}

// Comment Types
export interface Comment {
  id: number
  postId: number
  postTitle: string
  authorId: number
  authorNickname: string
  content: string
  createdAt: string
}

// Notice Types
export interface Notice {
  id: number
  title: string
  content: string
  authorId: number
  authorNickname: string
  isPinned: boolean
  viewCount: number
  images?: PostImage[]
  createdAt: string
  updatedAt: string
}

// Match Types
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED'
export type Competition = 'K리그1' | 'K리그2' | 'FA컵' | 'ACL'

export interface Match {
  id: number
  matchDate: string
  matchTime?: string
  homeTeam: string
  awayTeam: string
  homeScore?: number
  awayScore?: number
  stadium: string
  competition: Competition
  season: string
  matchDay?: number
  status: MatchStatus
  createdAt: string
  updatedAt: string
}

// Report Types
export type ReportReason = 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE' | 'ADVERTISING' | 'IMPERSONATION' | 'OTHER'
export type ReportStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'RESOLVED'

export interface Report {
  id: number
  reporterId: number
  reporterNickname: string
  reportedMemberId: number
  reportedMemberNickname: string
  reason: ReportReason
  reasonDescription: string
  description?: string
  contentType?: string
  contentId?: number
  status: ReportStatus
  statusDescription: string
  processedById?: number
  processedByNickname?: string
  processedAt?: string
  adminNote?: string
  createdAt: string
}

// Chat Types
export interface ChatMessage {
  id: number
  memberId: number
  memberNickname: string
  content: string
  createdAt: string
}

// Access Log Types
export interface AccessLog {
  id: number
  memberId?: number
  email: string
  ipAddress: string
  userAgent?: string
  isSuccess: boolean
  failureReason?: string
  createdAt: string
}

// Dashboard Types
export interface DashboardStats {
  totalMembers: number
  totalPosts: number
  totalComments: number
  todayNewMembers: number
  todayNewPosts: number
  pendingReports: number
  blockedMembers: number
  recentPosts: Array<{ id: number; title: string; authorNickname: string; createdAt: string }>
  recentMembers: Array<{ id: number; nickname: string; email: string; createdAt: string }>
  upcomingMatches: Array<{ id: number; homeTeam: string; awayTeam: string; matchDate: string; competition: string }>
}

// Filter Types
export interface ListParams {
  page?: number
  size?: number
  sort?: string
  keyword?: string
  [key: string]: string | number | boolean | undefined
}
