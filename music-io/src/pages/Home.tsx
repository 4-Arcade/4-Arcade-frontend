import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
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

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="flex flex-col items-center py-20 px-10 gap-8 bg-gradient-to-b from-blue-50 to-bg-primary">
        <h1 className="text-5xl font-extrabold text-text-primary text-center leading-[1.3]">
          친구들과 함께 즐기는
          <br />
          음악 퀴즈 배틀
        </h1>
        <p className="text-lg text-text-secondary text-center leading-relaxed max-w-[500px]">
          YouTube 음악을 듣고 제목을 맞추세요!
          <br />
          설치 없이 브라우저에서 바로 시작할 수 있습니다.
        </p>
        <div className="flex items-center gap-4">
          <Link to="/room/create">
            <Button variant="large">방 만들기</Button>
          </Link>
          <Link to="/room/join">
            <Button variant="secondary" className="!py-3.5 !px-7">
              방 참여하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Quiz Section */}
      <section className="flex flex-col gap-8 px-20 py-12">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-[28px] font-bold text-text-primary">인기 퀴즈</h2>
          <Link
            to="/quiz"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            더보기 →
          </Link>
        </div>

        <div className="flex gap-2.5">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-[13px] font-medium cursor-pointer transition-colors ${
                i === 0
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-white text-text-secondary border border-border hover:bg-bg-input"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {sampleQuizzes.map((quiz) => (
            <QuizCard key={quiz.title} {...quiz} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-between px-20 py-8 bg-bg-dark mt-auto">
        <span className="text-[13px] text-text-tertiary">
          © 2025 Music.io. All rights reserved.
        </span>
        <div className="flex gap-6">
          <a
            href="#"
            className="text-[13px] text-text-tertiary hover:text-white"
          >
            이용약관
          </a>
          <a
            href="#"
            className="text-[13px] text-text-tertiary hover:text-white"
          >
            개인정보처리방침
          </a>
        </div>
      </footer>
    </div>
  );
}
