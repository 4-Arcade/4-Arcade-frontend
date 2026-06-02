import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Music, X } from "lucide-react";
import InputField from "./InputField";
import Button from "./Button";
import { login } from "../services/authApi";
import { useAuth } from "../context/AuthContext";

interface LoginModalProps {
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginModal({
  onClose,
  onSwitchToRegister,
}: LoginModalProps) {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.accessToken);
        onClose();
        navigate("/");
      } else {
        setError(res.error?.message ?? "로그인에 실패했습니다.");
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      {/* Modal Box */}
      <div
        className="bg-white rounded-xl w-[800px] h-[500px] flex overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10">
          <X />
        </button>

        {/* Left */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-blue-800 to-blue-500 px-10 py-12 text-white">
          <Music className="w-12 h-12" />
          <span className="text-2xl font-extrabold">Music.io</span>
        </div>

        {/* Right */}
        <div className="flex-1 flex flex-col justify-center px-10 py-12">
          <form
            className="flex flex-col gap-6 w-[400px]"
            onSubmit={handleSubmit}
          >
            {/* Title */}
            <h1 className="text-xl font-bold mb-6">로그인</h1>

            {/* Inputs */}
            <div className="flex flex-col gap-4">
              <InputField
                label="이메일"
                type="email"
                placeholder="이메일 입력"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <InputField
                label="비밀번호"
                type="password"
                placeholder="비밀번호 입력"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button variant="large" className="w-full" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </Button>

            {/* 🔥 추가된 부분 */}
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-[13px] text-text-secondary">
                아직 계정이 없으신가요?
              </span>

              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-[13px] font-semibold text-blue-600 hover:underline"
              >
                회원가입
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
