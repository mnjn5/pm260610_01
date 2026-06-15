-- 0001_init_schema.sql
-- profiles, token_limit_requests 테이블 + 트리거 + RLS 정책 + 인덱스
-- 참고: docs/spec-demo.md 1. DB 스키마

-- ============================================================
-- 기존 객체 초기화 (다른 스키마의 profiles가 이미 존재하는 경우)
-- ============================================================
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();
drop table if exists token_limit_requests cascade;
drop table if exists profiles cascade;

-- ============================================================
-- profiles
-- ============================================================
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text not null,
  email text not null,
  role text not null default 'user' check (role in ('user', 'leader')),
  unit_name text not null default '마케팅팀',
  current_limit numeric not null default 750000,   -- 현재 한도 (KRW)
  used_amount numeric not null default 0,          -- 누적 사용량 (KRW)
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "본인 프로필 조회" on profiles for select using (auth.uid() = id);
create policy "본인 프로필 수정" on profiles for update using (auth.uid() = id);

-- 리더가 구성원 프로필 조회 (승인 시 current_limit 업데이트 필요)
create policy "리더는 모든 프로필 조회 가능" on profiles for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'leader'));

create policy "리더는 모든 프로필 수정 가능" on profiles for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'leader'));

-- ============================================================
-- 트리거 — 신규 사용자 프로필 자동 생성
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username, email, role, unit_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    coalesce(new.raw_user_meta_data->>'unit_name', '마케팅팀')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- token_limit_requests
-- ============================================================
create table token_limit_requests (
  id bigint generated always as identity primary key,
  requester_id uuid references profiles(id) on delete cascade not null,
  current_limit numeric not null,       -- 요청 당시 현재 한도
  requested_limit numeric not null,     -- 요청 한도
  reason text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  processed_by uuid references profiles(id) on delete set null,
  processed_at timestamptz,
  created_at timestamptz default now()
);

alter table token_limit_requests enable row level security;

-- 사용자: 본인 요청 생성 + 조회
create policy "본인 요청 생성" on token_limit_requests for insert
  with check (auth.uid() = requester_id);

create policy "본인 요청 조회" on token_limit_requests for select
  using (auth.uid() = requester_id);

-- 리더: 모든 요청 조회 + 상태 업데이트
create policy "리더는 모든 요청 조회" on token_limit_requests for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'leader'));

create policy "리더만 요청 처리 가능" on token_limit_requests for update
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'leader'))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'leader'));

-- ============================================================
-- 인덱스
-- ============================================================
create index idx_requests_requester on token_limit_requests (requester_id);
create index idx_requests_status on token_limit_requests (status);
create index idx_requests_created_at on token_limit_requests (created_at desc);
