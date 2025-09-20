import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

type Session = { id: string; device: string; current?: boolean; lastActive?: string };

export default function SessionsPage() {
  const nav = useNavigate();
  const [list, setList] = useState<Session[] | null>(null);

  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const { data } = await api.get<Session[]>("/auth/sessions");
        if (m) setList(data);
      } catch {
        // запасной вариант, если API нет
        if (m) setList([{ id: "current", device: "Это устройство", current: true, lastActive: new Date().toISOString() }]);
      }
    })();
    return () => { m = false; };
  }, []);

  return (
    <div className="mobile-wrap" style={{display:"grid", gap:12}}>
      <div className="row" style={{justifyContent:"flex-start", gap:8}}>
        <button className="btn icon-btn" onClick={() => nav(-1)}>←</button>
        <div className="h1">Устройства и сессии</div>
      </div>

      <div className="card" style={{display:"grid", gap:8}}>
        {(list ?? []).map(s => (
          <div key={s.id} className="nav-card" style={{padding:12}}>
            <div>
              <div className="title">{s.device}</div>
              <div className="meta">{s.lastActive ? new Date(s.lastActive).toLocaleString() : ""}</div>
            </div>
            {s.current ? <span className="tag">Текущая</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
