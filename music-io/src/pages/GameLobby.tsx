import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Music,
  LogOut,
  Copy,
  Check,
  Settings,
  X,
  UserX,
  Crown,
  Trash2,
} from "lucide-react";
import { useRoom, type Participant } from "../context/RoomContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../services/errorMessages";
import { colorOf } from "../utils/playerColor";
import { MAX_PLAYERS, MIN_PLAYERS } from "../services/roomConstants";
import type { RoomSettings } from "../services/roomApi";

export default function GameLobby() {
  const navigate = useNavigate();
  const toast = useToast();
  const { entry, state, myNickname, isHost, ws, leave, countdown } = useRoom();

  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hostMenuFor, setHostMenuFor] = useState<string | null>(null);
  const [confirmDisband, setConfirmDisband] = useState(false);

  // entry 없으면 홈으로
  useEffect(() => {
    if (!entry) navigate("/", { replace: true });
  }, [entry, navigate]);

  // 상태 전이 / 카운트다운 시작에 따른 라우팅
  // 카운트다운은 RoomContext가 들고 있으므로 GamePlaying 마운트 후에도 보존된다.
  useEffect(() => {
    if (!entry) return;
    if (countdown !== null) {
      navigate(`/game/play/${entry.roomCode}`, { replace: true });
      return;
    }
    if (!state) return;
    if (state.status === "IN_GAME") {
      navigate(`/game/play/${entry.roomCode}`, { replace: true });
    } else if (state.status === "RESULT") {
      navigate(`/game/result/${entry.roomCode}`, { replace: true });
    }
  }, [state, entry, navigate, countdown]);

  // 에러 처리 (해산/강퇴는 RoomContext에서 공통 처리)
  useEffect(() => {
    if (!ws) return;
    const offErr = ws.on("error", (data) => {
      const code = data.errorCode;
      toast.show(getErrorMessage(code, data.message), "error");
      // 치명적 에러 — 로비를 더 이상 유지할 수 없음
      if (code === "ROOM_NOT_FOUND") {
        leave();
        navigate("/", { replace: true });
      }
    });
    return () => {
      offErr();
    };
  }, [ws, leave, navigate, toast]);

  const me: Participant | undefined = useMemo(
    () =>
      state?.players.find((p) => p.nickname === myNickname) ?? undefined,
    [state, myNickname]
  );

  if (!entry) return null;

  function handleLeave() {
    ws?.send("player:left");
    leave();
    navigate("/", { replace: true });
  }

  function handleCopyCode() {
    if (!entry) return;
    const link = `${window.location.origin}/room/join?code=${entry.roomCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.show("초대 링크가 복사되었습니다", "success");
    setTimeout(() => setCopied(false), 1500);
  }

  function handleToggleReady() {
    if (!me) return;
    ws?.send("player:ready", { isReady: !me.isReady });
  }

  function handleStart() {
    ws?.send("game:start");
  }

  function handleKick(nickname: string) {
    ws?.send("host:kick", { targetNickname: nickname });
    setHostMenuFor(null);
  }

  function handleChangeHost(nickname: string) {
    ws?.send("host:change", { targetNickname: nickname });
    setHostMenuFor(null);
  }

  function handleDisband() {
    ws?.send("host:disband");
    setConfirmDisband(false);
  }

  const players = state?.players ?? [];
  const emptySlots = Math.max(0, MAX_PLAYERS - players.length);
  const canStart =
    isHost && state?.status === "READY" && players.length >= MIN_PLAYERS;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-blue-100 via-blue-50 to-bg-primary relative">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <Music className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-bold text-blue-700">Music.io</span>
        </div>
        <div className="flex items-center gap-2">
          {isHost && (
            <button
              onClick={() => setConfirmDisband(true)}
              className="flex items-center gap-1.5 bg-white border border-border rounded-full px-4 py-2 text-[13px] text-red-500 font-medium hover:bg-red-50 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              방 해산
            </button>
          )}
          <button
            onClick={handleLeave}
            className="flex items-center gap-1.5 bg-white border border-border rounded-full px-4 py-2 text-[13px] text-text-secondary font-medium hover:bg-bg-input cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            나가기
          </button>
        </div>
      </div>

      {/* Center */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-10">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-[26px] font-extrabold text-text-primary">
            {entry.quizTitle ?? "퀴즈 정보를 불러오는 중..."}
          </h1>
          <p className="text-sm text-text-secondary">
            {state
              ? `${state.settings.questionCount}문제 · 제한시간 ${state.settings.timeLimit}초`
              : "방 정보를 불러오는 중..."}
          </p>
        </div>

        {/* Settings button (host) */}
        {isHost && state && (
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 bg-white border border-blue-200 rounded-full px-5 py-2.5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <Settings className="w-[16px] h-[16px] text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">
              설정 변경
            </span>
          </button>
        )}

        {/* Room Code */}
        <div className="flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-sm">
          <span className="text-[13px] text-text-secondary font-medium">
            방 코드
          </span>
          <span className="bg-blue-600 text-white text-sm font-bold px-3.5 py-1.5 rounded-2xl tracking-wider">
            {entry.roomCode}
          </span>
          <button
            onClick={handleCopyCode}
            className="text-text-tertiary cursor-pointer hover:text-text-secondary"
            title="방 코드 복사"
          >
            {copied ? (
              <Check className="w-[18px] h-[18px] text-green-500" />
            ) : (
              <Copy className="w-[18px] h-[18px]" />
            )}
          </button>
        </div>

        {/* Players */}
        <div className="flex items-end gap-5 flex-wrap justify-center max-w-4xl">
          {players.map((p) => (
            <div
              key={p.nickname}
              className="flex flex-col items-center gap-1.5 relative"
            >
              <div
                className={`w-16 h-16 ${colorOf(p.nickname)} rounded-full flex items-center justify-center text-white text-xl font-bold ${
                  !p.isConnected ? "opacity-50" : ""
                }`}
              >
                {p.nickname[0]}
              </div>
              <span className="text-[13px] font-medium text-text-primary max-w-[80px] truncate">
                {p.nickname}
                {p.nickname === myNickname && (
                  <span className="text-text-tertiary"> (나)</span>
                )}
              </span>
              <div className="flex items-center gap-1 h-[14px]">
                {p.isHost && (
                  <span className="text-[11px] text-blue-600 font-semibold">
                    방장
                  </span>
                )}
                {!p.isHost && p.isReady && (
                  <span className="text-[11px] text-green-600 font-semibold">
                    준비완료
                  </span>
                )}
                {!p.isConnected && (
                  <span className="text-[11px] text-text-tertiary font-semibold">
                    연결끊김
                  </span>
                )}
              </div>

              {/* 호스트 메뉴 */}
              {isHost && p.nickname !== myNickname && (
                <button
                  onClick={() =>
                    setHostMenuFor(
                      hostMenuFor === p.nickname ? null : p.nickname
                    )
                  }
                  className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full border border-border flex items-center justify-center hover:bg-bg-input cursor-pointer text-text-tertiary text-xs"
                  title="플레이어 관리"
                >
                  ⋯
                </button>
              )}
              {hostMenuFor === p.nickname && (
                <div className="absolute top-12 z-10 bg-white rounded-[12px] shadow-lg border border-border py-1 w-[140px]">
                  <button
                    onClick={() => handleChangeHost(p.nickname)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-text-primary hover:bg-bg-input cursor-pointer"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    방장 이양
                  </button>
                  <button
                    onClick={() => handleKick(p.nickname)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 cursor-pointer"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    강퇴
                  </button>
                </div>
              )}
            </div>
          ))}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <div key={`empty-${i}`} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 border-2 border-dashed border-blue-200 rounded-full" />
              <span className="text-[13px] text-text-tertiary">대기중</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-text-secondary font-medium">
          {players.length}명 참여 중 · 최대 {MAX_PLAYERS}명
        </p>

        {/* Bottom action button */}
        {isHost ? (
          <button
            disabled={!canStart}
            onClick={handleStart}
            className={`px-0 py-4 w-[280px] rounded-full text-lg font-bold text-white text-center ${
              canStart
                ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                : "bg-border cursor-not-allowed"
            }`}
          >
            {state?.status === "READY"
              ? "게임 시작"
              : players.length < MIN_PLAYERS
              ? `${MIN_PLAYERS}명 이상 필요`
              : "모두 준비 대기 중"}
          </button>
        ) : (
          <button
            onClick={handleToggleReady}
            className={`px-0 py-4 w-[280px] rounded-full text-lg font-bold text-white text-center ${
              me?.isReady
                ? "bg-green-500 hover:bg-green-600 cursor-pointer"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
            }`}
          >
            {me?.isReady ? "준비 완료 (해제하기)" : "준비"}
          </button>
        )}
      </div>

      {/* Settings modal */}
      {showSettings && state && (
        <SettingsModal
          initial={state.settings}
          onClose={() => setShowSettings(false)}
          onSubmit={(next) => {
            ws?.send("host:settings_update", { settings: next });
            setShowSettings(false);
          }}
        />
      )}

      {/* Disband confirm */}
      {confirmDisband && (
        <div className="fixed inset-0 bg-[#0F172A66] flex items-center justify-center z-50">
          <div className="bg-white rounded-[20px] shadow-xl p-7 w-[360px] flex flex-col gap-4">
            <h3 className="text-lg font-bold text-text-primary">
              방을 해산하시겠어요?
            </h3>
            <p className="text-sm text-text-secondary">
              모든 참여자가 방에서 나가게 됩니다.
            </p>
            <div className="flex gap-2 justify-end mt-2">
              <button
                onClick={() => setConfirmDisband(false)}
                className="px-4 py-2 text-[13px] text-text-secondary font-medium rounded-[10px] hover:bg-bg-input cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleDisband}
                className="px-4 py-2 text-[13px] text-white font-semibold rounded-[10px] bg-red-500 hover:bg-red-600 cursor-pointer"
              >
                해산
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SettingsModalProps {
  initial: RoomSettings;
  onClose: () => void;
  onSubmit: (next: RoomSettings) => void;
}

function SettingsModal({ initial, onClose, onSubmit }: SettingsModalProps) {
  const [questionCount, setQuestionCount] = useState(initial.questionCount);
  const [timeLimit, setTimeLimit] = useState(initial.timeLimit);
  const [showAnswer, setShowAnswer] = useState(initial.showAnswer);
  const [wrongAnswerLimit, setWrongAnswerLimit] = useState<number | null>(
    initial.wrongAnswerLimit
  );

  return (
    <div className="fixed inset-0 bg-[#0F172A66] flex items-center justify-center z-50">
      <div className="bg-white rounded-[24px] w-[480px] shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-bg-primary rounded-t-[24px]">
          <h2 className="text-xl font-bold text-text-primary">게임 설정</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-bg-input rounded-2xl flex items-center justify-center cursor-pointer hover:bg-border"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 p-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-text-secondary">
              문제 수
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="bg-bg-input border border-border rounded-[12px] px-4 py-3 text-sm text-text-primary outline-none focus:border-border-focus"
            >
              {Array.from({ length: 16 }, (_, i) => i + 5).map((n) => (
                <option key={n} value={n}>
                  {n}문제
                </option>
              ))}
            </select>
          </div>

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

        <div className="flex justify-end gap-2 px-6 pb-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-[13px] text-text-secondary font-medium rounded-[10px] hover:bg-bg-input cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={() =>
              onSubmit({
                questionCount,
                timeLimit,
                showAnswer,
                wrongAnswerLimit,
              })
            }
            className="px-5 py-2.5 text-[13px] text-white font-semibold rounded-[10px] bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
