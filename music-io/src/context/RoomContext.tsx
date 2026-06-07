import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  connectRoom,
  type ConnectionStatus,
  type RoomWsClient,
} from "../services/wsClient";
import { getErrorMessage } from "../services/errorMessages";
import { useToast } from "./ToastContext";
import type {
  RoomEntry,
  RoomStateSnapshot,
  RoomStatus,
  GameResultData,
} from "../services/roomTypes";

/** 입장 거부 단계(=한 번도 ws.onopen 못 본 상태)에서 의미 있는 errorCode 집합 */
const ENTRY_REJECT_CODES = new Set([
  "ROOM_NOT_FOUND",
  "ROOM_FULL",
  "GAME_IN_PROGRESS",
  "NICKNAME_TAKEN",
]);

/**
 * 화면(라우팅) 단일 진실원천. 기존엔 GameLobby/GamePlaying 이 일시적 countdown 과
 * 메모리에 남은 과거 room:state.status 를 각자 해석해 lobby↔playing 핑퐁(=카운트다운 깜빡임)이
 * 발생하고, 카운트다운 종료 후 새 room:state(IN_GAME) 가 올 때까지 전환이 누락됐다.
 * WS 메시지는 순서가 보장되므로 phase 를 도착 순서대로 갱신하면 "마지막 이벤트가 승리"해
 * 깜빡임/미전환이 모두 사라진다.
 */
export type GamePhase = "lobby" | "playing" | "result";

function phaseFromStatus(status: RoomStatus): GamePhase {
  if (status === "IN_GAME") return "playing";
  if (status === "RESULT") return "result";
  return "lobby"; // WAITING | READY
}

export type {
  RoomStatus,
  Participant,
  GameProgress,
  RoomStateSnapshot,
  RoomEntry,
  RankingEntry,
  MyQuestionEntry,
  GameResultData,
} from "../services/roomTypes";

interface RoomContextType {
  entry: RoomEntry | null;
  setEntry: (entry: RoomEntry) => void;
  state: RoomStateSnapshot | null;
  myNickname: string | null;
  isHost: boolean;
  ws: RoomWsClient | null;
  gameResult: GameResultData | null;
  clearGameResult: () => void;
  connectionStatus: ConnectionStatus;
  /** 게임 시작 카운트다운 (3→2→1→0). count=0 이후 0.6초 뒤 null로 돌아감. 오버레이 표시 전용 */
  countdown: number | null;
  /** 라우팅 단일 진실원천 (lobby/playing/result). 각 게임 페이지는 이 값으로만 전환한다 */
  gamePhase: GamePhase;
  leave: () => void;
}

const RoomContext = createContext<RoomContextType | null>(null);

