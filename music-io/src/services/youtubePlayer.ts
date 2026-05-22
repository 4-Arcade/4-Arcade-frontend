/* YouTube IFrame Player API 로더 + machugi 스타일의 즉시-src 플레이어 */

interface YTPlayer {
  destroy?: () => void;
  unMute?: () => void;
  playVideo?: () => void;
}

interface YTNamespace {
  Player: new (el: string | HTMLElement, opts: unknown) => YTPlayer;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;

export function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject();
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return apiPromise;
}

export interface YtPlayerHandle {
  destroy: () => void;
}

export interface CreatePlayerOptions {
  /** YT.Player가 치환할 빈 <div>의 id */
  containerId: string;
  videoId: string;
  startSec: number;
  endSec: number;
  width?: number;
  height?: number;
  onError?: (code: number) => void;
}

/**
 * machugi 패턴 — videoId/start/end를 초기 옵션으로 넣어
 * iframe src에 직접 박힌 채로 생성한다. autoplay 정책을 통과하는 핵심.
 */
export async function createYtPlayer(
  opts: CreatePlayerOptions
): Promise<YtPlayerHandle> {
  await loadYouTubeApi();
  const YT = window.YT;
  if (!YT) throw new Error("YouTube API not available");

  return new Promise<YtPlayerHandle>((resolve, reject) => {
    let player: YTPlayer;
    let resolved = false;
    const makeHandle = (): YtPlayerHandle => ({
      destroy: () => {
        try {
          player?.destroy?.();
        } catch {
          /* noop */
        }
      },
    });
    const resolveOnce = () => {
      if (resolved) return;
      resolved = true;
      resolve(makeHandle());
    };

    try {
      player = new YT.Player(opts.containerId, {
        host: "https://www.youtube-nocookie.com",
        width: String(opts.width ?? 200),
        height: String(opts.height ?? 113),
        videoId: opts.videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          enablejsapi: 1,
          start: opts.startSec,
          end: opts.endSec,
        },
        events: {
          onReady: () => {
            try {
              player.unMute?.();
              player.playVideo?.();
            } catch {
              /* noop */
            }
            resolveOnce();
          },
          onError: (e: { data: number }) => {
            opts.onError?.(e.data);
            // onReady 전에 onError가 먼저 와도 정리 핸들이 호출부에 도달하도록
            resolveOnce();
          },
        },
      });
    } catch (e) {
      reject(e);
    }
  });
}
