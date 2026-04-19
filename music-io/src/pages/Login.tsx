import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Music } from 'lucide-react'
import InputField from '../components/InputField'
import Button from '../components/Button'
import { login } from '../services/authApi'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(email, password)
      if (res.success && res.data) {
        localStorage.setItem('accessToken', res.data.accessToken)
        setUser(res.data.user)
        navigate('/')
      } else {
        setError(res.error?.message ?? '로그인에 실패했습니다.')
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
          친구들과 함께 즐기는<br />실시간 음악 퀴즈 배틀
        </p>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-20">
        <form className="flex flex-col gap-6 w-[400px]" onSubmit={handleSubmit}>
          <h1 className="text-[28px] font-bold text-text-primary">로그인</h1>
          <p className="text-sm text-text-secondary">계정에 로그인하여 퀴즈를 만들고 관리하세요.</p>
          <InputField
            label="이메일"
            type="email"
            placeholder="이메일을 입력해주세요"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
            {loading ? '로그인 중...' : '로그인'}
          </Button>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[13px] text-text-secondary">아직 계정이 없으신가요?</span>
            <Link to="/register" className="text-[13px] font-semibold text-blue-600 hover:underline">
              회원가입
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
