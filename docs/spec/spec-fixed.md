# 프로젝트 설계 (spec-original.md 보완판)

> `spec-original.md`의 요구사항(회사 홈페이지, 회원관리(admin/user), 제품소개, 게시판, 문의하기)을 실제 구현 가능한 수준으로 구체화한 설계 문서입니다.

## 요구사항 확정 사항

- **admin 권한 범위**: 회원/게시글/문의를 종합 관리 (회원 role 변경, 게시글 삭제, 문의 확인·답변)
- **제품소개 형태**: DB 기반 동적 콘텐츠 — `products` 테이블, admin이 등록/수정/삭제
- **문의하기 처리 방식**: DB 저장 + 관리자 확인/답변 (상태 추적: pending → answered)

## 1. DB 스키마 변경/추가 (SQL)

### profiles 컬럼 추가 + 트리거

**실제 적용된 profiles 컬럼**: `id`, `username`, `email`(unique not null), `avatar_url`, `phone`(nullable), `address`(nullable), `role`, `created_at`

**신규 사용자 자동 프로필 생성 트리거** (`on_auth_user_created`): `auth.users` INSERT 시 `raw_user_meta_data`에서 username·phone·address를 읽어 `profiles` row를 자동 생성. `signUp` 호출 시 `options.data`로 metadata 전달 필수.

**`useProfile` 폴백**: 트리거 추가 전 가입 계정은 profiles row가 없을 수 있으므로, `PGRST116` 에러 감지 시 `supabase.auth.getUser()` 정보로 자동 생성.

**role 자기 승격 방지 트리거** (`prevent_self_role_change`):

```sql
create or replace function prevent_self_role_change()
returns trigger as $$
begin
  if new.role <> old.role and auth.uid() = old.id then
    raise exception '본인의 역할(role)은 변경할 수 없습니다';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_prevent_self_role_change
  before update on profiles
  for each row execute function prevent_self_role_change();

create policy "관리자는 모든 프로필 수정 가능" on profiles
  for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
```

> 주의: 기존 "누구나 프로필 조회 가능" (`using (true)`) 정책을 유지해야 함 — admin 체크 서브쿼리가 재귀적으로 profiles를 읽으므로, select 정책을 강화하면 admin 체크가 깨짐.

### products 테이블 (제품소개, 관리자 CRUD)

```sql
create table products (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  image_url text,
  price numeric,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table products enable row level security;

create policy "누구나 게시된 제품 조회 가능" on products for select using (is_published = true);
create policy "관리자는 모든 제품 조회 가능" on products for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "관리자만 제품 등록 가능" on products for insert
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "관리자만 제품 수정 가능" on products for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "관리자만 제품 삭제 가능" on products for delete
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
```

### inquiries 테이블 (문의하기, 상태 추적 + 관리자 답변)

```sql
create table inquiries (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  title text not null,
  content text not null,
  status text not null default 'pending' check (status in ('pending', 'answered')),
  answer text,
  answered_by uuid references profiles(id) on delete set null,
  answered_at timestamptz,
  created_at timestamptz default now()
);
alter table inquiries enable row level security;

create policy "누구나 문의 등록 가능" on inquiries for insert with check (true);
create policy "본인 문의 조회 가능" on inquiries for select using (auth.uid() = user_id);
create policy "관리자는 모든 문의 조회 가능" on inquiries for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "관리자만 문의 답변 및 상태 변경 가능" on inquiries for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "관리자만 문의 삭제 가능" on inquiries for delete
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
```

### posts — 관리자 삭제 정책 추가

```sql
create policy "관리자는 모든 게시글 삭제 가능" on posts for delete
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
```

### comments — 관리자 삭제 정책 추가

```sql
create policy "관리자는 모든 댓글 삭제 가능" on comments for delete
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
```

### increment_view_count RPC

```sql
create or replace function increment_view_count(post_id bigint)
returns void as $$
  update posts set view_count = view_count + 1 where id = post_id;
$$ language sql security definer;
```

### Supabase Storage — avatars 버킷

프로필 사진 저장. 버킷명 `avatars` (public). 파일 경로: `{userId}/avatar`. Storage RLS: `auth.uid()::text = (storage.foldername(name))[1]`로 본인 경로만 업로드·수정·삭제 허용. 전체 정의는 `docs/database/schema.md` 6절 참조.

