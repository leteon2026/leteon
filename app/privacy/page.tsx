import Link from 'next/link'

export const metadata = {
  title: '개인정보처리방침 | LETEON 레테온',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-base font-bold text-white mb-3">{title}</h2>
      <div className="text-sm text-zinc-400 leading-7 space-y-2">{children}</div>
    </div>
  )
}

function InfoTable({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-sm border-collapse">
        <tbody>
          {rows.map(({ label, value }) => (
            <tr key={label} className="border-b border-white/[0.05]">
              <td className="py-2.5 pr-4 text-zinc-500 whitespace-nowrap w-40 font-medium align-top">{label}</td>
              <td className="py-2.5 text-zinc-300">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* 헤더 */}
      <div className="mb-10">
        <p className="text-xs font-bold text-zinc-500 tracking-[0.2em] uppercase mb-2">Legal</p>
        <h1 className="text-3xl font-black text-white mb-2">개인정보처리방침</h1>
        <p className="text-sm text-zinc-500">시행일: 2026년 1월 1일 · 최종 수정: 2026년 6월 30일</p>
      </div>

      <div className="glass-card rounded p-6 sm:p-8">
        {/* 전문 */}
        <div className="mb-8 p-4 bg-lime-400/5 border border-lime-400/20 rounded">
          <p className="text-sm text-zinc-400 leading-7">
            레테온(이하 "회사")은 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등
            관련 법령을 준수하며, 이용자의 개인정보를 안전하게 보호합니다.
            이 방침은 회사가 수집하는 개인정보의 항목, 목적, 보유기간 및 이용자의 권리에 대해 안내합니다.
          </p>
        </div>

        <Section title="제1조 (개인정보의 처리 목적)">
          <p>회사는 다음의 목적을 위해 개인정보를 처리합니다. 처리된 개인정보는 다음 목적 이외의 용도로 사용되지 않으며, 목적이 변경되는 경우 별도의 동의를 받습니다.</p>
          <ol className="list-decimal pl-5 space-y-1.5 mt-2">
            <li><strong className="text-white">회원가입 및 관리:</strong> 회원제 서비스 이용에 따른 본인 식별·인증, 회원자격 유지·관리, 계정 서비스 제공</li>
            <li><strong className="text-white">서비스 제공:</strong> 매물 등록·조회·거래, 회원 간 연락 기능 제공</li>
            <li><strong className="text-white">서비스 개선 및 운영:</strong> 서비스 품질 개선, 불법 이용 방지, 민원 처리</li>
          </ol>
        </Section>

        <Section title="제2조 (수집하는 개인정보의 항목)">
          <p className="font-medium text-zinc-300">회원가입 시 수집 항목</p>
          <InfoTable rows={[
            { label: '필수 항목', value: '이메일 주소, 비밀번호(암호화 저장), 닉네임, 전화번호' },
            { label: '선택 항목', value: '프로필 사진, 자기소개' },
            { label: '자동 수집', value: '접속 IP, 접속 시간, 서비스 이용 기록, 쿠키' },
          ]} />
          <p className="mt-4 text-xs text-zinc-600">
            비밀번호는 단방향 암호화(해시)로 저장되며, 회사 직원도 원본을 확인할 수 없습니다.
          </p>
        </Section>

        <Section title="제3조 (개인정보의 보유 및 이용기간)">
          <p>회사는 법령에 따른 개인정보 보유·이용기간 또는 이용자로부터 개인정보를 수집 시에 동의 받은 기간 내에서 개인정보를 처리·보유합니다.</p>
          <InfoTable rows={[
            { label: '회원 정보', value: '회원 탈퇴 시까지 (탈퇴 후 30일 내 파기)' },
            { label: '매물 정보', value: '매물 삭제 요청 시까지 (최대 1년)' },
            { label: '분쟁 기록', value: '분쟁 해결 후 3년 (전자상거래법)' },
            { label: '소비자 불만', value: '처리 후 3년 (전자상거래법)' },
          ]} />
        </Section>

        <Section title="제4조 (개인정보의 제3자 제공)">
          <p>
            회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
            다만, 다음의 경우에는 예외로 합니다.
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 mt-2">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의한 경우, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관이 요구하는 경우</li>
          </ol>
        </Section>

        <Section title="제5조 (개인정보 처리의 위탁)">
          <p>
            회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를 외부에 위탁하고 있습니다.
          </p>
          <InfoTable rows={[
            { label: '수탁자', value: 'Supabase Inc.' },
            { label: '위탁 목적', value: '데이터베이스 및 인증 서비스 운영' },
            { label: '보유 기간', value: '서비스 종료 또는 위탁 계약 종료 시까지' },
          ]} />
          <p className="mt-3">
            위탁받은 업체는 위탁 목적 이외의 용도로 개인정보를 이용하거나 제3자에게 제공할 수 없습니다.
          </p>
        </Section>

        <Section title="제6조 (정보주체의 권리·의무 및 행사방법)">
          <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
          <ol className="list-decimal pl-5 space-y-1.5 mt-2">
            <li>개인정보 열람 요구</li>
            <li>오류 등이 있을 경우 정정 요구</li>
            <li>삭제 요구</li>
            <li>처리 정지 요구</li>
          </ol>
          <p className="mt-3">
            위의 권리 행사는{' '}
            <a href="mailto:leteon2026@gmail.com" className="text-lime-400 hover:text-lime-300 underline underline-offset-2">
              leteon2026@gmail.com
            </a>
            으로 이메일을 통해 요청하실 수 있으며, 회사는 지체없이 조치하겠습니다.
          </p>
          <p className="mt-2">
            만 14세 미만 아동의 경우 법정대리인이 아동의 개인정보에 대한 열람, 정정·삭제, 처리정지를 요구할 수 있습니다.
          </p>
        </Section>

        <Section title="제7조 (개인정보의 파기)">
          <p>
            회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
            지체없이 해당 개인정보를 파기합니다.
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 mt-2">
            <li><strong className="text-white">전자적 파일 형태:</strong> 복원이 불가능한 방법으로 영구 삭제</li>
            <li><strong className="text-white">종이 문서:</strong> 해당 없음 (전자 처리만 해당)</li>
          </ol>
        </Section>

        <Section title="제8조 (개인정보의 안전성 확보 조치)">
          <p>회사는 개인정보의 안전성 확보를 위해 다음 조치를 취하고 있습니다.</p>
          <ol className="list-decimal pl-5 space-y-1.5 mt-2">
            <li>비밀번호 단방향 암호화 저장</li>
            <li>HTTPS 전 구간 암호화 통신</li>
            <li>접근권한 최소화 (Row Level Security 적용)</li>
            <li>서비스 롤 키의 서버 전용 관리 (클라이언트 미노출)</li>
          </ol>
        </Section>

        <Section title="제9조 (쿠키 사용)">
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>회사는 로그인 상태 유지 및 서비스 제공을 위해 쿠키를 사용합니다.</li>
            <li>이용자는 브라우저 설정을 통해 쿠키를 거부할 수 있으나, 이 경우 일부 서비스 이용이 제한될 수 있습니다.</li>
            <li>광고 목적의 쿠키는 사용하지 않습니다.</li>
          </ol>
        </Section>

        <Section title="제10조 (개인정보 보호책임자)">
          <p>
            회사는 개인정보 처리에 관한 업무를 총괄하고, 개인정보 관련 불만 처리 및 피해 구제를 위해
            아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>
          <InfoTable rows={[
            { label: '책임자', value: 'LETEON 레테온 운영팀' },
            { label: '이메일', value: 'leteon2026@gmail.com' },
            { label: '처리 기간', value: '접수 후 3영업일 이내 답변' },
          ]} />
          <p className="mt-3">
            이용자는 개인정보 보호법 제77조에 따른 권익 침해 신고·상담을 위해
            개인정보 침해신고센터(privacy.kisa.or.kr)에 문의하실 수 있습니다.
          </p>
        </Section>

        <Section title="제11조 (개인정보처리방침 변경)">
          <p>
            이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우
            변경사항의 시행 7일 전부터 서비스 내 공지사항을 통해 고지합니다.
          </p>
        </Section>

        <div className="mt-8 pt-6 border-t border-white/[0.06]">
          <p className="text-xs text-zinc-600">
            본 방침은 2026년 1월 1일부터 시행됩니다.<br />
            문의: <a href="mailto:leteon2026@gmail.com" className="text-zinc-500 hover:text-lime-400 transition-colors">leteon2026@gmail.com</a>
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <Link href="/terms" className="text-sm text-lime-400 hover:text-lime-300 transition-colors">
          이용약관 →
        </Link>
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          홈으로
        </Link>
      </div>
    </div>
  )
}
