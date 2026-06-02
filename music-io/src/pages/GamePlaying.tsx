import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music, Send, CheckCircle2, SkipForward } from "lucide-react";
import { useRoom } from "../context/RoomContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../services/errorMessages";
import { colorOf } from "../utils/playerColor";
import {
  ANSWER_RATE_LIMIT,
  ANSWER_RATE_WINDOW_MS,
} from "../services/roomConstants";
import {
  createYtPlayer,
  loadYouTubeApi,
  type YtPlayerHandle,
} from "../services/youtubePlayer";

interface QuestionInfo {
  index: number;
  totalCount: number;
  timeLimit: number;
  hint: string | null;
  startedAt: number; // ms epoch
}

interface CorrectNotice {
  nickname: string;
  score: number;
  timeLeft: number;
}

interface SkipNotice {
  questionIndex: number;
  reason: string;
  nextIn: number;
}

export default function GamePlaying() {
  const navigate = useNavigate();
  const toast = useToast();
  const { entry, state, myNickname, ws, gameResult, countdown } = useRoom();

  const [question, setQuestion] = useState<QuestionInfo | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  const [answer, setAnswer] = useState("");
  const [locked, setLocked] = useState(false);
  const [correctNotice, setCorrectNotice] = useState<CorrectNotice | null>(
    null
  );
  // questionEnded: showAnswer=false 모드에서 correctAnswer가 null로 와도
  // 입력창을 비활성화해야 하므로 별도 플래그를 둔다.
  const [questionEnded, setQuestionEnded] = useState(false);
  const [endedAnswer, setEndedAnswer] = useState<string | null>(null);
  const [skip, setSkip] = useState<SkipNotice | null>(null);
  const [scoreMap, setScoreMap] = useState<Record<string, number>>({});

  const ytRef = useRef<YtPlayerHandle | null>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const pendingMediaRef = useRef<{
    videoId: string;
    startSec: number;
    endSec: number;
  } | null>(null);
  const apiReadyRef = useRef(false);
  const questionRef = useRef<QuestionInfo | null>(null);
  const submitTimesRef = useRef<number[]>([]);

  // question 최신값을 ref로 동기화 (YT onError에서 사용)
  useEffect(() => {
    questionRef.current = question;
  }, [question]);

  // 매 문제마다 새 YT.Player를 생성한다 (videoId를 src에 박아 autoplay 정책 통과)
  const spawnPlayer = useCallback(
    (data: { videoId: string; startSec: number; endSec: number }) => {
      const wrapper = playerWrapperRef.current;
      if (!wrapper) return;

      // 기존 player 정리
      ytRef.current?.destroy();
      ytRef.current = null;

      // wrapper 안에 새 target div 생성 (YT.Player는 div를 iframe으로 치환)
      wrapper.innerHTML = "";
      const target = document.createElement("div");
      target.id = "yt-player-target";
      wrapper.appendChild(target);

      createYtPlayer({
        containerId: "yt-player-target",
        videoId: data.videoId,
        startSec: data.startSec,
        endSec: data.endSec,
        onError: (code) => {
          const q = questionRef.current;
          if (!q) return;
          ws?.send("question:playback_error", {
            questionIndex: q.index,
            errorCode: code,
          });
        },
      })
        .then((handle) => {
          ytRef.current = handle;
        })
        .catch((e) => console.error("[yt] create error", e));
    },
    [ws]
  );

  // entry 없으면 홈으로
  useEffect(() => {
    if (!entry) navigate("/", { replace: true });
  }, [entry, navigate]);

  // 상태 전이 라우팅
  useEffect(() => {
    if (!entry) return;
    if (gameResult) {
      navigate(`/game/result/${entry.roomCode}`, { replace: true });
      return;
    }
    if (!state) return;
    if (state.status === "WAITING" || state.status === "READY") {
      navigate(`/game/lobby/${entry.roomCode}`, { replace: true });
    } else if (state.status === "RESULT") {
      navigate(`/game/result/${entry.roomCode}`, { replace: true });
    }
  }, [state, entry, navigate, gameResult]);

  // 초기 score 동기화
  useEffect(() => {
    if (!state) return;
    setScoreMap((prev) => {
      const next = { ...prev };
      state.players.forEach((p) => {
        if (next[p.nickname] === undefined) next[p.nickname] = p.score ?? 0;
      });
      return next;
    });
  }, [state]);

  // 재접속 시 gameProgress로 진행 중인 문제 복원
  useEffect(() => {
    if (!state?.gameProgress) return;
    const gp = state.gameProgress;
    const questionNumber = gp.currentQuestionIndex + 1; // 백엔드는 0-based, UI 표시는 1-based
    // 백엔드가 number(ms) / ISO string 둘 중 어느 형태로 보내든 안전하게 ms 로 정규화
    const startedAtMs =
      typeof gp.questionStartedAt === "number"
        ? gp.questionStartedAt
        : Date.parse(gp.questionStartedAt as unknown as string);
    setQuestion((prev) => {
      if (prev && prev.index === questionNumber) return prev;
      return {
        index: questionNumber,
        totalCount: gp.totalQuestionCount,
        timeLimit: gp.timeLimit,
        hint: null,
        startedAt: Number.isFinite(startedAtMs) ? startedAtMs : Date.now(),
      };
    });
  }, [state?.gameProgress]);

  // YT IFrame API 사전 로드 (player는 question:media 때 생성)
  useEffect(() => {
    let alive = true;
    loadYouTubeApi()
      .then(() => {
        if (!alive) return;
        apiReadyRef.current = true;
        // API 준비 전에 도착한 media가 있으면 지금 spawn
        const pending = pendingMediaRef.current;
        if (pending) {
          pendingMediaRef.current = null;
          spawnPlayer(pending);
        }
      })
      .catch((e) => console.error("[yt] api load error", e));
    return () => {
      alive = false;
      ytRef.current?.destroy();
      ytRef.current = null;
      apiReadyRef.current = false;
    };
  }, [spawnPlayer]);

  // 게임 이벤트 구독 (game:countdown 은 RoomContext 가 담당)
  useEffect(() => {
    if (!ws) return;

    const offs: Array<() => void> = [];

    offs.push(
      ws.on("question:start", (data) => {
        // 새 문제 진입 시 이전 곡 즉시 중지 (question:media 도착 전 잔재 방지)
        ytRef.current?.destroy();
        ytRef.current = null;
        setQuestion({
          index: data.index,
          totalCount: data.totalCount,
          timeLimit: data.timeLimit,
          hint: data.hint,
          startedAt: Date.now(),
        });
        setAnswer("");
        setLocked(false);
        setCorrectNotice(null);
        setQuestionEnded(false);
        setEndedAnswer(null);
        setSkip(null);
      })
    );

    offs.push(
      ws.on("question:media", (data) => {
        if (apiReadyRef.current) {
          spawnPlayer(data);
        } else {
          // API 아직 로드 중 → 큐에 저장. API ready 후 처리됨
          pendingMediaRef.current = data;
        }
      })
    );

    offs.push(
      ws.on("question:correct", (data) => {
        setCorrectNotice(data);
      })
    );

    offs.push(
      ws.on("question:end", (data) => {
        setQuestionEnded(true);
        setEndedAnswer(data.correctAnswer);
        ytRef.current?.destroy();
        ytRef.current = null;
        setScoreMap((prev) => {
          const next = { ...prev };
          data.scores.forEach((s) => {
            next[s.nickname] = s.totalScore;
          });
          return next;
        });
      })
    );

    offs.push(
      ws.on("question:skip", (data) => {
        setSkip(data);
        ytRef.current?.destroy();
        ytRef.current = null;
      })
    );

    offs.push(
      ws.on("answer:locked", () => {
        setLocked(true);
      })
    );

    // 해산/강퇴는 RoomContext에서 공통 처리 (entry=null → 아래 entry 가드가 홈으로 이동)
    offs.push(
      ws.on("error", (data) => {
        const code = data.errorCode;
        // 인원 부족 종료는 백엔드가 room:state(WAITING) 도 보내므로 안내만 하고 로비 복귀에 맡긴다
        if (code === "NOT_ENOUGH_PLAYERS") {
          toast.show("참여자가 부족해 게임이 종료되었습니다", "info");
          return;
        }
        toast.show(getErrorMessage(code, data.message), "error");
      })
    );

    return () => offs.forEach((o) => o());
  }, [ws, toast, spawnPlayer]);

  // 타이머
  useEffect(() => {
    if (!question) {
      setRemaining(0);
      return;
    }
    const tick = () => {
      const elapsed = (Date.now() - question.startedAt) / 1000;
      const left = Math.max(0, question.timeLimit - elapsed);
      setRemaining(left);
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [question]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = answer.trim();
    if (!trimmed || locked || !question || correctNotice || questionEnded) return;

    // 클라이언트 측 throttle: 윈도우 내 제한 횟수 이하
    const now = Date.now();
    const recent = submitTimesRef.current.filter(
      (t) => now - t < ANSWER_RATE_WINDOW_MS
    );
    if (recent.length >= ANSWER_RATE_LIMIT) return;
    recent.push(now);
    submitTimesRef.current = recent;

    ws?.send("game:answer", { answer: trimmed });
    setAnswer("");
  }

  const rankings = useMemo(() => {
    if (!state) return [];
    return state.players
      .map((p) => ({
        nickname: p.nickname,
        score: scoreMap[p.nickname] ?? 0,
      }))
      .sort((a, b) => b.score - a.score);
  }, [state, scoreMap]);

  if (!entry) return null;

  const timerPercent = question
    ? Math.max(0, Math.min(1, remaining / question.timeLimit))
    : 0;

  return (
    <div className="h-screen flex bg-gradient-to-b from-blue-100 via-blue-50 to-bg-primary">
      {/* YT player wrapper - 영상은 숨기고 오디오만 재생되도록 화면 밖에 둔다.
          display:none/visibility:hidden 은 일부 브라우저에서 autoplay/오디오가 막혀 off-screen 으로 둔다. */}
      <div
        ref={playerWrapperRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: -10000,
          left: -10000,
          width: 200,
          height: 113,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      />


      {/* Left - Main Game Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-1.5">
            <Music className="w-5 h-5 text-blue-600" />
            <span className="text-base font-bold text-blue-700">Music.io</span>
          </div>
          <div className="flex items-center gap-1 bg-white rounded-2xl px-3.5 py-1.5 shadow-sm">
            <span className="text-xs font-medium text-text-secondary">
              {question?.index ?? "-"}
            </span>
            <span className="text-xs text-text-tertiary">/</span>
            <span className="text-xs text-text-tertiary">
              {question?.totalCount ?? "-"}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-7 px-15">
          {/* Timer + 상태 카드 */}
          <div className="bg-white rounded-[24px] shadow-lg p-8 w-[420px] flex flex-col items-center gap-5">
            <div className="w-24 h-24 rounded-full border-4 border-blue-500 flex items-center justify-center">
              <span className="text-4xl font-black text-blue-600">
                {question ? Math.ceil(remaining) : "-"}
              </span>
            </div>
            <div className="w-full bg-bg-input rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${timerPercent * 100}%` }}
              />
            </div>
            {endedAnswer ? (
              <p className="text-sm text-text-primary font-semibold">
                정답: <span className="text-blue-600">{endedAnswer}</span>
              </p>
            ) : correctNotice ? (
              <p className="text-sm text-green-600 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {correctNotice.nickname}님 정답! (+{correctNotice.score})
              </p>
            ) : questionEnded ? (
              <p className="text-sm text-text-secondary">
                다음 문제를 준비 중입니다...
              </p>
            ) : skip ? (
              <p className="text-sm text-text-secondary flex items-center gap-1.5">
                <SkipForward className="w-4 h-4" />
                {skip.reason}
              </p>
            ) : question?.hint ? (
              <p className="text-sm text-text-secondary">힌트: {question.hint}</p>
            ) : (
              <p className="text-sm text-text-secondary">
                노래를 듣고 제목을 맞춰보세요!
              </p>
            )}
          </div>

          {/* Answer input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center bg-white rounded-full shadow-sm w-[420px] pl-5 pr-1.5 py-1.5"
          >
            <input
              type="text"
              placeholder={
                locked
                  ? "오답으로 입력이 잠겼습니다"
                  : questionEnded || correctNotice
                  ? "다음 문제를 기다리는 중..."
                  : "정답을 입력하세요..."
              }
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={
                !question ||
                locked ||
                !!correctNotice ||
                questionEnded ||
                !!skip
              }
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={
                !question ||
                locked ||
                !!correctNotice ||
                questionEnded ||
                !!skip ||
                !answer.trim()
              }
              className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 disabled:bg-border disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      </div>

      {/* Right - Rankings */}
      <div className="w-[340px] bg-white shadow-[-2px_0_16px_rgba(15,23,42,0.03)] flex flex-col p-4 gap-3">
        <h3 className="text-[15px] font-bold text-text-primary">실시간 순위</h3>
        <div className="flex flex-col gap-2">
          {rankings.map((r, idx) => (
            <div
              key={r.nickname}
              className={`flex items-center gap-2.5 rounded-[12px] px-3 py-2.5 ${
                r.nickname === myNickname
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-white border border-border"
              }`}
            >
              <span className="text-xs font-extrabold text-text-tertiary w-4">
                {idx + 1}
              </span>
              <div
                className={`w-7 h-7 ${colorOf(r.nickname)} rounded-full flex items-center justify-center text-white text-xs font-bold`}
              >
                {r.nickname[0]}
              </div>
              <span className="flex-1 text-sm font-medium text-text-primary truncate">
                {r.nickname}
                {r.nickname === myNickname && (
                  <span className="text-text-tertiary"> (나)</span>
                )}
              </span>
              <span className="text-sm font-bold text-blue-600">
                {r.score.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 bg-[#0F172A99] flex items-center justify-center z-50">
          <span className="text-white text-[160px] font-black drop-shadow-lg">
            {countdown > 0 ? countdown : "GO!"}
          </span>
        </div>
      )}
    </div>
  );
}
