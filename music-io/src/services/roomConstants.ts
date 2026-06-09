/** 방 최대 인원 */
export const MAX_PLAYERS = 8;

/** 게임 시작 가능 최소 인원 */
export const MIN_PLAYERS = 2;

/** 닉네임 최대 길이 */
export const MAX_NICKNAME_LENGTH = 16;

/** 정답 제출 클라이언트 throttle (윈도우 내 최대 횟수) */
export const ANSWER_RATE_LIMIT = 5;
export const ANSWER_RATE_WINDOW_MS = 1000;

/** RESULT 화면에서 game:result 가 안 오면 dead-end 안내로 전환하는 시간 */
export const RESULT_TIMEOUT_MS = 5000;

/** 방 코드 자릿수 */
export const ROOM_CODE_LENGTH = 6;

/** 직전 사용 닉네임 저장 키 (비회원 자동 채움용, PRD 9절) */
export const LAST_NICKNAME_KEY = "lastNickname";

/**
 * 방 생성 시 맵(퀴즈)을 따로 고르지 않은 경우 사용할 기본 퀴즈 ID.
 * 백엔드가 quizId 를 notnull 로 요구하므로 항상 전송한다. 방장은 로비에서 맵(퀴즈)을 바꿀 수 있다.
 */
export const DEFAULT_QUIZ_ID = "4e86517c-58e6-43fe-81fd-8c020a1bdda3";
