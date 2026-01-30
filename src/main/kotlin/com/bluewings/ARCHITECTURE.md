# Bluewings Nest - 모듈러 모놀리스 아키텍처

## 개요

이 프로젝트는 **모듈러 모놀리스(Modular Monolith)** 아키텍처를 적용하여 각 도메인 모듈 간의 결합도를 낮추고 향후 MSA 전환을 용이하게 합니다.

## 패키지 구조

```
com.bluewings/
├── shared/                    # 공유 커널
│   ├── kernel/               # 도메인 이벤트, 이벤트 버스
│   └── ModuleRegistry.kt     # 모듈 API 레지스트리
│
├── member/                    # 회원 모듈
│   ├── api/                  # 공개 API (다른 모듈에서 접근 가능)
│   │   ├── MemberApi.kt      # 회원 조회 인터페이스
│   │   └── MemberEvents.kt   # 회원 관련 이벤트
│   ├── internal/             # 내부 구현 (외부 접근 금지)
│   │   ├── MemberApiImpl.kt  # API 구현체
│   │   └── CommunityEventHandler.kt  # Community 이벤트 구독
│   ├── domain/               # 도메인 엔티티
│   ├── repository/           # 리포지토리
│   ├── command/              # CQRS Command
│   ├── query/                # CQRS Query
│   ├── service/              # 서비스
│   ├── resource/             # REST API
│   └── dto/                  # DTO
│
├── community/                 # 커뮤니티 모듈 (게시글, 댓글)
│   ├── api/
│   │   ├── CommunityApi.kt
│   │   └── CommunityEvents.kt
│   ├── internal/
│   │   ├── CommunityApiImpl.kt
│   │   └── MemberEventHandler.kt  # Member 이벤트 구독
│   └── ...
│
├── chat/                      # 채팅 모듈
│   ├── api/
│   │   ├── ChatApi.kt
│   │   └── ChatEvents.kt
│   ├── internal/
│   │   ├── ChatApiImpl.kt
│   │   └── MemberEventHandler.kt
│   └── ...
│
├── notice/                    # 공지사항 모듈
│   ├── api/
│   │   └── NoticeApi.kt
│   ├── internal/
│   │   └── NoticeApiImpl.kt
│   └── ...
│
├── match/                     # 경기 정보 모듈
│   ├── api/
│   │   └── MatchApi.kt
│   ├── internal/
│   │   └── MatchApiImpl.kt
│   └── ...
│
├── report/                    # 신고 모듈
│   ├── api/
│   │   └── ReportApi.kt
│   ├── internal/
│   │   └── ReportApiImpl.kt
│   └── ...
│
├── admin/                     # 어드민 모듈
│   └── resource/
│
└── common/                    # 공통 유틸리티
    ├── exception/
    ├── security/
    └── filter/
```

## 핵심 원칙

### 1. 모듈 경계 (Module Boundaries)

- 각 모듈은 `api/` 패키지를 통해서만 외부에 기능 노출
- `internal/` 패키지는 모듈 내부 구현으로, 다른 모듈에서 직접 참조 금지
- 도메인 엔티티는 모듈 내부에서만 사용, 외부에는 DTO로 노출

### 2. 모듈 간 통신

```kotlin
// ❌ 잘못된 방법: 다른 모듈의 internal 직접 참조
import com.bluewings.member.repository.MemberRepository
val member = memberRepository.findById(id)

// ✅ 올바른 방법: 공개 API 사용
import com.bluewings.member.api.MemberApi
val memberInfo = memberApi.getMemberInfo(id)
```

### 3. 이벤트 기반 통신

모듈 간 데이터 동기화는 이벤트를 통해 처리:

```kotlin
// 이벤트 발행 (Member 모듈)
eventBus.publish(MemberWithdrawnEvent(memberId))

// 이벤트 구독 (Community 모듈)
@ApplicationScoped
class MemberEventHandler {
    fun onMemberWithdrawn(@Observes event: MemberWithdrawnEvent) {
        // 게시글/댓글 익명화 처리
    }
}
```

### 4. ModuleRegistry 활용

```kotlin
@Inject
lateinit var modules: ModuleRegistry

fun example() {
    // 회원 정보 조회
    val memberInfo = modules.member.getMemberInfo(memberId)

    // 게시글 정보 조회
    val postInfo = modules.community.getPostInfo(postId)

    // 채팅에서 회원 퇴장
    modules.chat.kickMember(memberId)
}
```

## 현재 사용 현황 (2026-01-30 기준)

### API vs 이벤트 사용 현황

현재 모듈 간 통신은 **이벤트 기반**으로만 이루어지고 있으며, **Module API 인터페이스는 향후 사용을 위해 준비된 상태**입니다.

| 모듈 | API 인터페이스 | 이벤트 | 비고 |
|------|---------------|--------|------|
| **Member** | ❌ 미사용 | ✅ 사용 중 | 이벤트: 회원 가입/탈퇴/차단 |
| **Community** | ❌ 미사용 | ✅ 사용 중 | 이벤트: 게시글/댓글/좋아요 |
| **Chat** | ❌ 미사용 | ✅ 구독 중 | Member 이벤트 구독하여 퇴장 처리 |
| **Notice** | ❌ 미사용 | ❌ 미사용 | 준비만 됨 |
| **Match** | ❌ 미사용 | ❌ 미사용 | 준비만 됨 |
| **Report** | ❌ 미사용 | ❌ 미사용 | 준비만 됨 |

### API 인터페이스가 미사용인 이유

현재 JPA 엔티티 관계(`@ManyToOne`)로 모듈 간 데이터를 직접 참조하고 있기 때문:

