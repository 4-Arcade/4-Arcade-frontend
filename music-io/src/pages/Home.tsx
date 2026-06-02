import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";
import QuizCard from "../components/QuizCard";

const categories = ["전체", "K-POP", "POP", "OST", "게임음악", "기타"];

const sampleQuizzes = [
  {
    title: "2024 K-POP 히트곡 모음",
    category: "K-POP",
    questionCount: 20,
    author: "뮤직러버",
    playCount: 1234,
  },
  {
    title: "인기 POP 명곡 퀴즈",
    category: "POP",
    questionCount: 15,
    author: "팝마스터",
    playCount: 856,
  },
  {
    title: "애니메이션 OST 퀴즈",
    category: "OST",
    questionCount: 25,
    author: "오타쿠킹",
    playCount: 2105,
  },
  {
    title: "게임 BGM 맞추기",
    category: "게임음악",
    questionCount: 30,
    author: "게이머",
    playCount: 567,
  },
];

const avatars = ["🎵", "🎸", "🎹", "🎺", "🥁", "🎻", "🎤", "🎧"];

const howToSteps = [
  {
    n: 1,
    title: "통화가 더 좋아요",
    desc: "친구들을 음성 통화에 초대하세요 (예: Discord, Zoom)",
  },
  {
    n: 2,
    title: "방을 만들거나 참가하세요",
    desc: "링크를 공유하거나 방 코드를 입력해 참여하세요.",
  },
  {
    n: 3,
    title: "노래를 듣고 맞춰보세요! 🏆",
    desc: "빠를수록 더 많은 점수! 최고 점수를 차지하세요.",
  },
];

export default function Home() {
  const navigate = useNavigate();

  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [nickname, setNickname] = useState("");
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<"join" | "create">("join");
  const [stepIdx, setStepIdx] = useState(0);
  const [nicknameError, setNicknameError] = useState(false);

  const isLoggedIn = !!localStorage.getItem("accessToken");

  const filtered =
    selectedCategory === "전체"
      ? sampleQuizzes
      : sampleQuizzes.filter((q) => q.category === selectedCategory);

  const handleStart = () => {
    if (!nickname.trim()) {
      setNicknameError(true);
      setTimeout(() => setNicknameError(false), 1200);
      return;
    }
    if (activeTab === "join") {
      navigate("/room/join");
    } else {
      navigate("/room/create");
    }
  };

  const handleQuizCreate = () => {
    if (isLoggedIn) {
      navigate("/quiz/studio");
    } else {
      setLoginOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col">
      <Navbar onLoginClick={() => setLoginOpen(true)} />

      <section className="relative overflow-hidden bg-gradient-to-br from-white via-sky-50 to-sky-100 flex-1 flex items-center justify-center px-4">
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-sky-200 opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-blue-200 opacity-30 blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {/* ── 왼쪽 카드 ── */}
            <div className="bg-white border border-sky-100 rounded-3xl shadow-xl shadow-sky-100/60 p-7 flex flex-col">
              {/* 탭: 방 참여 / 방 제작 */}
              <div className="flex bg-sky-50 border border-sky-100 rounded-2xl p-1 mb-7">
                <button
                  onClick={() => setActiveTab("join")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === "join"
                      ? "bg-white text-sky-600 shadow-sm shadow-sky-100"
                      : "text-sky-400 hover:text-sky-500"
                  }`}
                >
                  방 참여
                </button>
                <button
                  onClick={() => setActiveTab("create")}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === "create"
                      ? "bg-white text-sky-600 shadow-sm shadow-sky-100"
                      : "text-sky-400 hover:text-sky-500"
                  }`}
                >
                  방 제작
                </button>
              </div>

              {/* 아바타 */}
              <div className="flex justify-center mb-6">
                <button
                  onClick={() =>
                    setAvatarIdx((prev) => (prev + 1) % avatars.length)
                  }
                  className="relative w-28 h-28 rounded-full bg-gradient-to-br from-sky-200 to-blue-300 flex items-center justify-center text-6xl shadow-lg shadow-sky-200 hover:scale-105 active:scale-95 transition-transform"
                >
                  {avatars[avatarIdx]}
                </button>
              </div>

              {/* 닉네임 */}
              <p className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-2 text-center">
                캐릭터와 닉네임 선택
              </p>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                placeholder="닉네임을 입력하세요"
                maxLength={20}
                className={`w-full bg-sky-50 border-2 rounded-2xl px-4 py-3 text-sky-800 font-bold placeholder-sky-300 outline-none transition-all text-base ${
                  nicknameError
                    ? "border-red-300 bg-red-50"
                    : "border-sky-200 focus:border-sky-400 focus:bg-white"
                }`}
              />
              {nicknameError && (
                <p className="text-red-400 text-xs font-bold mt-1.5 text-center">
                  닉네임을 입력해주세요!
                </p>
              )}

              {/* 탭에 따라 버튼 변경 — 하단 고정 */}
              <div className="mt-auto pt-5">
                {activeTab === "join" ? (
                  <button
                    onClick={handleStart}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 text-white font-black text-lg shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    참여
                  </button>
                ) : (
                  <button
                    onClick={handleStart}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 text-white font-black text-lg shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    방 제작
                  </button>
                )}
              </div>
            </div>

            {/* ── 오른쪽 카드: 퀴즈 제작 유도 ── */}
            <div className="bg-white border border-sky-100 rounded-3xl shadow-xl shadow-sky-100/60 p-7 flex flex-col">
              <h2 className="text-center font-black text-sky-500 text-lg tracking-wide mb-5">
                ✍️ 나만의 퀴즈 만들기
              </h2>

              <div
                className="text-7xl text-center mb-5"
                style={{ animation: "mascotBounce 2.4s ease-in-out infinite" }}
              >
                🎼
              </div>

              <div className="flex flex-col px-1 space-y-4 mb-6">
                {[
                  {
                    n: 1,
                    title: "문제를 직접 만들어요",
                    desc: "노래 제목, 아티스트, 앨범 등 원하는 문제를 추가하세요.",
                  },
                  {
                    n: 2,
                    title: "친구들과 공유하세요",
                    desc: "만든 퀴즈를 방에서 바로 사용할 수 있어요.",
                  },
                  {
                    n: 3,
                    title: "함께 즐겨요 🎉",
                    desc: "내가 만든 퀴즈로 친구들과 대결해보세요!",
                  },
                ].map(({ n, title, desc }) => (
                  <div key={n} className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-400 text-white text-xs font-black flex items-center justify-center mt-0.5">
                      {n}
                    </span>
                    <span className="text-sm leading-relaxed">
                      <strong className="text-sky-700 font-bold">
                        {title}
                      </strong>
                      <br />
                      <span className="text-slate-400">{desc}</span>
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleQuizCreate}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 text-white font-black text-lg shadow-lg hover:-translate-y-0.5 transition-all"
              >
                ✍️ 퀴즈 제작
              </button>
            </div>
          </div>
        </div>
      </section>

      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSwitchToRegister={() => {
            setLoginOpen(false);
            setRegisterOpen(true);
          }}
        />
      )}
      {registerOpen && (
        <RegisterModal
          onClose={() => setRegisterOpen(false)}
          onSwitchToLogin={() => {
            setLoginOpen(true);
            setRegisterOpen(false);
          }}
        />
      )}
    </div>
  );
}
