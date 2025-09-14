import React, { useState } from "react";
import API from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/auth/forgot", { email });
      setMsg("Код отправлен на почту (если аккаунт существует).");
      setTimeout(() => nav(`/reset?email=${encodeURIComponent(email)}`), 1200);
    } catch {
      setMsg("Ошибка");
    }
  };

  return (
    <div style={{maxWidth:420,margin:"80px auto", background:"var(--panel)", padding:22, borderRadius:12, boxShadow:"var(--card-shadow)"}}>
      <h2>Восстановление пароля</h2>
      <form onSubmit={submit}>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{width:"100%",padding:10,marginBottom:8}} />
        <button className="btn primary" type="submit">Отправить код</button>
      </form>
      {msg && <div style={{marginTop:8}}>{msg}</div>}
      <div style={{marginTop:12,fontSize:13}}>Вернуться: <Link to="/login">Войти</Link></div>
    </div>
  );
}
