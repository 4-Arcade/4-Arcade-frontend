import { useState, useRef } from 'react'
import { User, Settings, LogOut, Music, Play, X, Camera } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL as BASE_URL } from '../services/config'

const myQuizzes = [
  { title: '2024 K-POP 히트곡 모음', category: 'K-POP', plays: 1234 },
  { title: '인기 POP 명곡 퀴즈', category: 'POP', plays: 856 },
]

const history = [
  { quiz: '애니메이션 OST 퀴즈', date: '2025.01.15', rank: 1, score: 4200 },
  { quiz: '게임 BGM 맞추기', date: '2025.01.14', rank: 3, score: 3100 },
  { quiz: '90년대 가요 퀴즈', date: '2025.01.13', rank: 2, score: 3800 },
]

export default function MyPage() {
  const { user, setUser } = useAuth()

  const [nickname, setNickname] = useState<string>(user?.nickname ?? '')
  const [profileImg, setProfileImg] = useState<string | null>(user?.profileImg ?? null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [tempNickname, setTempNickname] = useState<string>('')
  const [tempImgBase64, setTempImgBase64] = useState<string | null>(null)
  const [tempImgPreview, setTempImgPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const openModal = () => {
    setTempNickname(nickname)
    setTempImgBase64(null)
    setTempImgPreview(profileImg)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      const canvas = document.createElement('canvas')

      const MAX_SIZE = 200
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width)
          width = MAX_SIZE
        }
      } else {
        if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height)
          height = MAX_SIZE
        }
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      const compressed = canvas.toDataURL('image/jpeg', 0.5)

      setTempImgBase64(compressed)
      setTempImgPreview(compressed)
      URL.revokeObjectURL(objectUrl)
    }

    img.src = objectUrl
  }

  const handleSave = async () => {
    setIsLoading(true)
    const token = localStorage.getItem('accessToken')

    try {
      let updatedUser = { ...user! }

      if (tempNickname !== nickname) {
        const res = await fetch(`${BASE_URL}/mypage/nickname`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({ nickname: tempNickname }),
        })
        const data = await res.json()
        if (data.success) {
          setNickname(data.data.nickname)
          updatedUser = { ...updatedUser, nickname: data.data.nickname }
        }
      }

      if (tempImgBase64) {
        // base64를 Blob으로 변환 후 FormData로 전송
        const blob = await fetch(tempImgBase64).then(r => r.blob())
        const formData = new FormData()
        formData.append('image', blob, 'profile.jpg')

        const res = await fetch(`${BASE_URL}/api/users/me/profile-image`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Content-Type 없애야 함 - FormData가 자동 설정
          },
          credentials: 'include',
          body: formData,
        })

        const data = await res.json()
        console.log('서버 응답 전체:', JSON.stringify(data))

        if (data.success) {
          setProfileImg(tempImgBase64)
          updatedUser = { ...updatedUser, profileImg: tempImgBase64 }
        }
      }

      setUser(updatedUser)
      closeModal()
    } catch (err) {
      console.error(err)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <div className="flex gap-10 px-20 py-10 flex-1">

        {/* Left - Profile */}
        <div className="w-[280px] bg-white rounded-2xl border border-border p-6 flex flex-col items-center gap-6 h-fit">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
            {profileImg
              ? <img src={profileImg} alt="profile" className="w-full h-full object-cover" />
              : <User className="w-10 h-10 text-white" />
            }
          </div>

          <h2 className="text-xl font-bold text-text-primary">{nickname}</h2>

          <div className="flex w-full justify-around">
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-text-primary">12</span>
              <span className="text-xs text-text-tertiary">퀴즈</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-text-primary">48</span>
              <span className="text-xs text-text-tertiary">플레이</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-text-primary">5.4k</span>
              <span className="text-xs text-text-tertiary">총 플레이</span>
            </div>
          </div>

          <div className="flex flex-col w-full gap-1">
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-text-primary hover:bg-bg-input cursor-pointer"
            >
              <Settings className="w-4 h-4 text-text-secondary" />
              프로필 설정
            </button>
            <button className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-error hover:bg-red-50 cursor-pointer">
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-text-primary">내 퀴즈</h2>
            <button className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">전체보기</button>
          </div>
          <div className="flex flex-col gap-3">
            {myQuizzes.map((q) => (
              <div key={q.title} className="flex items-center gap-3 bg-white rounded-xl border border-border px-4 py-3">
                <Music className="w-5 h-5 text-blue-400" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-primary">{q.title}</p>
                  <span className="text-xs text-text-tertiary">{q.category}</span>
                </div>
                <div className="flex items-center gap-1 text-text-tertiary">
                  <Play className="w-3 h-3" />
                  <span className="text-xs">{q.plays.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-text-primary mt-4">플레이 기록</h2>
          <div className="flex flex-col gap-3">
            {history.map((h) => (
              <div key={h.quiz + h.date} className="flex items-center gap-3 bg-white rounded-xl border border-border px-4 py-3">
                <span className={`text-sm font-extrabold w-6 ${h.rank === 1 ? 'text-blue-600' : 'text-text-tertiary'}`}>
                  {h.rank}위
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{h.quiz}</p>
                  <span className="text-xs text-text-tertiary">{h.date}</span>
                </div>
                <span className="text-sm font-bold text-text-secondary">{h.score.toLocaleString()}점</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 프로필 편집 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[360px] flex flex-col gap-5 shadow-xl">

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">프로필 설정</h3>
              <button onClick={closeModal}>
                <X className="w-5 h-5 text-text-tertiary hover:text-text-primary" />
              </button>
            </div>

            {/* 이미지 변경 */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden relative cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {tempImgPreview
                  ? <img src={tempImgPreview} alt="preview" className="w-full h-full object-cover" />
                  : <User className="w-10 h-10 text-white" />
                }
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-xs text-text-tertiary">클릭하여 이미지 변경</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* 닉네임 변경 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">닉네임</label>
              <input
                type="text"
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                className="border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-blue-500"
                placeholder="닉네임을 입력하세요"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-2 mt-1">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-lg border border-border text-sm text-text-secondary hover:bg-bg-input"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-lg bg-blue-600 text-sm text-white font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? '저장 중...' : '저장'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}