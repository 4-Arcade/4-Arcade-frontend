import { Link } from 'react-router-dom'
import { Music, RotateCcw, Home } from 'lucide-react'

const podium = [
  { rank: 2, name: '김철수', score: 3800, color: 'bg-green-500', height: 'h-20' },
  { rank: 1, name: '홍길동', score: 4200, color: 'bg-blue-500', height: 'h-28' },
  { rank: 3, name: '이영희', score: 3500, color: 'bg-purple-500', height: 'h-16' },
]

export default function GameResult() {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-blue-100 via-blue-50 to-bg-primary">
      {/* Top */}
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-1.5">
          <Music className="w-5 h-5 text-blue-600" />
          <span className="text-base font-bold text-blue-700">Music.io</span>
        </div>
        <span className="text-sm text-text-secondary font-medium">2024 K-POP 히트곡 모음</span>
      </div>

      {/* Center */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-10">
        <h1 className="text-4xl font-black text-text-primary">게임 종료!</h1>

        {/* Podium */}
        <div className="flex items-end gap-5">
          {podium.map((p) => (
            <div key={p.rank} className="flex flex-col items-center gap-2.5">
              <div className={`w-16 h-16 ${p.color} rounded-full flex items-center justify-center text-white text-xl font-bold`}>
                {p.name[0]}
              </div>
              <span className="text-[15px] font-semibold text-text-primary">{p.name}</span>
              <span className="text-sm font-bold text-blue-600">{p.score.toLocaleString()}점</span>
              <div className={`w-24 ${p.height} rounded-t-xl ${
                p.rank === 1 ? 'bg-blue-500' : p.rank === 2 ? 'bg-blue-300' : 'bg-blue-200'
              } flex items-center justify-center`}>
                <span className="text-2xl font-black text-white">{p.rank}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 4th place */}
        <div className="flex items-center gap-3 bg-white rounded-2xl shadow-sm px-5 py-3 w-[400px]">
          <span className="text-base font-extrabold text-text-tertiary">4</span>
          <div className="w-9 h-9 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">박</div>
          <span className="text-[15px] font-medium text-text-primary">박민수</span>
          <span className="flex-1" />
          <span className="text-[15px] font-bold text-text-secondary">3,100점</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-3.5 rounded-full shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:bg-blue-700 cursor-pointer">
            <RotateCcw className="w-4 h-4" />
            다시 하기
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 bg-white text-text-primary font-bold px-8 py-3.5 rounded-full border border-border hover:bg-bg-input"
          >
            <Home className="w-4 h-4" />
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}
