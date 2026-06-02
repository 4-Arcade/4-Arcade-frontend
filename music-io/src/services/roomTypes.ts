import type { RoomSettings } from "./roomApi";

export type RoomStatus = "WAITING" | "READY" | "IN_GAME" | "RESULT";

export interface Participant {
  nickname: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  score?: number;
  disconnectedAt?: number | null;
}

export interface GameProgress {
  currentQuestionIndex: number;
  totalQuestionCount: number;
  questionStartedAt: number;
  timeLimit: number;
}

export interface RoomStateSnapshot {
  roomId: string;
  roomCode: string;
  status: RoomStatus;
  hostNickname: string;
  players: Participant[];
  settings: RoomSettings;
  gameProgress: GameProgress | null;
}

export interface RoomEntry {
  roomId: string;
  roomCode: string;
  nickname: string;
  quizTitle?: string;
}

export interface RankingEntry {
  rank: number;
  nickname: string;
  totalScore: number;
  isMe: boolean;
}

export interface MyQuestionEntry {
  index: number;
  isCorrect: boolean;
  score: number;
  speedBonus?: number;
  correctAnswer: string;
}

export interface GameResultData {
  ranking: RankingEntry[];
  myQuestions: MyQuestionEntry[];
}
