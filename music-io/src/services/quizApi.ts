const BASE_URL = "https://four-arcade-backend.onrender.com";

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  createdBy: string;
  playCount: number;
  questionCount: number;
}

export interface QuizPage {
  content: Quiz[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface QuizListResponse {
  success: boolean;
  data: QuizPage;
}

export interface Question {
  id: string;
  orderIndex: number;
  hint: string;
  startSec: number;
  endSec: number;
}

export interface QuizDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  playCount: number;
  questionCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
  isPublic: boolean;
}

export interface QuizDetailResponse {
  success: boolean;
  data: QuizDetail;
}

/* 퀴즈 조회 */
export async function getQuizList(
  page = 0,
  size = 12,
  category?: string
): Promise<QuizListResponse> {
  let url = `${BASE_URL}/quiz?page=${page}&size=${size}`;

  if (category && category !== "전체") {
    url += `&category=${encodeURIComponent(category)}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("API 요청 실패");
  }

  return res.json();
}

/* 퀴즈 상세 조회 */
export async function getQuizById(id: string): Promise<QuizDetailResponse> {
  const res = await fetch(`${BASE_URL}/quiz/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return res.json();
}

/* 퀴즈 업데이트 */
export async function updateQuiz(quizId: string, data: any) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/quiz/${quizId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const text = await res.text();

  // 응답이 없으면 안전하게 처리
  if (!text) {
    return { success: res.ok };
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    return { success: res.ok };
  }
}

/* 퀴즈 삭제 */
export async function deleteQuiz(quizId: string) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/quiz/${quizId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await res.text();
  return text ? JSON.parse(text) : { success: true };
}
