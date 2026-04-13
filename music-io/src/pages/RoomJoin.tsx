import { useState } from 'react'
import Navbar from '../components/Navbar'
import InputField from '../components/InputField'
import Button from '../components/Button'
import { LogIn } from 'lucide-react'

export default function RoomJoin() {
  const [code, setCode] = useState(['', '', '', '', '', ''])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newCode = [...code]
    newCode[index] = value.toUpperCase()
    setCode(newCode)
    if (value && index < 5) {
      const next = document.getElementById(`code-${index + 1}`)
      next?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-white rounded-[24px] shadow-lg p-10 w-[480px] flex flex-col items-center gap-7">
          <LogIn className="w-12 h-12 text-blue-500" />
          <h1 className="text-2xl font-bold text-text-primary">방 참여하기</h1>
          <p className="text-sm text-text-secondary">방장에게 받은 6자리 코드를 입력하세요.</p>

          <div className="flex gap-2 justify-center w-full">
            {code.map((char, i) => (
              <input
                key={i}
                id={`code-${i}`}
                type="text"
                maxLength={1}
                value={char}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                className="w-[52px] h-[60px] bg-bg-input border border-border rounded-[12px] text-center text-2xl font-bold text-text-primary outline-none focus:border-blue-500 focus:border-2 transition-colors"
              />
            ))}
          </div>

          <InputField label="닉네임" placeholder="닉네임을 입력해주세요" className="w-full" />
          <Button variant="large" className="w-full">입장하기</Button>
        </div>
      </div>
    </div>
  )
}
