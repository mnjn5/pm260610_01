-- 0004_units_and_roles.sql
-- 4단계 권한(user/manager/leader/admin) + units 테이블(상위/하위 유닛, 담당자) 도입
-- 참고: 팀 합의 - 어드민(전사), 리더(최상위 유닛), 매니저(하위 유닛, 대시보드 접근 불가), 유저(요청만)

-- ============================================================
-- profiles.role 4단계로 확장
-- ============================================================
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('user', 'manager', 'leader', 'admin'));

-- ============================================================
-- units (유닛 계층 + 담당자)
-- ============================================================
create table units (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  parent_id uuid references units(id),
  manager_id uuid references profiles(id),
  created_at timestamptz default now()
);

alter table units enable row level security;

create policy "인증 사용자 전체 조회" on units for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- profiles.unit_id (units 참조, unit_name은 표시용으로 유지)
-- ============================================================
alter table profiles add column unit_id uuid references units(id);

-- ============================================================
-- 헬퍼 함수
-- ============================================================
create or replace function is_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = uid and role = 'admin'
  );
$$;

-- uid가 관리 권한을 갖는 유닛 id 목록 (자기 유닛 + 직속 하위 유닛, 어드민은 전체)
create or replace function managed_unit_ids(uid uuid)
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select id from units
  where is_admin(uid)
     or manager_id = uid
     or parent_id in (select id from units where manager_id = uid)
$$;

-- ============================================================
-- profiles RLS 정책 갱신 (is_leader → is_admin / managed_unit_ids)
-- ============================================================
drop policy if exists "리더는 모든 프로필 조회 가능" on profiles;
drop policy if exists "리더는 모든 프로필 수정 가능" on profiles;

create policy "유닛 담당자/어드민은 프로필 조회 가능" on profiles for select
  using (is_admin(auth.uid()) or unit_id in (select managed_unit_ids(auth.uid())));

create policy "유닛 담당자/어드민은 프로필 수정 가능" on profiles for update
  using (is_admin(auth.uid()) or unit_id in (select managed_unit_ids(auth.uid())));

-- ============================================================
-- token_limit_requests RLS 정책 갱신
-- ============================================================
drop policy if exists "리더는 모든 요청 조회" on token_limit_requests;
drop policy if exists "리더만 요청 처리 가능" on token_limit_requests;

create policy "유닛 담당자/어드민은 요청 조회 가능" on token_limit_requests for select
  using (
    exists (
      select 1 from profiles requester
      where requester.id = token_limit_requests.requester_id
        and (is_admin(auth.uid()) or requester.unit_id in (select managed_unit_ids(auth.uid())))
    )
  );

create policy "유닛 담당자/어드민만 요청 처리 가능" on token_limit_requests for update
  using (
    exists (
      select 1 from profiles requester
      where requester.id = token_limit_requests.requester_id
        and (is_admin(auth.uid()) or requester.unit_id in (select managed_unit_ids(auth.uid())))
    )
  )
  with check (
    exists (
      select 1 from profiles requester
      where requester.id = token_limit_requests.requester_id
        and (is_admin(auth.uid()) or requester.unit_id in (select managed_unit_ids(auth.uid())))
    )
  );

drop function if exists is_leader(uuid);

-- ============================================================
-- handle_new_user() 트리거 갱신 — 가입 시 unit_name으로 unit_id도 함께 설정
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
declare
  new_unit_name text;
begin
  new_unit_name := coalesce(new.raw_user_meta_data->>'unit_name', '마케팅팀');

  insert into public.profiles (id, username, email, role, unit_name, unit_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    new_unit_name,
    (select id from public.units where name = new_unit_name)
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- ============================================================
-- 시드 백필: TokenPush(최상위) / 마케팅팀(하위) 유닛 생성 및 연결
-- ============================================================
insert into units (name, parent_id, manager_id)
values ('TokenPush', null, (select id from profiles where role = 'leader' and unit_name = 'TokenPush' limit 1));

insert into units (name, parent_id, manager_id)
values ('마케팅팀', (select id from units where name = 'TokenPush'), null);

update profiles set unit_id = (select id from units where units.name = profiles.unit_name)
where unit_id is null;
