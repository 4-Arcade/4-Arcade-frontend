import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RoomCreate from "./pages/RoomCreate";
import RoomJoin from "./pages/RoomJoin";
import QuizList from "./pages/QuizList";
import QuizDetail from "./pages/QuizDetail";
import QuizStudio from "./pages/QuizStudio";
import MyPage from "./pages/MyPage";
import GameLobby from "./pages/GameLobby";
import GamePlaying from "./pages/GamePlaying";
import GameResult from "./pages/GameResult";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/room/create" element={<RoomCreate />} />
      <Route path="/room/join" element={<RoomJoin />} />
      <Route path="/quiz" element={<QuizList />} />
      <Route path="/quiz/:id" element={<QuizDetail />} />
      <Route path="/quiz/studio" element={<QuizStudio />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/game/lobby/:code" element={<GameLobby />} />
      <Route path="/game/play/:code" element={<GamePlaying />} />
      <Route path="/game/result/:code" element={<GameResult />} />
    </Routes>
  );
}
