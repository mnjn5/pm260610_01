-- 0005_add_saup_ga_units.sql
-- 사업팀(TokenPush 하위), 경영부(독립 최상위) 유닛 추가

insert into units (name, parent_id, manager_id)
select '사업팀', id, null
from units where name = 'TokenPush'
on conflict (name) do nothing;

insert into units (name, parent_id, manager_id)
values ('경영부', null, null)
on conflict (name) do nothing;
