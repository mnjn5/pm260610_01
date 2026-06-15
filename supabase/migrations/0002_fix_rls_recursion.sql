-- 0002_fix_rls_recursion.sql
-- profiles 테이블의 "리더" RLS 정책이 profiles를 재조회하면서 infinite recursion 발생.
-- security definer 헬퍼 함수로 RLS를 우회해 role을 조회하도록 수정.

create or replace function is_leader(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = uid and role = 'leader'
  );
$$;

-- profiles 정책 재생성
drop policy if exists "리더는 모든 프로필 조회 가능" on profiles;
drop policy if exists "리더는 모든 프로필 수정 가능" on profiles;

create policy "리더는 모든 프로필 조회 가능" on profiles for select
  using (is_leader(auth.uid()));

create policy "리더는 모든 프로필 수정 가능" on profiles for update
  using (is_leader(auth.uid()));

-- token_limit_requests 정책 재생성
drop policy if exists "리더는 모든 요청 조회" on token_limit_requests;
drop policy if exists "리더만 요청 처리 가능" on token_limit_requests;

create policy "리더는 모든 요청 조회" on token_limit_requests for select
  using (is_leader(auth.uid()));

create policy "리더만 요청 처리 가능" on token_limit_requests for update
  using (is_leader(auth.uid()))
  with check (is_leader(auth.uid()));
