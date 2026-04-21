import { Plus, Music, Trash2 } from "lucide-react";
import { useState } from "react";
import Navbar from "../components/Navbar";
import InputField from "../components/InputField";
import Button from "../components/Button";
import QuizCreateModal from "../components/QuizCreateModal";

const questions = [
  { id: 1, title: "문제 1", url: "https://youtube.com/watch?v=..." },
  { id: 2, title: "문제 2", url: "https://youtube.com/watch?v=..." },
  { id: 3, title: "문제 3", url: "https://youtube.com/watch?v=..." },
];

export default function QuizStudio() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <div className="flex gap-8 px-20 py-8 flex-1">
        {/* Left - Quiz Info */}
        <div className="w-[360px] flex flex-col gap-5">
          <h2 className="text-xl font-bold text-text-primary">퀴즈 정보</h2>
          <InputField label="퀴즈 제목" placeholder="퀴즈 제목을 입력하세요" />
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-text-secondary">
              카테고리
            </label>
            <select className="bg-bg-input border border-border rounded-[12px] px-4 py-3 text-sm text-text-primary outline-none focus:border-border-focus">
              <option>K-POP</option>
              <option>POP</option>
              <option>OST</option>
              <option>게임음악</option>
              <option>기타</option>
            </select>
          </div>
          <div className="flex items-center justify-between bg-bg-input rounded-[12px] px-4 py-3">
            <span className="text-sm text-text-secondary">공개 여부</span>
            <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer">
              <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full" />
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-2">
            <Button variant="large" className="w-full">
              저장하기
            </Button>
            <Button variant="ghost" className="w-full text-error">
              삭제하기
            </Button>
          </div>
        </div>

        {/* Right - Questions */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary">
              문제 목록 ({questions.length})
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-[12px] cursor-pointer hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              문제 추가
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {questions.map((q) => (
              <div
                key={q.id}
                className="flex items-center gap-3 bg-white rounded-xl border border-border px-4 py-3"
              >
                <span className="text-sm font-bold text-blue-600 w-6">
                  {q.id}
                </span>
                <Music className="w-4 h-4 text-text-tertiary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {q.title}
                  </p>
                  <p className="text-xs text-text-tertiary truncate">{q.url}</p>
                </div>
                <button className="text-text-tertiary hover:text-error cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <QuizCreateModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
