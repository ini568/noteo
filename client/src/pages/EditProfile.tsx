import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

type User = { id: string; email: string; name?: string | null; avatarUrl?: string | null };

export default function EditProfile() {
  const nav = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const { data } = await api.get<User>("/auth/me");
        if (!m) return;
        setUser(data);
        setName(data.name || "");
        setPreview(data.avatarUrl || null);
      } catch {
        nav("/login", { replace: true });
      }
    })();
    return () => { m = false; };
  }, [nav]);

  const onFile = (f: File | null) => {
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(user?.avatarUrl || null);
    }
  };

  const save = async () => {
    if (!user) return;
    setSaving(true); setErr(null);
    try {
      let avatarUrl = user.avatarUrl || null;

      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        // предполагаем, что есть /attachments для загрузки и оно вернет {url}
        const up = await api.post<{ url: string }>("/attachments", fd, { headers: { "Content-Type": "multipart/form-data" }});
        avatarUrl = up.data.url;
      }

      await api.put("/auth/me", { name, avatarUrl });
      nav("/profile", { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="mobile-wrap muted">Загрузка…</div>;

  return (
    <div className="mobile-wrap" style={{display:"grid", gap:12}}>
      <div className="row" style={{justifyContent:"flex-start", gap:8}}>
        <button className="btn icon-btn" onClick={() => nav(-1)}>←</button>
        <div className="h1">Редактирование профиля</div>
      </div>

      <div className="card" style={{display:"grid", gap:12}}>
        <div className="row" style={{gap:12}}>
          <div>
            <div style={{width:72,height:72,borderRadius:999,overflow:"hidden",border:"1px solid var(--border)",background:"#e5e7eb"}}>
              {preview ? <img src={preview} style={{width:"100%",height:"100%",objectFit:"cover"}} /> : null}
            </div>
          </div>
          <div style={{display:"grid",gap:8}}>
            <label className="btn">
              Загрузить фото
              <input type="file" accept="image/*" style={{display:"none"}} onChange={(e)=>onFile(e.target.files?.[0] || null)} />
            </label>
            {preview ? <button className="btn" onClick={()=>onFile(null)}>Удалить фото</button> : null}
          </div>
        </div>

        <div className="row" style={{alignItems:"center"}}>
          <div style={{minWidth:90}}>Имя</div>
          <input className="input" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Ваше имя" />
        </div>

        {err && <div className="muted" style={{color:"#b91c1c"}}>{err}</div>}

        <div className="row" style={{justifyContent:"flex-end", gap:8}}>
          <button className="btn" onClick={()=>nav(-1)}>Отмена</button>
          <button className="btn primary" disabled={saving} onClick={save}>{saving ? "Сохранение…" : "Сохранить"}</button>
        </div>
      </div>
    </div>
  );
}
