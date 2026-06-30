# LETEON 레테온 — C2C Bike Marketplace

MTB · eMTB · eBike · Parts 전문 중고 자전거 C2C 플랫폼

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js App Router (TypeScript) |
| 스타일 | Tailwind CSS v4 |
| 데이터베이스 | Supabase PostgreSQL |
| 파일 저장 | Supabase Storage (`listing-images` 버킷) |
| 인증 | Supabase Auth (이메일/비밀번호) |
| 결제 | Toss Payments v2 (선택) |
| 배포 | Vercel |

---

## 데이터가 유지되는 구조

### 원칙

사이트를 1000번 업데이트·재배포해도 사용자가 등록한 **매물, 회원정보, 이미지, 결제내역**은 절대 삭제되지 않습니다.

```
[사용자 브라우저]
       │
       ▼
[Next.js / Vercel]  ──── 재배포해도 이 레이어만 바뀜
       │
       ▼
[Supabase PostgreSQL]  ← 영구 데이터 저장소 (재배포와 무관)
[Supabase Storage]     ← 이미지 영구 저장소 (재배포와 무관)
```

Vercel 재배포는 **코드(Next.js 앱)**만 교체합니다.
Supabase는 독립 인프라이므로 Vercel 배포와 완전히 분리되어 있습니다.

### 저장 위치

| 데이터 | 저장 위치 |
|--------|----------|
| 회원 정보 | `public.profiles` 테이블 |
| 판매 매물 | `public.listings` 테이블 |
| 매물 이미지 | Supabase Storage `listing-images` 버킷 (URL만 DB 저장) |
| 찜(하트) | `public.hearts` 테이블 |
| 결제 내역 | `public.payments` 테이블 |
| 신고 | `public.reports` 테이블 |
| 관리자 로그 | `public.admin_logs` 테이블 |

### 절대 하지 않는 것

```sql
-- 금지
DROP TABLE listings;
TRUNCATE listings;
DELETE FROM listings WHERE ...;

-- 허용 (데이터 유지하며 구조 변경)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS brand text DEFAULT '';
CREATE TABLE IF NOT EXISTS new_feature (...);
UPDATE listings SET status = 'deleted' WHERE id = '...';  -- 소프트 삭제만
```

---

## DB 초기 설정 (새 프로젝트)

Supabase 대시보드 → SQL Editor에서 전체 실행:

```
supabase/schema.sql
```

이미 DB가 설정된 경우 새 마이그레이션만 실행:

```
supabase/migrations/002_add_listing_metadata.sql
```

---

## Migration 가이드

기능이 추가될 때마다 `supabase/migrations/` 에 순서대로 파일을 만듭니다.

```
supabase/
  schema.sql                        ← 마스터 스키마 (전체 재현용, 항상 안전)
  seed.sql                          ← 개발용 예제 데이터 (운영 실행 금지)
  migrations/
    001_initial_schema.sql          ← 기록용 (이미 적용됨)
    002_add_listing_metadata.sql    ← brand, model, year, reports, admin_logs
    003_add_phone.sql               ← profiles.phone 컬럼
    004_update_profiles_auth.sql    ← email, verified_phone, role, deleted_at, updated_at, username UNIQUE
```

### 새 컬럼 추가 예시

```sql
-- migrations/003_add_view_count.sql
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_listings_view_count ON public.listings (view_count DESC);
```

### 새 테이블 추가 예시

```sql
-- migrations/005_add_chat.sql
CREATE TABLE IF NOT EXISTS public.chats (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  buyer_id   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  seller_id  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

---

## 이미지 저장 구조

이미지는 Supabase Storage에 직접 업로드되고, DB에는 Public URL만 저장됩니다.

```
업로드 흐름:
  1. 사용자가 사진 선택 (최대 5개, 각 10MB 이하)
  2. 브라우저 → Supabase Storage 직접 업로드
     버킷: listing-images (public)
     경로: {timestamp}-{random}.{ext}
  3. Public URL 반환
  4. listings.image_urls 배열에 URL 저장
  5. listings.thumbnail = image_urls[0]

삭제 방지:
  - Storage 객체는 사용자가 명시적으로 삭제하지 않는 한 영구 보존
  - 매물 삭제 시 DB 레코드의 status = 'deleted' 처리만
  - 이미지 파일 자체는 삭제하지 않음
