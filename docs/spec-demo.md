# 데모 설계 (spec-demo.md)

> **데모 범위**: 사용자가 AI 토큰 한도 조정을 요청하면 리더(매니저)가 승인·반려하는 핵심 흐름만 구현합니다.

---

## 1. DB 스키마 (SQL)

### profiles 테이블

```sql
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
```

**트리거 — 신규 사용자 프로필 자동 생성**

```sql
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
```

> `signUp` 호출 시 `options.data`에 `{ username, role, unit_name }` 전달 필수.

---

### token_limit_requests 테이블

```sql
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
```

### 인덱스

```sql
create index idx_requests_requester on token_limit_requests (requester_id);
create index idx_requests_status on token_limit_requests (status);
create index idx_requests_created_at on token_limit_requests (created_at desc);
```

---

## 2. 라우트 맵

```
/login                → LoginPage (이메일/비밀번호 로그인)

[user 보호]
/mypage               → MyPage (현황 카드 + 요청 내역 목록)
/mypage/request       → RequestFormPage (한도 조정 요청 폼)

[leader 보호]
/leader               → LeaderDashboardPage (대기 요청 목록)
/leader/requests/:id  → RequestDetailPage (요청 상세 + 승인/반려)
```

로그인 후 역할에 따라 자동 리다이렉트:
- `user` → `/mypage`
- `leader` → `/leader`

---

## 3. 디렉터리 구조 (src/)

```
components/
  common/
    Button.jsx          # variant: primary / secondary / danger
    Spinner.jsx
    ErrorMessage.jsx
    Layout.jsx          # 공통 레이아웃 (사이드바 + 콘텐츠 영역)
    Sidebar.jsx         # 역할별 사이드바 (user/leader)
    Badge.jsx           # 상태 배지 (pending/approved/rejected)
  auth/
    LoginForm.jsx
    ProtectedRoute.jsx  # role prop으로 역할별 보호
  requests/
    RequestCard.jsx         # 리더용 — 요청 카드 (요청자/금액/사유/승인·반려 버튼)
    RequestSummaryCard.jsx  # 사용자용 — 제출한 요청 내역 카드
    LimitPreview.jsx        # 현재 한도 → 새 한도 변화 미리보기 (프로그레스바 포함)

pages/
  LoginPage.jsx
  user/
    MyPage.jsx          # 현재 사용량 카드 + 요청 내역 목록
    RequestFormPage.jsx # 한도 조정 요청 폼
  leader/
    LeaderDashboardPage.jsx   # 대기(pending) 요청 목록, 탭: 대기/처리완료
    RequestDetailPage.jsx     # 요청 상세 확인 + 승인/반려 버튼

hooks/
  useAuth.js              # signIn / signOut / session
  useProfile.js           # 본인 프로필 조회
  useMyRequests.js        # 내 요청 목록 + submitRequest()
  useLeaderRequests.js    # 대기 요청 목록 + processRequest(id, action)

context/
  AuthContext.jsx         # session, user, profile, role

lib/supabase.js
utils/
  constants.js   # ROLES = { USER, LEADER }, REQUEST_STATUS = { PENDING, APPROVED, REJECTED }
  formatDate.js  # formatDate, formatDateTime
  formatKRW.js   # formatKRW(number) → "750,000 KRW"
```

---

## 4. 커스텀 훅 책임 분담

### `useAuth`
- `signIn(email, password)` — Supabase Auth 로그인
- `signOut()`
- `session`, `user`, `loading`

### `useProfile`
- `profile`: `{ id, username, email, role, unit_name, current_limit, used_amount }`
- `loading`, `error`

### `useMyRequests`
- `requests`: 내가 제출한 요청 목록 (최신순)
- `submitRequest({ requestedLimit, reason })` — 현재 한도는 profile에서 자동 주입
- `loading`, `error`, `refetch`

### `useLeaderRequests`
- `pendingRequests`: status='pending' 요청 목록 (requester 프로필 join)
- `processedRequests`: status in ('approved','rejected') 목록
- `processRequest(requestId, action: 'approved'|'rejected')`:
  1. `token_limit_requests.status` 업데이트 + `processed_by`, `processed_at` 기록
  2. `action === 'approved'`이면 `profiles.current_limit`을 `requested_limit`으로 업데이트
- `loading`, `error`, `refetch`

---

## 5. UI 화면별 명세

### [사용자] MyPage (`/mypage`)

**현황 카드**
- 유닛명 + 사용자명
- 현재 한도: `current_limit` (KRW)
- 사용량: `used_amount` / `current_limit` (KRW)
- 사용률 프로그레스바 (색상: 0~70% 초록, 70~90% 주황, 90%+ 빨강)
- 우측 상단: "한도 조정 요청" 버튼 → `/mypage/request`

