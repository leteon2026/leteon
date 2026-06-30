import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const PHONE_RE = /^01[016789][-\s]?\d{3,4}[-\s]?\d{4}$/

function validatePhone(phone: string) {
  return PHONE_RE.test(phone.replace(/\s/g, ''))
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, username, phone } = await req.json()

    // ── 입력 검증 ──────────────────────────────────────────
    if (!email || !password || !username || !phone) {
      return NextResponse.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, { status: 400 })
    }
    const trimmedUsername = username.trim()
    if (trimmedUsername.length < 2 || trimmedUsername.length > 20) {
      return NextResponse.json({ error: '닉네임은 2~20자여야 합니다.' }, { status: 400 })
    }
    const trimmedPhone = phone.trim()
    if (!validatePhone(trimmedPhone)) {
      return NextResponse.json(
        { error: '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // ── username 중복 확인 ──────────────────────────────────
    const { data: existingUsername } = await admin
      .from('profiles')
      .select('id')
      .eq('username', trimmedUsername)
      .maybeSingle()

    if (existingUsername) {
      return NextResponse.json({ error: '이미 사용 중인 닉네임입니다.' }, { status: 409 })
    }

    // ── auth 유저 생성 (이메일 인증 없이 자동 확인) ─────────
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // MVP: 이메일 인증 없이 즉시 사용 가능
      user_metadata: {
        full_name: trimmedUsername,
        phone: trimmedPhone,
      },
    })

    if (authError) {
      const msg = authError.message.toLowerCase()
      if (
        msg.includes('already registered') ||
        msg.includes('already exists') ||
        msg.includes('email address already in use') ||
        msg.includes('user already exists')
      ) {
        return NextResponse.json({ error: '이미 가입된 이메일 주소입니다.' }, { status: 409 })
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = authData.user.id

    // ── profiles 테이블에 명시적 upsert ────────────────────
    // (트리거가 이미 실행됐을 수 있으므로 upsert로 올바른 값 보장)
    const { error: profileError } = await admin
      .from('profiles')
      .upsert(
        {
          id: userId,
          email,
          username: trimmedUsername,
          phone: trimmedPhone,
          verified_phone: false,
          role: 'user',
        },
        { onConflict: 'id' }
      )

    if (profileError) {
      // 프로필 생성 실패 → auth 유저 롤백
      await admin.auth.admin.deleteUser(userId)

      if (
        profileError.code === '23505' ||
        profileError.message.includes('profiles_username_key')
      ) {
        return NextResponse.json({ error: '이미 사용 중인 닉네임입니다.' }, { status: 409 })
      }
      console.error('[signup] profile upsert error:', profileError)
      return NextResponse.json({ error: '회원가입 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[signup] unexpected error:', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 })
  }
}