### 인덱스

```sql
create index idx_posts_created_at on posts (created_at desc);
create index idx_comments_post_id on comments (post_id);
create index idx_inquiries_status on inquiries (status);
create index idx_inquiries_user_id on inquiries (user_id);
create index idx_products_is_published on products (is_published);
```

## 2. 라우트 맵

`[보호]` = ProtectedRoute(로그인 필요), `[관리자]` = AdminRoute(role=admin 필요).
게시판은 `/`에서 `/board`로 이동(홈페이지가 `/`를 차지하는 구조 변경).

```
/                        → HomePage (회사 홈페이지)
/products                → ProductListPage
/products/:id            → ProductDetailPage
/contact                 → ContactPage
/contact/complete        → ContactCompletePage

/board                   → BoardListPage
/board/posts/:id         → BoardDetailPage
/board/posts/new         → BoardWritePage           [보호]
/board/posts/:id/edit    → BoardWritePage            [보호, 본인만]

/login, /register        → LoginPage, RegisterPage
/mypage                  → MyPage (내 정보/문의내역)  [보호]

/admin                   → AdminDashboardPage        [관리자]
/admin/users             → AdminUserListPage         [관리자]
/admin/posts             → AdminPostListPage         [관리자]
/admin/products          → AdminProductListPage      [관리자]
/admin/products/new      → AdminProductFormPage      [관리자]
/admin/products/:id/edit → AdminProductFormPage      [관리자]
/admin/inquiries         → AdminInquiryListPage      [관리자]
/admin/inquiries/:id     → AdminInquiryDetailPage    [관리자]
```

`/admin/*`는 `<AdminRoute><AdminLayout/></AdminRoute>` 한 곳에서만 가드한다.

## 3. 디렉터리 구조 (src/)

```
components/
  common/   Button, Input, Modal, Spinner, Pagination, ErrorMessage, Header, Footer, Layout
  auth/     LoginForm, RegisterForm, ProtectedRoute
  home/     HeroSection, CompanyIntroSection, FeaturedProductsSection, QuickLinksSection
  products/ ProductCard, ProductGrid, ProductDetailView
  board/    PostList, PostListItem, PostDetail, PostForm, CommentList, CommentItem, CommentForm
  contact/  InquiryForm, InquiryStatusBadge
  admin/    AdminRoute, AdminLayout, AdminSidebar, UserTable, RoleSelect,
            PostManageTable, ProductTable, ProductForm,
            InquiryTable, InquiryDetailPanel, InquiryStatusSelect
pages/
  HomePage
  auth/{LoginPage, RegisterPage}
  products/{ProductListPage, ProductDetailPage}
  board/{BoardListPage, BoardDetailPage, BoardWritePage}
  contact/{ContactPage, ContactCompletePage}
  mypage/MyPage
  admin/{AdminDashboardPage, AdminUserListPage, AdminPostListPage,
         AdminProductListPage, AdminProductFormPage,
         AdminInquiryListPage, AdminInquiryDetailPage}
hooks/
  useAuth, useProfile, usePosts, usePost, useComments,
  useProducts, useProduct, useInquiries,
  useAdminUsers, useAdminPosts, useAdminProducts, useAdminInquiries
lib/supabase.js
context/AuthContext.jsx
utils/{formatDate, validators, constants}
```

## 4. 커스텀 훅 책임 분담

| 훅 | 책임 |
|---|---|
| `useAuth` | signUp(options.data로 metadata 전달)/signIn/signOut/session/loading |
| `useProfile` | 프로필 조회·updateProfile·uploadAvatar·deleteAvatar; PGRST116 시 자동 생성 폴백 |
| `usePosts`/`usePost`/`useComments` | 게시판 목록(페이지네이션)/상세(조회수RPC)/CRUD/댓글 ✅ 구현 완료 |
| `useProducts`/`useProduct` | 공개(is_published=true) 제품 목록/상세 |
| `useInquiries` | 문의 등록(공개), 본인 문의 내역 조회 |
| `useAdminUsers` | 전체 회원 목록, role 변경 |
| `useAdminPosts` | 전체 게시글 목록(작성자 join), 삭제 |
| `useAdminProducts` | 제품 CRUD (등록/수정/삭제/미게시 포함 목록) |
| `useAdminInquiries` | 전체 문의 목록/필터, 답변·상태 변경 |

