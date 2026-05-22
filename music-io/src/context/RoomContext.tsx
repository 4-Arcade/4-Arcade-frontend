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
import { useToast } from "./ToastContext";
import type {
  RoomEntry,
  RoomStateSnapshot,
  GameResultData,
} from "../services/roomTypes";

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
  /** 게임 시작 카운트다운 (3→2→1→0). count=0 이후 0.6초 뒤 null로 돌아감 */
  countdown: number | null;
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

  const setEntry = useCallback((next: RoomEntry) => {
    setGameResult(null);
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
  }, []);

  useEffect(() => {
    if (!entry) return;

    const client = connectRoom({
      roomId: entry.roomId,
      nickname: entry.nickname,
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
      onClose: () => {
        // 모든 재시도 실패 → 방을 떠나고(각 페이지가 홈으로 이동) 안내
        toast.show("서버 연결이 끊겼습니다. 홈으로 이동합니다.", "error");
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
        setCountdown(data.count);
        if (data.count <= 0) {
          window.clearTimeout(countdownResetTimer);
          countdownResetTimer = window.setTimeout(() => setCountdown(null), 600);
        }
      })
    );

    unsubs.push(
      client.on("question:start", () => {
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
  }, [entry, toast, leave]);

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
