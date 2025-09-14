import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../api";

export default function ResetPassword() {
  const [search] = useSearchParams();
  const emailParam = search.get("email") || "";
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/auth/reset", { email, code, password });
      setMsg("Пароль изменён");
      setTimeout(() => nav("/login"), 1200);
    } catch (e: any) {
      setMsg(String(e?.response?.data?.error || "Ошибка"));
    }
  };

  return (
    <div style={{maxWidth:420,margin:"80px auto", background:"var(--panel)", padding:22, borderRadius:12, boxShadow:"var(--card-shadow)"}}>
      <h2>Сброс пароля</h2>
      <form onSubmit={submit}>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{width:"100%",padding:10,marginBottom:8}} />
        <input value={code} onChange={e => setCode(e.target.value)} placeholder="Код из письма" style={{width:"100%",padding:10,marginBottom:8}} />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Новый пароль" type="password" style={{width:"100%",padding:10,marginBottom:8}} />
        <button className="btn primary" type="submit">Установить новый пароль</button>
      </form>
      {msg && <div style={{marginTop:8}}>{msg}</div>}
    </div>
  );
}
