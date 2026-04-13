import { useState } from 'react'
import { Music, Send } from 'lucide-react'

const rankings = [
  { rank: 1, name: '홍길동', score: 4200, color: 'bg-blue-500', active: true },
  { rank: 2, name: '김철수', score: 3800, color: 'bg-green-500', active: false },
  { rank: 3, name: '이영희', score: 3500, color: 'bg-purple-500', active: false },
  { rank: 4, name: '박민수', score: 3100, color: 'bg-red-500', active: false },
]

const chatMessages = [
  { name: '김철수', message: '이거 뭐지...' },
  { name: '이영희', message: '아 알것같은데' },
  { name: '박민수', message: '힌트 좀!' },
]

export default function GamePlaying() {
  const [answer, setAnswer] = useState('')

  return (
    <div className="h-screen flex bg-gradient-to-b from-blue-100 via-blue-50 to-bg-primary">
      {/* Left - Main Game Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-1.5">
            <Music className="w-5 h-5 text-blue-600" />
            <span className="text-base font-bold text-blue-700">Music.io</span>
          </div>
          <div className="flex items-center gap-1 bg-white rounded-2xl px-3.5 py-1.5 shadow-sm">
            <span className="text-xs font-medium text-text-secondary">3</span>
            <span className="text-xs text-text-tertiary">/</span>
            <span className="text-xs text-text-tertiary">20</span>
          </div>
        </div>

        {/* Center - Timer & Input */}
        <div className="flex-1 flex flex-col items-center justify-center gap-7 px-15">
          {/* Timer Card */}
          <div className="bg-white rounded-[24px] shadow-lg p-8 w-[400px] flex flex-col items-center gap-5">
            <div className="w-24 h-24 rounded-full border-4 border-blue-500 flex items-center justify-center">
              <span className="text-4xl font-black text-blue-600">15</span>
            </div>
            <div className="w-full bg-bg-input rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full w-3/4 transition-all" />
            </div>
            <p className="text-sm text-text-secondary">노래를 듣고 제목을 맞춰보세요!</p>
          </div>

          {/* Chat Input */}
          <div className="flex items-center bg-white rounded-full shadow-sm w-[400px] pl-5 pr-1.5 py-1.5">
            <input
              type="text"
              placeholder="정답을 입력하세요..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none"
            />
            <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Right - Sidebar */}
      <div className="w-[340px] bg-white shadow-[-2px_0_16px_rgba(15,23,42,0.03)] flex flex-col p-4 gap-3">
        {/* Rankings */}
        <h3 className="text-[15px] font-bold text-text-primary">실시간 순위</h3>
        <div className="flex flex-col gap-2">
          {rankings.map((r) => (
            <div
              key={r.rank}
              className={`flex items-center gap-2.5 rounded-[12px] px-3 py-2.5 ${
                r.active
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-white border border-border'
              }`}
            >
              <span className="text-xs font-extrabold text-text-tertiary w-4">{r.rank}</span>
              <div className={`w-7 h-7 ${r.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                {r.name[0]}
              </div>
              <span className="flex-1 text-sm font-medium text-text-primary">{r.name}</span>
              <span className="text-sm font-bold text-blue-600">{r.score.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col justify-end gap-2 mt-3">
          <h3 className="text-[15px] font-bold text-text-primary">채팅</h3>
          {chatMessages.map((msg, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-xs font-semibold text-text-secondary shrink-0">{msg.name}</span>
              <span className="text-xs text-text-primary">{msg.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
