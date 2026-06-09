import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";

interface AuthModalContextType {
  openLogin: () => void;
  openRegister: () => void;
  close: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | null>(null);

/**
 * 로그인/회원가입 모달을 앱 전역에서 한 번만 렌더하고 어디서든 열 수 있게 한다.
 * 기존엔 각 페이지가 onLoginClick prop 으로 모달 상태를 들고 있어 Home 외 페이지에선
 * 로그인 버튼이 동작하지 않았다(prop 미전달). 이를 Context 로 통일한다.
 */
export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<"login" | "register" | null>(null);

  const openLogin = useCallback(() => setModal("login"), []);
  const openRegister = useCallback(() => setModal("register"), []);
  const close = useCallback(() => setModal(null), []);

  const value = useMemo<AuthModalContextType>(
    () => ({ openLogin, openRegister, close }),
    [openLogin, openRegister, close]
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {modal === "login" && (
        <LoginModal onClose={close} onSwitchToRegister={openRegister} />
      )}
      {modal === "register" && (
        <RegisterModal onClose={close} onSwitchToLogin={openLogin} />
      )}
    </AuthModalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
