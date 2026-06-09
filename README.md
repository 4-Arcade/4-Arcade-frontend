# 🎵 Music.io — 실시간 음악 퀴즈 배틀

친구들과 함께 즐기는 실시간 음악 퀴즈 게임 플랫폼의 프론트엔드입니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 19 |
| 언어 | TypeScript |
| 빌드 도구 | Vite |
| 라우팅 | React Router v7 |
| 스타일링 | Tailwind CSS v4 |
| 아이콘 | Lucide React |
| 백엔드 API | https://four-arcade-backend.onrender.com |

---

## 프로젝트 구조

```
music-io/
├── src/
│   ├── components/        # 공통 UI 컴포넌트
│   │   ├── Navbar.tsx
│   │   ├── Button.tsx
│   │   ├── InputField.tsx
│   │   └── QuizCard.tsx
│   ├── context/
│   │   └── AuthContext.tsx # 전역 로그인 상태 관리
│   ├── pages/             # 라우트별 페이지
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── QuizList.tsx
│   │   ├── QuizDetail.tsx
│   │   ├── QuizStudio.tsx
│   │   ├── RoomCreate.tsx
│   │   ├── RoomJoin.tsx
│   │   ├── GameLobby.tsx
│   │   ├── GamePlaying.tsx
│   │   ├── GameResult.tsx
│   │   └── MyPage.tsx
│   └── services/
│       └── authApi.ts     # 인증 API 함수 모음
```

---

## 주요 기능

- **회원가입 / 로그인** — 이메일·닉네임 기반 인증, JWT 토큰 관리
- **퀴즈 탐색** — 다른 유저가 만든 퀴즈 목록 조회 및 상세 보기
- **퀴즈 제작** — 나만의 음악 퀴즈 생성 및 편집
- **방 생성 / 참가** — 코드 기반으로 게임 방 생성 및 입장
- **실시간 게임** — 로비 대기 → 게임 플레이 → 결과 확인
- **마이페이지** — 내 프로필 및 제작한 퀴즈 관리

---

## 페이지 라우팅

| 경로 | 페이지 |
|------|--------|
| `/` | 홈 |
| `/login` | 로그인 |
| `/register` | 회원가입 |
| `/quiz` | 퀴즈 목록 |
| `/quiz/:id` | 퀴즈 상세 |
| `/quiz/studio` | 퀴즈 제작 |
| `/room/create` | 방 생성 |
| `/room/join` | 방 참가 |
| `/game/lobby/:code` | 게임 로비 |
| `/game/play/:code` | 게임 진행 |
| `/game/result/:code` | 게임 결과 |
| `/mypage` | 마이페이지 |

---

## 인증 흐름

```
로그인 / 회원가입
      ↓
accessToken → localStorage 저장
user 정보   → AuthContext + localStorage 저장
      ↓
Navbar에 닉네임 표시 (클릭 시 마이페이지 이동)
      ↓
토큰 만료 시 POST /auth/refresh 로 재발급
```

---

## 시작하기

```bash
# 의존성 설치
cd music-io
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

---

## API 문서

백엔드 Swagger UI: https://four-arcade-backend.onrender.com/swagger-ui/index.html
