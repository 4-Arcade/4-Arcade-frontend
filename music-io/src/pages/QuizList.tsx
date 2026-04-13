import { useState } from 'react'
import { Search } from 'lucide-react'
import Navbar from '../components/Navbar'
import QuizCard from '../components/QuizCard'

const categories = ['전체', 'K-POP', 'POP', 'OST', '게임음악', '기타']

const quizzes = [
  { title: '2024 K-POP 히트곡 모음', category: 'K-POP', questionCount: 20, author: '뮤직러버', playCount: 1234 },
  { title: '인기 POP 명곡 퀴즈', category: 'POP', questionCount: 15, author: '팝마스터', playCount: 856 },
  { title: '애니메이션 OST 퀴즈', category: 'OST', questionCount: 25, author: '오타쿠킹', playCount: 2105 },
  { title: '게임 BGM 맞추기', category: '게임음악', questionCount: 30, author: '게이머', playCount: 567 },
  { title: '90년대 가요 퀴즈', category: 'K-POP', questionCount: 20, author: '레트로맨', playCount: 943 },
  { title: '클래식 음악 퀴즈', category: '기타', questionCount: 15, author: '클래식팬', playCount: 312 },
  { title: '2023 K-POP 결산', category: 'K-POP', questionCount: 25, author: '뮤직러버', playCount: 2890 },
  { title: '영화 OST 베스트', category: 'OST', questionCount: 20, author: '영화광', playCount: 1567 },
]

export default function QuizList() {
  const [activeCategory, setActiveCategory] = useState('전체')

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <div className="flex flex-col gap-8 px-20 py-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-bold text-text-primary">퀴즈 탐색</h1>
          <div className="flex items-center gap-2 bg-white border border-border rounded-[12px] px-4 py-2.5 w-80">
            <Search className="w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="퀴즈 검색..."
              className="bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none flex-1"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-[13px] font-medium cursor-pointer transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-white text-text-secondary border border-border hover:bg-bg-input'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.title} {...quiz} />
          ))}
        </div>
      </div>
    </div>
  )
}
