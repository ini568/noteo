import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// страницы
import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import ForgotPassword from "./pages/ForgotPassword";
import NotesList from "./pages/NotesList";
import NoteEditor from "./pages/NoteEditor";
import Profile from "./pages/Profile";
import SettingsHome from "./pages/SettingsHome";

import "./styles.css";

function App() {
  // если токен есть — пускаем на защищённые экраны
  const token = localStorage.getItem("token");
  try { console.log("[Router] token:", !!token); } catch {}

  return (
    <BrowserRouter>
      <Routes>
        {/* auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/forgot" element={<ForgotPassword />} />

        {/* app (защищённые) */}
        <Route
          path="/notes"
          element={token ? <NotesList /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/notes/:id"
          element={token ? <NoteEditor /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/profile"
          element={token ? <Profile /> : <Navigate to="/login" replace />}
        />

        {/* настройки (пока без защиты, если нужно — можно обернуть как выше) */}
        <Route path="/settings/*" element={<SettingsHome />} />

        {/* дефолтный маршрут */}
        <Route
          path="*"
          element={<Navigate to={token ? "/notes" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
