# 디자인 시스템 (mycompany)

> 브랜드 색상, 타이포그래피, 스페이싱 등 UI 토큰과 컴포넌트 스타일 가이드.

## 1. 컬러 (Colors)

### Primary
| 토큰 | 값 | 용도 |
|---|---|---|
| `visang-blue` | `#0064FF` | 주요 브랜드 색상, CTA 버튼, 활성 상태, 링크 |
| `visang-blue-dark` | `#0050CC` | primary blue hover 상태 |
| `visang-blue-light` | `#E6F0FF` | primary 색상 틴트 배경, 선택 상태 |

### Secondary
| 토큰 | 값 | 용도 |
|---|---|---|
| `visang-orange` | `#FF6B00` | 강조, 뱃지, 하이라이트, 이벤트 라벨 |
| `visang-orange-light` | `#FFF0E6` | 오렌지 틴트 배경 |
| `visang-green` | `#00B050` | 성공 상태, NEW 뱃지 |

### Neutral
| 토큰 | 값 | 용도 |
|---|---|---|
| `gray-900` | `#1A1A1A` | 본문 제목, 헤딩 |
| `gray-800` | `#333333` | 본문 텍스트, 네비게이션 항목 |
| `gray-700` | `#555555` | 보조 텍스트 |
| `gray-500` | `#888888` | placeholder, 비활성 라벨 |
| `gray-400` | `#AAAAAA` | 구분선, 비활성 요소 |
| `gray-200` | `#DDDDDD` | 테두리, input outline |
| `gray-100` | `#F5F5F5` | 페이지/카드 배경 |
| `white` | `#FFFFFF` | 컴포넌트 배경, 헤더 |

### Semantic
```
color-text-primary:    #1A1A1A
color-text-secondary:  #555555
color-text-disabled:   #AAAAAA
color-text-link:       #0064FF
color-text-inverse:    #FFFFFF
color-bg-page:         #F5F5F5
color-bg-surface:      #FFFFFF
color-bg-overlay:      rgba(0,0,0,0.5)
color-border-default:  #DDDDDD
color-border-focus:    #0064FF
color-status-success:  #00B050
color-status-warning:  #FF6B00
color-status-error:    #E02020
color-status-info:     #0064FF
```

## 2. 타이포그래피 (Typography)

### 폰트 패밀리
- **font-primary**: `'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif` — 한글 UI 기본
- **font-secondary**: `'Roboto', 'Helvetica Neue', Arial, sans-serif` — 영문/숫자
- **font-mono**: `'Courier New', Courier, monospace` — 코드 스니펫

### 폰트 크기
| 토큰 | 크기 | 줄간격 | 용도 |
|---|---|---|---|
| `text-xs` | 12px (0.75rem) | 18px | 캡션, 뱃지, 메타 |
| `text-sm` | 13px (0.8125rem) | 20px | 서브 라벨, 각주 |
| `text-base` | 14px (0.875rem) | 22px | 본문, 네비게이션 링크 |
| `text-md` | 15px (0.9375rem) | 24px | 약간 큰 본문 |
| `text-lg` | 16px (1rem) | 26px | 기본, 섹션 라벨 |
| `text-xl` | 18px (1.125rem) | 28px | 카드 제목, 서브 헤딩 |
| `text-2xl` | 20px (1.25rem) | 30px | 섹션 헤딩 |
| `text-3xl` | 24px (1.5rem) | 34px | 페이지 서브 헤딩 |
| `text-4xl` | 28px (1.75rem) | 40px | 주요 헤딩 |
| `text-5xl` | 32px (2rem) | 46px | Hero / H1 |

### 폰트 굵기 / 줄간격 / 자간
```
font-regular: 400   font-medium: 500   font-semibold: 600
font-bold: 700      font-extrabold: 800

leading-tight: 1.3   leading-snug: 1.4   leading-normal: 1.5
leading-relaxed: 1.6 leading-loose: 1.8

tracking-tight: -0.02em   tracking-normal: 0em   tracking-wide: 0.04em
```

