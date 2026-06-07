import type { ServerEvents, ClientEvents } from "./wsEvents";

const WS_BASE_URL =
  import.meta.env.VITE_WS_BASE_URL ?? "wss://four-arcade-backend.onrender.com";
const DEV = import.meta.env.DEV;
const MAX_NICKNAME_RETRY = 5;
const MAX_RECONNECT_TRIES = 6;
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 15000;

interface WsMessage {
  event: string;
  data: unknown;
}

type AnyHandler = (data: unknown) => void;

export type ConnectionStatus = "connecting" | "open" | "reconnecting" | "closed";

export interface RoomWsClient {
  send: <E extends keyof ClientEvents>(event: E, data?: ClientEvents[E]) => void;
  on: <E extends keyof ServerEvents>(
    event: E,
    handler: (data: ServerEvents[E]) => void
  ) => () => void;
  close: () => void;
}

export interface ConnectOptions {
  roomId: string;
  nickname: string;
  /** 닉네임 충돌 #N 재시도 끝에 최종 사용된 닉네임 알림 */
  onConnected?: (finalNickname: string) => void;
  /** MAX_NICKNAME_RETRY 초과 시 호출 */
  onNicknameExhausted?: () => void;
  /** 연결 종료 (모든 재시도 실패 포함). lastErrorCode 는 close 직전 수신한 error 페이로드의 errorCode (있다면). */
  onClose?: (code: number, reason: string, lastErrorCode?: string) => void;
  /** 상태 변화 알림 */
  onStatusChange?: (status: ConnectionStatus) => void;
}

/** exponential backoff with full jitter. attempt 는 1 부터 시작 */
function computeBackoff(attempt: number): number {
  const exp = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * 2 ** (attempt - 1));
  return Math.floor(Math.random() * exp);
}

export function connectRoom(opts: ConnectOptions): RoomWsClient {
  const handlers = new Map<string, Set<AnyHandler>>();
  let ws: WebSocket | null = null;
  let nicknameAttempt = 0;
  let currentNickname = opts.nickname;
  let isRetryingNickname = false;
  let closedByUser = false;
  let reconnectAttempt = 0;
  let hasEverConnected = false;
  /** close 직전 마지막으로 수신한 error 의 errorCode. onClose 에 전달해 입장 거부 사유를 구분한다. */
  let lastErrorCode: string | undefined;

  function buildUrl(nickname: string): string {
    const params = new URLSearchParams({
      roomId: opts.roomId,
      // 한글 닉네임이 NFD(자모 분리, 예: macOS/일부 IME)로 들어오면 NFC 와 바이트가 달라져
      // 서버 저장·표시에서 깨질 수 있다. 표준 NFC 로 정규화(ASCII·이미 NFC 면 변화 없음).
      nickname: nickname.normalize("NFC"),
    });
    return `${WS_BASE_URL}/ws/room?${params.toString()}`;
  }

  function dispatch(event: string, data: unknown) {
    const set = handlers.get(event);
    if (!set) return;
    set.forEach((h) => {
      try {
        h(data);
      } catch (e) {
        console.error(`[ws] handler error for ${event}`, e);
      }
    });
  }

  function open() {
    const reopeningForNickname = isRetryingNickname;
    isRetryingNickname = false;
    const nickname =
      nicknameAttempt === 0
        ? opts.nickname
        : `${opts.nickname}#${nicknameAttempt + 1}`;
    currentNickname = nickname;
    // 닉네임 재시도 중에는 동일 상태 알림이 깜빡임을 유발하므로 스킵
    if (!reopeningForNickname) {
      opts.onStatusChange?.(hasEverConnected ? "reconnecting" : "connecting");
    }
    ws = new WebSocket(buildUrl(nickname));

    ws.onopen = () => {
      hasEverConnected = true;
      reconnectAttempt = 0;
      nicknameAttempt = 0; // 정상 연결 성공 시 카운터 리셋 (이후 재연결 중 NICKNAME_TAKEN 누적 방지)
      lastErrorCode = undefined; // 이전 시도의 에러 코드가 다음 close 에 잘못 노출되지 않도록 초기화
      opts.onStatusChange?.("open");
      opts.onConnected?.(currentNickname);
    };

    ws.onmessage = (e) => {
      let msg: WsMessage;
      try {
        msg = JSON.parse(e.data);
      } catch {
        if (DEV) console.warn("[ws] non-JSON message", e.data);
        return;
      }

      // error 페이로드 정규화: 백엔드가 { code } 또는 { errorCode, message } 두 형태로 보냄
      if (msg.event === "error") {
        const d = (msg.data ?? {}) as { errorCode?: string; code?: string; message?: string };
        msg = {
          event: "error",
          data: { errorCode: d.errorCode ?? d.code, message: d.message },
        };
      }
      if (DEV) console.log("[ws ←]", msg.event, msg.data);

      const errorCode = (msg.data as { errorCode?: string } | null)?.errorCode;

      if (msg.event === "error" && errorCode) {
        lastErrorCode = errorCode;
      }

      // 닉네임 충돌 처리: 재시도 여유가 있으면 접미사 붙여 재연결, 소진 시엔 콜백만 호출
      if (msg.event === "error" && errorCode === "NICKNAME_TAKEN") {
        if (nicknameAttempt < MAX_NICKNAME_RETRY - 1) {
          nicknameAttempt += 1;
          isRetryingNickname = true;
          try {
            ws?.close();
          } catch {
            /* noop */
          }
          setTimeout(() => open(), 50);
        } else {
          opts.onNicknameExhausted?.();
        }
        return; // 어느 분기든 dispatch 로 흘려보내지 않음 (구독자 측 중복 처리 방지)
      }

      dispatch(msg.event, msg.data);
    };

    ws.onclose = (e) => {
      if (closedByUser) {
        opts.onStatusChange?.("closed");
        return;
      }
      if (isRetryingNickname) return;

      // 한 번도 연결된 적이 없으면 (=초기 진입 실패) 재연결 시도하지 않음
      if (!hasEverConnected) {
        opts.onStatusChange?.("closed");
        opts.onClose?.(e.code, e.reason, lastErrorCode);
        return;
      }

      // 비정상 끊김 → 자동 재연결 시도 (exponential backoff + jitter)
      if (reconnectAttempt < MAX_RECONNECT_TRIES) {
        reconnectAttempt += 1;
        opts.onStatusChange?.("reconnecting");
        const delay = computeBackoff(reconnectAttempt);
        setTimeout(() => {
          if (!closedByUser) open();
        }, delay);
        return;
      }

      opts.onStatusChange?.("closed");
      opts.onClose?.(e.code, e.reason, lastErrorCode);
    };

    ws.onerror = () => {
      /* onclose가 뒤따라옴 */
    };
  }

  open();

  return {
    send(event, data) {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        if (DEV) console.warn(`[ws] send dropped (not open): ${event}`);
        return;
      }
      const payload = data ?? {};
      if (DEV) console.log("[ws →]", event, payload);
      ws.send(JSON.stringify({ event, data: payload }));
    },
    on(event, handler) {
      const key = event as string;
      if (!handlers.has(key)) handlers.set(key, new Set());
      handlers.get(key)!.add(handler as AnyHandler);
      return () => {
        handlers.get(key)?.delete(handler as AnyHandler);
      };
    },
    close() {
      closedByUser = true;
      try {
        ws?.close();
      } catch {
        /* noop */
      }
    },
  };
}
