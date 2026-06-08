import { useEffect, useState } from "react";
import Slider from "rc-slider";
import { Clock, ChevronRight } from "lucide-react";

// API
import {
  createQuestion,
  updateQuestion,
  getQuestionById,
} from "@/services/questionApi";

type Props = {
  open: boolean;
  quizId: string;
  questionId?: string | null;
  onClose: () => void;
};

const formatTime = (sec: number) => {
  const h = Math.floor(sec / 3600)
    .toString()
    .padStart(2, "0");

  const m = Math.floor((sec % 3600) / 60)
    .toString()
    .padStart(2, "0");

  const s = (sec % 60).toString().padStart(2, "0");

  return `${h}:${m}:${s}`;
};

const QuestionCreateModal = ({ open, quizId, questionId, onClose }: Props) => {
  const [url, setUrl] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);
  const [range, setRange] = useState<[number, number]>([243, 273]);
  const [duration, setDuration] = useState(300);
  const [currentTime] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const isEditMode = !!questionId;
  const durationButtons = [1, 5, 10, 30];

  /* 영상 길이 측정 로직 */
  const handleDurationClick = (sec: number) => {
    setRange(([start]) => {
      const newEnd = Math.min(start + sec, duration); // 영상 길이 초과 방지
      return [start, newEnd];
    });
  };

  /* 정답 입력 */
  const handleAddAnswer = () => {
    if (!answer.trim()) return;

    setAnswers((prev) => [...prev, answer.trim()]);
    setAnswer(""); // 입력 초기화
  };

  /* 유튜브 URL 참고해서 영상 불러오는 로직 */
  const getYoutubeId = (url: string): string | null => {
    if (!url) return null;

    const regExp =
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?/]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };
  const videoId = getYoutubeId(url) || "";

  const parseISO8601Duration = (iso: string): number => {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    const hours = parseInt(match?.[1] || "0");
    const minutes = parseInt(match?.[2] || "0");
    const seconds = parseInt(match?.[3] || "0");

    return hours * 3600 + minutes * 60 + seconds;
  };

  /* 문제 생성 */
  const handleSubmit = async () => {
    try {
      const payload = {
        youtubeUrl: url,
        startSec: range[0],
        endSec: range[1],
        answers: answers,
        hint: "",
      };

      if (isEditMode && questionId) {
        await updateQuestion(quizId, questionId, payload);
        alert("문제가 수정되었습니다.");
      } else {
        const res = await createQuestion(quizId, payload);
        if (res.success) {
          alert("문제가 생성되었습니다.");
          onClose();
        } else {
          alert(res.message);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  /* Youtube URL Validation */
  useEffect(() => {
    const videoId = getYoutubeId(url);
    console.log("call1");
    // 1. 빈 값
    if (!url.trim()) {
      setIsInvalid(false);
      setDuration(0);
      setRange([0, 0]);
      return;
    }

    // 2. ID 없음
    if (!videoId) {
      setIsInvalid(true);
      setDuration(0);
      return;
    }

    const myApiKey = "AIzaSyBzO1hMtKD3LPbDmXsgfvSBvbcmkdgqjbk";

    const fetchVideoData = async () => {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${myApiKey}`
        );

        const data = await res.json();

        const item = data.items?.[0];

        // 3. 영상 없음
        if (!item) {
          setIsInvalid(true);
          setDuration(0);
          return;
        }

        setIsInvalid(false);

        // 4. duration 세팅
        const iso = item.contentDetails?.duration;
        setDuration(parseISO8601Duration(iso));
      } catch (e) {
        setIsInvalid(true);
        setDuration(0);
      }
    };

    fetchVideoData();
  }, [url]);

  /* Youtube URL 변경 시 영상 길이 초기화 로직 */
  useEffect(() => {
    if (!questionId) {
      setRange([0, duration]);
    }
  }, [duration]);

  /* 문제 생성인지, 수정인지 구분하는 로직 */
  useEffect(() => {
    if (!open) return;

    const fetchQuestion = async () => {
      try {
        // 문제 생성일 경우
        if (!questionId) {
          setUrl("");
          setRange([0, 0]);
          setAnswers([]);
          return;
        }

        // 문제 수정일 경우
        const res = await getQuestionById(quizId, questionId);
        // API 호출 성공
        if (res.success) {
          const data = res.data.data;

          setUrl(data.youtubeUrl);
          setRange([data.startSec, data.endSec]);
          setAnswers(data.answers || []);
        }
        // API 호출 실패
        else {
          alert(res.message);
        }
      } catch (e) {
        console.error("문제 상세 조회 실패:", e);

        const error = e as Error;
        alert(error.message);
      }
    };

    fetchQuestion();
  }, [questionId, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="w-[720px] bg-white rounded-[15px] px-6 pt-4 pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold mb-4">
          {isEditMode ? "문제 수정" : "문제 생성"}
        </h2>
        <hr className="border-t border-gray-200 mb-7 -mx-6" />

        <div className="flex gap-8">
          {/* LEFT */}
          <div className="w-[320px] flex flex-col">
            <div className="relative w-full aspect-video overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>

            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Youtube URL"
              className={`mt-3 border px-3 py-2 text-sm rounded-[3px] ${
                isInvalid ? "border-red-500" : "border-blue-500"
              }`}
            />

            {isInvalid && (
              <p className="font-bold text-xs text-red-500 mt-1 leading-none">
                유효하지 않은 URL입니다.
              </p>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold mb-4">영상 구간 설정</p>

              <Slider
                key={url || "empty"}
                range
                min={0}
                max={duration}
                value={range}
                onChange={(value) => setRange(value as [number, number])}
              />

              <div className="mt-5 border border-blue-500 px-4 py-1 flex items-center justify-between text-sm font-medium text-gray-700">
                {/* START */}
                <span>{formatTime(range[0])}</span>

                {/* ARROW */}
                <span className="text-gray-400 mx-2">→</span>

                {/* END */}
                <span>{formatTime(range[1])}</span>

                {/* ICON */}
                <Clock className="w-4 h-4 text-blue-500 ml-2" />
              </div>
            </div>

            <div className="flex gap-2 mt-8">
              <button
                onClick={() => setRange(([_, end]) => [currentTime, end])}
                className="flex-1 px-3 py-1.5 text-sm border bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-[5px] font-semibold cursor-pointer"
              >
                현위치에서 시작
              </button>

              <button
                onClick={() => setRange(([start]) => [start, currentTime])}
                className="flex-1 px-3 py-1.5 text-sm border bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-[5px] font-semibold cursor-pointer"
              >
                현위치에서 종료
              </button>
            </div>

            <div className="flex gap-2">
              {durationButtons.map((sec) => (
                <button
                  key={sec}
                  onClick={() => handleDurationClick(sec)}
                  className="flex-1 px-4 py-1.5 border bg-indigo-800 hover:bg-indigo-900 text-white text-sm rounded-[5px] font-semibold cursor-pointer"
                >
                  {sec}초
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-1 mt-4">
          <label className="text-sm font-semibold text-text-primary">
            정답 (주관식)
          </label>

          <div className="flex gap-2">
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // form submit 방지
                  handleAddAnswer();
                }
              }}
              placeholder="정답을 입력하세요. (최대 100자, 최대 10개)"
              className="flex-1 border px-3 py-2 text-sm border-blue-500 rounded-[3px]"
            />

            <button
              onClick={handleAddAnswer}
              className="px-4 bg-blue-600 text-white text-sm hover:bg-blue-700 semi-border rounded-[3px] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {answers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {answers.map((item, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-0.5 py-0.5 text-sm bg-blue-100 border border-blue-700 rounded-[3px]"
                >
                  <span className="text-sm">{item}</span>

                  <button
                    onClick={() =>
                      setAnswers((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="text-red-500 text-xs leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-[11px] text-gray-400 w-full mt-10">
          ※ 음란물, 비하, 혐오 등의 퀴즈는 임의로 삭제될 수 있으며 관련 법에
          의거 처벌받을 수 있습니다.
        </p>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleSubmit}
            className="px-8 py-1 bg-blue-600 text-white rounded-[6px] cursor-pointer"
          >
            확인
          </button>
          <button
            onClick={onClose}
            className="px-8 py-1 border rounded-[6px] text-blue-600 cursor-pointer"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCreateModal;
