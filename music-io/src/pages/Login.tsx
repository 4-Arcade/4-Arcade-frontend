import { Music, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import InputField from '../components/InputField'
import Button from '../components/Button'

interface LoginModalProps {
  onClose: () => void
}

export default function LoginModal({ onClose }: LoginModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      
      {/* Modal Box */}
      <div className="bg-white rounded-xl w-[800px] flex overflow-hidden relative">

        {/* 닫기 버튼 */}
        <button onClick={onClose} className="absolute top-4 right-4">
          <X />
        </button>

        {/* Left */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-blue-800 to-blue-500 px-10 py-12">
          <Music className="w-12 h-12 text-white" />
          <span className="text-2xl font-extrabold text-white">
            Music.io
          </span>
        </div>

        {/* Right */}
        <div className="flex-1 flex flex-col justify-center px-10 py-12">
          <div className="flex flex-col gap-5">

            <h1 className="text-xl font-bold">로그인</h1>

            <InputField
              label="이메일"
              type="email"
              placeholder="이메일을 입력해주세요"
            />

            <InputField
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력해주세요"
            />

            <Button className="w-full">로그인</Button>

            {/* 🔥 추가된 부분 */}
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[13px] text-text-secondary">
                아직 계정이 없으신가요?
              </span>

              <Link
                to="/register"
                className="text-[13px] font-semibold text-blue-600 hover:underline"
              >
                회원가입
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}