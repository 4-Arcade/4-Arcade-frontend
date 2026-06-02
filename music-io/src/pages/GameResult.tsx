import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music, RotateCcw, Home, ChevronDown, ChevronUp } from "lucide-react";
import { useRoom } from "../context/RoomContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../services/errorMessages";
import { colorOf } from "../utils/playerColor";
import { RESULT_TIMEOUT_MS } from "../services/roomConstants";

export default function GameResult() {
  const navigate = useNavigate();
  const toast = useToast();
  const {
    entry,
    state,
    isHost,
    ws,
    gameResult,
    clearGameResult,
    leave,
  } = useRoom();
  const [showDetails, setShowDetails] = useState(false);
  // 새 탭 / 새 세션으로 RESULT 상태에 들어오면 백엔드가 game:result 를 unicast 하지 않아
  // 무한 로딩에 갇힐 수 있다. 5초 이상 결과가 없으면 dead-end 안내로 전환.
  const [resultTimedOut, setResultTimedOut] = useState(false);

  // entry 없거나 결과 데이터가 없으면 홈으로
  useEffect(() => {
    if (!entry) navigate("/", { replace: true });
  }, [entry, navigate]);

  // 다시 하기 후 WAITING 상태로 돌아오면 로비로
  useEffect(() => {
    if (!state || !entry) return;
    if (state.status === "WAITING" || state.status === "READY") {
      clearGameResult();
      navigate(`/game/lobby/${entry.roomCode}`, { replace: true });
    }
  }, [state, entry, navigate, clearGameResult]);

  useEffect(() => {
    if (gameResult) return;
    const id = window.setTimeout(() => setResultTimedOut(true), RESULT_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [gameResult]);

  // 에러 (해산은 RoomContext에서 공통 처리)
  useEffect(() => {
    if (!ws) return;
    const offErr = ws.on("error", (data) => {
      toast.show(getErrorMessage(data.errorCode, data.message), "error");
    });
    return () => {
      offErr();
    };
  }, [ws, toast]);

  const top3 = useMemo(
    () => (gameResult?.ranking ?? []).slice(0, 3),
    [gameResult]
  );
  const rest = useMemo(
    () => (gameResult?.ranking ?? []).slice(3),
    [gameResult]
  );

  if (!entry) return null;

  function handleRestart() {
    ws?.send("game:restart");
  }

  function handleHome() {
    leave();
    navigate("/", { replace: true });
  }

  if (!gameResult) {
    if (resultTimedOut) {
      return (
        <div className="h-screen flex flex-col items-center justify-center gap-4 bg-bg-primary">
          <p className="text-text-secondary">
            결과를 불러올 수 없습니다. 홈으로 돌아가 다시 시도해 주세요.
          </p>
          <button
            onClick={handleHome}
            className="flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-2.5 rounded-full hover:bg-blue-700 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            홈으로
          </button>
        </div>
      );
    }
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary">
        <p className="text-text-secondary">결과를 불러오는 중...</p>
      </div>
    );
  }

  // podium 배치: 2등 - 1등 - 3등
  const podiumLayout = [
    top3[1] ? { ...top3[1], height: "h-20" } : null,
    top3[0] ? { ...top3[0], height: "h-28" } : null,
    top3[2] ? { ...top3[2], height: "h-16" } : null,
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-blue-50 to-bg-primary">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-1.5">
          <Music className="w-5 h-5 text-blue-600" />
          <span className="text-base font-bold text-blue-700">Music.io</span>
        </div>
        <span className="text-sm text-text-secondary font-medium">
          {entry.quizTitle}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-10 py-10">
        <h1 className="text-4xl font-black text-text-primary">게임 종료!</h1>

        {/* Podium */}
        <div className="flex items-end gap-5">
          {podiumLayout.map((p, idx) =>
            p ? (
              <div key={p.nickname} className="flex flex-col items-center gap-2.5">
                <div
                  className={`w-16 h-16 ${colorOf(p.nickname)} rounded-full flex items-center justify-center text-white text-xl font-bold`}
                >
                  {p.nickname[0]}
                </div>
                <span className="text-[15px] font-semibold text-text-primary">
                  {p.nickname}
                  {p.isMe && (
                    <span className="text-text-tertiary"> (나)</span>
                  )}
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {p.totalScore.toLocaleString()}점
                </span>
                <div
                  className={`w-24 ${p.height} rounded-t-xl ${
                    p.rank === 1
                      ? "bg-blue-500"
                      : p.rank === 2
                      ? "bg-blue-300"
                      : "bg-blue-200"
                  } flex items-center justify-center`}
                >
                  <span className="text-2xl font-black text-white">
                    {p.rank}
                  </span>
                </div>
              </div>
            ) : (
              <div key={`empty-${idx}`} className="w-24" />
            )
          )}
        </div>

        {/* 4등 이하 */}
        {rest.length > 0 && (
          <div className="flex flex-col gap-2 w-[440px]">
            {rest.map((r) => (
              <div
                key={r.nickname}
                className={`flex items-center gap-3 rounded-2xl shadow-sm px-5 py-3 ${
                  r.isMe ? "bg-blue-50 border border-blue-200" : "bg-white"
                }`}
              >
                <span className="text-base font-extrabold text-text-tertiary w-5">
                  {r.rank}
                </span>
                <div
                  className={`w-9 h-9 ${colorOf(r.nickname)} rounded-full flex items-center justify-center text-white font-bold`}
                >
                  {r.nickname[0]}
                </div>
                <span className="text-[15px] font-medium text-text-primary">
                  {r.nickname}
                  {r.isMe && <span className="text-text-tertiary"> (나)</span>}
                </span>
                <span className="flex-1" />
                <span className="text-[15px] font-bold text-text-secondary">
                  {r.totalScore.toLocaleString()}점
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 내 문제 상세 토글 */}
        {gameResult.myQuestions.length > 0 && (
          <button
            onClick={() => setShowDetails((v) => !v)}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            내 문제 결과 보기
            {showDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}

        {showDetails && (
          <div className="flex flex-col gap-2 w-[440px] bg-white rounded-2xl shadow-sm p-4">
            {gameResult.myQuestions.map((q) => (
              <div
                key={q.index}
                className="flex items-center gap-3 py-2 border-b border-border last:border-b-0"
              >
                <span className="text-[13px] font-bold text-text-tertiary w-8">
                  Q{q.index}
                </span>
                <span
                  className={`text-[12px] font-bold px-2 py-0.5 rounded-[6px] ${
                    q.isCorrect
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-500"
                  }`}
                >
                  {q.isCorrect ? "정답" : "오답"}
                </span>
                <span className="flex-1 text-[13px] text-text-secondary truncate">
                  정답: {q.correctAnswer}
                </span>
                <span className="text-[13px] font-bold text-blue-600">
                  +{q.score.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          {isHost && (
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-3.5 rounded-full shadow-[0_4px_16px_rgba(37,99,235,0.3)] hover:bg-blue-700 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              다시 하기
            </button>
          )}
          <button
            onClick={handleHome}
            className="flex items-center gap-2 bg-white text-text-primary font-bold px-8 py-3.5 rounded-full border border-border hover:bg-bg-input cursor-pointer"
          >
            <Home className="w-4 h-4" />
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}
