import { Link } from 'react-router-dom'
import { useState } from 'react'
import Navbar from '../components/Navbar'
import Button from '../components/Button'
import QuizCard from '../components/QuizCard'
import LoginModal from '../components/LoginModal'
import RegisterModal from '../components/RegisterModal'

const categories = ['전체', 'K-POP', 'POP', 'OST', '게임음악', '기타']

const sampleQuizzes = [
  { title: '2024 K-POP 히트곡 모음', category: 'K-POP', questionCount: 20, author: '뮤직러버', playCount: 1234 },
  { title: '인기 POP 명곡 퀴즈', category: 'POP', questionCount: 15, author: '팝마스터', playCount: 856 },
  { title: '애니메이션 OST 퀴즈', category: 'OST', questionCount: 25, author: '오타쿠킹', playCount: 2105 },
  { title: '게임 BGM 맞추기', category: '게임음악', questionCount: 30, author: '게이머', playCount: 567 },
]

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">

      {/* Navbar */}
      <Navbar onLoginClick={() => setLoginOpen(true)} />

      {/* Hero */}
      <section className="flex flex-col items-center py-20 px-10 gap-8 bg-gradient-to-b from-blue-50 to-bg-primary">
        <h1 className="text-5xl font-extrabold text-text-primary text-center">
          친구들과 함께 즐기는<br />음악 퀴즈 배틀
        </h1>

        <p className="text-lg text-text-secondary text-center max-w-[500px]">
          YouTube 음악을 듣고 제목을 맞추세요!
        </p>

        <div className="flex items-center gap-4">
          <Link to="/room/create">
            <Button variant="large">방 만들기</Button>
          </Link>

          <Link to="/room/join">
            <Button variant="secondary">방 참여하기</Button>
          </Link>

          <Button onClick={() => setLoginOpen(true)} variant="secondary">
            로그인
          </Button>
        </div>
      </section>

      {/* Quiz */}
      <section className="flex flex-col gap-8 px-20 py-12">
        <div className="flex justify-between items-center">
          <h2 className="text-[28px] font-bold">인기 퀴즈</h2>
          <Link to="/quiz">더보기 →</Link>
        </div>

        <div className="flex gap-6">
          {sampleQuizzes.map((quiz) => (
            <QuizCard key={quiz.title} {...quiz} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-20 py-8 bg-bg-dark text-white">
        © 2025 Music.io
      </footer>

      {/* 🔥 로그인 모달 */}
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSwitchToRegister={() => {
            setLoginOpen(false)
            setRegisterOpen(true)
          }}
        />
      )}

      {/* 🔥 회원가입 모달 */}
      {registerOpen && (
        <RegisterModal
          onClose={() => setRegisterOpen(false)}
          onSwitchToLogin={() => {
            setRegisterOpen(false)
            setLoginOpen(true)
          }}
        />
      )}

    </div>
  )
}