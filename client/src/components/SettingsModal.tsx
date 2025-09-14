import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "../i18n";
import {
  getApiBaseURL,
  getApiBaseURLOverride,
  setApiBaseURL,
  clearApiBaseURLOverride,
} from "../api";

type Props = {
  open: boolean;
  onClose: () => void;
  onLogout?: () => void;
};

/* ——— локальные ключи хранения ——— */
const THEME_KEY = "app.theme";          // 'system' | 'light' | 'dark'
const SCALE_KEY = "app.fontScale";      // number, %, напр. 100
const LANG_KEY  = "app.lang";           // 'ru' | 'en'

/* ——— применение темы ——— */
function applyTheme(pref: "system" | "light" | "dark") {
  const root = document.documentElement;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const dark = pref === "dark" || (pref === "system" && prefersDark);
  root.classList.toggle("theme-dark", dark);
}

/* ——— применение масштаба ——— */
function applyScale(percent: number) {
  const clamped = Math.min(130, Math.max(85, percent || 100));
  document.documentElement.style.setProperty("--font-scale", String(clamped / 100));
}

/* ——— модалка ——— */
export default function SettingsModal({ open, onClose, onLogout }: Props) {
  const { lang, setLang, t } = useI18n();

  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const [scale, setScale] = useState<number>(100);
  const [apiUrl, setApiUrl] = useState<string>("");

  useEffect(() => {
    if (!open) return;

    // блокировка скролла фона
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // загрузка текущих значений
    const st = (localStorage.getItem(THEME_KEY) as any) || "system";
    const sc = Number(localStorage.getItem(SCALE_KEY) || "100");
    const currentApi = getApiBaseURLOverride() ?? getApiBaseURL();

    setTheme(st);
    setScale(Number.isFinite(sc) ? sc : 100);
    setApiUrl(currentApi);

    // применим
    applyTheme(st);
    applyScale(sc);

    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // тема — применяем сразу и сохраняем
  const onThemeChange = (v: "system" | "light" | "dark") => {
    setTheme(v);
    localStorage.setItem(THEME_KEY, v);
    applyTheme(v);
  };

  // масштаб — применяем сразу и сохраняем
  const onScaleChange = (v: number) => {
    setScale(v);
    localStorage.setItem(SCALE_KEY, String(v));
    applyScale(v);
  };

  // язык — применяем сразу и сохраняем
  const onLangChange = (v: "ru" | "en") => {
    setLang(v);
    try { localStorage.setItem(LANG_KEY, v); } catch {}
  };

  if (!open) return null;

  return createPortal(
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet" role="dialog" aria-modal="true">
        <div className="modal-handle" />

        <h3 className="modal-title">{t("settings") ?? "Настройки"}</h3>

        {/* Интерфейс */}
        <div className="modal-group">
          <div className="modal-subtitle">Интерфейс</div>

          <label className="modal-label">Тема</label>
          <select
            className="modal-input"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value as any)}
          >
            <option value="system">Системная</option>
            <option value="light">Светлая</option>
            <option value="dark">Тёмная</option>
          </select>

          <label className="modal-label">Размер текста</label>
          <div className="modal-row" style={{ alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>85%</span>
            <input
              type="range"
              min={85}
              max={130}
              step={5}
              value={scale}
              onChange={(e) => onScaleChange(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ width: 40, textAlign: "right", fontSize: 13 }}>{scale}%</span>
          </div>
        </div>

        {/* Язык */}
        <div className="modal-group">
          <div className="modal-subtitle">Язык</div>
          <label className="modal-label">Интерфейс</label>
          <select
            className="modal-input"
            value={lang as "ru" | "en"}
            onChange={(e) => onLangChange(e.target.value as "ru" | "en")}
          >
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Сервер */}
        <div className="modal-group">
          <div className="modal-subtitle">Сервер</div>

          <label className="modal-label">API URL</label>
          <input
            className="modal-input"
            placeholder="например, http://10.0.2.2:4000"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
          />
          <div className="modal-row">
            <button
              className="btn"
              onClick={() => {
                clearApiBaseURLOverride();
                const v = getApiBaseURL();
                setApiUrl(v);
              }}
            >
              По умолчанию
            </button>
            <button
              className="btn primary"
              onClick={() => {
                if (apiUrl.trim()) setApiBaseURL(apiUrl.trim());
                onClose();
              }}
            >
              Сохранить
            </button>
          </div>
        </div>

        <div className="modal-row" style={{ justifyContent: "space-between" }}>
          {onLogout && (
            <button className="btn" onClick={onLogout}>Выйти</button>
          )}
          <button className="btn" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
