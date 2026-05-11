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

const questions = [
  { id: 1, title: "문제 1", url: "https://youtube.com/watch?v=..." },
  { id: 2, title: "문제 2", url: "https://youtube.com/watch?v=..." },
  { id: 3, title: "문제 3", url: "https://youtube.com/watch?v=..." },
];

const categories = ["K-POP", "POP", "OST", "게임음악", "기타"];

export default function QuizEdit() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("K-POP");
  const [isPublic, setIsPublic] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id } = useParams();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

        // 🔥 목록으로 이동
        navigate("/quiz/studio");
      } else {
        alert("저장 실패");
      }
    } catch (err) {
      console.error("저장 에러:", err);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      const res = await deleteQuiz(id);

      if (res.success) {
        alert("삭제 완료");

        // 목록으로 이동
        navigate("/quiz/studio");
      } else {
        alert("삭제 실패");
      }
    } catch (err) {
      console.error("삭제 에러:", err);
    }
  };

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const res = await getQuizById(id);

        if (res.success) {
          setQuiz(res.data);

          // 🔥 여기 중요 (로컬 state로 복사)
          setTitle(res.data.title);
          setCategory(res.data.category);
          setIsPublic(res.data.isPublic);
        }
      } catch (err) {
        console.error("퀴즈 상세 조회 실패:", err);
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
              문제 목록 ({questions.length})
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
            {questions.map((q) => (
              <div
                key={q.id}
                className="flex items-center gap-3 bg-white rounded-xl border border-border px-4 py-3"
              >
                <span className="text-sm font-bold text-blue-600 w-6">
                  {q.id}
                </span>
                <Music className="w-4 h-4 text-text-tertiary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {q.title}
                  </p>
                  <p className="text-xs text-text-tertiary truncate">{q.url}</p>
                </div>
                <button className="text-text-tertiary hover:text-error cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <QuestionCreateModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
