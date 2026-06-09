import { API_BASE_URL as BASE_URL } from "./config";

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  let accessToken = localStorage.getItem("accessToken");

  const request = (token: string | null) =>
    fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

  let res = await request(accessToken);
  // 403 체크
  if (res.status === 403) {
    let refreshToken = localStorage.getItem("refreshToken");

    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        refreshToken,
      }),
    });
    const refreshData = await refreshRes.json();

    if (!refreshData.success || !refreshData.data) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
      throw new Error("인증 만료");
    }

    const newToken = refreshData.data.accessToken;

    localStorage.setItem("accessToken", newToken);

    res = await request(newToken);
  }

  return res;
}
