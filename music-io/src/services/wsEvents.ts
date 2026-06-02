import type { RoomSettings } from "./roomApi";
import type {
  RoomStateSnapshot,
  RoomStatus,
  Participant,
  GameResultData,
} from "./roomTypes";

/** 서버 → 클라이언트 이벤트별 payload 타입 (ws-docs 계약 기준) */
export interface ServerEvents {
  "room:state": RoomStateSnapshot;
  "room:players_updated": { status: RoomStatus; players: Participant[] };
  "room:settings_updated": { settings: RoomSettings };
  "room:disbanded": { message: string };
  "player:joined": { nickname: string; playerCount: number };
  "player:reconnected": { nickname: string };
  "player:disconnected": { nickname: string; reconnectTimeoutSec: number };
  "player:left": { nickname: string; playerCount: number };
  "player:kicked": { message: string };
  "host:changed": { newHostNickname: string };
  "game:countdown": { count: number };
  "question:start": {
    index: number;
    totalCount: number;
    timeLimit: number;
    hint: string | null;
  };
  "question:media": { videoId: string; startSec: number; endSec: number };
  "question:correct": { nickname: string; score: number; timeLeft: number };
  "question:end": {
    correctAnswer: string | null;
    scores: Array<{
      nickname: string;
      questionScore: number;
      totalScore: number;
    }>;
  };
  "question:skip": { questionIndex: number; reason: string; nextIn: number };
  "answer:locked": { questionIndex: number; message: string };
  "game:result": GameResultData;
  /** wsClient 가 { code } / { errorCode, message } 두 형태를 errorCode 로 정규화해 전달 */
  error: { errorCode?: string; message?: string };
}

/** 클라이언트 → 서버 이벤트별 payload 타입 */
export interface ClientEvents {
  "player:ready": { isReady: boolean };
  "host:kick": { targetNickname: string };
  "host:settings_update": { settings: RoomSettings };
  "host:disband": Record<string, never>;
  "host:change": { targetNickname: string };
  "player:left": Record<string, never>;
  "game:start": Record<string, never>;
  "game:answer": { answer: string };
  "question:playback_error": { questionIndex: number; errorCode: number };
  "game:restart": Record<string, never>;
}
