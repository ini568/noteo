import React, { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";
import { useI18n } from "../i18n";

export default function Register() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await API.post("/auth/register", { email, password, name });
      nav(`/verify?email=${encodeURIComponent(email)}`);
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Ошибка");
    }
  };

  return (
    <div style={{maxWidth:420,margin:"60px auto", background:"var(--panel)", padding:22, borderRadius:12, boxShadow:"var(--card-shadow)"}}>
      <h2 style={{marginTop:0}}>{t("register")}</h2>
      <form onSubmit={submit}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Имя (необязательно)" style={{width:"100%",padding:10,marginBottom:8}} />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder={t("email")} style={{width:"100%",padding:10,marginBottom:8}} />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder={t("password")} type="password" style={{width:"100%",padding:10,marginBottom:8}} />
        <button className="btn primary" type="submit">{t("register")}</button>
      </form>
      {err && <div style={{color:"#a00",marginTop:8}}>{err}</div>}
      <div style={{marginTop:12,fontSize:13}}>Есть аккаунт? <Link to="/login">Войти</Link></div>
    </div>
  );
}
