/**
 * 백엔드 베이스 URL 한 곳에서 관리. 모든 API/WS 클라이언트가 이 값을 사용한다.
 * Vercel 등 배포 환경에서는 VITE_API_BASE_URL / VITE_WS_BASE_URL 로 덮어쓸 수 있다.
 * (미설정 시 운영 백엔드로 폴백)
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://four-arcade-backend.onrender.com";

export const WS_BASE_URL =
  import.meta.env.VITE_WS_BASE_URL ?? "wss://four-arcade-backend.onrender.com";

/**
 * YouTube Data API v3 키 (퀴즈 제작 시 영상 길이 조회용).
 * ⚠️ VITE_ 변수는 빌드 번들에 인라인되어 브라우저에 노출되므로, Google Cloud Console에서
 * HTTP 리퍼러 + YouTube Data API v3 로 반드시 제한해야 한다.
 */
export const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY ?? "";
