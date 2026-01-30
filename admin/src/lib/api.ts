import type { ApiResponse, PagedResponse, ListParams } from '@/types'

const API_URL = '/api'

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401 || response.status === 403) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      throw new Error('인증이 필요합니다')
    }

    const result: ApiResponse<T> = await response.json()

    if (!result.success || result.data === null) {
      throw new Error(result.error?.message || 'API 요청 실패')
    }

    return result.data
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse<T>(response)
  }

  async getList<T>(resource: string, params: ListParams = {}): Promise<PagedResponse<T>> {
    const { page = 0, size = 20, sort = 'createdAt,desc', keyword, ...filters } = params

    const queryParams = new URLSearchParams()
    queryParams.set('page', String(page))
    queryParams.set('size', String(size))
    queryParams.set('sort', sort)

    if (keyword) {
      queryParams.set('keyword', keyword)
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.set(key, String(value))
      }
    })

    return this.get<PagedResponse<T>>(`/admin/${resource}?${queryParams.toString()}`)
  }

  async getOne<T>(resource: string, id: number | string): Promise<T> {
    return this.get<T>(`/admin/${resource}/${id}`)
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })
    return this.handleResponse<T>(response)
  }

  async create<T>(resource: string, data: unknown): Promise<T> {
    return this.post<T>(`/admin/${resource}`, data)
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<T>(response)
  }

  async update<T>(resource: string, id: number | string, data: unknown): Promise<T> {
    return this.put<T>(`/admin/${resource}/${id}`, data)
  }

  async delete(endpoint: string): Promise<void> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok && response.status !== 204) {
      const result = await response.json()
      throw new Error(result.error?.message || '삭제 실패')
    }
  }

  async remove(resource: string, id: number | string): Promise<void> {
    return this.delete(`/admin/${resource}/${id}`)
  }

  // Auth specific methods
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return this.handleResponse<{
      accessToken: string
      refreshToken: string
      member: { id: number; email: string; nickname: string; role: string; profileImageUrl?: string }
    }>(response)
  }

  // Member specific actions
  async blockMember(memberId: number, reason: string): Promise<void> {
    await this.post(`/admin/members/${memberId}/block`, { reason })
  }

  async unblockMember(memberId: number): Promise<void> {
    await this.post(`/admin/members/${memberId}/unblock`)
  }

  // Report specific actions
  async updateReportStatus(reportId: number, status: string, adminNote?: string): Promise<void> {
    await this.put(`/admin/reports/${reportId}`, { status, adminNote })
  }

  // Post specific actions
  async updatePostCategory(postId: number, categoryId: number | null): Promise<void> {
    await this.patch(`/admin/posts/${postId}/category`, { categoryId })
  }

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse<T>(response)
  }
}

export const api = new ApiClient()
