import { API_BASE_URL as BASE_URL } from "./config";

export interface RoomSettings {
  questionCount: number;
  timeLimit: number;
  showAnswer: boolean;
  wrongAnswerLimit: number | null;
  /** 맵(=퀴즈). 로비에서 방장이 선택/변경하며 host:settings_update 로 함께 전파된다. */
  quizId?: string | null;
  /** 표시용 퀴즈 제목 (settings 와 함께 브로드캐스트되어 전원이 동일 제목을 본다). */
  quizTitle?: string | null;
}

export interface CreateRoomPayload {
  /** 맵(퀴즈)은 로비에서 정하므로 생성 시엔 선택 사항. */
  quizId?: string;
  nickname: string;
  settings: RoomSettings;
}

export interface CreateRoomData {
  roomId: string;
  roomCode: string;
  status: string;
  quizTitle: string;
  settings: RoomSettings;
}

export interface RoomInfoData {
  roomId: string;
  roomCode: string;
  status: string;
  currentPlayerCount: number;
  maxPlayerCount: number;
  quizTitle: string;
}

type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; code?: string; message: string };

async function parseApiResult<T>(
  res: Response,
  fallbackMessage: string
): Promise<ApiResult<T>> {
  const data = await res.json();
  if (data.success) {
    return { success: true, data: data.data as T };
  }
  return {
    success: false,
    code: data.error?.code,
    message: data.error?.message ?? fallbackMessage,
  };
}

/* 방 생성 */
export async function createRoom(
  payload: CreateRoomPayload
): Promise<ApiResult<CreateRoomData>> {
  try {
    const res = await fetch(`${BASE_URL}/room`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await parseApiResult<CreateRoomData>(res, "방 생성에 실패했습니다");
  } catch (e) {
    const error = e as Error;
    return { success: false, message: error.message };
  }
}

/* 방 정보 조회 (신규 입장 사전 검증) */
export async function getRoomByCode(
  roomCode: string
): Promise<ApiResult<RoomInfoData>> {
  try {
    const res = await fetch(`${BASE_URL}/room/${roomCode}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return await parseApiResult<RoomInfoData>(
      res,
      "방 정보를 가져오지 못했습니다"
    );
  } catch (e) {
    const error = e as Error;
    return { success: false, message: error.message };
  }
}
