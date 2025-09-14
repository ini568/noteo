import React, { useEffect, useRef, useState } from "react";
import API from "../api";
import { Link, useNavigate } from "react-router-dom";
import IconButton from "../components/IconButton";
import Icon from "../components/Icon";
import { useI18n } from "../i18n";

type Note = {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  archived: boolean;
  updatedAt: string;
  tags: { id: number; name: string }[];
};

export default function NotesList() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [q, setQ] = useState("");
  const debounceRef = useRef<number | null>(null);

  const load = async (search = "") => {
    try {
      const res = await API.get("/notes", { params: { q: search } });
      setNotes(res.data);
    } catch {
      setNotes([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => load(q), 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [q]);

  const logout = () => {
    localStorage.removeItem("token");
    nav("/login");
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo"><Icon name="logo" size={20} /></div>
          <div>
            <h2 style={{margin:0}}>{t("notes")}</h2>
            <div style={{fontSize:12,color:"var(--muted)"}}>
              Лёгкий и быстрый блокнот
            </div>
          </div>
          <div style={{marginLeft:"auto"}}>
            <IconButton
              name="user"
              title={t("profile")}
              onClick={() => nav("/profile")}
            />
          </div>
        </div>

        <div className="side-actions" style={{justifyContent:"flex-start"}}>
          <button className="btn primary" onClick={() => nav("/notes/0")}>
            <Icon name="plus" /> {t("new_note")}
          </button>
        </div>

        <div className="search">
          <div style={{display:"flex",gap:8}}>
            <input
              placeholder={t("search")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <IconButton name="search" onClick={() => load(q)} />
          </div>
          <div style={{display:"flex",gap:8,marginTop:8}}>
            <button className="btn" onClick={() => { setQ(""); load(""); }}>
              {t("cancel")}
            </button>
          </div>
        </div>

        <div style={{marginTop:12, borderTop:"1px solid rgba(16,24,32,0.04)", paddingTop:12, fontSize:13, color:"var(--muted)"}}>
          <div style={{marginBottom:8,fontWeight:700}}>Метки</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            <span className="tag">Важное</span>
            <span className="tag">Идеи</span>
            <span className="tag">Работа</span>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <div className="topbar">
          <div>
            <div className="h1">{t("notes")}</div>
            <div style={{fontSize:13,color:"var(--muted)"}}>
              {notes.length} {t("notes")}
            </div>
          </div>
        </div>

        {notes.length === 0 ? (
          <div className="empty">{t("empty_notes")}</div>
        ) : (
          <div className="notes-grid">
            {notes.map((n) => (
              <Link key={n.id} to={`/notes/${n.id}`} className="note-card">
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                    <div className="note-title">{n.title || "(Без названия)"}</div>
                    <div>
                      <button
                        className="btn icon-btn"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* pin toggle TODO */ }}
                        title={n.pinned ? "Открепить" : "Закрепить"}
                      >
                        <Icon name="pin" />
                      </button>
                    </div>
                  </div>
                  <div className="note-excerpt">
                    {n.content ? (n.content.length > 140 ? n.content.slice(0,140) + "…" : n.content) : "—"}
                  </div>
                </div>
                <div className="note-meta">
                  <div style={{display:"flex",gap:8}}>
                    {n.tags?.slice(0,2).map(t => <span key={t.id} className="tag">{t.name}</span>)}
                  </div>
                  <div style={{color:"var(--muted)"}}>
                    {new Date(n.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
