// 데모 더미 계정 시드 스크립트
// 실행: node --env-file=.env scripts/seed-users.js
// 필요 환경변수: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('ERROR: .env에 VITE_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 필요합니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── 계정 목록 ──────────────────────────────────────────────
// 유닛 구조:
//   TokenPush (최상위)
//   └ 마케팅팀
//   └ 사업팀
//   경영부 (독립 최상위)
const USERS = [
  { email: 'leader@demo.com', username: '김토큰', role: 'leader',  unit_name: 'TokenPush', current_limit: 3_000_000, used_amount: 1_240_000 },
  { email: 'user@demo.com',   username: '이마케', role: 'user',    unit_name: '마케팅팀',  current_limit:   750_000, used_amount:   572_028 },
  { email: 'mkt@demo.com',    username: '박수현', role: 'manager', unit_name: '마케팅팀',  current_limit: 1_000_000, used_amount:   420_000 },
  { email: 'mkt-a1@demo.com', username: '최지현', role: 'user',    unit_name: '마케팅팀',  current_limit:   600_000, used_amount:   180_000 },
  { email: 'dev@demo.com',    username: '정태준', role: 'manager', unit_name: '사업팀',    current_limit: 1_200_000, used_amount:   890_000 },
  { email: 'dev-a1@demo.com', username: '강민서', role: 'user',    unit_name: '사업팀',    current_limit:   500_000, used_amount:   320_000 },
  { email: 'ga@demo.com',     username: '윤성호', role: 'leader',  unit_name: '경영부',    current_limit: 2_000_000, used_amount:   650_000 },
  { email: 'ga-a1@demo.com',  username: '조은별', role: 'user',    unit_name: '경영부',    current_limit:   800_000, used_amount:   210_000 },
  { email: 'ga-a2@demo.com',  username: '한준혁', role: 'user',    unit_name: '경영부',    current_limit:   800_000, used_amount:   680_000 },
]

// 유닛 책임자 매핑
const UNIT_MANAGERS = [
  { unit: 'TokenPush', email: 'leader@demo.com' },
  { unit: '마케팅팀',  email: 'mkt@demo.com'    },
  { unit: '사업팀',    email: 'dev@demo.com'    },
  { unit: '경영부',    email: 'ga@demo.com'     },
]

// ── 유닛 존재 확인 ─────────────────────────────────────────
async function ensureUnits() {
  const defs = [
    { name: 'TokenPush', parent: null },
    { name: '마케팅팀',  parent: 'TokenPush' },
    { name: '사업팀',    parent: 'TokenPush' },
    { name: '경영부',    parent: null },
  ]

  for (const def of defs) {
    const { data: existing } = await supabase.from('units').select('id').eq('name', def.name).maybeSingle()
    if (existing) { console.log(`  [skip] unit '${def.name}' already exists`); continue }

    let parentId = null
    if (def.parent) {
      const { data: p } = await supabase.from('units').select('id').eq('name', def.parent).single()
      parentId = p?.id ?? null
    }

    const { error } = await supabase.from('units').insert({ name: def.name, parent_id: parentId })
    if (error) console.error(`  [error] unit '${def.name}':`, error.message)
    else console.log(`  [ok] created unit '${def.name}'`)
  }
}

// ── 사용자 생성 ────────────────────────────────────────────
async function createUsers() {
  for (const u of USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: 'demo1234',
      email_confirm: true,
      user_metadata: { username: u.username, role: u.role, unit_name: u.unit_name },
    })

    if (error) {
      if (error.message.includes('already been registered') || error.code === 'email_exists') {
        console.log(`  [skip] '${u.email}' already exists`)
      } else {
        console.error(`  [error] '${u.email}':`, error.message)
      }
      // 기존 계정도 한도/사용량 업데이트
      await supabase.from('profiles')
        .update({ current_limit: u.current_limit, used_amount: u.used_amount })
        .eq('email', u.email)
      continue
    }

    // 트리거가 profiles를 생성할 시간 확보
    await new Promise(r => setTimeout(r, 600))

    const { error: profileError } = await supabase.from('profiles')
      .update({ current_limit: u.current_limit, used_amount: u.used_amount })
      .eq('id', data.user.id)

    if (profileError) console.error(`  [error] profile update for '${u.email}':`, profileError.message)
    else console.log(`  [ok] '${u.email}' (${u.role} / ${u.unit_name})`)
  }
}

// ── 유닛 책임자 설정 ────────────────────────────────────────
async function updateManagerIds() {
  for (const { unit, email } of UNIT_MANAGERS) {
    const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle()
    if (!profile) { console.error(`  [error] profile not found for '${email}'`); continue }

    const { error } = await supabase.from('units').update({ manager_id: profile.id }).eq('name', unit)
    if (error) console.error(`  [error] manager for '${unit}':`, error.message)
    else console.log(`  [ok] '${unit}' manager → ${email}`)
  }
}

// ── 메인 ──────────────────────────────────────────────────
async function main() {
  console.log('\n=== 1. units ===')
  await ensureUnits()

  console.log('\n=== 2. users ===')
  await createUsers()

  console.log('\n=== 3. unit managers ===')
  await updateManagerIds()

  console.log('\n✓ seed complete\n')
}

main().catch(err => { console.error(err); process.exit(1) })
