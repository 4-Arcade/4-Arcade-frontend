/* 서버 에러 코드 → 한국어 메시지 (ws-docs §7) */
const MESSAGES: Record<string, string> = {
  VALIDATION_FAILED: "입력값을 확인해 주세요",
  EMAIL_ALREADY_EXISTS: "이미 사용 중인 이메일입니다",
  ROOM_FULL: "방이 꽉 찼습니다 (최대 8명)",
  GAME_IN_PROGRESS: "게임이 진행 중이거나 결과 화면 상태입니다",
  NICKNAME_TAKEN: "이미 사용 중인 닉네임입니다",
  YOUTUBE_EMBED_BLOCKED: "해당 영상은 임베드가 제한되어 있습니다",
  QUIZ_MIN_QUESTIONS: "최소 5문제 이상 등록 후 공개 가능합니다",
  QUIZ_MAX_QUESTIONS: "문제는 최대 30개까지 등록 가능합니다",
  QUIZ_NOT_PUBLIC: "비공개 퀴즈는 게임에 사용할 수 없습니다",
  INVALID_CREDENTIALS: "이메일 또는 비밀번호가 올바르지 않습니다",
  ACCOUNT_DELETED: "탈퇴한 계정입니다",
  UNAUTHORIZED: "로그인이 필요합니다",
  TOKEN_EXPIRED: "세션이 만료되었습니다. 다시 로그인해 주세요",
  FORBIDDEN: "접근 권한이 없습니다",
  NOT_HOST: "호스트만 가능한 작업입니다",
  GAME_IN_PROGRESS_ACTION: "게임 진행 중에는 불가능한 작업입니다",
  NOT_FOUND: "요청한 리소스를 찾을 수 없습니다",
  ROOM_NOT_FOUND: "존재하지 않는 방입니다",
  RATE_LIMITED: "너무 많은 요청입니다. 잠시 후 다시 시도해 주세요",
  INTERNAL_SERVER_ERROR: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요",
  NOT_ENOUGH_PLAYERS: "참여자가 부족해 게임이 종료되었습니다",
  NO_QUESTIONS: "퀴즈에 등록된 문제가 없습니다",
  INVALID_STATE: "현재 상태에서 불가능한 요청입니다",
  EXCEEDS_MAX_QUESTIONS: "문제 수가 퀴즈 최대치를 초과했습니다",
  INVALID_SETTINGS: "유효하지 않은 설정값입니다",
};

export function getErrorMessage(
  code: string | undefined,
  fallback?: string
): string {
  if (code && MESSAGES[code]) return MESSAGES[code];
  return fallback ?? "알 수 없는 오류가 발생했습니다";
}
