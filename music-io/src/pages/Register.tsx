import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Music } from 'lucide-react'
import InputField from '../components/InputField'
import Button from '../components/Button'
import { register } from '../services/authApi'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await register(email, password, nickname)
      if (res.success && res.data) {
        localStorage.setItem('accessToken', res.data.accessToken)
        navigate('/')
      } else {
        setError(res.error?.message ?? '회원가입에 실패했습니다.')
      }
    } catch {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Left - Branding */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-blue-800 to-blue-500 px-20 py-15">
        <Music className="w-16 h-16 text-white" />
        <span className="text-[40px] font-extrabold text-white">Music.io</span>
        <p className="text-lg text-blue-200 text-center leading-relaxed max-w-[300px]">
          지금 가입하고<br />나만의 퀴즈를 만들어보세요
        </p>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-20">
        <form className="flex flex-col gap-5 w-[400px]" onSubmit={handleSubmit}>
          <h1 className="text-[28px] font-bold text-text-primary">회원가입</h1>
          <p className="text-sm text-text-secondary">계정을 만들어 퀴즈 제작 기능을 이용하세요.</p>
          <InputField
            label="이메일"
            type="email"
            placeholder="이메일을 입력해주세요"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <InputField
            label="닉네임"
            placeholder="닉네임을 입력해주세요"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            required
          />
          <InputField
            label="비밀번호"
            type="password"
            placeholder="비밀번호를 입력해주세요"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button variant="large" className="w-full" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </Button>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[13px] text-text-secondary">이미 계정이 있으신가요?</span>
            <Link to="/login" className="text-[13px] font-semibold text-blue-600 hover:underline">
              로그인
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
