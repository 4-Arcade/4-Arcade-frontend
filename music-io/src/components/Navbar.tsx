import { Link, useLocation } from "react-router-dom";
import { Music } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

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
        <Link
          to="/login"
          className="text-[14px] font-medium text-blue-600 hover:underline"
        >
          로그인
        </Link>
      </div>
    </nav>
  );
}
