import React, { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";
import { useI18n } from "../i18n";
import SettingsModal from "../components/SettingsModal";

export default function Login() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      nav("/notes");
    } catch (e: any) {
      const msg = e?.response?.data?.error || "Ошибка";
      if (msg === "Email not verified") {
        nav(`/verify?email=${encodeURIComponent(email)}`);
        return;
      }
      setErr(String(msg));
    }
  };

  return (
    <div style={{maxWidth:420,margin:"80px auto", background:"var(--panel)", padding:22, borderRadius:12, boxShadow:"var(--card-shadow)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h2 style={{marginTop:0}}>{t("login")}</h2>
        <button className="btn" onClick={() => setSettingsOpen(true)} title="Server settings">⚙</button>
      </div>
      <form onSubmit={submit}>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder={t("email")} style={{width:"100%",padding:10,marginBottom:8}} />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder={t("password")} type="password" style={{width:"100%",padding:10,marginBottom:8}} />
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
          <button className="btn primary" type="submit">{t("login")}</button>
          <Link to="/forgot" style={{fontSize:13}}>{/* маленькая ссылка */}Забыли пароль?</Link>
        </div>
      </form>
      {err && <div style={{color:"#a00",marginTop:8}}>{err}</div>}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <div style={{marginTop:12,fontSize:13}}>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></div>
    </div>
  );
}