```kotlin
// 현재 방식: JPA 관계로 직접 참조
@ManyToOne
lateinit var member: Member  // Post, Comment, ChatMessage 등에서 직접 참조

// 따라서 MemberApi.getMemberInfo() 호출 불필요
```

### 실제 사용 중인 이벤트 흐름

```
┌─────────────────────────────────────────────────────────────────┐
│                        실제 사용 중                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [MemberCommandHandler]                                         │
│       │                                                         │
│       ├── MemberRegisteredEvent ──→ (구독자 없음)               │
│       │                                                         │
│       └── MemberWithdrawnEvent ───→ [Chat] 강제 퇴장            │
│                                                                 │
│  [AdminMemberResource]                                          │
│       │                                                         │
│       ├── MemberBlockedEvent ─────→ [Chat] 강제 퇴장            │
│       │                                                         │
│       └── MemberUnblockedEvent ───→ (구독자 없음)               │
│                                                                 │
│  [PostCommandHandler]                                           │
│       │                                                         │
│       ├── PostCreatedEvent ───────→ [Member] 활동 통계 증가     │
│       ├── PostDeletedEvent ───────→ [Member] 활동 통계 감소     │
│       ├── CommentCreatedEvent ────→ [Member] 활동 통계 증가     │
│       ├── CommentDeletedEvent ────→ [Member] 활동 통계 감소     │
│       └── PostLikeToggledEvent ───→ [Member] 활동 통계 변경     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### API 인터페이스가 필요해지는 시점

1. **엔티티 관계 분리 시**: `Post.member` → `Post.memberId: Long`으로 변경할 때
2. **MSA 전환 시**: 모듈을 별도 서비스로 분리할 때
3. **복잡한 조회 시**: 다른 모듈의 집계 데이터가 필요할 때

```kotlin
// 향후 엔티티 관계 분리 시 API 사용 예시
class Post {
    var memberId: Long = 0  // Member 엔티티 대신 ID만 저장
}

// 작성자 정보가 필요할 때 API 호출
val authorInfo = memberApi.getMemberInfo(post.memberId)
```

### 삭제해도 되는 파일 (현재 미사용)

아래 파일들은 현재 사용되지 않으며, 삭제해도 동작에 영향 없음:
- `member/api/MemberApi.kt`, `member/internal/MemberApiImpl.kt`
- `community/api/CommunityApi.kt`, `community/internal/CommunityApiImpl.kt`
- `chat/api/ChatApi.kt`, `chat/internal/ChatApiImpl.kt`
- `notice/api/NoticeApi.kt`, `notice/internal/NoticeApiImpl.kt`
- `match/api/MatchApi.kt`, `match/internal/MatchApiImpl.kt`
- `report/api/ReportApi.kt`, `report/internal/ReportApiImpl.kt`
- `shared/ModuleRegistry.kt`

**단, 향후 확장을 위해 유지하는 것을 권장**

---

## 이벤트 목록

### Member 모듈 이벤트
| 이벤트 | 설명 | 구독 모듈 |
|--------|------|-----------|
| `MemberRegisteredEvent` | 회원 가입 | - |
| `MemberWithdrawnEvent` | 회원 탈퇴 | Community, Chat |
| `MemberBlockedEvent` | 회원 차단 | Community, Chat |
| `MemberUnblockedEvent` | 회원 차단 해제 | - |
| `MemberGradeChangedEvent` | 등급 변경 | - |
| `MemberProfileUpdatedEvent` | 프로필 변경 | - |

### Community 모듈 이벤트
| 이벤트 | 설명 | 구독 모듈 |
|--------|------|-----------|
| `PostCreatedEvent` | 게시글 작성 | Member (활동 증가) |
| `PostDeletedEvent` | 게시글 삭제 | Member (활동 감소) |
| `CommentCreatedEvent` | 댓글 작성 | Member |
| `CommentDeletedEvent` | 댓글 삭제 | Member |
| `PostLikeToggledEvent` | 좋아요 토글 | Member |

## 모듈 의존성 규칙

```
         ┌──────────────┐
         │    shared    │  ← 모든 모듈이 의존
         └──────────────┘
                │
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
┌────────┐ ┌─────────┐ ┌─────────┐
│ member │ │community│ │  chat   │
└────────┘ └─────────┘ └─────────┘
    │           │           │
    └───────────┼───────────┘
                │
                ▼
         ┌──────────────┐
         │    admin     │  ← 모든 모듈의 API 사용
         └──────────────┘
```

**의존성 규칙:**
1. `shared` → 어떤 모듈도 의존하지 않음 (독립)
2. `member` → `shared`만 의존
3. `community`, `chat`, `notice`, `match`, `report` → `shared`, `member.api`만 의존
4. `admin` → 모든 모듈의 `api` 패키지만 의존

## 향후 MSA 전환 시

1. 각 모듈의 `api/` 패키지를 gRPC/REST 클라이언트로 교체
2. 이벤트 버스를 Kafka/RabbitMQ로 교체
3. 모듈별로 별도 서비스로 분리

```kotlin
// 현재 (모듈러 모놀리스)
@Inject
lateinit var memberApi: MemberApi  // 로컬 구현체

// MSA 전환 후
@RegisterRestClient
interface MemberApi  // REST 클라이언트
```

## 새로운 모듈 추가 시

1. `api/` 패키지에 공개 API 인터페이스 정의
2. `internal/` 패키지에 API 구현체 작성
3. 필요 시 이벤트 클래스 정의
4. `ModuleRegistry`에 API 등록
