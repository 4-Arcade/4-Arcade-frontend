import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface RoomExitGuardProps {
  /** 방에 있는 동안(entry 존재) true. 새로고침·탭 닫기·뒤로가기를 가로채 확인을 받는다. */
  active: boolean;
  /** 사용자가 나가기를 확정했을 때 호출 (방 연결 정리) */
  onConfirmLeave: () => void;
}

/**
 * 방(로비/게임/결과)에 있는 동안 실수로 페이지를 떠나는 것을 막는다.
 * - 새로고침 / 탭 닫기: beforeunload 네이티브 경고
 * - 브라우저 뒤로가기: history 트랩 엔트리 + popstate 확인 다이얼로그
 *   (앱이 클래식 BrowserRouter 라 React Router useBlocker 를 못 써서 트랩 방식 사용)
 */
export default function RoomExitGuard({
  active,
  onConfirmLeave,
}: RoomExitGuardProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // 새로고침 / 탭 닫기 경고
  useEffect(() => {
    if (!active) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [active]);

  // 뒤로가기 차단: 트랩 엔트리를 두고 popstate 시 확인
  useEffect(() => {
    if (!active) return;
    const onPopState = () => {
      const ok = window.confirm(
        "방에서 나가시겠어요? 게임이 진행 중이면 진행 상황이 사라질 수 있어요."
      );
      if (ok) {
        onConfirmLeave();
        navigate("/", { replace: true });
      } else {
        // 취소 → 트랩 재설치로 현재 화면 유지
        window.history.pushState(null, "", window.location.href);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [active, onConfirmLeave, navigate]);

  // 방 안에서 페이지가 바뀔 때마다(로비↔게임↔결과) 트랩 엔트리 재설치
  useEffect(() => {
    if (!active) return;
    if (!location.pathname.startsWith("/game/")) return;
    window.history.pushState(null, "", window.location.href);
  }, [active, location.pathname]);

  return null;
}