**요청 내역 목록**
- `RequestSummaryCard` 리스트 (최신순)
- 각 카드: 요청일 / 현재 한도 → 요청 한도 / 상태 배지
- 요청 없을 시: "아직 요청 내역이 없습니다." 빈 상태 표시

---

### [사용자] RequestFormPage (`/mypage/request`)

1. **헤더**: 유닛명 + 사용자명 + 현재 한도 표시
2. **새 한도 금액 입력** (숫자 input, KRW 단위)
   - 현재 한도 대비 증감률 자동 계산 및 우측에 표시 (`+20 %`)
   - 입력값 ↔ 증감률 양방향 연동
3. **변화 요약 박스**: 현재 한도 → 새 한도, 변동 % (초록/빨강)
4. **사용률 변화 미리보기** (`LimitPreview`):
   - 왼쪽: 현재 프로그레스바 (used/current)
   - 오른쪽: 예상 프로그레스바 (used/requested)
5. **요청 사유** textarea (필수)
6. **취소** (뒤로가기) / **확인** 버튼
   - 새 한도 ≤ 현재 사용량이면 버튼 비활성화 + 경고 메시지
   - 성공 시 `/mypage`로 이동 + 성공 토스트

---

### [리더] LeaderDashboardPage (`/leader`)

- 탭: **대기 (N건)** / **처리 완료**
- **대기 탭**: `pendingRequests` → `RequestCard` 리스트
  - 각 카드: 요청자명·유닛 / 날짜·시각 / 현재 한도 → 요청 한도 (증감%) / 요청 사유 (2줄 말줄임) / 승인·반려 버튼
  - 승인 버튼 클릭 → 확인 모달 → `processRequest(id, 'approved')`
  - 반려 버튼 클릭 → 확인 모달 → `processRequest(id, 'rejected')`
- **처리 완료 탭**: `processedRequests` → 동일 카드 구조, 상태 배지(승인/반려)만 표시 (버튼 없음)
- 요청 없을 시 빈 상태 메시지

---

## 6. 권한(RBAC) 설계

- **클라이언트**: `AuthContext`가 `role`을 제공. `ProtectedRoute(role)`이 역할 불일치 시 리다이렉트.
- **서버(RLS, 진짜 보안 경계)**:
  - `token_limit_requests.UPDATE`는 리더만 가능 — RLS로 강제
  - `profiles.current_limit` 수정도 리더만 가능 — RLS로 강제
  - 클라이언트 가드는 UX 편의일 뿐

---

## 7. 시드(Seed) 데이터

데모 시연을 위해 아래 계정을 미리 생성:

| 이메일 | 비밀번호 | 역할 | 유닛 | 현재 한도 | 사용량 |
|--------|----------|------|------|----------|--------|
| user@demo.com | demo1234 | user | 마케팅팀 | 750,000 | 572,028 |
| leader@demo.com | demo1234 | leader | TokenPush | — | — |

`signUp` 시 `options.data: { username, role, unit_name }`으로 전달.

---

## 8. 구현 체크리스트

| 단계 | 항목 | 상태 |
|------|------|------|
| 1 | Vite + React + Tailwind + Supabase 스캐폴딩 | 🔲 |
| 1 | 환경 변수 설정, supabase.js 초기화 | 🔲 |
| 2 | DB 마이그레이션 (profiles + token_limit_requests + 트리거 + RLS) | 🔲 |
| 2 | 시드 계정 2개 생성 | 🔲 |
| 3 | `useAuth`, `useProfile`, `AuthContext` | 🔲 |
| 3 | `LoginPage`, `ProtectedRoute` | 🔲 |
| 4 | `useMyRequests` | 🔲 |
| 4 | `MyPage` (현황 카드 + 요청 내역 목록) | 🔲 |
| 4 | `RequestFormPage` (입력폼 + 미리보기) | 🔲 |
| 5 | `useLeaderRequests` | 🔲 |
| 5 | `LeaderDashboardPage` (대기/처리완료 탭) | 🔲 |
| 6 | 공통 컴포넌트 (Badge, LimitPreview, RequestCard 등) | 🔲 |
| 7 | 역할별 사이드바 + Layout | 🔲 |
| 8 | 전체 흐름 수동 테스트 (user 요청 → leader 승인 → user 한도 반영 확인) | 🔲 |

---

## 9. 검증 시나리오 (핵심 5개)

1. `user@demo.com` 로그인 → `/mypage`에서 현재 한도 750,000 / 사용량 572,028 표시 확인
2. 한도 조정 요청 폼에서 900,000 입력 → +20% 표시, 사용률 76%→64% 미리보기 확인 → 제출
3. `leader@demo.com` 로그인 → `/leader`에서 대기 1건 확인 → 승인 클릭
4. `user@demo.com`으로 재로그인 → `/mypage`에서 현재 한도가 900,000으로 업데이트됐는지 확인
5. 반려 시나리오: user가 새 요청 제출 → leader가 반려 → user 한도 변동 없음 확인
