import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useI18n } from "../i18n";

type User = {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  plan?: string | null;
};

export default function Profile() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const { data } = await api.get<User>("/auth/me", { timeout: 10000 });
        if (!m) return;
        setUser(data);
      } catch {
        // если сессия сломалась — на логин
        nav("/login", { replace: true });
      } finally {
        if (m) setLoading(false);
      }
    })();
    return () => { m = false; };
  }, [nav]);

  if (loading) return <div className="mobile-wrap muted">Загрузка…</div>;
  if (!user)   return <div className="mobile-wrap muted">Пользователь не найден</div>;

  return (
    <div className="mobile-wrap" style={{display:"grid", gap:12}}>
      {/* Хедер */}
      <div className="row" style={{justifyContent:"flex-start", gap:8}}>
        <button className="btn icon-btn" onClick={() => nav(-1)} aria-label={t("back")}>←</button>
        <div className="h1">{t("profile")}</div>
      </div>

      {/* Карточка пользователя */}
      <div className="card">
        <div className="row" style={{gap:12, alignItems:"center"}}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" style={{width:56,height:56,borderRadius:999,objectFit:"cover",border:"1px solid var(--border)"}} />
          ) : (
            <div style={{width:56,height:56,borderRadius:999,background:"#e5e7eb",display:"grid",placeItems:"center",fontWeight:700}}>
              {(user.name?.[0] || user.email?.[0] || "U").toUpperCase()}
            </div>
          )}
          <div style={{flex:1}}>
            <div style={{fontWeight:700}}>{user.name || "User"}</div>
            <div className="muted" style={{fontSize:13}}>{user.email}</div>
          </div>
          <span className="tag">{t("Free")}</span>
        </div>

        <div className="row" style={{justifyContent:"flex-start"}}>
          <button className="btn" onClick={() => nav("/profile/edit")}>Редактировать профиль</button>
        </div>
      </div>

      {/* Навигация по разделам */}
      <button className="nav-card" onClick={() => nav("/settings/security")} aria-label="Безопасность">
        <div className="title">Безопасность</div>
        <div style={{opacity:.6}}>›</div>
      </button>

      <button className="nav-card" onClick={() => nav("/settings/sessions")} aria-label="Устройства и сессии">
        <div className="title">Устройства и сессии</div>
        <div style={{opacity:.6}}>›</div>
      </button>

      {/* Большая кнопка «Настройки» внизу */}
      <div style={{marginTop:8, display:"grid", gap:8}}>
        <button className="btn block" onClick={() => nav("/settings")}>
          {t("settings")}
        </button>

        {/* Логаут в самом низу, менее контрастный */}
        <button
          className="btn danger-soft block"
          onClick={async () => {
            try { await api.post("/auth/logout"); } catch {}
            localStorage.removeItem("token");
            nav("/login", { replace: true });
          }}
        >
          {t("logout")}
        </button>
      </div>
    </div>
  );
}