각 훅은 쿼리 후 `error`를 체크하여 컴포넌트에 `<ErrorMessage/>`로 노출하고, `loading`/`refetch`를 제공한다 (CLAUDE.md "Supabase 쿼리는 hooks에서만" 규칙 준수).

## 5. 권한(RBAC) 설계

- **클라이언트**: `AuthContext`가 `useAuth`+`useProfile`을 합쳐 `user`/`profile`/`role`을 제공한다. `ProtectedRoute`는 `user` 존재 여부만, `AdminRoute`는 `user && profile.role === 'admin'`까지 확인 후 `<Navigate>`로 리다이렉트한다.
- **서버(RLS, 진짜 보안 경계)**: anon key가 클라이언트에 노출되므로 모든 admin 작업은 `exists (select 1 from profiles ... role='admin')` 형태의 정책으로 독립적으로 강제한다. role 자기 승격은 트리거로 차단한다.
- 클라이언트 가드는 UX 편의일 뿐이다 — RLS 정책을 먼저 설계하고 UI 가드는 그 위에 얹는다.

## 6. 구현 현황

| 단계 | 항목 | 상태 |
|---|---|---|
| 1 | 스캐폴딩, 라우터 골격, 플레이스홀더 | ✅ 완료 |
| 2 | 인증/프로필/역할 (`useAuth`/`useProfile`/`AuthContext`/`ProtectedRoute`/`AdminRoute`, 로그인/회원가입) | ✅ 완료 |
| 2+ | 회원가입 폼 전화번호·주소 추가, 프로필 사진(Storage), 마이페이지 정보 수정 | ✅ 완료 |
| 3 | 게시판 (`usePosts`/`usePost`/`useComments`, 목록/상세/작성/수정/댓글) | ✅ 완료 |
| 4 | 제품소개 (`useProducts`/`useProduct`, 목록/상세) | 🔲 미구현 |
| 5 | 문의하기 (`useInquiries`, 문의 폼/완료) | 🔲 미구현 |
| 6 | 관리자 대시보드 (회원/게시글/제품/문의 관리) | 🔲 미구현 |
| 7 | 홈페이지 상세 섹션, 반응형 점검 | 🔲 미구현 |

## 7. CLAUDE.md 갱신 항목

- 프로젝트 개요: 게시판 중심 → 홈페이지/회원관리/제품/게시판/문의/관리자 전체로 확장
- 프로젝트 구조: `home/`, `products/`, `contact/`, `admin/` 추가, 신규 훅 목록 추가
- DB 스키마: role 컬럼+트리거, products/inquiries 테이블, posts admin 삭제 정책, 인덱스 추가
- 핵심 기능: "회원 관리(관리자)", "제품소개", "문의하기", "관리자 대시보드" 섹션 신설
- 라우트 구조: 위 2번 라우트 맵으로 교체 (게시판이 `/`→`/board`로 이동함을 명시)
- 코딩 규칙: "관리자 라우트는 AdminRoute로 감싸고 모든 admin 작업은 RLS로도 강제", "role 변경은 트리거+정책으로 자기 승격 차단" 규칙 추가
- 주의사항: profiles select 정책(`using(true)`)을 유지해야 admin 체크 서브쿼리가 깨지지 않는다는 점 명시

## 8. 검증 체크리스트 (정상 + 엣지케이스 27개)

구현 후 아래 시나리오를 실제로 (Supabase MCP `execute_sql`/`get_advisors` 및 브라우저 수동 테스트로) 검증한다.

**인증/회원/역할**
1. 일반 회원가입 시 `profiles`에 `role='user'`로 기본 생성되는지
2. 로그인하지 않은 상태에서 `/board/posts/new`, `/mypage`, `/admin` 접근 시 `/login`으로 리다이렉트되는지
3. 일반 user가 `/admin`, `/admin/users` 등에 직접 URL로 접근 시 `/`로 리다이렉트되는지 (UI 가드)
4. 일반 user가 자신의 `profiles.role`을 `update`로 직접 `'admin'`으로 바꾸려는 SQL/API 호출이 트리거에 의해 거부되는지 (RLS 우회 시도 검증)
5. admin 계정이 다른 사용자의 `role`을 `user→admin`/`admin→user`로 변경할 수 있는지, 그리고 그 결과가 즉시 화면에 반영되는지
6. 동일 이메일로 중복 가입 시도 시 Supabase Auth 에러가 사용자에게 한국어로 표시되는지
7. 비밀번호 형식 미달/이메일 형식 오류 등 입력 검증 에러가 폼에서 제대로 노출되는지

