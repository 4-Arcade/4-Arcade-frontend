import { User, Settings, LogOut, Music, Play } from 'lucide-react'
import Navbar from '../components/Navbar'

const myQuizzes = [
  { title: '2024 K-POP 히트곡 모음', category: 'K-POP', plays: 1234 },
  { title: '인기 POP 명곡 퀴즈', category: 'POP', plays: 856 },
]

const history = [
  { quiz: '애니메이션 OST 퀴즈', date: '2025.01.15', rank: 1, score: 4200 },
  { quiz: '게임 BGM 맞추기', date: '2025.01.14', rank: 3, score: 3100 },
  { quiz: '90년대 가요 퀴즈', date: '2025.01.13', rank: 2, score: 3800 },
]

export default function MyPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <div className="flex gap-10 px-20 py-10 flex-1">
        {/* Left - Profile */}
        <div className="w-[280px] bg-white rounded-2xl border border-border p-6 flex flex-col items-center gap-6 h-fit">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">홍길동</h2>
          <p className="text-[13px] text-text-tertiary">user@example.com</p>

          <div className="flex w-full justify-around">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-text-primary">12</span>
              <span className="text-xs text-text-tertiary">퀴즈</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-text-primary">48</span>
              <span className="text-xs text-text-tertiary">플레이</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-text-primary">5.4k</span>
              <span className="text-xs text-text-tertiary">총 플레이</span>
            </div>
          </div>

          <div className="flex flex-col w-full gap-1">
            <button className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-text-primary hover:bg-bg-input cursor-pointer">
              <Settings className="w-4 h-4 text-text-secondary" />
              프로필 설정
            </button>
            <button className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-error hover:bg-red-50 cursor-pointer">
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="flex-1 flex flex-col gap-6">
          {/* My Quizzes */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary">내 퀴즈</h2>
            <button className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">전체보기</button>
          </div>
          <div className="flex flex-col gap-3">
            {myQuizzes.map((q) => (
              <div key={q.title} className="flex items-center gap-3 bg-white rounded-xl border border-border px-4 py-3">
                <Music className="w-5 h-5 text-blue-400" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-primary">{q.title}</p>
                  <span className="text-xs text-text-tertiary">{q.category}</span>
                </div>
                <div className="flex items-center gap-1 text-text-tertiary">
                  <Play className="w-3 h-3" />
                  <span className="text-xs">{q.plays.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Play History */}
          <h2 className="text-xl font-bold text-text-primary mt-4">플레이 기록</h2>
          <div className="flex flex-col gap-3">
            {history.map((h) => (
              <div key={h.quiz + h.date} className="flex items-center gap-3 bg-white rounded-xl border border-border px-4 py-3">
                <span className={`text-sm font-extrabold w-6 ${h.rank === 1 ? 'text-blue-600' : 'text-text-tertiary'}`}>
                  {h.rank}위
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{h.quiz}</p>
                  <span className="text-xs text-text-tertiary">{h.date}</span>
                </div>
                <span className="text-sm font-bold text-text-secondary">{h.score.toLocaleString()}점</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
