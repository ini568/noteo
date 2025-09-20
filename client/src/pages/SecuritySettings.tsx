import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";

export default function SecuritySettings() {
  const { t } = useI18n();
  const nav = useNavigate();

  // локальные состояния (пока без серверной интеграции)
  const [pin, setPin] = useState<boolean>(() => localStorage.getItem("sec.pin") === "1");
  const [bio, setBio] = useState<boolean>(() => localStorage.getItem("sec.bio") === "1");
  const [fa, setFa] = useState<boolean>(() => localStorage.getItem("sec.2fa") === "1");

  useEffect(()=>{ localStorage.setItem("sec.pin", pin ? "1":"0"); },[pin]);
  useEffect(()=>{ localStorage.setItem("sec.bio", bio ? "1":"0"); },[bio]);
  useEffect(()=>{ localStorage.setItem("sec.2fa", fa ? "1":"0"); },[fa]);

  return (
    <div className="mobile-wrap" style={{display:"grid", gap:12}}>
      <div className="row" style={{justifyContent:"flex-start", gap:8}}>
        <button className="btn icon-btn" onClick={() => nav(-1)}>←</button>
        <div className="h1">{t("security")}</div>
      </div>

      <div className="card">
        <div className="row">
          <div>PIN-код</div>
          <label className="switch">
            <input type="checkbox" checked={pin} onChange={()=>setPin(v=>!v)} />
            <span className="slider" />
          </label>
        </div>
        <div className="row">
          <div>Биометрия</div>
          <label className="switch">
            <input type="checkbox" checked={bio} onChange={()=>setBio(v=>!v)} />
            <span className="slider" />
          </label>
        </div>
        <div className="row">
          <div>Двухфакторная аутентификация (2FA)</div>
          <label className="switch">
            <input type="checkbox" checked={fa} onChange={()=>setFa(v=>!v)} />
            <span className="slider" />
          </label>
        </div>
      </div>
    </div>
  );
}
