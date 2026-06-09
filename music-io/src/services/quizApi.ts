import { apiFetch } from "./apiClient";

import { API_BASE_URL as BASE_URL } from "./config";

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  createdBy: string;
  playCount: number;
  questionCount: number;
}

export interface MyQuiz {
  id: string;
  title: string;
  description: string;
  category: string;
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
  category?: string,
  keyword?: string
): Promise<QuizListResponse | any> {
  let url = `/quiz?page=${page}&size=${size}`;

  if (category && category !== "전체") {
    url += `&category=${encodeURIComponent(category)}`;
  }

  if (keyword) {
    url += `&keyword=${encodeURIComponent(keyword)}`;
  }

  const res = await apiFetch(url, {
    method: "GET",
  });

  try {
    const data = await res.json();

    if (data.success) {
      return {
        success: true,
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.error?.message,
      };
    }
  } catch (e) {
    const error = e as Error;
    return {
      success: false,
      message: error.message,
    };
  }
}

/* 퀴즈 상세 조회 */
export async function getQuizById(
  id: string
): Promise<QuizDetailResponse | any> {
  const res = await fetch(`${BASE_URL}/quiz/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  try {
    const data = await res.json();

    if (data.success) {
      return {
        success: true,
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.error.message,
      };
    }
  } catch (e) {
    const error = e as Error;
    return {
      success: false,
      message: error.message,
    };
  }
}

/* 퀴즈 업데이트 (인증 필요) */
export async function updateQuiz(quizId: string, payload: any) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/quiz/${quizId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  try {
    const data = await res.json();

    if (data.success) {
      return { success: true };
    } else {
      return {
        success: false,
        message: data.error.message,
      };
    }
  } catch (e) {
    const error = e as Error;
    return {
      success: false,
      message: error.message,
    };
  }
}

/* 퀴즈 삭제 (인증 필요) */
export async function deleteQuiz(quizId: string) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/quiz/${quizId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  try {
    const data = await res.json();

    if (data.success) {
      return { success: true };
    } else {
      return {
        success: false,
        message: data.error.message,
      };
    }
  } catch (e) {
    const error = e as Error;
    return {
      success: false,
      message: error.message,
    };
  }
}

/* 퀴즈 생성 (인증 필요) */
export async function createQuiz(payload: any) {
  let url = "/quiz";

  const res = await apiFetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  try {
    const data = await res.json();

    if (data.success) {
      return { success: true };
    } else {
      return {
        success: false,
        message: data.error.message,
      };
    }
  } catch (e) {
    const error = e as Error;
    return {
      success: false,
      message: error.message,
    };
  }
}

/* 내 퀴즈 조회 (인증 필요) */
export async function getMyQuizList(page = 0, size = 7, keyword?: String) {
  let url = `/mypage/quiz?page=${page}&size=${size}`;

  if (keyword?.trim()) {
    url += `&keyword=${encodeURIComponent(keyword.trim())}`;
  }

  const res = await apiFetch(url, {
    method: "GET",
  });

  // const res = await fetch(`${BASE_URL}/mypage/quiz`, {
  //   method: "GET",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${token}`,
  //   },
  // });

  try {
    const data = await res.json();

    if (data.success) {
      return {
        success: true,
        data: data.data,
      };
    } else {
      return {
        success: false,
        message: data.error.message,
      };
    }
  } catch (e) {
    const error = e as Error;
    return {
      success: false,
      message: error.message,
    };
  }
}
