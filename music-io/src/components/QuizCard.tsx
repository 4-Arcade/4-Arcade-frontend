import { Music, Play } from "lucide-react";

interface QuizCardProps {
  title: string;
  category: string;
  questionCount: number;
  createdBy?: string;
  playCount: number;
  onClick?: () => void;
}

export default function QuizCard({
  title,
  category,
  questionCount,
  createdBy,
  playCount,
  onClick,
}: QuizCardProps) {
  return (
    <div
      className="w-full h-full bg-bg-card rounded-[16px] border border-border shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow flex flex-col"
      onClick={onClick}
    >
      {/* 썸네일 — 고정 높이로 두어야 카드(h-66) 안에서 아래 텍스트가 잘리지 않는다.
          (aspect-[16/9]는 카드 폭이 넓어질수록 썸네일이 커져 본문이 밀려 잘렸음) */}
      <div className="w-full h-32 bg-blue-100 flex items-center justify-center relative shrink-0">
        <Music className="w-12 h-12 text-blue-300" />
      </div>

      {/* 내용 */}
      <div className="flex flex-col flex-1 gap-2.5 p-4 min-h-0">
        <p className="text-[16px] font-semibold text-text-primary line-clamp-1 min-h-[20px]">
          {title}
        </p>

        {createdBy ? (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-blue-50 text-blue-600 text-[11px] font-semibold px-2 py-1 rounded-[6px]">
                {category}
              </span>

              <span className="text-[12px] text-text-tertiary">
                {questionCount}문제
              </span>
            </div>

            <div className="flex items-center justify-between mt-auto gap-2">
              <span className="text-[12px] text-text-tertiary truncate">
                by {createdBy}
              </span>

              <div className="flex items-center gap-1 text-text-tertiary shrink-0">
                <Play className="w-3 h-3" />
                <span className="text-[12px]">
                  {playCount.toLocaleString()}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 mt-auto">
            <span className="bg-blue-50 text-blue-600 text-[11px] font-semibold px-2 py-1 rounded-[6px]">
              {category}
            </span>

            <span className="text-[12px] text-text-tertiary">
              {questionCount}문제
            </span>

            <div className="flex items-center gap-1 text-text-tertiary shrink-0 ml-auto">
              <Play className="w-3 h-3" />
              <span className="text-[12px]">{playCount.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
