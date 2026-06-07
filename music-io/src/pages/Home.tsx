import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { useAuthModal } from '../context/AuthModalContext'
import { useRoom } from '../context/RoomContext'
import { useToast } from '../context/ToastContext'
import { getRoomByCode, createRoom, type RoomSettings } from '../services/roomApi'
import { getErrorMessage } from '../services/errorMessages'
import { hangulToLatin } from '../utils/hangulToLatin'
import {
  LAST_NICKNAME_KEY,
  MAX_NICKNAME_LENGTH,
  ROOM_CODE_LENGTH,
  DEFAULT_QUIZ_ID,
} from '../services/roomConstants'

// 한글 IME 로 입력해도 같은 자리 영문 대문자로 변환 + 코드 문자셋(A-Z0-9)만 남긴다.
const sanitizeCode = (raw: string) =>
  hangulToLatin(raw).toUpperCase().replace(/[^A-Z0-9]/g, '')

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { openLogin } = useAuthModal()
  const { setEntry } = useRoom()
  const toast = useToast()
  const [searchParams] = useSearchParams()

  const [nickname, setNickname] = useState(
    () => localStorage.getItem(LAST_NICKNAME_KEY) ?? ''
  )
  // 퀴즈 상세 "이 퀴즈로 플레이"에서 넘어온 경우: 해당 퀴즈로 바로 방 생성(맵 프리셋)
  const presetQuizId = searchParams.get('quizId') ?? undefined
  // 초대 링크(?code=...) → 참여 탭, ?tab=create 또는 quizId → 제작 탭
  const [activeTab, setActiveTab] = useState<'join' | 'create'>(() =>
    presetQuizId || searchParams.get('tab') === 'create' ? 'create' : 'join'
  )
  const [nicknameError, setNicknameError] = useState(false)
  const nicknameErrorTimer = useRef<number | undefined>(undefined)
  const [submitting, setSubmitting] = useState(false)

  // 방 참여: 6자리 코드
  const [code, setCode] = useState<string[]>(() => {
    const param = searchParams.get('code')
    const chars = param ? sanitizeCode(param).slice(0, ROOM_CODE_LENGTH).split('') : []
    return Array.from({ length: ROOM_CODE_LENGTH }, (_, i) => chars[i] ?? '')
  })
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  // 방 제작: 게임 설정 (맵=퀴즈는 로비에서 방장이 선택)
  const [questionCount, setQuestionCount] = useState(10)
  const [timeLimit, setTimeLimit] = useState(20)
  const [showAnswer, setShowAnswer] = useState(true)
  const [wrongAnswerLimit, setWrongAnswerLimit] = useState<number | null>(null)

  useEffect(() => {
    return () => {
      if (nicknameErrorTimer.current !== undefined) {
        window.clearTimeout(nicknameErrorTimer.current)
      }
    }
  }, [])

  function flashNicknameError() {
    setNicknameError(true)
    if (nicknameErrorTimer.current !== undefined) {
      window.clearTimeout(nicknameErrorTimer.current)
    }
    nicknameErrorTimer.current = window.setTimeout(
      () => setNicknameError(false),
      1200
    )
  }

  const handleCodeChange = (index: number, value: string) => {
    const char = sanitizeCode(value).slice(-1)
    const newCode = [...code]
    newCode[index] = char
    setCode(newCode)
    if (char && index < ROOM_CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleCodeKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = sanitizeCode(e.clipboardData.getData('text')).slice(
      0,
      ROOM_CODE_LENGTH
    )
    if (!text) return
    const chars = text.split('')
    setCode(Array.from({ length: ROOM_CODE_LENGTH }, (_, i) => chars[i] ?? ''))
    const focusIndex = Math.min(text.length, ROOM_CODE_LENGTH - 1)
    inputsRef.current[focusIndex]?.focus()
  }

  const roomCode = code.join('')

  async function handleJoin() {
    if (!nickname.trim()) return flashNicknameError()
    if (roomCode.length !== ROOM_CODE_LENGTH) {
      toast.show('방 코드 6자리를 입력해주세요', 'error')
      return
    }
    setSubmitting(true)
    const res = await getRoomByCode(roomCode)
    setSubmitting(false)
    if (!res.success) {
      toast.show(getErrorMessage(res.code, res.message), 'error')
      return
    }
    const nick = nickname.trim().normalize('NFC')
    localStorage.setItem(LAST_NICKNAME_KEY, nick)
    setEntry({
      roomId: res.data.roomId,
      roomCode: res.data.roomCode,
      nickname: nick,
      quizTitle: res.data.quizTitle,
    })
    navigate(`/game/lobby/${res.data.roomCode}`)
  }

  async function handleCreate() {
    if (!nickname.trim()) return flashNicknameError()
    const settings: RoomSettings = {
      questionCount,
      timeLimit,
      showAnswer,
      wrongAnswerLimit,
    }
    const nick = nickname.trim().normalize('NFC')
    setSubmitting(true)
    // 백엔드가 quizId 를 notnull 로 요구하므로 항상 전송한다.
    // "이 퀴즈로 플레이"로 들어온 경우 그 퀴즈를, 아니면 기본 퀴즈를 맵으로 방을 만든다(로비에서 변경 가능).
    const res = await createRoom({
      quizId: presetQuizId ?? DEFAULT_QUIZ_ID,
      nickname: nick,
      settings,
    })
    setSubmitting(false)
    if (!res.success) {
      toast.show(getErrorMessage(res.code, res.message), 'error')
      return
    }
    localStorage.setItem(LAST_NICKNAME_KEY, nick)
    setEntry({
      roomId: res.data.roomId,
      roomCode: res.data.roomCode,
      nickname: nick,
      quizTitle: res.data.quizTitle,
    })
    navigate(`/game/lobby/${res.data.roomCode}`)
  }

  const handleStart = () => (activeTab === 'join' ? handleJoin() : handleCreate())

  const handleQuizCreate = () => {
    if (user) navigate('/quiz/studio')
    else openLogin()
  }

  const selectClass =
    'w-full bg-sky-50 border-2 border-sky-200 rounded-2xl px-4 py-3 text-sky-800 font-bold outline-none focus:border-sky-400 focus:bg-white transition-all text-sm'

  const questionCountOptions = useMemo(() => {
    const opts: number[] = []
    for (let i = 5; i <= 20; i++) opts.push(i)
    return opts
  }, [])

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-white via-sky-50 to-sky-100 flex-1 flex items-center justify-center px-4 py-10">
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-sky-200 opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-blue-200 opacity-30 blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto items-start">
            {/* ── 왼쪽 카드: 참여 / 제작 ── */}
            <div className="bg-white border border-sky-100 rounded-3xl shadow-xl shadow-sky-100/60 p-7 flex flex-col">
              {/* 탭 */}
              <div className="flex bg-sky-50 border border-sky-100 rounded-2xl p-1 mb-7">
                <button
                  onClick={() => setActiveTab('join')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === 'join'
                      ? 'bg-white text-sky-600 shadow-sm shadow-sky-100'
                      : 'text-sky-400 hover:text-sky-500'
                  }`}
                >
                  방 참여
                </button>
                <button
                  onClick={() => setActiveTab('create')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === 'create'
                      ? 'bg-white text-sky-600 shadow-sm shadow-sky-100'
                      : 'text-sky-400 hover:text-sky-500'
                  }`}
                >
                  방 제작
                </button>
              </div>

              {/* 닉네임 */}
              <p className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-2 text-center">
                닉네임 선택
              </p>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && activeTab === 'create' && handleStart()
                }
                placeholder="닉네임을 입력하세요"
                maxLength={MAX_NICKNAME_LENGTH}
                className={`w-full bg-sky-50 border-2 rounded-2xl px-4 py-3 text-sky-800 font-bold placeholder-sky-300 outline-none transition-all text-base ${
                  nicknameError
                    ? 'border-red-300 bg-red-50'
                    : 'border-sky-200 focus:border-sky-400 focus:bg-white'
                }`}
              />
              {nicknameError && (
                <p className="text-red-400 text-xs font-bold mt-1.5 text-center">
                  닉네임을 입력해주세요!
                </p>
              )}

              {/* 탭별 본문 */}
              {activeTab === 'join' ? (
                <div className="mt-6">
                  <p className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-2 text-center">
                    방 코드 (6자리)
                  </p>
                  <div className="flex gap-2 justify-center w-full">
                    {code.map((char, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          inputsRef.current[i] = el
                        }}
                        type="text"
                        inputMode="text"
                        aria-label={`방 코드 ${i + 1}번째 자리`}
                        maxLength={1}
                        value={char}
                        onChange={(e) => handleCodeChange(i, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(i, e)}
                        onPaste={handlePaste}
                        className="w-[44px] h-[54px] bg-sky-50 border-2 border-sky-200 rounded-2xl text-center text-2xl font-black text-sky-800 outline-none focus:border-sky-400 focus:bg-white transition-all"
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-sky-400">
                      문제 수
                    </label>
                    <select
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className={selectClass}
                    >
                      {questionCountOptions.map((n) => (
                        <option key={n} value={n}>
                          {n}문제
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-sky-400">
                      제한 시간
                    </label>
                    <select
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className={selectClass}
                    >
                      {[10, 15, 20, 25, 30].map((t) => (
                        <option key={t} value={t}>
                          {t}초
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-sky-400">
                      정답 공개
                    </label>
                    <select
                      value={showAnswer ? 'true' : 'false'}
                      onChange={(e) => setShowAnswer(e.target.value === 'true')}
                      className={selectClass}
                    >
                      <option value="true">매 문제마다</option>
                      <option value="false">게임 종료 후</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-sky-400">
                      오답 허용
                    </label>
                    <select
                      value={wrongAnswerLimit === null ? 'null' : '1'}
                      onChange={(e) =>
                        setWrongAnswerLimit(e.target.value === 'null' ? null : 1)
                      }
                      className={selectClass}
                    >
                      <option value="null">무제한</option>
                      <option value="1">1회</option>
                    </select>
                  </div>
                  <p className="col-span-2 text-[11px] text-sky-400 text-center mt-1">
                    {presetQuizId
                      ? '선택한 퀴즈로 방을 만듭니다.'
                      : '퀴즈(맵)는 방을 만든 뒤 로비에서 선택해요.'}
                  </p>
                </div>
              )}

              {/* 액션 버튼 — 하단 고정 */}
              <div className="mt-auto pt-6">
                <button
                  onClick={handleStart}
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 text-white font-black text-lg shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {submitting
                    ? activeTab === 'join'
                      ? '확인 중...'
                      : '방 만드는 중...'
                    : activeTab === 'join'
                    ? '참여'
                    : '방 제작'}
                </button>
              </div>
            </div>

            {/* ── 오른쪽 카드: 퀴즈 제작 유도 ── */}
            <div className="bg-white border border-sky-100 rounded-3xl shadow-xl shadow-sky-100/60 p-7 flex flex-col">
              <h2 className="text-center font-black text-sky-500 text-lg tracking-wide mb-5">
                ✍️ 나만의 퀴즈 만들기
              </h2>

              <div
                className="text-7xl text-center mb-5"
                style={{ animation: 'mascotBounce 2.4s ease-in-out infinite' }}
              >
                🎼
              </div>

              <div className="flex flex-col px-1 space-y-4 mb-6">
                {[
                  {
                    n: 1,
                    title: '문제를 직접 만들어요',
                    desc: '노래 제목, 아티스트, 앨범 등 원하는 문제를 추가하세요.',
                  },
                  {
                    n: 2,
                    title: '친구들과 공유하세요',
                    desc: '만든 퀴즈를 방에서 바로 사용할 수 있어요.',
                  },
                  {
                    n: 3,
                    title: '함께 즐겨요 🎉',
                    desc: '내가 만든 퀴즈로 친구들과 대결해보세요!',
                  },
                ].map(({ n, title, desc }) => (
                  <div key={n} className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-400 text-white text-xs font-black flex items-center justify-center mt-0.5">
                      {n}
                    </span>
                    <span className="text-sm leading-relaxed">
                      <strong className="text-sky-700 font-bold">{title}</strong>
                      <br />
                      <span className="text-slate-400">{desc}</span>
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleQuizCreate}
                className="mt-auto w-full py-4 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 text-white font-black text-lg shadow-lg hover:-translate-y-0.5 transition-all"
              >
                ✍️ 퀴즈 제작
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
