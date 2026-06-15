# CLAUDE.md

## 프로젝트 개요

React + Tailwind CSS + Supabase 기반 **기업 AI 토큰 사용량 관리 플랫폼** 데모.
조직 내 AI 토큰 예산을 유닛(팀) 단위로 배분·관리하고, 사용자가 한도 조정을 요청하면 리더(매니저)가 승인/반려하는 흐름을 구현합니다.

> 상세 설계는 [`docs/spec-demo.md`](docs/spec-demo.md) 참고.

## 기술 스택

- **프론트엔드**: React 18, React Router v6
- **스타일링**: Tailwind CSS v3
- **백엔드/DB**: Supabase (PostgreSQL, Auth)
- **빌드 도구**: Vite
- **패키지 매니저**: npm

## 프로젝트 구조

```
src/
├── components/
│   ├── common/        # Button, Spinner, ErrorMessage, Layout, Sidebar, Badge
│   ├── auth/          # LoginForm, ProtectedRoute
│   └── requests/      # RequestCard, RequestForm, RequestStatusBadge
├── pages/
│   ├── LoginPage.jsx
│   ├── user/          # MyPage (내 정보 + 사용량 + 한도 조정 요청)
│   └── leader/        # LeaderDashboard, RequestApprovalPage
├── hooks/
│   ├── useAuth.js         # 세션 관리, signIn/signOut
│   ├── useProfile.js      # 프로필 조회
│   ├── useMyRequests.js   # 내가 제출한 요청 목록/생성
│   └── useLeaderRequests.js  # 리더 - 대기 중 요청 목록, 승인/반려
├── context/
│   └── AuthContext.jsx    # session, user, profile, role 전역 제공
├── lib/
│   └── supabase.js
└── utils/
    ├── constants.js       # ROLES, REQUEST_STATUS
    └── formatDate.js
```

## Supabase 설정

### 환경 변수 (`.env`)

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### DB 스키마 요약

- **profiles**: `id`, `username`, `email`, `role`(`user`|`leader`), `unit_name`, `current_limit`(숫자, KRW), `used_amount`(숫자, KRW), `created_at`
- **token_limit_requests**: `id`, `requester_id`→profiles, `current_limit`, `requested_limit`, `reason`, `status`(`pending`|`approved`|`rejected`), `processed_by`→profiles, `processed_at`, `created_at`

전체 SQL은 `docs/spec-demo.md` 참고.

## 역할(Role) 설계

| 역할 | 설명 | 접근 가능 페이지 |
|------|------|----------------|
| `user` | 일반 사용자 | `/mypage` (사용량 확인 + 한도 조정 요청) |
| `leader` | 유닛 리더/매니저 | `/leader` (요청 승인·반려) |

## 핵심 기능

### 사용자(`user`) — 한도 조정 요청
1. 현재 한도·사용량 확인
2. 새 한도 금액 입력 → 증감률 자동 계산
3. 사용률 변화 미리보기 (프로그레스바)
4. 요청 사유 작성 후 제출
5. 제출 후 요청 내역 및 상태(`pending`/`approved`/`rejected`) 확인

### 리더(`leader`) — 요청 승인·반려
1. 대기 중 요청 목록 확인 (탭: 대기 / 처리 완료)
2. 요청 카드에서 요청자 정보·사유·금액 변화 확인
3. 승인 → `approved`, 프로필 `current_limit` 업데이트
4. 반려 → `rejected`

## 라우트 구조

```
/login                → 로그인 (LoginPage)
/mypage               → 내 현황 + 요청 내역   [user 보호]
/mypage/request       → 한도 조정 요청 폼      [user 보호]
/leader               → 대기 요청 목록         [leader 보호]
/leader/requests/:id  → 요청 상세 + 승인/반려  [leader 보호]
```

`ProtectedRoute(role)` — 로그인 미인증 시 `/login`, 역할 불일치 시 역할별 기본 페이지로 리다이렉트.

## 개발 명령어

```bash
npm install
npm run dev       # localhost:5173
npm run build
```

## 코딩 규칙

- 컴포넌트: 함수형 + React Hooks
- 스타일: Tailwind 유틸리티 클래스 우선, 인라인 style 금지
- Supabase 쿼리는 커스텀 훅(`hooks/`)에서만 실행, 컴포넌트 직접 작성 금지
- 에러: Supabase 응답 `error` 항상 확인 후 한국어 메시지로 노출
- 역할 보호: `user` 페이지는 `ProtectedRoute(role='user')`, `leader` 페이지는 `ProtectedRoute(role='leader')`
- 승인 처리 시 `token_limit_requests` 상태 업데이트와 `profiles.current_limit` 업데이트를 함께 처리

## 주의사항

- RLS 반드시 활성화 — anon key 클라이언트 노출이므로 정책이 유일한 서버 보안
- `leader`만 `token_limit_requests` UPDATE 가능하도록 RLS 정책 설정
- `profiles.current_limit`은 승인 시에만 업데이트 (반려 시 변경 없음)
- `.env` 파일 절대 커밋 금지
