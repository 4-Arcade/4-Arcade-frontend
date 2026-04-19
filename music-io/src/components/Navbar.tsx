import { Link, useLocation, useNavigate } from "react-router-dom";
import { Music, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navLink = (path: string, label: string) => {
    const isActive = location.pathname === path;
    return (
      <Link
        to={path}
        className={`text-[15px] font-medium ${
          isActive ? "text-text-primary" : "text-text-secondary"
        } hover:text-text-primary transition-colors`}
      >
        {label}
      </Link>
    );
  };

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="w-full h-16 bg-bg-secondary flex items-center justify-between px-10 shadow-sm">
      <Link to="/" className="flex items-center gap-2">
        <Music className="w-7 h-7 text-blue-600" />
        <span className="text-[22px] font-bold text-blue-600">Music.io</span>
      </Link>
      <div className="flex items-center gap-8">
        {navLink("/", "홈")}
        {navLink("/quiz", "퀴즈 탐색")}
        {navLink("/quiz/studio", "퀴즈 제작")}
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
          <Link
            to="/login"
            className="text-[14px] font-medium text-blue-600 hover:underline"
          >
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
}