### 텍스트 스타일
| 스타일 | 크기 | 굵기 | 줄간격 | 색상 |
|---|---|---|---|---|
| `heading-h1` | 32px | 700 | 1.3 (자간 -0.02em) | `#1A1A1A` |
| `heading-h2` | 24px | 700 | 1.4 (자간 -0.01em) | `#1A1A1A` |
| `heading-h3` | 20px | 600 | 1.4 | `#1A1A1A` |
| `heading-h4` | 18px | 600 | 1.5 | `#333333` |
| `body-large` | 16px | 400 | 1.6 | `#333333` |
| `body-base` | 14px | 400 | 1.6 | `#333333` |
| `body-small` | 13px | 400 | 1.5 | `#555555` |
| `caption` | 12px | 400 | 1.4 | `#888888` |
| `label` | 13px | 500 | 1.4 | `#1A1A1A` |
| `nav-item` | 14px | 500 | 1.0 | `#333333` |
| `button-text` | 14px | 600 | 1.0 | `#FFFFFF` |

## 3. 스페이싱 (4px 기준)

```
space-0: 0px    space-1: 4px    space-2: 8px    space-3: 12px
space-4: 16px   space-5: 20px   space-6: 24px   space-7: 28px
space-8: 32px   space-10: 40px  space-12: 48px  space-16: 64px
space-20: 80px  space-24: 96px
```

시맨틱 스페이싱:
```
spacing-component-xs/sm/md/lg: 4px / 8px / 16px / 24px
spacing-section-sm/md/lg:      40px / 64px / 80px
spacing-page-horizontal:           20px (모바일)
spacing-page-horizontal-desktop:   40px (데스크톱)
```

## 4. 보더 / 그림자 / z-index / 모션

### Border Radius
```
radius-none: 0px   radius-sm: 4px    radius-md: 8px
radius-lg: 12px    radius-xl: 16px   radius-2xl: 20px
radius-full: 9999px
```

### Border Width / Style
```
border-thin: 1px    border-medium: 2px    border-thick: 3px

border-default: 1px solid #DDDDDD
border-focus:   2px solid #0064FF
border-active:  1px solid #0064FF
border-error:   1px solid #E02020
border-card:    1px solid #EEEEEE
```

### Shadow
```
shadow-xs:    0 1px 2px rgba(0,0,0,0.06)
shadow-sm:    0 2px 8px rgba(0,0,0,0.08)
shadow-md:    0 4px 16px rgba(0,0,0,0.10)
shadow-lg:    0 8px 24px rgba(0,0,0,0.12)
shadow-xl:    0 16px 40px rgba(0,0,0,0.15)
shadow-card:  0 2px 8px rgba(0,0,0,0.08)
shadow-modal: 0 8px 32px rgba(0,0,0,0.18)
shadow-nav:   0 2px 4px rgba(0,0,0,0.06)
```

### Z-index
```
z-below: -1   z-base: 0   z-raised: 10   z-dropdown: 100
z-sticky: 200 z-overlay: 300  z-modal: 400  z-toast: 500  z-tooltip: 600
```

### 모션
```
duration-fast: 150ms   duration-normal: 250ms   duration-slow: 400ms

ease-default: cubic-bezier(0.4, 0, 0.2, 1)
ease-in:      cubic-bezier(0.4, 0, 1, 1)
ease-out:     cubic-bezier(0, 0, 0.2, 1)
ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1)
```

## 5. 컴포넌트

### 5.1 네비게이션 (GNB)
- 높이: 60px(모바일) / 72px(데스크톱), 배경 `#FFFFFF`, `shadow-nav`, `position: sticky; top: 0`, `z-index: 200`
- 좌우 패딩: 20px(모바일) / 40px(데스크톱)
- nav 아이템: `font-size 14px`, `font-weight 500`, 색상 `#333333` → hover/active `#0064FF`, 하단 보더 `2px solid #0064FF`(active)
- 구성: 로고 + 1차 메뉴(주요 카테고리) + 2차 메뉴(학년별/자료실/리뷰/이벤트 드롭다운) + 유틸리티 메뉴(로그인/회원가입/고객센터/장바구니/마이페이지)

### 5.2 버튼
| variant | 배경 | 텍스트 | 테두리 | hover |
|---|---|---|---|---|
| `primary` | `#0064FF` | `#FFFFFF` | none | `#0050CC` |
| `secondary` | `#FFFFFF` | `#0064FF` | `1px solid #0064FF` | `#E6F0FF` |
| `ghost` | transparent | `#555555` | `1px solid #DDDDDD` | `#F5F5F5` |
| `text` | transparent | `#0064FF` | none | underline |
| `cta` | `#FF6B00` | `#FFFFFF` | none | `#E55F00` |

크기: `sm`(12px/6·12px), `md`(14px/10·20px), `lg`(15px/14·28px), `xl`(16px/16·32px) — 모두 `border-radius: 8px` 내외
상태: `disabled`(opacity 0.4), `loading`(opacity 0.7, cursor wait)

