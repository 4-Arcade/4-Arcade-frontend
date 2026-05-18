import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Component
import Navbar from "../components/Navbar";
import QuizCreateModal from "../components/QuizCreateModal";
import QuizCard from "../components/QuizCard";

// API
import { MyQuiz, getMyQuizList } from "@/services/quizApi";

export default function QuizStudio() {
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [myQuizList, setMyQuizList] = useState<MyQuiz[]>([]);
  const navigate = useNavigate();

  /* 내 퀴즈 리스트 조회 */
  useEffect(() => {
    const fetchMyQuizList = async () => {
      try {
        setLoading(true);

        const res = await getMyQuizList();
        if (res.success) {
          setMyQuizList(res.data.content);
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

    fetchMyQuizList();
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />

      <div className="w-full max-w-6xl mx-auto px-4 mt-4">
        {/* 검색 영역 */}
        <div className="flex gap-2">
          <input
            placeholder="검색어를 입력하세요."
            className="flex-1 border px-3 py-2 text-sm border-blue-500 rounded-md"
          />

          <button className="px-4 bg-blue-600 text-white text-sm hover:bg-blue-700 rounded-md cursor-pointer flex items-center justify-center">
            <Search size={18} />
          </button>
        </div>

        {/* 카드 영역 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
          {/* 퀴즈 만들기 카드 */}
          <button
            onClick={() => setOpenModal(true)}
            className="h-66 border-2 border-dashed border-blue-400 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-all hover:scale-[1.02]"
          >
            <div className="text-5xl text-blue-500">+</div>

            <p className="mt-3 text-sm font-medium text-gray-600">
              퀴즈 만들기
            </p>
          </button>

          {/* 내 퀴즈들 */}
          {loading ? (
            <div className="col-span-4 text-center text-gray-400">
              불러오는 중...
            </div>
          ) : (
            myQuizList.map((quiz) => (
              <button
                key={quiz.id}
                onClick={() => navigate(`/quiz/edit/${quiz.id}`)}
                className="h-66 w-full border border-gray-200 rounded-xl bg-white cursor-pointer hover:bg-blue-50 hover:shadow-md transition-all overflow-hidden"
              >
                <QuizCard {...quiz} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* 모달 */}
      <QuizCreateModal open={openModal} onClose={() => setOpenModal(false)} />
    </div>
  );
}
