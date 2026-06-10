# 데이터베이스 스키마 (Supabase / PostgreSQL)

> `CLAUDE.md`의 기존 게시판 스키마와 `docs/spec/spec-fixed.md`에서 확장 설계한 회원 역할(role)/제품(products)/문의(inquiries) 스키마를 통합 정리한 문서입니다. RLS(Row Level Security)는 모든 테이블에서 필수이며, anon key가 클라이언트에 노출되므로 정책이 유일한 서버 측 보안 경계입니다.

## 테이블 개요

| 테이블 | 설명 | RLS |
|---|---|---|
| `profiles` | `auth.users` 확장 — 사용자명, 이메일, 아바타, 전화번호, 주소, **역할(role)** | ✅ |
| `posts` | 게시판 글 | ✅ |
| `comments` | 게시글 댓글 | ✅ |
| `products` | 제품소개 (관리자 CRUD, DB 기반 동적 콘텐츠) | ✅ |
| `inquiries` | 문의하기 (상태 추적 + 관리자 답변) | ✅ |

## ER 관계 요약

```
auth.users 1───1 profiles (role: admin | user)
profiles   1───N posts
profiles   1───N comments
posts      1───N comments
profiles   1───N products  (실제로는 admin만 작성 — FK 없음, RLS로 통제)
profiles   1───N inquiries (user_id nullable — 비로그인 작성 가능)
profiles   1───N inquiries (answered_by — 답변한 관리자)
```

---

## 1. `profiles` — 회원 프로필 (역할 포함)

`auth.users`를 확장하며, `on_auth_user_created` 트리거가 `auth.users` INSERT 시 자동으로 row를 생성한다. 클라이언트에서 직접 insert하지 않는다.

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  email text unique not null,
  avatar_url text,
  phone text,
  address text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "누구나 프로필 조회 가능" on profiles for select using (true);
