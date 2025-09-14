import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import Icon from "../components/Icon";
import IconButton from "../components/IconButton";
import { useI18n } from "../i18n";

// простая утилита подтверждений
function confirmAsync(message: string): Promise<boolean> {
  return new Promise((resolve) => resolve(window.confirm(message)));
}

type Session = { id: string; device: string; lastActive: string; current?: boolean };

export default function Profile() {
  const nav = useNavigate();
  const { t } = useI18n();

  // Заглушки данных пользователя: пробуем /auth/me, иначе берем из токена/локалки
  const [user, setUser] = useState<{ name: string; email: string }>({ name: "User", email: "user@example.com" });
  const [subscription, setSubscription] = useState<"free" | "pro">("free");
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const me = await API.get("/auth/me").then(r => r.data).catch(() => null);
        if (me?.name || me?.email) setUser({ name: me.name || "User", email: me.email || "user@example.com" });
      } catch {}
    })();

    // Сессии — локальная заглушка (можно заменить на реальный API)
    const local = JSON.parse(localStorage.getItem("sessions") || "null") as Session[] | null;
    if (local) setSessions(local);
    else {
      const base: Session[] = [
        { id: "current", device: "Это устройство", lastActive: new Date().toISOString(), current: true },
      ];
      setSessions(base);
      localStorage.setItem("sessions", JSON.stringify(base));
    }
  }, []);

  const initials = useMemo(() => user.name.trim().split(/\s+/).map(s => s[0]).slice(0,2).join("").toUpperCase(), [user.name]);

  const revokeSession = async (id: string) => {
    if (!(await confirmAsync("Отозвать эту сессию?"))) return;
    const next = sessions.filter(s => s.id !== id);
    setSessions(next);
    localStorage.setItem("sessions", JSON.stringify(next));
  };

  const exportData = async () => {
    try {
      const notes = await API.get("/notes").then(r => r.data);
      const blob = new Blob([JSON.stringify({ user, notes }, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `noteo-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      alert("Не удалось экспортировать данные");
      console.error(e);
    }
  };

  const backupNow = async () => {
    // сюда потом можно подвесить резерв в облако
    await exportData();
  };

  const syncNow = async () => {
    try { await API.get("/notes"); alert("Синхронизация завершена"); } catch { alert("Нет сети"); }
  };

  const logout = async () => {
    if (!(await confirmAsync("Выйти из аккаунта?"))) return;
    localStorage.removeItem("token");
    nav("/login");
  };

  return (
    <div style={{maxWidth: 720, margin: "0 auto", padding: 16}}>
      {/* заголовок */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <button className="btn" onClick={()=>nav(-1)}><Icon name="arrow-left" /> {t("back") || "Назад"}</button>
        <div className="h1">{t("profile") || "Профиль"}</div>
        <Link to="/settings" className="btn"><Icon name="settings" /> {t("settings") || "Настройки"}</Link>
      </div>

      {/* карточка профиля */}
      <div className="card">
        <div style={{display:"flex", gap:12, alignItems:"center"}}>
          <div style={{
            width:64,height:64,borderRadius:"50%",background:"linear-gradient(180deg,#eff4ff,#dbe7ff)",
            display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"#0a4fa6"
          }}>{initials || "U"}</div>
          <div style={{minWidth:0}}>
            <div style={{fontWeight:700, fontSize:18}}>{user.name}</div>
            <div style={{color:"var(--muted)"}}>{user.email}</div>
          </div>
          <span style={{marginLeft:"auto"}} className="tag">
            {subscription === "pro" ? "PRO" : "Free"}
          </span>
        </div>

        <div style={{display:"flex", gap:8, marginTop:12, flexWrap:"wrap"}}>
          <button className="btn" onClick={syncNow}><Icon name="refresh" /> Синхронизировать сейчас</button>
          <button className="btn" onClick={exportData}><Icon name="download" /> Экспорт</button>
          <button className="btn" onClick={backupNow}><Icon name="upload" /> Резервная копия</button>
        </div>
      </div>

      {/* безопасность */}
      <div className="card">
        <div className="card-title">Безопасность</div>
        <div className="row">
          <label>PIN-код</label>
          <Toggle storageKey="sec.pin" />
        </div>
        <div className="row">
          <label>Биометрия</label>
          <Toggle storageKey="sec.biometry" />
        </div>
        <div className="row">
          <label>Двухфакторная аутентификация (2FA)</label>
          <Toggle storageKey="sec.2fa" />
        </div>
      </div>

      {/* сессии/устройства */}
      <div className="card">
        <div className="card-title">Устройства и сессии</div>
        <div style={{display:"flex", flexDirection:"column", gap:8}}>
          {sessions.map(s => (
            <div key={s.id} className="row">
              <div>
                <div style={{fontWeight:600}}>{s.device}</div>
                <div style={{fontSize:12, color:"var(--muted)"}}>
                  Активность: {new Date(s.lastActive).toLocaleString()}
                </div>
              </div>
              {!s.current && (
                <button className="btn" onClick={()=>revokeSession(s.id)}><Icon name="trash" /> Отозвать</button>
              )}
              {s.current && <span className="tag">Текущая</span>}
            </div>
          ))}
        </div>
      </div>

      {/* опасная зона */}
      <div className="card danger">
        <div className="card-title">Опасные действия</div>
        <button className="btn primary" style={{background:"#e5484d"}} onClick={logout}>
          <Icon name="log-out" /> Выйти
        </button>
      </div>
    </div>
  );
}

function Toggle({ storageKey }: { storageKey: string }) {
  const [v, setV] = useState<boolean>(() => localStorage.getItem(storageKey) === "1");
  useEffect(()=>localStorage.setItem(storageKey, v ? "1" : "0"),[v, storageKey]);
  return (
    <label className="switch">
      <input type="checkbox" checked={v} onChange={(e)=>setV(e.target.checked)} />
      <span className="slider" />
    </label>
  );
}
