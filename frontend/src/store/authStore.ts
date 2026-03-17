import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MemberResponse, GradeInfoResponse, AttendanceResponse } from '../types';
import { api } from '../services/api';

// 스토어 버전 - 구조 변경 시 증가
const STORE_VERSION = 4;

interface AuthState {
  isAuthenticated: boolean;
  member: MemberResponse | null;
  gradeInfo: GradeInfoResponse | null;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, nickname: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  fetchGradeInfo: () => Promise<void>;
  checkAttendance: () => Promise<AttendanceResponse | null>;
  setMember: (member: MemberResponse) => void;
  clearError: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      member: null,
      gradeInfo: null,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        const response = await api.login({ email, password });

        if (response.success && response.data) {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          set({
            isAuthenticated: true,
            member: response.data.member,
            isLoading: false,
          });
          // 로그인 후 등급 정보 조회
          get().fetchGradeInfo();
          return true;
        } else {
          set({
            isLoading: false,
            error: response.error?.message || '로그인에 실패했습니다.',
          });
          return false;
        }
      },

      signUp: async (email: string, password: string, nickname: string) => {
        set({ isLoading: true, error: null });

        const response = await api.signUp({ email, password, nickname });

        if (response.success) {
          set({ isLoading: false });
          return true;
        } else {
          set({
            isLoading: false,
            error: response.error?.message || '회원가입에 실패했습니다.',
          });
          return false;
        }
      },

      logout: async () => {
        // 서버에 로그아웃 요청 (리프레시 토큰 무효화)
        try {
          await api.logout();
        } catch {
          // 서버 요청 실패해도 로컬 로그아웃은 진행
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
          isAuthenticated: false,
          member: null,
          gradeInfo: null,
          error: null,
        });
      },

      fetchProfile: async () => {
        const response = await api.getMyProfile();

        if (response.success && response.data) {
          set({ member: response.data });
        } else if (response.error?.code === 'UNAUTHORIZED') {
          get().logout();
        }
      },

      fetchGradeInfo: async () => {
        const response = await api.getMyGradeInfo();

        if (response.success && response.data) {
          set({ gradeInfo: response.data });
        }
      },

      checkAttendance: async () => {
        set({ isLoading: true });

        try {
          const response = await api.checkAttendance();

          if (response.success && response.data) {
            // 출석 성공 후 프로필 다시 조회하여 최신 정보 반영
            await get().fetchProfile();
            await get().fetchGradeInfo();
            set({ isLoading: false });
            return response.data;
          } else {
            set({
              isLoading: false,
              error: response.error?.message || '출석 체크에 실패했습니다.',
            });
            return null;
          }
        } catch {
          set({
            isLoading: false,
            error: '출석 체크 중 오류가 발생했습니다.',
          });
          return null;
        }
      },

      setMember: (member: MemberResponse) => set({ member }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      version: STORE_VERSION,
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        member: state.member,
      }),
      migrate: (persistedState: unknown, version: number) => {
        // 이전 버전 데이터는 초기화
        if (version < STORE_VERSION) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          return {
            isAuthenticated: false,
            member: null,
            gradeInfo: null,
            isLoading: false,
            error: null,
          };
        }
        return persistedState as AuthState;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// 토큰 갱신 실패 시 자동 로그아웃 및 로그인 페이지로 리다이렉트
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    const { logout } = useAuthStore.getState();
    logout().then(() => {
      // 이미 로그인 페이지에 있으면 리다이렉트하지 않음
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    });
  });
}
