import { Music, X } from 'lucide-react'
import InputField from './InputField'
import Button from './Button'

interface LoginModalProps {
  onClose: () => void
  onSwitchToRegister?: () => void
}

export default function LoginModal({
  onClose,
  onSwitchToRegister,
}: LoginModalProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      {/* Modal Box */}
      <div
        className="bg-white rounded-xl w-[800px] h-[500px] flex overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10"
        >
          <X />
        </button>

        {/* Left */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-blue-800 to-blue-500 px-10 py-12 text-white">
          <Music className="w-12 h-12" />
          <span className="text-2xl font-extrabold">Music.io</span>
        </div>

        {/* Right */}
        <div className="flex-1 flex flex-col justify-center px-10 py-12">

          {/* Title */}
          <h1 className="text-xl font-bold mb-6">로그인</h1>

          {/* Inputs */}
          <div className="flex flex-col gap-4">
            <InputField
              label="이메일"
              type="email"
              placeholder="이메일 입력"
            />

            <InputField
              label="비밀번호"
              type="password"
              placeholder="비밀번호 입력"
            />
          </div>

          {/* Login Button */}
          <Button className="w-full mt-4">
            로그인
          </Button>

          {/* Register Switch */}
          <div className="flex justify-center gap-1.5 mt-6">
            <span className="text-sm text-gray-500">
              아직 계정이 없으신가요?
            </span>

            <button
              onClick={onSwitchToRegister}
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              회원가입
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}