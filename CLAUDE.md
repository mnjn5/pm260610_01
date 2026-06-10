# CLAUDE.md

## 프로젝트 개요

React + Tailwind CSS + Supabase 기반 회사 홈페이지 웹 애플리케이션.
회원가입/로그인, 회원 관리(admin/user 역할), 회사 소개, 제품소개, 게시판, 문의하기, 관리자 대시보드로 구성됩니다.

> 상세 요구사항/설계는 [`docs/spec/spec-fixed.md`](docs/spec/spec-fixed.md), DB 스키마 전체는 [`docs/database/schema.md`](docs/database/schema.md), 디자인 토큰은 [`docs/design/design-system.md`](docs/design/design-system.md) 참고.

## 기술 스택

- **프론트엔드**: React 18, React Router v6
- **스타일링**: Tailwind CSS v3
- **백엔드/DB**: Supabase (PostgreSQL, Auth, Storage)
- **빌드 도구**: Vite
- **패키지 매니저**: npm

## 프로젝트 구조


```
src/
├── components/
│   ├── common/        # Button, Spinner, ErrorMessage, Header, Footer, Layout, PagePlaceholder
│   ├── auth/          # LoginForm, RegisterForm, ProtectedRoute
│   └── admin/         # AdminRoute, AdminLayout
├── pages/
│   ├── HomePage.jsx
│   ├── auth/          # LoginPage, RegisterPage
│   ├── products/      # ProductListPage, ProductDetailPage  (placeholder)
│   ├── board/         # BoardListPage ✅, BoardDetailPage ✅, BoardWritePage ✅
│   ├── contact/       # ContactPage, ContactCompletePage    (placeholder)
│   ├── mypage/        # MyPage ✅
│   └── admin/         # AdminDashboardPage, AdminUserListPage, AdminPostListPage,
│                      # AdminProductListPage, AdminProductFormPage,
│                      # AdminInquiryListPage, AdminInquiryDetailPage (placeholder)
├── hooks/
│   ├── useAuth.js         ✅  세션 관리, signUp/signIn/signOut
│   ├── useProfile.js      ✅  프로필 조회·수정, 아바타 업로드/삭제, 미등록 계정 자동 생성
│   ├── usePosts.js        ✅  게시글 목록(페이지네이션) + createPost
│   ├── usePost.js         ✅  단일 게시글 조회(조회수 증가 옵션) + updatePost + deletePost
│   └── useComments.js     ✅  댓글 목록 + addComment + deleteComment
├── context/
│   └── AuthContext.jsx    ✅  session, user, profile, role,
│                              signUp/signIn/signOut,
│                              updateProfile, uploadAvatar, deleteAvatar,
│                              refetchProfile
├── lib/
│   └── supabase.js        ✅  Supabase 클라이언트 초기화
└── utils/
    ├── constants.js       ✅  ROLES, INQUIRY_STATUS
    └── formatDate.js      ✅  formatDate(날짜), formatDateTime(날짜+시각)
```

## Supabase 설정

### 환경 변수 (`.env`)

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### 클라이언트 초기화 (`src/lib/supabase.js`)

```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### DB 스키마

테이블: `profiles`, `posts`, `comments`, `products`, `inquiries`. 전체 컬럼 정의, RLS 정책 SQL, 인덱스, ER 관계는 [`docs/database/schema.md`](docs/database/schema.md)에 정리되어 있습니다. 핵심 요약:

- **profiles**: `auth.users` 확장. 컬럼: `id`, `username`, `email`, `avatar_url`, `phone`, `address`, `role`(`admin`|`user`, 기본 `user`), `created_at`
- **posts / comments**: 게시판 스키마. 작성자 본인 + 관리자가 게시글 삭제 가능(정책 OR 결합). 관리자는 댓글도 삭제 가능
- **products**: `is_published=true`만 공개 노출, CRUD는 관리자 전용
- **inquiries**: 문의 등록(비로그인 포함 누구나) + 상태 추적(`pending`→`answered`) + 관리자 답변

### Supabase Storage

- **`avatars` 버킷** (public): 프로필 사진 저장. 경로 규칙 `{userId}/avatar`
- RLS: 본인 경로(`auth.uid()::text = (storage.foldername(name))[1]`)에 대해서만 업로드·수정·삭제 허용

### DB 함수 / 트리거

- **`on_auth_user_created` 트리거**: `auth.users` INSERT 시 `raw_user_meta_data`(username·phone·address)를 읽어 `profiles` row를 자동 생성 (`security definer`)
- **`prevent_self_role_change` 트리거**: 본인의 role 변경 차단
- **`increment_view_count(post_id)` RPC**: 게시글 조회수 증가 (`security definer`, RLS 우회)

## 핵심 기능 구현 현황

### ✅ 회원가입/인증
- Supabase Auth 이메일/비밀번호 방식
- 회원가입 폼: 사용자명, 이메일, 비밀번호, **전화번호**, **주소** 입력
- `signUp` 시 `options.data`로 metadata 전달 → DB 트리거가 `profiles` 자동 생성
- `useProfile`에서 프로필 미존재(`PGRST116`) 감지 시 자동 생성 폴백 (트리거 추가 전 가입 계정 대응)
- `AuthContext` → `session`, `user`, `profile`, `role`, `loading` 전역 제공

### ✅ 마이페이지 (`/mypage`)
- 프로필 사진 등록·변경·삭제 (Supabase Storage `avatars` 버킷, 최대 5MB)
- 사용자명·이메일 읽기 전용 표시
- 전화번호·주소 수정 가능 (수정 버튼 → 저장/취소)

### ✅ 게시판 (`/board`)
- **목록**: 10개 페이지네이션, 번호·제목·작성자·작성일·조회수 표시
- **상세**: 조회수 자동 증가(RPC), 본인 수정·삭제, 관리자 삭제
- **작성/수정**: 공용 폼(`BoardWritePage`), URL의 `:id` 유무로 모드 분기
- **댓글**: 로그인 사용자 작성, 본인·관리자 삭제

### 🔲 미구현 (placeholder)
- 회사 홈페이지 상세 섹션
- 제품소개 (`/products`)
- 문의하기 (`/contact`)
- 관리자 대시보드 각 페이지

## 라우트 구조

`[보호]` = `ProtectedRoute`(로그인 필요), `[관리자]` = `AdminRoute`(role=admin 필요)

```
/                        → 회사 홈페이지 (HomePage)
/products                → 제품소개 목록 (ProductListPage)
/products/:id            → 제품 상세 (ProductDetailPage)
/contact                 → 문의하기 (ContactPage)
/contact/complete        → 문의 접수 완료 (ContactCompletePage)

