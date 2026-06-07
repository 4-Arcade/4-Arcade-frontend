import { useEffect, useMemo, useState } from "react";
import { Search, X, Music, Check } from "lucide-react";
import { getQuizList, type Quiz } from "../services/quizApi";

const categories = ["전체", "K-POP", "POP", "OST", "게임음악", "기타"];

interface QuizPickerModalProps {
  onClose: () => void;
  onSelect: (quiz: Quiz) => void;
}

/** 퀴즈(맵) 선택 모달. 방 만들기·로비 맵 변경에서 공용으로 사용한다. */
export default function QuizPickerModal({
  onClose,
  onSelect,
}: QuizPickerModalProps) {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await getQuizList(0, 30, activeCategory);
      if (cancelled) return;
      if (res.success) {
        setQuizzes(res.data.content.filter((q: Quiz) => q.questionCount >= 5));
      } else {
        setQuizzes([]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [activeCategory]);

  const filtered = useMemo(() => {
    if (!search.trim()) return quizzes;
    const kw = search.trim().toLowerCase();
    return quizzes.filter((q) => q.title.toLowerCase().includes(kw));
  }, [quizzes, search]);

  return (
    <div className="fixed inset-0 bg-[#0F172A66] flex items-center justify-center z-50">
      <div className="bg-white rounded-[24px] w-[680px] max-h-[620px] flex flex-col shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-bg-primary">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-xl font-bold text-text-primary">퀴즈 목록</h2>
            <p className="text-xs text-text-tertiary">
              5문제 이상 등록된 공개 퀴즈만 표시됩니다
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-bg-input rounded-2xl flex items-center justify-center cursor-pointer hover:bg-border"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6 overflow-y-auto">
          <div className="flex items-center gap-2 bg-bg-input border border-border rounded-[8px] px-3.5 h-11">
            <Search className="w-[18px] h-[18px] text-text-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="퀴즈 검색..."
              className="bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none flex-1"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-[13px] font-medium cursor-pointer transition-colors ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white font-semibold"
                    : "bg-bg-input text-text-secondary hover:bg-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-sm text-text-tertiary text-center py-8">
              불러오는 중...
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-text-tertiary text-center py-8">
              표시할 퀴즈가 없습니다
            </p>
          ) : (
            filtered.map((quiz) => (
              <div
                key={quiz.id}
                className="flex items-center gap-3.5 py-3 border-b border-border last:border-b-0"
              >
                <div className="w-14 h-14 bg-bg-input rounded-[8px] shrink-0 flex items-center justify-center">
                  <Music className="w-6 h-6 text-blue-300" />
                </div>
                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-text-primary truncate">
                      {quiz.title}
                    </span>
                    <span className="bg-blue-50 text-blue-600 text-[11px] font-semibold px-2 py-0.5 rounded-[10px]">
                      {quiz.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-tertiary">
                    <span>{quiz.questionCount}문제</span>
                    <span>·</span>
                    <span>{quiz.playCount.toLocaleString()}회 플레이</span>
                  </div>
                </div>
                <button
                  onClick={() => onSelect(quiz)}
                  className="bg-blue-600 text-white text-[13px] font-semibold px-4 py-2 rounded-[8px] cursor-pointer hover:bg-blue-700 inline-flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  선택
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
