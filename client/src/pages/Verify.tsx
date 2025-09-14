import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import API from "../api";

export default function VerifyPage() {
  const [search] = useSearchParams();
  const emailParam = search.get("email") || "";
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/auth/verify", { email, code });
      setMsg("Verified. You can login now.");
      setTimeout(() => nav("/login"), 1200);
    } catch (e: any) {
      setMsg(String(e?.response?.data?.error || "Ошибка"));
    }
  };

  const resend = async () => {
    try {
      await API.post("/auth/resend", { email });
      setMsg("Код отправлен повторно");
    } catch {
      setMsg("Ошибка отправки");
    }
  };

  return (
    <div style={{maxWidth:420,margin:"60px auto", background:"var(--panel)", padding:22, borderRadius:12, boxShadow:"var(--card-shadow)"}}>
      <h2 style={{marginTop:0}}>Подтвердить email</h2>
      <form onSubmit={submit}>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{width:"100%",padding:10,marginBottom:8}} />
        <input value={code} onChange={e => setCode(e.target.value)} placeholder="Код из письма" style={{width:"100%",padding:10,marginBottom:8}} />
        <div style={{display:"flex",gap:8}}>
          <button className="btn primary" type="submit">Подтвердить</button>
          <button className="btn" type="button" onClick={resend}>Отправить код снова</button>
        </div>
      </form>
      {msg && <div style={{marginTop:8}}>{msg}</div>}
      <div style={{marginTop:12,fontSize:13}}>Вернуться: <Link to="/login">Войти</Link></div>
    </div>
  );
}