```

---

## 업데이트 시 주의사항

### 해도 되는 것

- `git push` / Vercel Deploy — 코드만 배포, 데이터 영향 없음
- `supabase/schema.sql` 실행 — `IF NOT EXISTS` 사용이므로 재실행 안전
- 새 `migrations/00N_xxx.sql` Supabase SQL Editor에서 실행

### 절대 하지 말 것

```
❌  Supabase 대시보드에서 테이블 DROP
❌  TRUNCATE 실행
❌  운영 DB에서 seed.sql 실행
❌  .env.local 의 NEXT_PUBLIC_SUPABASE_URL 을 다른 프로젝트로 변경
❌  대량 DELETE 쿼리 실행
❌  Storage 버킷 전체 삭제
```

### 코드 변경 시 체크리스트

- [ ] 새 DB 컬럼이 필요하면 `ALTER TABLE ADD COLUMN IF NOT EXISTS` 마이그레이션 파일 작성
- [ ] 마이그레이션 파일을 **먼저 Supabase에서 실행**한 뒤 코드 배포
- [ ] 기존 컬럼 타입 변경 시 데이터 유실 여부 반드시 확인
- [ ] `types/index.ts` TypeScript 타입도 함께 업데이트

---

## 시작하기

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경변수 설정

```env
NEXT_PUBLIC_SUPABASE_URL=https://qzujzsgjsiqhornsxvhv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...        # 브라우저 노출 가능 (anon key)
SUPABASE_SERVICE_ROLE_KEY=...            # 서버 전용 — 절대 NEXT_PUBLIC_ 접두사 금지
NEXT_PUBLIC_TOSS_CLIENT_KEY=...          # 선택 (없으면 결제 없이 바로 등록)
TOSS_SECRET_KEY=...                      # 선택
```

> **Vercel 배포 시**: Settings → Environment Variables 에서 동일하게 입력.  
> `SUPABASE_SERVICE_ROLE_KEY`는 Production/Preview 환경에서도 반드시 서버 전용으로 유지.

### 3. Supabase DB 스키마 적용

Supabase 대시보드 → **SQL Editor** 에서 `supabase/schema.sql` 전체 실행

### 4. 개발 서버 실행

```bash
npm run dev
```

---

## 인증 설정

### Supabase Authentication

#### 1. 이메일 확인 비활성화 (MVP 필수)

Supabase 대시보드 → **Authentication → Configuration → Email** 에서:
- **"Confirm email"** 옵션을 **OFF** 로 설정

> 이 설정이 꺼져 있어야 가입 즉시 로그인이 가능합니다.
> MVP 이후 이메일 인증을 켜려면 별도 UI(인증 메일 재발송, 확인 페이지)가 필요합니다.

#### 2. Redirect URLs 등록

**Authentication → URL Configuration → Redirect URLs** 에 추가:

```
http://localhost:3000/auth/callback
https://your-domain.vercel.app/auth/callback
```

#### 3. 가입 API 보안 구조

```
클라이언트 (브라우저)
  └─ POST /api/auth/signup      ← SUPABASE_SERVICE_ROLE_KEY 사용 (서버 전용)
       └─ admin.auth.admin.createUser(email_confirm: true)
       └─ profiles 테이블 upsert

클라이언트에서 직접 supabase.auth.signUp() 호출하지 않음
NEXT_PUBLIC_ 접두사 없는 서비스 키는 절대 브라우저에 노출되지 않음
```

#### 4. 전화번호 인증 (MVP 미적용)

현재 전화번호는 수집만 하고 SMS 인증은 없습니다 (`verified_phone = false`).
가입 화면에 "현재는 전화번호 인증 없이 가입됩니다." 안내가 표시됩니다.

#### 5. DB 마이그레이션 실행 순서

새 DB라면 `schema.sql` 실행 후:
```
supabase/migrations/004_update_profiles_auth.sql
```

기존 DB라면 `004_update_profiles_auth.sql` 만 실행 (멱등성 보장):
- profiles 테이블에 email, verified_phone, role, deleted_at, updated_at 컬럼 추가
- username UNIQUE 제약 추가
- handle_new_user 트리거 업데이트 (email 포함)
- RLS 정책 강화 (deleted_at IS NULL 조건 추가)

---

## 관리자

- 계정: `leteon2026@gmail.com` 만 `/admin` 접근 가능
- 매물 삭제 = `status = 'deleted'` 소프트 삭제 (DB 행 삭제 아님)
- 대량 삭제 기능 없음 — 개별 확인 후 처리
- 모든 관리 행동은 `admin_logs` 테이블에 기록

---

## Vercel 배포

1. Vercel → Settings → Environment Variables 에 `.env.local` 내용 입력
2. Supabase Site URL 을 Vercel 도메인으로 변경
3. Supabase URL Configuration → Site URL 을 Vercel 도메인으로 변경