/board                   → 게시판 목록 (BoardListPage)
/board/posts/:id         → 게시글 상세 (BoardDetailPage)
/board/posts/new         → 게시글 작성 (BoardWritePage) [보호]
/board/posts/:id/edit    → 게시글 수정 (BoardWritePage) [보호, 본인만]

/login                   → 로그인 (LoginPage)
/register                → 회원가입 (RegisterPage)
/mypage                  → 내 정보 (MyPage) [보호]

/admin                   → 관리자 대시보드 (AdminDashboardPage) [관리자]
/admin/users             → 회원 관리 (AdminUserListPage) [관리자]
/admin/posts             → 게시글 관리 (AdminPostListPage) [관리자]
/admin/products          → 제품 관리 (AdminProductListPage) [관리자]
/admin/products/new      → 제품 등록 (AdminProductFormPage) [관리자]
/admin/products/:id/edit → 제품 수정 (AdminProductFormPage) [관리자]
/admin/inquiries         → 문의 관리 (AdminInquiryListPage) [관리자]
/admin/inquiries/:id     → 문의 상세/답변 (AdminInquiryDetailPage) [관리자]
```

> `/admin/*`은 개별 페이지마다 가드를 거는 대신 `<AdminRoute><AdminLayout/></AdminRoute>` 한 곳에서만 감쌉니다.
> 페이지 컴포넌트는 Layout을 직접 렌더하지 않음 — `App.jsx`의 `<Route element={<Layout />}>` 부모 라우트가 헤더/푸터를 담당합니다.

## 개발 명령어

```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 실행 (localhost:5173)
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 결과 미리보기
```

## 코딩 규칙

- 컴포넌트: 함수형 + React Hooks만 사용
- 스타일: Tailwind 유틸리티 클래스 우선, 인라인 style 금지 (디자인 토큰은 `docs/design/design-system.md` 참고)
- Supabase 쿼리는 커스텀 훅(`hooks/`)에서만 실행, 컴포넌트에 직접 작성 금지
- 에러 처리: Supabase 응답의 `error` 객체 항상 확인 후 사용자에게 한국어 메시지로 표시
- 인증 필요 페이지는 `ProtectedRoute`, 관리자 전용 페이지는 `AdminRoute`로 감싸기
- 페이지 컴포넌트는 `<Layout>`을 직접 렌더하지 않는다 — App.jsx 라우트 구조가 담당
- 관리자가 수행하는 모든 CRUD는 클라이언트 가드와 **별개로** RLS 정책으로 서버 측에서도 반드시 강제
- 회원 role 변경: 트리거로 자기 자신의 승격/강등을 차단하고, 관리자만 타인의 role을 변경할 수 있도록 별도 정책을 둔다
- `.env` 파일은 절대 커밋하지 않음 (`.gitignore`에 포함)

## 주의사항

- RLS(Row Level Security)는 반드시 활성화 — anon key는 클라이언트에 노출되므로 정책이 유일한 서버 측 보안
- 비밀번호는 절대 클라이언트에서 직접 처리하지 않음 (Supabase Auth에 위임)
- `profiles` row는 DB 트리거(`on_auth_user_created`)가 생성 — 클라이언트에서 직접 insert하지 않는다
- `signUp` 호출 시 username·phone·address는 `options.data`로 전달해야 트리거가 읽을 수 있다
- `profiles`의 "누구나 프로필 조회 가능"(`using (true)`) select 정책은 절대 강화하지 말 것 — 다른 테이블의 admin 체크(`exists (select 1 from profiles ... role='admin')`)가 이 정책에 재귀적으로 의존하므로, 좁히면 모든 관리자 권한 체크가 깨진다
- `increment_view_count` RPC는 `security definer`로 실행되어 RLS를 우회한다 — 의도된 동작