### 5.3 카드
- **bookCard**: 흰 배경, `radius-lg(12px)`, `border-card`, `shadow-card` → hover 시 `shadow-lg` + `translateY(-2px)`. 썸네일(`aspect-ratio 3/4`), 본문 패딩 `12px 16px 16px`, 뱃지/제목/부제/가격(파란색 `#0064FF`, 700) 구성
- **brandCard**: 세로 정렬, 패딩 `16px 12px`, `radius-lg`, hover 시 `shadow-md`
- **newsCard**: 패딩 `16px 20px`, 하단 보더, 뱃지/제목/요약/날짜 구성

### 5.4 입력 요소
- **검색창**: 높이 44px, `radius-full(22px)`, 테두리 2px(`#DDDDDD` → focus `#0064FF` + 포커스 글로우)
- **텍스트 입력**: 높이 44px, `radius-md(8px)`, 테두리 1px(`#DDDDDD` → focus `#0064FF`)
- **select**: 텍스트 입력과 동일 + chevron 아이콘
- **checkbox/radio**: 18px, `radius-sm`/원형, 체크 시 `#0064FF`
- **label/helper/error**: 13px(`#333333`) / 12px(`#888888`) / 12px(`#E02020`)

### 5.5 뱃지
- `new`(녹색 `#00B050`), `event`(오렌지 `#FF6B00`), `notice`(파란색 `#0064FF`, "공지"), `info`(연파랑 배경 `#E6F0FF`/파란 텍스트, "안내")
- 학년 뱃지: 초등(`#FFF0E6`/`#FF6B00`), 중학(`#E6F0FF`/`#0064FF`), 고등(`#F0E6FF`/`#7B00FF`)

### 5.6 탭
- 하단 보더 `1px solid #DDDDDD`, 탭 아이템 패딩 `12px 20px`, 비활성 `#888888`
- 활성 탭: `#0064FF`, `font-weight 700`, 하단 보더 `2px solid #0064FF`
- 예시 카테고리: 전체 / 초등 / 중학 / 고등

### 5.7 배너
- `aspect-ratio 375/200`(모바일) / `1440/480`(데스크톱), 모서리 둥글기 0(모바일)/12px(데스크톱)
- 인디케이터: 도트(8px, 활성 `#0064FF` / 비활성 `#DDDDDD`)

### 5.8 모달
- 오버레이: `rgba(0,0,0,0.5)`, `z-index 400`
- 컨테이너: 흰 배경, `radius-xl(16px)`, 패딩 24px, `max-width 480px`, `shadow-modal`, 화면 중앙 고정
- 헤더: 18px/700, 닫기 버튼 24px (우상단 16px 위치)

### 5.9 토스트
- 위치: 하단 중앙(24px), `radius-md`, 패딩 `12px 20px`, `z-index 500`
- variants: `default`(`#333333`), `success`(`#00B050`), `error`(`#E02020`), `warning`(`#FF6B00`) — 모두 흰 텍스트

### 5.10 푸터
- 배경 `#F5F5F5`, 상단 보더, 패딩 `40px 20px 24px`
- 구성: 로고+슬로건, 섹션 링크(출판교육 서비스/에듀플랫폼/교육기관/인쇄시설), 회사 정보(상호/대표/사업자번호/연락처/주소), 소셜 링크
- 카피라이트: 12px, `#AAAAAA`, 중앙 정렬

### 5.11 퀵 메뉴 (모바일 하단 고정)
- `position: fixed; bottom: 0`, 4열 그리드, 흰 배경, 상단 보더, `z-index 200`
- 아이템: 아이콘+라벨(11px/500/`#555555`) 세로 정렬

## 6. 레이아웃

### 브레이크포인트
| 구간 | 범위 | 컬럼 | 거터 |
|---|---|---|---|
| mobile | 0–767px | 4 | 16px |
| tablet | 768–1023px | 8 | 20px |
| desktop | 1024–1279px | 12 | 24px |
| wide | 1280px+ | 12 | 24px |

### 컨테이너
- `max-width: 1200px`, 좌우 패딩 20px(모바일)/40px(데스크톱), `margin: 0 auto`

### 그리드 패턴
```
bookList:
  mobile:  repeat(2, 1fr), gap 16px
  tablet:  repeat(3, 1fr), gap 20px
  desktop: repeat(4, 1fr), gap 24px

brandGrid:
  mobile:  repeat(3, 1fr), gap 12px
  desktop: repeat(6, 1fr), gap 16px
```