**게시판**
8. 비로그인 사용자가 게시글 목록/상세는 볼 수 있지만 작성/수정/삭제 버튼은 보이지 않는지
9. 본인이 작성하지 않은 게시글의 `/board/posts/:id/edit` URL에 직접 접근 시 차단되는지 (UI + RLS 양쪽)
10. admin이 타인의 게시글을 삭제할 수 있는지 (관리자 삭제 정책 동작 확인)
11. 게시글 상세 진입 시 `view_count`가 정확히 1씩 증가하고, 새로고침을 반복해도 비정상적으로 누적되지 않는지(중복 증가 정책 결정 필요)
12. 댓글 작성/삭제 권한이 본인 댓글에만 적용되는지, 게시글 삭제 시 댓글이 cascade로 함께 삭제되는지

**제품소개**
13. `is_published=false`인 제품이 일반 사용자/비로그인 사용자에게는 노출되지 않고 admin 목록에는 보이는지
14. admin이 제품을 등록/수정/삭제했을 때 일반 사용자 화면에 즉시(또는 새로고침 후) 반영되는지
15. `price`가 `null`이거나 `image_url`이 없는 제품을 카드/상세에서 깨지지 않고 처리하는지 (옵셔널 필드 렌더링)
16. 제품이 0개일 때 목록 페이지와 홈페이지의 "추천 제품" 섹션이 빈 상태 UI를 보여주는지

**문의하기**
17. 비로그인 방문자가 문의를 등록할 수 있고(`user_id=null`), 등록 후 완료 페이지로 이동하는지
18. 로그인 사용자가 문의를 등록하면 `user_id`가 자동으로 채워지고, `/mypage`에서 본인 문의 내역(상태 포함)을 조회할 수 있는지
19. 타인이 등록한 문의를 본인 계정으로 조회할 수 없는지 (RLS select 정책 검증)
20. admin이 문의에 답변을 작성하면 `status`가 `pending→answered`로 바뀌고 `answered_by`/`answered_at`이 채워지는지, 작성자 화면에도 답변이 노출되는지
21. 필수 입력값(이름/이메일/제목/내용) 누락 시 클라이언트 검증 메시지가 표시되고 빈 값으로 DB에 들어가지 않는지

**관리자 대시보드**
22. `/admin`의 각 하위 메뉴(회원/게시글/제품/문의)가 AdminLayout 한 곳의 가드만으로 모두 보호되는지 (개별 페이지에 가드 누락 없는지)
23. 회원 목록에서 본인 계정의 role 변경 UI는 비활성화되거나, 시도 시 트리거 에러 메시지가 사용자에게 노출되는지
24. 대량 데이터(게시글/문의/회원 수십~수백 건) 상황에서 관리자 목록 페이지에 페이지네이션이 정상 동작하는지

**공통/인프라**
25. `mcp__supabase__get_advisors`(security)로 새로 추가된 `products`/`inquiries` 테이블의 RLS 활성화 및 정책 누락 여부를 점검
26. 네트워크 오류/Supabase 에러 발생 시 모든 페이지에서 `error` 객체를 사용자에게 한국어 메시지로 노출하는지 (CLAUDE.md 에러 처리 규칙 준수)
27. 모바일 폭(375px 등)에서 Header 네비게이션, 관리자 사이드바, 폼들이 Tailwind 반응형 클래스로 깨지지 않는지

## 검증 방법

- Supabase MCP `apply_migration`으로 스키마 적용 후 `list_tables`/`get_advisors(type=security)`로 RLS 활성화 확인
- `execute_sql`로 위 1~7, 9~10, 13, 17~21번 같은 권한/데이터 시나리오를 실제 쿼리로 재현(예: 일반 user 세션으로 admin 전용 update/delete 시도 → 거부 확인)
- `npm run dev`로 브라우저에서 일반 계정/관리자 계정 두 개를 번갈아 로그인하며 8~12, 14~16, 22~24, 27번 UI 시나리오 수동 점검
- `npm run build`로 빌드 에러 없는지 최종 확인