create policy "본인 프로필 생성 가능" on profiles for insert with check (auth.uid() = id);
create policy "본인만 프로필 수정 가능" on profiles for update using (auth.uid() = id);
```

### 신규 사용자 프로필 자동 생성 (트리거)

`auth.users`에 INSERT가 발생하면 `raw_user_meta_data`에서 username·phone·address를 읽어 `profiles` row를 자동 생성한다. `security definer`로 실행되어 RLS를 우회한다.

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email, phone, address)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'address'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

> `signUp` 호출 시 반드시 `options.data: { username, phone, address }`로 metadata를 전달해야 트리거가 올바르게 읽는다.

### role 자기 승격 방지 (트리거)

Postgres RLS만으로는 "본인이 자신의 role은 못 바꾸지만 admin은 타인의 role을 바꿀 수 있다"는 규칙을 깔끔하게 표현하기 어려우므로, 트리거로 자기 자신의 role 변경을 차단하고 admin에게는 별도 update 정책을 부여한다.

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

> ⚠️ **주의**: "누구나 프로필 조회 가능" (`using (true)`) 정책을 절대 강화하지 말 것. 다른 테이블의 admin 체크(`exists (select 1 from profiles ... role='admin')`)가 이 select 정책에 재귀적으로 의존하므로, 이를 좁히면 모든 admin 권한 체크가 깨진다.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | uuid (PK, FK → auth.users) | 사용자 ID |
| `username` | text, unique, not null | 사용자명 |
| `email` | text, unique, not null | 이메일 (auth.users와 동기화) |
| `avatar_url` | text | 프로필 이미지 URL |
| `phone` | text, nullable | 전화번호 |
| `address` | text, nullable | 주소 |
| `role` | text, default `'user'`, check (`admin`\|`user`) | 회원 역할 |
| `created_at` | timestamptz | 가입일 |

---

## 2. `posts` — 게시판 글

```sql
create table posts (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  view_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table posts enable row level security;

create policy "누구나 게시글 조회 가능" on posts for select using (true);
create policy "로그인 사용자만 작성 가능" on posts for insert with check (auth.uid() = user_id);
create policy "본인만 수정 가능" on posts for update using (auth.uid() = user_id);
create policy "본인만 삭제 가능" on posts for delete using (auth.uid() = user_id);

-- 관리자는 모든 게시글 삭제 가능 (기존 "본인만 삭제 가능"과 OR로 공존)
create policy "관리자는 모든 게시글 삭제 가능" on posts for delete
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
```

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | bigint (PK, identity) | 글 ID |
| `user_id` | uuid (FK → profiles) | 작성자 |
| `title` / `content` | text, not null | 제목 / 본문 |
| `view_count` | int, default 0 | 조회수 |
| `created_at` / `updated_at` | timestamptz | 작성/수정 시각 |

---

## 3. `comments` — 댓글

```sql
create table comments (
  id bigint generated always as identity primary key,
  post_id bigint references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

alter table comments enable row level security;

create policy "누구나 댓글 조회 가능" on comments for select using (true);
create policy "로그인 사용자만 댓글 작성 가능" on comments for insert with check (auth.uid() = user_id);
create policy "본인만 댓글 삭제 가능" on comments for delete using (auth.uid() = user_id);

-- 관리자는 모든 댓글 삭제 가능 (기존 "본인만 삭제 가능"과 OR로 공존)
create policy "관리자는 모든 댓글 삭제 가능" on comments for delete
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
```

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | bigint (PK, identity) | 댓글 ID |
| `post_id` | bigint (FK → posts, cascade) | 대상 게시글 |
| `user_id` | uuid (FK → profiles, cascade) | 작성자 |
| `content` | text, not null | 내용 |
| `created_at` | timestamptz | 작성 시각 |

---

## 4. `products` — 제품소개 (관리자 CRUD, DB 기반 동적 콘텐츠)

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

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | bigint (PK, identity) | 제품 ID |
| `name` | text, not null | 제품명 |
| `description` | text | 설명 |
| `image_url` | text | 대표 이미지 URL |
| `price` | numeric | 가격 (nullable — 비공개 가격 허용) |
| `is_published` | boolean, default true | 공개 여부 (false면 일반 사용자에게 노출 안 됨) |
| `created_at` / `updated_at` | timestamptz | 등록/수정 시각 |

---

## 5. `inquiries` — 문의하기 (상태 추적 + 관리자 답변)

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

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | bigint (PK, identity) | 문의 ID |
| `user_id` | uuid (FK → profiles, nullable) | 작성자 (비로그인 작성 시 null) |
| `name` / `email` / `phone` | text | 문의자 연락처 정보 |
| `title` / `content` | text, not null | 제목 / 내용 |
| `status` | text, default `'pending'`, check (`pending`\|`answered`) | 처리 상태 |
| `answer` | text | 관리자 답변 내용 |
| `answered_by` | uuid (FK → profiles, nullable) | 답변한 관리자 |
| `answered_at` | timestamptz | 답변 시각 |
| `created_at` | timestamptz | 등록 시각 |

---

## 6. Supabase Storage

### `avatars` 버킷 (public)

프로필 사진 저장. 파일 경로 규칙: `{userId}/avatar` (확장자 없이 고정 경로, upsert로 덮어쓰기).

```sql
-- 버킷 생성
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Storage RLS
create policy "본인 아바타 업로드 가능" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "본인 아바타 수정 가능" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "본인 아바타 삭제 가능" on storage.objects
  for delete using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );
```

## 7. DB 함수 (RPC)

```sql
-- 게시글 조회수 증가 (security definer — RLS 우회, 누구나 호출 가능)
create or replace function increment_view_count(post_id bigint)
returns void as $$
  update posts set view_count = view_count + 1 where id = post_id;
$$ language sql security definer;
```

`usePost` 훅에서 `incrementView: true` 옵션으로 호출. 수정 페이지(`BoardWritePage`)에서는 호출하지 않는다.

## 8. 인덱스

```sql
create index idx_posts_created_at on posts (created_at desc);
create index idx_comments_post_id on comments (post_id);
create index idx_inquiries_status on inquiries (status);
create index idx_inquiries_user_id on inquiries (user_id);
create index idx_products_is_published on products (is_published);
```

---

## RLS 정책 요약

| 테이블 | 조회(select) | 작성(insert) | 수정(update) | 삭제(delete) |
|---|---|---|---|---|
| `profiles` | 누구나 | 본인(`auth.uid() = id`) | 본인 / 관리자(역할 변경, 트리거로 자기 승격 차단) | — |
| `posts` | 누구나 | 로그인 사용자(본인) | 본인 | 본인 또는 관리자 |
| `comments` | 누구나 | 로그인 사용자(본인) | — | 본인 또는 관리자 |
| `products` | 공개된 것만(`is_published=true`) / 관리자는 전체 | 관리자만 | 관리자만 | 관리자만 |
| `inquiries` | 본인 또는 관리자 | 누구나(비로그인 포함) | 관리자만(답변/상태) | 관리자만 |

> 클라이언트 측 라우트 가드(`ProtectedRoute`/`AdminRoute`)는 UX 편의일 뿐이며, 위 RLS 정책이 실제 보안 경계입니다. 새 마이그레이션 적용 후에는 반드시 `mcp__supabase__get_advisors(type="security")`로 RLS 활성화 및 정책 누락 여부를 점검하세요.

## 마이그레이션 적용 순서 참고

1. `profiles` 생성 + `email`/`phone`/`address` 컬럼 추가 + role 트리거 + INSERT 정책
2. `on_auth_user_created` 트리거 생성
3. `posts`, `comments` 생성
4. `products` 생성
5. `inquiries` 생성
6. `posts`에 관리자 삭제 정책 추가
7. `comments`에 관리자 삭제 정책 추가
8. `increment_view_count` RPC 생성
9. `avatars` Storage 버킷 + RLS 생성
10. 인덱스 생성
