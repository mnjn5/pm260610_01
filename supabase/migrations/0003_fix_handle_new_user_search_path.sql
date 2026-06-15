-- 0003_fix_handle_new_user_search_path.sql
-- handle_new_user()에 search_path가 지정되지 않아 auth.users insert 시
-- supabase_auth_admin 역할의 기본 search_path에 public이 없어 profiles 테이블을
-- 찾지 못하고 "Database error saving new user"가 발생하는 문제 수정.

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, email, role, unit_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    coalesce(new.raw_user_meta_data->>'unit_name', '마케팅팀')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;
