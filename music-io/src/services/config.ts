/**
 * 백엔드 베이스 URL 한 곳에서 관리. 모든 API/WS 클라이언트가 이 값을 사용한다.
 * Vercel 등 배포 환경에서는 VITE_API_BASE_URL / VITE_WS_BASE_URL 로 덮어쓸 수 있다.
 * (미설정 시 운영 백엔드로 폴백)
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://four-arcade-backend.onrender.com";

export const WS_BASE_URL =
  import.meta.env.VITE_WS_BASE_URL ?? "wss://four-arcade-backend.onrender.com";
