const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://four-arcade-backend.onrender.com";

export interface RoomSettings {
  questionCount: number;
  timeLimit: number;
  showAnswer: boolean;
  wrongAnswerLimit: number | null;
}

export interface CreateRoomPayload {
  quizId: string;
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

/* 방 생성 */
export async function createRoom(
  payload: CreateRoomPayload
): Promise<ApiResult<CreateRoomData>> {
  const res = await fetch(`${BASE_URL}/room`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  try {
    const data = await res.json();
    if (data.success) {
      return { success: true, data: data.data };
    }
    return {
      success: false,
      code: data.error?.code,
      message: data.error?.message ?? "방 생성에 실패했습니다",
    };
  } catch (e) {
    const error = e as Error;
    return { success: false, message: error.message };
  }
}

/* 방 정보 조회 (신규 입장 사전 검증) */
export async function getRoomByCode(
  roomCode: string
): Promise<ApiResult<RoomInfoData>> {
  const res = await fetch(`${BASE_URL}/room/${roomCode}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  try {
    const data = await res.json();
    if (data.success) {
      return { success: true, data: data.data };
    }
    return {
      success: false,
      code: data.error?.code,
      message: data.error?.message ?? "방 정보를 가져오지 못했습니다",
    };
  } catch (e) {
    const error = e as Error;
    return { success: false, message: error.message };
  }
}
