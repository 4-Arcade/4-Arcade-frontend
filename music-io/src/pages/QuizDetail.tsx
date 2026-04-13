import { Link } from 'react-router-dom'
import { Music, Play, User } from 'lucide-react'
import Navbar from '../components/Navbar'
import Button from '../components/Button'

export default function QuizDetail() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <div className="flex gap-10 px-20 py-10 flex-1">
        {/* Left */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="w-full h-[300px] bg-blue-100 rounded-2xl flex items-center justify-center">
            <Music className="w-16 h-16 text-blue-300" />
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold text-text-primary">2024 K-POP 히트곡 모음</h1>
            <div className="flex items-center gap-2">
              <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-md">K-POP</span>
              <span className="text-sm text-text-tertiary">20문제</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              2024년 가장 인기있었던 K-POP 히트곡들을 모아봤습니다. 아이돌부터 솔로 가수까지 다양한 장르의 음악을 맞춰보세요!
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <h2 className="text-lg font-bold text-text-primary">문제 목록</h2>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-border px-4 py-3">
                <span className="text-sm font-bold text-blue-600 w-6">{i}</span>
                <Music className="w-4 h-4 text-text-tertiary" />
                <span className="text-sm text-text-primary">문제 {i}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="w-[360px] flex flex-col gap-5">
          <div className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-4">
            <h3 className="text-base font-bold text-text-primary">제작자</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">뮤직러버</p>
                <p className="text-xs text-text-tertiary">퀴즈 12개 · 플레이 5,432회</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text-primary">플레이</h3>
              <div className="flex items-center gap-1 text-text-secondary">
                <Play className="w-3.5 h-3.5" />
                <span className="text-sm font-medium">1,234회</span>
              </div>
            </div>
            <Link to="/room/create">
              <Button variant="large" className="w-full">이 퀴즈로 플레이</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