export function RoomProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [entry, setEntryState] = useState<RoomEntry | null>(null);
  const [state, setState] = useState<RoomStateSnapshot | null>(null);
  const [myNickname, setMyNickname] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<GameResultData | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("closed");
  const [ws, setWs] = useState<RoomWsClient | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>("lobby");

  const setEntry = useCallback((next: RoomEntry) => {
    setGameResult(null);
    setGamePhase("lobby");
    setEntryState(next);
  }, []);

  const clearGameResult = useCallback(() => {
    setGameResult(null);
  }, []);

  const leave = useCallback(() => {
    // ws 종료는 entry=null 로 인한 useEffect cleanup이 담당. 라우팅은 각 페이지의 entry 가드.
    setEntryState(null);
    setState(null);
    setMyNickname(null);
    setGameResult(null);
    setCountdown(null);
    setGamePhase("lobby");
  }, []);

  // entry 객체 자체가 아니라 roomId/nickname 만 deps 로 둬서
  // 동일 방·동일 닉네임이면 ws 가 재연결되지 않도록 한다.
  const entryRoomId = entry?.roomId;
  const entryNickname = entry?.nickname;

  useEffect(() => {
    if (!entryRoomId || !entryNickname) return;

    const client = connectRoom({
      roomId: entryRoomId,
      nickname: entryNickname,
      onConnected: (finalNickname) => {
        setMyNickname(finalNickname);
      },
      onStatusChange: (status) => {
        setConnectionStatus(status);
      },
      onNicknameExhausted: () => {
        toast.show(
          "닉네임이 이미 사용 중입니다. 다른 닉네임으로 다시 시도해 주세요.",
          "error"
        );
      },
      onClose: (_code, _reason, lastErrorCode) => {
        // 입장 거부 사유가 명확하면 그 메시지로, 아니면 일반 끊김 메시지로 안내
        const message =
          lastErrorCode && ENTRY_REJECT_CODES.has(lastErrorCode)
            ? getErrorMessage(lastErrorCode)
            : "서버 연결이 끊겼습니다. 홈으로 이동합니다.";
        toast.show(message, "error");
        leave();
      },
    });
    // ws 인스턴스를 useState로 노출하기 위해 effect 안에서 set 한다 (useRef 우회 시 강제 리렌더 패턴이 필요해짐).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWs(client);

    const unsubs: Array<() => void> = [];

    unsubs.push(
      client.on("room:state", (data) => {
        setState(data);
        setGamePhase(phaseFromStatus(data.status));
        if (data.status === "WAITING" || data.status === "READY") {
          setGameResult(null);
        }
      })
    );

    unsubs.push(
      client.on("room:players_updated", (data) => {
        setState((prev) =>
          prev ? { ...prev, status: data.status, players: data.players } : prev
        );
        setGamePhase(phaseFromStatus(data.status));
      })
    );

    unsubs.push(
      client.on("room:settings_updated", (data) => {
        setState((prev) => (prev ? { ...prev, settings: data.settings } : prev));
      })
    );

    unsubs.push(
      client.on("game:result", (data) => {
        setGameResult(data);
        setGamePhase("result");
      })
    );

    unsubs.push(
      client.on("host:changed", (data) => {
        setState((prev) =>
          prev
            ? {
                ...prev,
                hostNickname: data.newHostNickname,
                players: prev.players.map((p) => ({
                  ...p,
                  isHost: p.nickname === data.newHostNickname,
                })),
              }
            : prev
        );
      })
    );

    // 강제 종료류는 한 곳에서 처리 (각 페이지의 중복 구독 제거). 라우팅은 entry=null 가드.
    unsubs.push(
      client.on("room:disbanded", (data) => {
        toast.show(data.message ?? "방이 해산되었습니다", "info");
        leave();
      })
    );

    unsubs.push(
      client.on("player:kicked", (data) => {
        toast.show(data.message ?? "방에서 강퇴되었습니다", "error");
        leave();
      })
    );

    // 카운트다운을 상위 Context 에 들고 있어, GameLobby→GamePlaying 라우팅 도중
    // 첫 카운트(3) 메시지가 손실되지 않도록 한다.
    // 백엔드는 현재 count=0 메시지를 안 보내고 바로 question:start 로 넘어가므로,
    // question:start 수신 시 countdown 을 강제로 정리한다.
    let countdownResetTimer: number | undefined;
    unsubs.push(
      client.on("game:countdown", (data) => {
        // 카운트다운 시작 = 게임 진입. phase 를 persistent 하게 playing 으로 올려
        // 낡은 READY 스냅샷이 lobby 로 되돌리지 못하게 한다.
        setGamePhase("playing");
        setCountdown(data.count);
        if (data.count <= 0) {
          window.clearTimeout(countdownResetTimer);
          countdownResetTimer = window.setTimeout(() => setCountdown(null), 600);
        }
      })
    );

    unsubs.push(
      client.on("question:start", () => {
        // 카운트다운이 (백그라운드 배칭 등으로) 누락돼도 question:start 는 항상 도착하므로
        // playing 을 확정한다 → gameplaying 미전환 버그 방지.
        setGamePhase("playing");
        window.clearTimeout(countdownResetTimer);
        setCountdown(null);
      })
    );

    return () => {
      window.clearTimeout(countdownResetTimer);
      unsubs.forEach((u) => u());
      client.close();
      setWs(null);
      setCountdown(null);
    };
  }, [entryRoomId, entryNickname, toast, leave]);

  const isHost =
    !!state && !!myNickname && state.hostNickname === myNickname;

  const value = useMemo<RoomContextType>(
    () => ({
      entry,
      setEntry,
      state,
      myNickname,
      isHost,
      ws,
      gameResult,
      clearGameResult,
      connectionStatus,
      countdown,
      gamePhase,
      leave,
    }),
    [
      entry,
      setEntry,
      state,
      myNickname,
      isHost,
      ws,
      gameResult,
      clearGameResult,
      connectionStatus,
      countdown,
      gamePhase,
      leave,
    ]
  );

  return (
    <RoomContext.Provider value={value}>
      {entry && connectionStatus === "reconnecting" && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500 text-white text-center text-[13px] font-semibold py-1.5 shadow-md">
          연결이 끊겼습니다. 다시 연결 중...
        </div>
      )}
      {entry && !state && connectionStatus !== "closed" && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-bg-primary/80">
          <p className="text-text-secondary text-sm">방에 연결하는 중...</p>
        </div>
      )}
      {children}
    </RoomContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used within RoomProvider");
  return ctx;
}
