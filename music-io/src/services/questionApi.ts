const BASE_URL = "https://four-arcade-backend.onrender.com";

/* 문제 생성 (인증 필요) */
export async function createQuestion(quizId: string, payload: any) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${BASE_URL}/quiz/${quizId}/questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  try {
    const data = await res.json();

    // 문제 생성 성공했을 경우
    if (data.success) {
      return { success: true };
    }
    // 문제 생성 실패했을 경우
    else {
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

/* 문제 수정 (인증 필요) */
export async function updateQuestion(
  quizId: string,
  questionId: string,
  payload: any
) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(
    `${BASE_URL}/quiz/${quizId}/questions/${questionId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  try {
    const data = await res.json();

    // 문제 수정 성공했을 경우
    if (data.success) {
      return { success: true };
    }
    // 문제 수정 실패했을 경우
    else {
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

/* 문제 삭제 (인증 필요) */
export async function deleteQuestion(quizId: string, questionId: string) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(
    `${BASE_URL}/quiz/${quizId}/questions/${questionId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  try {
    const data = await res.json();

    // 문제 삭제 성공했을 경우
    if (data.success) {
      return { success: true };
    }
    // 문제 삭제 실패했을 경우
    else {
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

// TODO : 기능 테스트 필요
/* 문제 상세 조회 (인증 필요) */
// export async function getQuestionById(quizId: string, questionId: string) {
//   const token = localStorage.getItem("accessToken");

//   const res = await fetch(
//     `${BASE_URL}/quiz/${quizId}/questions/${questionId}`,
//     {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

//   try {
//     const data = await res.json();

//     // 문제 삭제 성공했을 경우
//     if (data.success) {
//       return {
//         success: true,
//         data: data,
//       };
//     }
//     // 문제 삭제 실패했을 경우
//     else {
//       return {
//         success: false,
//         message: data.error.message,
//       };
//     }
//   } catch (e) {
//     const error = e as Error;

//     return {
//       success: false,
//       message: error.message,
//     };
//   }
// }
