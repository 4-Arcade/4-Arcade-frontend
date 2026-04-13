import { Link } from 'react-router-dom'
import { Music } from 'lucide-react'
import InputField from '../components/InputField'
import Button from '../components/Button'

export default function Login() {
  return (
    <div className="flex h-screen">
      {/* Left - Branding */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-blue-800 to-blue-500 px-20 py-15">
        <Music className="w-16 h-16 text-white" />
        <span className="text-[40px] font-extrabold text-white">Music.io</span>
        <p className="text-lg text-blue-200 text-center leading-relaxed max-w-[300px]">
          친구들과 함께 즐기는<br />실시간 음악 퀴즈 배틀
        </p>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-20">
        <div className="flex flex-col gap-6 w-[400px]">
          <h1 className="text-[28px] font-bold text-text-primary">로그인</h1>
          <p className="text-sm text-text-secondary">계정에 로그인하여 퀴즈를 만들고 관리하세요.</p>
          <InputField label="이메일" type="email" placeholder="이메일을 입력해주세요" />
          <InputField label="비밀번호" type="password" placeholder="비밀번호를 입력해주세요" />
          <Button variant="large" className="w-full">로그인</Button>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[13px] text-text-secondary">아직 계정이 없으신가요?</span>
            <Link to="/register" className="text-[13px] font-semibold text-blue-600 hover:underline">
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
