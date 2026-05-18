import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Music, Trash2 } from "lucide-react";

// Components
import Navbar from "../components/Navbar";
import InputField from "../components/InputField";
import Button from "../components/Button";
import QuestionCreateModal from "../components/QuestionCreateModal";

// API
import {
  getQuizById,
  QuizDetail,
  deleteQuiz,
  updateQuiz,
} from "@/services/quizApi";
import { deleteQuestion } from "@/services/questionApi";

const categories = ["K-POP", "POP", "OST", "게임음악", "기타"];

export default function QuizEdit() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("K-POP");
  const [isPublic, setIsPublic] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id } = useParams();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<
    QuizDetail["questions"][number] | null
  >(null);
  const navigate = useNavigate();

  /* 퀴즈 수정 */
  const handleSave = async () => {
    if (!id) return;

    const payload = {
      title,
      description: quiz?.description ?? "",
      category,
      isPublic,
    };

    try {
      const res = await updateQuiz(id, payload);

      if (res.success) {
        alert("저장 완료");
        navigate("/quiz/studio");
      } else {
        alert(res.message);
      }
    } catch (e) {
      console.error("저장 에러:", e);

      const error = e as Error;
      alert(error.message);
    }
  };

  /* 퀴즈 삭제 */
  const handleDelete = async () => {
    if (!id) return;

    const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      const res = await deleteQuiz(id);

      if (res.success) {
        alert("삭제 완료");
        navigate("/quiz/studio");
      } else {
        alert(res.message);
      }
    } catch (e) {
      console.error("삭제 에러:", e);

      const error = e as Error;
      alert(error.message);
    }
  };

  /* 문제 상세 조회 */
  const handleQuestionClick = (question: QuizDetail["questions"][number]) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
  };

  /* 문제 삭제 */
  const handleDeleteQuestion = async (quizId: any, questionId: string) => {
    try {
      const res = await deleteQuestion(quizId, questionId);

      if (res.success) {
        // 화면 즉시 반영
        setQuiz((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            questions: prev.questions.filter((q) => q.id !== questionId),
          };
        });
      } else {
        alert(res.message);
      }
    } catch (e) {
      console.log("문제 삭제 중 에러 : " + e);

      const error = e as Error;
      alert(error.message);
    }
  };

  /* 문제 생성 후 페이지 최신화 로직 */
  const refetchQuiz = async () => {
    if (!id) return;

    const res = await getQuizById(id);

    if (res.success) {
      setQuiz(res.data);
    } else {
      alert(res.message);
    }
  };

  /* 퀴즈 상세 조회 */
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const res = await getQuizById(id);

        if (res.success) {
          setQuiz(res.data);

          setTitle(res.data.title);
          setCategory(res.data.category);
          setIsPublic(res.data.isPublic);
        } else {
          alert(res.message);
        }
      } catch (e) {
        console.error("퀴즈 상세 조회 실패:", e);

        const error = e as Error;
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  if (loading) return <div>로딩 중...</div>;
  if (!quiz) return <div>데이터 없음</div>;

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <div className="flex gap-8 px-20 py-8 flex-1">
        {/* Left - Quiz Info */}
        <div className="w-[360px] flex flex-col gap-5">
          <h2 className="text-xl font-bold text-text-primary">퀴즈 정보</h2>
          <InputField
            label="퀴즈 제목"
            placeholder="퀴즈 제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-text-secondary">
              카테고리
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div
            onClick={() => setIsPublic((prev) => !prev)}
            className={`w-10 h-6 rounded-full relative cursor-pointer ${
              isPublic ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${
                isPublic ? "right-0.5" : "left-0.5"
              }`}
            />
          </div>
          <div className="flex flex-col gap-3 mt-2">
            <Button variant="large" className="w-full" onClick={handleSave}>
              저장하기
            </Button>
            <Button
              variant="ghost"
              className="w-full text-error"
              onClick={handleDelete}
            >
              삭제하기
            </Button>
          </div>
        </div>

        {/* Right - Questions */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary">
              문제 목록 ({quiz.questions.length})
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-[12px] cursor-pointer hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              문제 추가
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {quiz.questions.map((q) => (
              <div
                key={q.id}
                className="flex items-center gap-3 bg-white rounded-xl border border-border px-4 py-3"
              >
                <span className="text-sm font-bold text-blue-600 w-6">
                  {q.orderIndex}
                </span>
                <Music className="w-4 h-4 text-text-tertiary" />
                <div
                  onClick={() => handleQuestionClick(q)}
                  className="flex-1 cursor-pointer"
                >
                  <p className="text-sm font-medium text-text-primary">
                    문제 {q.orderIndex}
                  </p>
                  <p className="text-xs text-text-tertiary truncate">
                    {q.hint}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 카드 클릭 방지
                    handleDeleteQuestion(id, q.id);
                  }}
                  className="text-text-tertiary hover:text-error cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <QuestionCreateModal
        open={isModalOpen}
        quizId={quiz.id}
        questionId={selectedQuestion?.id}
        onClose={async () => {
          setIsModalOpen(false);
          setSelectedQuestion(null);
          await refetchQuiz();
        }}
      />
    </div>
  );
}
