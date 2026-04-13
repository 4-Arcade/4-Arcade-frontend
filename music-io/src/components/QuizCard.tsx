import { Music, Play } from "lucide-react";

interface QuizCardProps {
  title: string;
  category: string;
  questionCount: number;
  author: string;
  playCount: number;
  onClick?: () => void;
}

export default function QuizCard({
  title,
  category,
  questionCount,
  author,
  playCount,
  onClick,
}: QuizCardProps) {
  return (
    <div
      className="w-80 bg-bg-card rounded-[16px] border border-border shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="w-full h-[180px] bg-blue-100 flex items-center justify-center relative">
        <Music className="w-12 h-12 text-blue-300" />
      </div>
      <div className="flex flex-col gap-2.5 p-4">
        <p className="text-[16px] font-semibold text-text-primary truncate">
          {title}
        </p>
        <div className="flex items-center gap-2">
          <span className="bg-blue-50 text-blue-600 text-[11px] font-semibold px-2 py-1 rounded-[6px]">
            {category}
          </span>
          <span className="text-[12px] text-text-tertiary">
            {questionCount}문제
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-text-tertiary">by {author}</span>
          <div className="flex items-center gap-1 text-text-tertiary">
            <Play className="w-3 h-3" />
            <span className="text-[12px]">{playCount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
