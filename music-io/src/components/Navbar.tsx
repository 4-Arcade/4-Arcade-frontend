import { Link, useLocation, useNavigate } from "react-router-dom";
import { Music, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAuthModal } from "../context/AuthModalContext";

interface NavLinkProps {
  to: string;
  label: string;
  active: boolean;
}

function NavLink({ to, label, active }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`text-[15px] font-medium ${
        active ? "text-text-primary" : "text-text-secondary"
      } hover:text-text-primary transition-colors`}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { openLogin } = useAuthModal();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="w-full h-16 bg-bg-secondary flex items-center justify-between px-10 shadow-sm">
      <Link to="/" className="flex items-center gap-2">
        <Music className="w-7 h-7 text-blue-600" />
        <span className="text-[22px] font-bold text-blue-600">Music.io</span>
      </Link>
      <div className="flex items-center gap-8">
        <NavLink to="/" label="홈" active={location.pathname === "/"} />
        <NavLink
          to="/quiz"
          label="퀴즈 탐색"
          active={location.pathname === "/quiz"}
        />
        {/* <NavLink to="/quiz/studio" label="퀴즈 제작" active={location.pathname === "/quiz/studio"} /> */}
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link
              to="/mypage"
              className="flex items-center gap-2 text-[14px] font-medium text-text-primary hover:text-blue-600 transition-colors"
            >
              <User className="w-4 h-4" />
              {user.nickname}
            </Link>
            <button
              onClick={handleLogout}
              className="text-[14px] font-medium text-text-secondary hover:text-red-500 transition-colors"
            >
              로그아웃
            </button>
          </>
        ) : (
          <button
            onClick={openLogin}
            className="text-[14px] font-medium text-blue-600 hover:underline"
          >
            로그인
          </button>
        )}
      </div>
    </nav>
  );
}
