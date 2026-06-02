import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LogIn } from "lucide-react";
import Navbar from "../components/Navbar";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { getRoomByCode } from "../services/roomApi";
import { getErrorMessage } from "../services/errorMessages";
import { useRoom } from "../context/RoomContext";
import { useToast } from "../context/ToastContext";
import {
  LAST_NICKNAME_KEY,
  MAX_NICKNAME_LENGTH,
  ROOM_CODE_LENGTH,
} from "../services/roomConstants";

const sanitizeCode = (raw: string) =>
  raw.toUpperCase().replace(/[^A-Z0-9]/g, "");

export default function RoomJoin() {
  const navigate = useNavigate();
  const toast = useToast();
  const { setEntry } = useRoom();
  const [searchParams] = useSearchParams();
  // 초대 링크(?code=ABC123) 코드 자동 채움 + 직전 닉네임 자동 채움 (PRD 5.2 / 9절)
  const [code, setCode] = useState<string[]>(() => {
    const param = searchParams.get("code");
    const chars = param
      ? sanitizeCode(param).slice(0, ROOM_CODE_LENGTH).split("")
      : [];
    return Array.from({ length: ROOM_CODE_LENGTH }, (_, i) => chars[i] ?? "");
  });
  const [nickname, setNickname] = useState(
    () => localStorage.getItem(LAST_NICKNAME_KEY) ?? ""
  );
  const [submitting, setSubmitting] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleCodeChange = (index: number, value: string) => {
    const char = sanitizeCode(value).slice(-1);
    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);
    if (char && index < ROOM_CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = sanitizeCode(e.clipboardData.getData("text")).slice(
      0,
      ROOM_CODE_LENGTH
    );
    if (!text) return;
    const chars = text.split("");
    setCode(Array.from({ length: ROOM_CODE_LENGTH }, (_, i) => chars[i] ?? ""));
    const focusIndex = Math.min(text.length, ROOM_CODE_LENGTH - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  const roomCode = code.join("");
  const canSubmit =
    roomCode.length === ROOM_CODE_LENGTH &&
    nickname.trim().length >= 1 &&
    nickname.trim().length <= MAX_NICKNAME_LENGTH &&
    !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    const res = await getRoomByCode(roomCode);
    setSubmitting(false);

    if (!res.success) {
      toast.show(getErrorMessage(res.code, res.message), "error");
      return;
    }

    localStorage.setItem(LAST_NICKNAME_KEY, nickname.trim());
    setEntry({
      roomId: res.data.roomId,
      roomCode: res.data.roomCode,
      nickname: nickname.trim(),
      quizTitle: res.data.quizTitle,
    });
    navigate(`/game/lobby/${res.data.roomCode}`);
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white rounded-[24px] shadow-lg p-10 w-[480px] flex flex-col items-center gap-7">
          <LogIn className="w-12 h-12 text-blue-500" />
          <h1 className="text-2xl font-bold text-text-primary">방 참여하기</h1>
          <p className="text-sm text-text-secondary">
            방장에게 받은 6자리 코드를 입력하세요.
          </p>

          <div className="flex gap-2 justify-center w-full">
            {code.map((char, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                type="text"
                inputMode="text"
                aria-label={`방 코드 ${i + 1}번째 자리`}
                maxLength={1}
                value={char}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className="w-[52px] h-[60px] bg-bg-input border border-border rounded-[12px] text-center text-2xl font-bold text-text-primary outline-none focus:border-blue-500 focus:border-2 transition-colors"
              />
            ))}
          </div>

          <InputField
            label="닉네임"
            placeholder="1~16자 닉네임을 입력해주세요"
            value={nickname}
            maxLength={MAX_NICKNAME_LENGTH}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full"
          />
          <Button
            variant="large"
            className="w-full"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {submitting ? "확인 중..." : "입장하기"}
          </Button>
        </div>
      </div>
    </div>
  );
}
