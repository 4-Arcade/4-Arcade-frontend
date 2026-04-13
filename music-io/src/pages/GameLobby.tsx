import { useState } from 'react'
import { Music, LogOut, Copy, ListMusic, X, Search } from 'lucide-react'

const players = [
  { name: '홍길동', color: 'bg-blue-500', isHost: true },
  { name: '김철수', color: 'bg-green-500', isHost: false },
  { name: '이영희', color: 'bg-purple-500', isHost: false },
  { name: '박민수', color: 'bg-red-500', isHost: false },
]

const categories = ['전체', 'K-POP', 'POP', 'OST', '게임음악', '기타']

const quizzes = [
  { title: '2024 K-POP 히트곡 모음', category: 'K-POP', count: 20, plays: 1234 },
  { title: '인기 POP 명곡 퀴즈', category: 'POP', count: 15, plays: 856 },
  { title: '애니메이션 OST 퀴즈', category: 'OST', count: 25, plays: 2105 },
  { title: '게임 BGM 맞추기', category: '게임음악', count: 30, plays: 567 },
]

export default function GameLobby() {
  const [showModal, setShowModal] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('전체')
  const roomCode = 'AB3K7X'

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-blue-100 via-blue-50 to-bg-primary relative">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <Music className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-bold text-blue-700">Music.io</span>
        </div>
        <button className="flex items-center gap-1.5 bg-white border border-border rounded-full px-4 py-2 text-[13px] text-text-secondary font-medium hover:bg-bg-input cursor-pointer">
          <LogOut className="w-4 h-4" />
          나가기
        </button>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-10">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-[26px] font-extrabold text-text-primary">
            {selectedQuiz ?? '퀴즈를 선택해주세요'}
          </h1>
          <p className="text-sm text-text-secondary">제한시간 20초</p>
        </div>

        {/* Quiz List Button */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-white border border-blue-200 rounded-full px-6 py-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        >
          <ListMusic className="w-[18px] h-[18px] text-blue-600" />
          <span className="text-[15px] font-semibold text-blue-600">퀴즈 목록</span>
        </button>

        {/* Room Code */}
        <div className="flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-sm">
          <span className="text-[13px] text-text-secondary font-medium">방 코드</span>
          <span className="bg-blue-600 text-white text-sm font-bold px-3.5 py-1.5 rounded-2xl tracking-wider">
            {roomCode}
          </span>
          <Copy className="w-[18px] h-[18px] text-text-tertiary cursor-pointer hover:text-text-secondary" />
        </div>

        {/* Players */}
        <div className="flex items-end gap-5">
          {players.map((p) => (
            <div key={p.name} className="flex flex-col items-center gap-2">
              <div className={`w-16 h-16 ${p.color} rounded-full flex items-center justify-center text-white text-xl font-bold`}>
                {p.name[0]}
              </div>
              <span className="text-[13px] font-medium text-text-primary">{p.name}</span>
              {p.isHost && (
                <span className="text-[11px] text-blue-600 font-semibold">방장</span>
              )}
            </div>
          ))}
          {[1, 2].map((i) => (
            <div key={`empty-${i}`} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 border-2 border-dashed border-blue-200 rounded-full" />
              <span className="text-[13px] text-text-tertiary">대기중</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-text-secondary font-medium">4명 참여 중 · 최대 8명</p>

        <button
          disabled={!selectedQuiz}
          className={`px-0 py-4 w-[280px] rounded-full text-lg font-bold text-white text-center ${
            selectedQuiz ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-border cursor-not-allowed'
          }`}
        >
          게임 시작
        </button>
      </div>

      {/* Quiz Modal */}
      {showModal && (
        <div className="absolute inset-0 bg-[#0F172A66] flex items-center justify-center z-50">
          <div className="bg-white rounded-[24px] w-[680px] max-h-[620px] flex flex-col shadow-xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-bg-primary">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-xl font-bold text-text-primary">퀴즈 목록</h2>
                <p className="text-xs text-text-tertiary">방장만 퀴즈를 선택할 수 있습니다</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 bg-bg-input rounded-2xl flex items-center justify-center cursor-pointer hover:bg-border"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col gap-4 p-6 overflow-y-auto">
              {/* Search */}
              <div className="flex items-center gap-2 bg-bg-input border border-border rounded-[8px] px-3.5 h-11">
                <Search className="w-[18px] h-[18px] text-text-tertiary" />
                <input
                  type="text"
                  placeholder="퀴즈 검색..."
                  className="bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none flex-1"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-[13px] font-medium cursor-pointer transition-colors ${
                      activeCategory === cat
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-bg-input text-text-secondary hover:bg-border'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Quiz Items */}
              {quizzes.map((quiz) => (
                <div
                  key={quiz.title}
                  className="flex items-center gap-3.5 py-3 border-b border-border last:border-b-0"
                >
                  <div className="w-14 h-14 bg-bg-input rounded-[8px] shrink-0" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">{quiz.title}</span>
                      <span className="bg-blue-50 text-blue-600 text-[11px] font-semibold px-2 py-0.5 rounded-[10px]">
                        {quiz.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-tertiary">
                      <span>{quiz.count}문제</span>
                      <span>·</span>
                      <span>{quiz.plays.toLocaleString()}회 플레이</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedQuiz(quiz.title)
                      setShowModal(false)
                    }}
                    className="bg-blue-600 text-white text-[13px] font-semibold px-4 py-2 rounded-[8px] cursor-pointer hover:bg-blue-700"
                  >
                    선택
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
