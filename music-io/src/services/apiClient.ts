const BASE_URL = "https://four-arcade-backend.onrender.com";

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  let accessToken = localStorage.getItem("accessToken");
  console.log("before token >> " + accessToken);

  const request = (token: string | null) =>
    fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

  let res = await request(accessToken);
  console.log("status >> " + res.status);
  // 403 체크
  if (res.status === 403) {
    console.log("refresh!");
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
    console.log("refreshRes >> " + JSON.stringify(refreshRes));
    const refreshData = await refreshRes.json();
    console.log("result >> " + JSON.stringify(refreshData));

    if (!refreshData.success || !refreshData.data) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
      throw new Error("인증 만료");
    }

    const newToken = refreshData.data.accessToken;
    console.log("after token >> " + newToken);

    localStorage.setItem("accessToken", newToken);

    res = await request(newToken);
  }

  return res;
}
