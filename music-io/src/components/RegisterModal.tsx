import { Music, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import InputField from './InputField'
import Button from './Button'

interface RegisterModalProps {
  onClose: () => void
  onSwitchToLogin?: () => void
}

export default function RegisterModal({
  onClose,
  onSwitchToLogin,
}: RegisterModalProps) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      {/* Modal Box */}
      <div
        className="bg-white rounded-xl w-[800px] flex overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >

        {/* 닫기 */}
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

          <h1 className="text-xl font-bold mb-6">회원가입</h1>

          {/* 입력 */}
          <div className="flex flex-col gap-4">
            <InputField
              label="이메일"
              type="email"
              placeholder="이메일 입력"
            />

            <InputField
              label="닉네임"
              type="text"
              placeholder="닉네임 입력"
            />

            <InputField
              label="비밀번호"
              type="password"
              placeholder="비밀번호 입력"
            />
          </div>

          <Button className="w-full mt-4">회원가입</Button>

          {/* 로그인으로 전환 */}
          <div className="flex justify-center gap-1.5 mt-6">
            <span className="text-sm text-gray-500">
              이미 계정이 있으신가요?
            </span>

            <button
              onClick={onSwitchToLogin}
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              로그인
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}