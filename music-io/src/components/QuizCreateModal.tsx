import { useState } from "react";
import "rc-slider/assets/index.css";
import { X, Plus, ChevronDown } from "lucide-react";

// API
import { createQuiz } from "@/services/quizApi";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const categories = ["K-POP", "POP", "OST", "게임음악", "기타"];

const QuizCreateModal = ({ open, onClose, onSuccess }: Props) => {
  if (!open) return null;

  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [openCategory, setOpenCategory] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [errors, setErrors] = useState({
    title: "",
    category: "",
  });

  /* 제출 전 검증 */
  const validate = () => {
    const newErrors = {
      title: "",
      category: "",
    };

    if (!title.trim()) {
      newErrors.title = "제목을 입력해주세요.";
    }

    if (!category) {
      newErrors.category = "카테고리를 선택해주세요.";
    }

    setErrors(newErrors);

    return !newErrors.title && !newErrors.category;
  };

  /* 퀴즈 생성 로직 */
  const handleSubmit = async () => {
    if (loading) return;

    if (!validate()) return;

    setLoading(true);

    const payload = {
      title,
      description,
      category,
      isPublic,
    };

    try {
      const res = await createQuiz(payload);

      if (res.success) {
        onSuccess?.();

        setTimeout(() => {
          onClose();
        }, 300);
      } else {
        alert(res.message);
      }
    } catch (e) {
      console.error("에러:", e);

      const error = e as Error;
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-xl relative">
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
              <p className="text-white text-sm">퀴즈 생성 중...</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold">퀴즈 생성</h2>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 relative">
          <div className="flex gap-6">
            <div className="flex-1 flex flex-col gap-4">
              <div>
                <label className="block text-base font-semibold mb-2">
                  <span className="text-red-500 mr-1">*</span>
                  제목
                </label>

                <input
                  type="text"
                  placeholder="제목을 입력하세요. (최대 50자)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 border border-violet-400 rounded-md px-3 text-sm outline-none focus:ring-2 focus:ring-violet-200"
                />
              </div>

              <div>
                <label className="block text-base font-semibold mb-2">
                  설명
                </label>

                <textarea
                  placeholder="설명을 입력하세요. (최대 100자)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-27 border border-violet-400 rounded-md px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-violet-200"
                />
              </div>

              <div className="relative">
                <label className="block text-base font-semibold mb-2">
                  <span className="text-red-500 mr-1">*</span>
                  카테고리
                </label>

                <button
                  type="button"
                  onClick={() => setOpenCategory((prev) => !prev)}
                  className="w-full h-11 border border-violet-400 rounded-md px-3 flex items-center justify-between text-sm"
                >
                  <span className={category ? "text-black" : "text-gray-400"}>
                    {category || "카테고리를 선택하세요."}
                  </span>

                  <ChevronDown size={18} className="text-black" />
                </button>

                {openCategory && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                    {categories.map((item, index) => (
                      <button
                        key={item}
                        onClick={() => {
                          setCategory(item);
                          setOpenCategory(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-violet-50 ${
                          index !== categories.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-semibold mb-2">
                  <span className="text-red-500 mr-1">*</span>
                  공개 여부
                </label>

                <button className="w-14 h-8 bg-indigo-700 rounded-full relative transition">
                  <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-6">
              <div>
                <label className="block text-base font-semibold mb-2">
                  썸네일
                </label>

                <button className="w-full h-50 border-4 border-dashed border-indigo-600 rounded-2xl flex flex-col items-center justify-center text-indigo-700 hover:bg-indigo-50 transition">
                  <div className="w-12 h-12 rounded-full border-2 border-indigo-700 flex items-center justify-center">
                    <Plus size={24} />
                  </div>

                  <p className="mt-3 text-sm text-center leading-relaxed">
                    썸네일을 추가해보세요.
                  </p>
                </button>
              </div>

              <div>
                <label className="block text-base font-semibold mb-2">
                  <span className="text-red-500 mr-1">*</span>
                  답변 형식
                </label>

                <div className="flex flex-wrap gap-2">
                  <button className="px-4 h-10 border-2 border-violet-600 text-violet-600 text-sm rounded-md">
                    주관식
                  </button>

                  <button className="px-4 h-10 border text-sm rounded-md">
                    객관식
                  </button>

                  <button className="px-4 h-10 border text-sm rounded-md">
                    O/X
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-center mt-10">
            <button
              onClick={handleSubmit}
              className="px-10 h-11 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-md transition"
            >
              생성
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCreateModal;
