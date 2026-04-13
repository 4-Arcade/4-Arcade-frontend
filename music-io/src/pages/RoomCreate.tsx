import Navbar from '../components/Navbar'
import Button from '../components/Button'

export default function RoomCreate() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center py-12">
        <div className="bg-white rounded-[24px] shadow-lg p-10 w-[520px] flex flex-col gap-7">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-text-primary">방 만들기</h1>
            <p className="text-sm text-text-secondary">
              게임 설정을 완료하고 방을 만드세요.<br />
              퀴즈는 대기실에서 선택할 수 있습니다.
            </p>
          </div>

          <h2 className="text-base font-semibold text-text-primary">게임 설정</h2>

          <div className="flex flex-col gap-4">
            {/* Time Limit */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-text-secondary">제한 시간</label>
              <select className="bg-bg-input border border-border rounded-[12px] px-4 py-3 text-sm text-text-primary outline-none focus:border-border-focus">
                <option>30초</option>
                <option>15초</option>
                <option>60초</option>
              </select>
            </div>

            {/* Answer Reveal */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-text-secondary">정답 공개</label>
              <select className="bg-bg-input border border-border rounded-[12px] px-4 py-3 text-sm text-text-primary outline-none focus:border-border-focus">
                <option>매 문제마다</option>
                <option>게임 종료 후</option>
              </select>
            </div>
          </div>

          <Button variant="large" className="w-full">방 만들기</Button>
        </div>
      </div>
    </div>
  )
}
