import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import IconButton from "../components/IconButton";
import Icon from "../components/Icon";
import { useI18n } from "../i18n";

type Attachment = { id: number; url: string; mimetype: string; filename: string };

export default function NoteEditor() {
  const { id } = useParams();
  const noteId = Number(id);
  const nav = useNavigate();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const isTypingRef = useRef(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [reminderAt, setReminderAt] = useState<string>("");
  const [fontFamily, setFontFamily] = useState<string>("system-ui");
  const [formatAction, setFormatAction] = useState<string>("");
  const { t } = useI18n();

  const abs = (u: string) => {
    const base = (API.defaults.baseURL || "").replace(/\/$/, "");
    return /^https?:/i.test(u) ? u : `${base}${u}`;
  };

  useEffect(() => {
    if (noteId && noteId !== 0) {
      API.get(`/notes/${noteId}`)
        .then(res => {
          setTitle(res.data.title || "");
          setContent(res.data.content || "");
          setTags(Array.isArray(res.data.tags) ? res.data.tags.map((t: any) => t.name).join(",") : "");
          setAttachments(res.data.attachments || []);
          setReminderAt(res.data.reminderAt ? new Date(res.data.reminderAt).toISOString().slice(0, 16) : "");
        })
        .catch(() => nav("/notes"));
    } else {
      setTitle(""); setContent(""); setTags(""); setAttachments([]); setReminderAt("");
    }
  }, [noteId, nav]);

  useEffect(() => {
    if (!editorRef.current) return;
    if (isTypingRef.current) { isTypingRef.current = false; return; }
    editorRef.current.innerHTML = content;
  }, [content]);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    isTypingRef.current = true;
    setContent(editorRef.current?.innerHTML || "");
  };

  const onEditorInput = () => {
    isTypingRef.current = true;
    setContent(editorRef.current?.innerHTML || "");
  };

  const save = async () => {
    setLoading(true);
    const payload: any = {
      title,
      content,
      tags: tags.split(",").map(s => s.trim()).filter(Boolean),
    };
    if (reminderAt) payload.reminderAt = new Date(reminderAt).toISOString();
    try {
      if (noteId === 0) await API.post("/notes", payload);
      else await API.put(`/notes/${noteId}`, payload);
      nav("/notes");
    } catch (e) {
      alert("Save failed"); console.error(e);
    } finally { setLoading(false); }
  };

  const uploadFile = async (file: File) => {
    let nid = noteId;
    try {
      if (!nid || nid === 0) {
        const res = await API.post("/notes", {
          title,
          content,
          tags: tags.split(",").map(s => s.trim()).filter(Boolean),
        });
        nid = res.data.id;
        nav(`/notes/${nid}`);
      }
      const fd = new FormData();
      fd.append("file", file);
      fd.append("noteId", String(nid));
      const res2 = await API.post("/attachments/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setAttachments(prev => [...prev, res2.data]);
    } catch (e) {
      alert("Upload failed"); console.error(e);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file);
    e.currentTarget.value = "";
  };

  const removeAttachment = async (aid: number) => {
    try {
      await API.delete(`/attachments/${aid}`);
      setAttachments(prev => prev.filter(a => a.id !== aid));
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div>
      <div className="editor">
        <div className="editor-head toolbar">
          <IconButton name="arrow-left" label={t("cancel")} onClick={() => nav("/notes")} />
          <input
            className="title-input"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} style={{ padding: 8, borderRadius: 8 }}>
            <option value="system-ui">System</option>
            <option value="'Inter', system-ui">Inter</option>
            <option value="serif">Serif</option>
            <option value="monospace">Mono</option>
          </select>

          <IconButton
            name="trash"
            label={t("delete")}
            onClick={async () => {
              if (!noteId) return;
              if (!confirm("Delete note?")) return;
              try { await API.delete(`/notes/${noteId}`); nav("/notes"); }
              catch { alert("Delete failed"); }
            }}
          />

          <select
            value={formatAction}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "bold" || v === "italic" || v === "underline") exec(v);
              else if (v === "link") { const url = prompt("Link URL"); if (url) exec("createLink", url); }
              setFormatAction("");
            }}
            style={{ padding: 8, borderRadius: 8 }}
          >
            <option value="">Format</option>
            <option value="bold">Bold</option>
            <option value="italic">Italic</option>
            <option value="underline">Underline</option>
            <option value="link">Link</option>
          </select>

          <input id="fileInput" type="file" accept="image/*,video/*,audio/*" onChange={onFileChange} style={{ display: "none" }} />
          <label htmlFor="fileInput" className="btn icon-btn" aria-label={t("attach")} title={t("attach")}>
            <Icon name="paperclip" />
          </label>

          <input type="datetime-local" value={reminderAt} onChange={e => setReminderAt(e.target.value)} style={{ padding: 8, borderRadius: 8 }} />

          <button className="btn primary" onClick={save} disabled={loading}>{t("save")}</button>
        </div>

        <div
          ref={editorRef}
          onInput={onEditorInput}
          contentEditable
          style={{ minHeight: "50vh", padding: 14, borderRadius: 8, border: "1px solid rgba(16,24,32,0.06)", background: "var(--input-bg)", fontFamily: fontFamily as any, direction: "ltr" }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          <input
            style={{ padding: 8, borderRadius: 8, border: "1px solid rgba(16,24,32,0.04)" }}
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="tags, comma,separated"
          />

          <div className="attachments-grid">
            {attachments.map(a => (
              <div key={a.id} className="attachment-card">
                {a.mimetype.startsWith("image/") && <img src={abs(a.url)} alt={a.filename} />}
                {a.mimetype.startsWith("video/") && <video src={abs(a.url)} controls />}
                {a.mimetype.startsWith("audio/") && <audio src={abs(a.url)} controls style={{ width: "100%" }} />}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                  <div style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.filename}</div>
                  <button className="btn" onClick={() => removeAttachment(a.id)}>{t("delete")}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
