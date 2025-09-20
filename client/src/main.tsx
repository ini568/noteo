import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotesList from "./pages/NotesList";
import NoteEditor from "./pages/NoteEditor";
import Verify from "./pages/Verify";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import "./styles.css";
import API from "./api";
import { I18nProvider } from "./i18n";
import { ThemeProvider } from "./theme";
import Profile from "./pages/Profile";
import SettingsHome from "./pages/SettingsHome";
import EditProfile from "./pages/EditProfile";
import SecuritySettings from "./pages/SecuritySettings";
import SessionsPage from "./pages/SessionsPage";


const App = () => {
  const token = localStorage.getItem("token");

  useEffect(()=>{ /* polling reminders if needed */ }, [token]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/notes" element={token ? <NotesList /> : <Navigate to="/login" replace />} />
        <Route path="/notes/:id" element={token ? <NoteEditor /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={token ? "/notes" : "/login"} replace />} />
        <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" replace />} />
        <Route path="/profile/edit" element={token ? <EditProfile /> : <Navigate to="/login" replace />} />
        <Route path="/settings/*" element={<SettingsHome />} />
        <Route path="/settings/security" element={token ? <SecuritySettings /> : <Navigate to="/login" replace />} />
        <Route path="/settings/sessions" element={token ? <SessionsPage /> : <Navigate to="/login" replace />} />
     </Routes>
    </HashRouter>
  );
};

createRoot(document.getElementById("root")!).render(
  <I18nProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </I18nProvider>
);
