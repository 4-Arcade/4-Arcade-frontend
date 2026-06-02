import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Component
import Navbar from "../components/Navbar";
import QuizCard from "../components/QuizCard";

// API
import { getQuizList, Quiz } from "@/services/quizApi";

const categories = ["전체", "K-POP", "POP", "OST", "게임음악", "기타"];

export default function QuizList() {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [quizList, setQuizList] = useState<Quiz[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

  // 퀴즈 검색창 엔터
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      await handleSearch();
    }
  };

  // 키워드 기준 검색
  const handleSearch = async () => {
    const res = await getQuizList(0, 12, activeCategory, keyword);

    if (res.success) {
      setQuizList(res.data.content);
    } else {
      console.error(res.message);
    }
  };

  /* 퀴즈 리스트 조회 */
  useEffect(() => {
    const fetchQuizList = async () => {
      try {
        setLoading(true);

        const res = await getQuizList(page, 12, activeCategory);

        if (res.success) {
          setQuizList(res.data.content);
          setTotalPages(res.data.totalPages);
        } else {
          alert(res.message);
        }
      } catch (e) {
        console.error("퀴즈 조회 실패:", e);

        const error = e as Error;
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizList();
  }, [page, activeCategory]);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <div className="flex flex-col gap-8 px-20 py-10">
        {/* Header */}
        {/* TODO : 퀴즈 검색 기능 수정 필요 */}
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-bold text-text-primary">퀴즈 탐색</h1>
          <div className="flex items-center gap-2 bg-white border border-border rounded-[12px] px-4 py-2.5 w-80">
            <Search className="w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="퀴즈 검색..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none flex-1"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setQuizList([]);
                setActiveCategory(cat);
              }}
              className={`px-4 py-2 rounded-full text-[13px] font-medium cursor-pointer transition-colors ${
                activeCategory === cat
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-white text-text-secondary border border-border hover:bg-bg-input"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-6">
          {/* 퀴즈 카드들 */}
          {loading ? (
            <div className="col-span-4 text-center text-gray-400">
              불러오는 중...
            </div>
          ) : quizList.length === 0 ? (
            <div className="col-span-4 text-center text-gray-400">
              조회된 퀴즈가 없습니다.
            </div>
          ) : (
            quizList.map((quiz) => (
              <button
                key={quiz.id}
                onClick={() => navigate(`/quiz/${quiz.id}`)}
                className="h-66 w-full border border-gray-200 rounded-xl bg-white cursor-pointer hover:bg-blue-50 hover:shadow-md transition-all overflow-hidden"
              >
                <QuizCard {...quiz} />
              </button>
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        {quizList.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            {/* 이전 */}
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-2 text-sm rounded-md border bg-white
               hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ←
            </button>

            {/* 페이지 번호 */}
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-10 h-10 rounded-md text-sm font-medium transition-all border
      ${
        page === i
          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
      }`}
              >
                {i + 1}
              </button>
            ))}

            {/* 다음 */}
            <button
              disabled={page === totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-2 text-sm rounded-md border bg-white
               hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
