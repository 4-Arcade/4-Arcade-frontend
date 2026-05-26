import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Music, Check } from "lucide-react";
import Navbar from "../components/Navbar";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { getQuizList, type Quiz } from "../services/quizApi";
import { createRoom, type RoomSettings } from "../services/roomApi";
import { getErrorMessage } from "../services/errorMessages";
import { useRoom } from "../context/RoomContext";
import { useToast } from "../context/ToastContext";
import {
  LAST_NICKNAME_KEY,
  MAX_NICKNAME_LENGTH,
} from "../services/roomConstants";

const categories = ["전체", "K-POP", "POP", "OST", "게임음악", "기타"];

export default function RoomCreate() {
  const navigate = useNavigate();
  const toast = useToast();
  const { setEntry } = useRoom();

  const [nickname, setNickname] = useState(
    () => localStorage.getItem(LAST_NICKNAME_KEY) ?? ""
  );
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(20);
  const [showAnswer, setShowAnswer] = useState(true);
  const [wrongAnswerLimit, setWrongAnswerLimit] = useState<number | null>(null);

  const [showQuizModal, setShowQuizModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 선택된 퀴즈가 바뀌면 questionCount 범위를 보정
  useEffect(() => {
    if (!selectedQuiz) return;
    const max = Math.min(20, selectedQuiz.questionCount);
    if (questionCount > max) setQuestionCount(max);
    if (questionCount < 5) setQuestionCount(Math.min(10, max));
  }, [selectedQuiz, questionCount]);

  const questionCountOptions = useMemo(() => {
    const max = selectedQuiz ? Math.min(20, selectedQuiz.questionCount) : 20;
    const opts: number[] = [];
    for (let i = 5; i <= max; i++) opts.push(i);
    return opts;
  }, [selectedQuiz]);

  const canSubmit =
    nickname.trim().length >= 1 &&
    nickname.trim().length <= MAX_NICKNAME_LENGTH &&
    !!selectedQuiz &&
    !submitting;

  async function handleSubmit() {
    if (!selectedQuiz) return;
    const settings: RoomSettings = {
      questionCount,
      timeLimit,
      showAnswer,
      wrongAnswerLimit,
    };
    setSubmitting(true);
    const res = await createRoom({
      quizId: selectedQuiz.id,
      nickname: nickname.trim(),
      settings,
    });
    setSubmitting(false);

    if (!res.success) {
      toast.show(getErrorMessage(res.code, res.message), "error");
      return;
    }

    localStorage.setItem(LAST_NICKNAME_KEY, nickname.trim());
    setEntry({
      roomId: res.data.roomId,
      roomCode: res.data.roomCode,
      nickname: nickname.trim(),
      quizTitle: res.data.quizTitle,
    });
    navigate(`/game/lobby/${res.data.roomCode}`);
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center py-12">
        <div className="bg-white rounded-[24px] shadow-lg p-10 w-[560px] flex flex-col gap-7">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-text-primary">방 만들기</h1>
            <p className="text-sm text-text-secondary">
              퀴즈와 게임 설정을 선택하고 방을 만드세요.
            </p>
          </div>

          {/* 닉네임 */}
          <InputField
            label="닉네임"
            placeholder="1~16자 닉네임을 입력해주세요"
            value={nickname}
            maxLength={MAX_NICKNAME_LENGTH}
            onChange={(e) => setNickname(e.target.value)}
          />

          {/* 퀴즈 선택 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-text-secondary text-[13px] font-medium">
              퀴즈 선택
            </label>
            {selectedQuiz ? (
              <div className="flex items-center gap-3 bg-bg-input border border-border rounded-[12px] px-4 py-3">
                <div className="w-10 h-10 bg-blue-100 rounded-[8px] flex items-center justify-center shrink-0">
                  <Music className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-semibold text-text-primary truncate">
                    {selectedQuiz.title}
                  </span>
                  <span className="text-[12px] text-text-tertiary">
                    {selectedQuiz.category} · {selectedQuiz.questionCount}문제
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuizModal(true)}
                  className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  변경
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowQuizModal(true)}
                className="bg-bg-input border border-dashed border-border rounded-[12px] px-4 py-3 text-sm text-text-secondary text-left hover:bg-white cursor-pointer"
              >
                퀴즈를 선택해주세요
              </button>
            )}
          </div>

          <h2 className="text-base font-semibold text-text-primary">
            게임 설정
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* 문제 수 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-text-secondary">
                문제 수
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="bg-bg-input border border-border rounded-[12px] px-4 py-3 text-sm text-text-primary outline-none focus:border-border-focus"
              >
                {questionCountOptions.map((n) => (
                  <option key={n} value={n}>
                    {n}문제
                  </option>
                ))}
              </select>
            </div>

            {/* 제한 시간 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-text-secondary">
                제한 시간
              </label>
              <select
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="bg-bg-input border border-border rounded-[12px] px-4 py-3 text-sm text-text-primary outline-none focus:border-border-focus"
              >
                {[10, 15, 20, 25, 30].map((t) => (
                  <option key={t} value={t}>
                    {t}초
                  </option>
                ))}
              </select>
            </div>

            {/* 정답 공개 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-text-secondary">
                정답 공개
              </label>
              <select
                value={showAnswer ? "true" : "false"}
                onChange={(e) => setShowAnswer(e.target.value === "true")}
                className="bg-bg-input border border-border rounded-[12px] px-4 py-3 text-sm text-text-primary outline-none focus:border-border-focus"
              >
                <option value="true">매 문제마다</option>
                <option value="false">게임 종료 후</option>
              </select>
            </div>

            {/* 오답 허용 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-text-secondary">
                오답 허용
              </label>
              <select
                value={wrongAnswerLimit === null ? "null" : "1"}
                onChange={(e) =>
                  setWrongAnswerLimit(e.target.value === "null" ? null : 1)
                }
                className="bg-bg-input border border-border rounded-[12px] px-4 py-3 text-sm text-text-primary outline-none focus:border-border-focus"
              >
                <option value="null">무제한</option>
                <option value="1">1회</option>
              </select>
            </div>
          </div>

          <Button
            variant="large"
            className="w-full"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {submitting ? "방 만드는 중..." : "방 만들기"}
          </Button>
        </div>
      </div>

      {showQuizModal && (
        <QuizPickerModal
          onClose={() => setShowQuizModal(false)}
          onSelect={(quiz) => {
            setSelectedQuiz(quiz);
            setShowQuizModal(false);
          }}
        />
      )}
    </div>
  );
}

interface QuizPickerModalProps {
  onClose: () => void;
  onSelect: (quiz: Quiz) => void;
}

function QuizPickerModal({ onClose, onSelect }: QuizPickerModalProps) {
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
        setQuizzes(
          res.data.content.filter((q: Quiz) => q.questionCount >= 5)
        );
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
