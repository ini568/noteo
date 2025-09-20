import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";
import Icon from "../components/Icon";

const THEME_KEY = "app.theme";        // system | light | dark
const SCALE_KEY = "app.fontScale";    // 85..130
const DENSITY_KEY = "ui.density";     // comfy | compact
const SORT_KEY = "notes.sort";        // title | updatedAt | createdAt
// ... остальной ваш код без изменений
const LANG_KEY = "app.lang";          // ru | en
const DATE_KEY = "app.dateFmt";       // auto | D.M.Y | M/D/Y etc.
const HOTKEYS_KEY = "ui.hotkeys";     // json

function applyTheme(pref: string) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const dark = pref === "dark" || (pref === "system" && prefersDark);
  root.classList.toggle("theme-dark", dark);
}
function applyScale(percent: number) {
  const clamped = Math.min(130, Math.max(85, percent || 100));
  document.documentElement.style.setProperty("--font-scale", String(clamped / 100));
}

export default function SettingsHome() {
  const nav = useNavigate();
  const { lang, setLang, t } = useI18n();
  const [q, setQ] = useState("");

  // значения
  const [theme, setTheme] = useState<string>(() => localStorage.getItem(THEME_KEY) || "system");
  const [scale, setScale] = useState<number>(() => Number(localStorage.getItem(SCALE_KEY) || "100"));
  const [density, setDensity] = useState<string>(() => localStorage.getItem(DENSITY_KEY) || "comfy");
  const [sort, setSort] = useState<string>(() => localStorage.getItem(SORT_KEY) || "updatedAt");
  const [dateFmt, setDateFmt] = useState<string>(() => localStorage.getItem(DATE_KEY) || "auto");
  const [hotkeys, setHotkeys] = useState<string>(() => localStorage.getItem(HOTKEYS_KEY) || "{}");

  // применение сразу
  useEffect(()=>{ applyTheme(theme); localStorage.setItem(THEME_KEY, theme); },[theme]);
  useEffect(()=>{ applyScale(scale); localStorage.setItem(SCALE_KEY, String(scale)); },[scale]);
  useEffect(()=>{ localStorage.setItem(DENSITY_KEY, density); },[density]);
  useEffect(()=>{ localStorage.setItem(SORT_KEY, sort); },[sort]);
  useEffect(()=>{ localStorage.setItem(DATE_KEY, dateFmt); },[dateFmt]);
  useEffect(()=>{ localStorage.setItem(HOTKEYS_KEY, hotkeys); },[hotkeys]);
  useEffect(()=>{ setLang(lang); localStorage.setItem(LANG_KEY, lang); },[lang, setLang]);

  const resetAll = () => {
    if (!confirm("Сбросить настройки на значения по умолчанию?")) return;
    localStorage.removeItem(THEME_KEY);
    localStorage.removeItem(SCALE_KEY);
    localStorage.removeItem(DENSITY_KEY);
    localStorage.removeItem(SORT_KEY);
    localStorage.removeItem(LANG_KEY);
    localStorage.removeItem(DATE_KEY);
    localStorage.removeItem(HOTKEYS_KEY);
    setTheme("system");
    setScale(100);
    setDensity("comfy");
    setSort("updatedAt");
    setDateFmt("auto");
    setHotkeys("{}");
    setLang("ru" as any);
    applyTheme("system");
    applyScale(100);
  };

  // фильтрация разделов по поиску
  const filter = (text: string) => text.toLowerCase().includes(q.trim().toLowerCase());
  const hidden = (title: string, ...items: string[]) => q ? !(filter(title) || items.some(filter)) : false;

  return (
    <div style={{maxWidth:720, margin:"0 auto", padding:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <button className="btn" onClick={()=>nav(-1)}><Icon name="arrow-left" /> {t("back")||"Назад"}</button>
        <div className="h1">{t("settings")||"Настройки"}</div>
        <button className="btn" onClick={resetAll}><Icon name="rotate-ccw" /> Сбросить</button>
      </div>

      <input className="modal-input" placeholder="Поиск по настройкам…" value={q} onChange={e=>setQ(e.target.value)} />

      {/* Интерфейс/Персонализация */}
      {!hidden("Интерфейс", "тема","размер","плотность","язык","дата","горячие")}
      <div className="card">
        <div className="card-title">Интерфейс / Персонализация</div>

        <div className="row">
          <label>Тема</label>
          <select className="modal-input" value={theme} onChange={(e)=>setTheme(e.target.value)}>
            <option value="system">Системная</option>
            <option value="light">Светлая</option>
            <option value="dark">Тёмная</option>
          </select>
        </div>

        <div className="row">
          <label>Размер текста</label>
          <div className="modal-row" style={{alignItems:"center"}}>
            <span style={{fontSize:12,color:"var(--muted)"}}>85%</span>
            <input type="range" min={85} max={130} step={5} value={scale} onChange={(e)=>setScale(Number(e.target.value))} style={{flex:1}}/>
            <span style={{width:40,textAlign:"right"}}>{scale}%</span>
          </div>
        </div>

        <div className="row">
          <label>Плотность списка</label>
          <select className="modal-input" value={density} onChange={(e)=>setDensity(e.target.value)}>
            <option value="comfy">Обычная</option>
            <option value="compact">Компактная</option>
          </select>
        </div>

        <div className="row">
          <label>Сортировка заметок</label>
          <select className="modal-input" value={sort} onChange={(e)=>setSort(e.target.value)}>
            <option value="updatedAt">По дате изменения</option>
            <option value="createdAt">По дате создания</option>
            <option value="title">По заголовку</option>
          </select>
        </div>

        <div className="row">
          <label>Язык</label>
          <select className="modal-input" value={lang as any} onChange={(e)=> (setLang(e.target.value as any))}>
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="row">
          <label>Формат даты</label>
          <select className="modal-input" value={dateFmt} onChange={(e)=>setDateFmt(e.target.value)}>
            <option value="auto">Системный</option>
            <option value="D.M.Y">Д.М.Г</option>
            <option value="M/D/Y">M/D/Y</option>
            <option value="Y-M-D">Y-M-D</option>
          </select>
        </div>

        <div className="row">
          <label>Горячие клавиши</label>
          <textarea className="modal-input" rows={3}
            placeholder='JSON, напр. {"save":"Ctrl+S"}'
            value={hotkeys} onChange={(e)=>setHotkeys(e.target.value)} />
        </div>
              {/* Данные и резервные копии */}
      <div className="card">
        <div className="card-title">Данные и резервные копии</div>
        <div className="row" style={{justifyContent:"flex-start",gap:8}}>
          <button className="btn" onClick={()=>{/* триггер фоновой синхронизации */ alert("Синхронизация…")}}>
            ⟳ {t("sync_now")}
          </button>
          <button className="btn" onClick={()=>{/* экспорт */ alert("Экспорт данных…")}}>
            ⬇ {t("export_data")}
          </button>
          <button className="btn" onClick={()=>{/* резервная копия */ alert("Резервная копия…")}}>
            ⤓ {t("backup")}
          </button>
        </div>

      </div>
    </div>

      {/* Безопасность и приватность */}
      {!hidden("Безопасность", "автоблокировка","анали")}
      <div className="card">
        <div className="card-title">Безопасность и приватность</div>
        <div className="row">
          <label>Автоблокировка (мин.)</label>
          <input className="modal-input" type="number" min={0}
                 defaultValue={localStorage.getItem("sec.autolock")||"0"}
                 onChange={e=>localStorage.setItem("sec.autolock", e.target.value)} />
        </div>
        <div className="row">
          <label>Разрешить аналитику</label>
          <label className="switch">
            <input type="checkbox"
                   defaultChecked={localStorage.getItem("privacy.analytics")==="1"}
                   onChange={e=>localStorage.setItem("privacy.analytics", e.target.checked? "1":"0")} />
            <span className="slider" />
          </label>
        </div>
      </div>

      {/* Данные и хранилище */}
      {!hidden("Данные", "очистка","удаление","экспорт","импорт")}
      <div className="card">
        <div className="card-title">Данные и хранилище</div>
        <div className="row">
          <button className="btn" onClick={()=>{
            if (confirm("Очистить кэш интерфейса?")) {
              caches?.keys?.().then(keys => keys.forEach(k => caches.delete(k)));
              alert("Кэш очищен.");
            }
          }}><Icon name="trash" /> Очистить кэш</button>
        </div>
        <div className="row">
          <button className="btn" onClick={()=>{
            if (confirm("Удалить аккаунт (только локально)?")) {
              localStorage.clear();
              alert("Локальные данные удалены");
            }
          }}><Icon name="alert-triangle" /> Удалить аккаунт</button>
        </div>
      </div>

      {/* Устройства и сессии */}
      {!hidden("Устройства","сессии")}
      <div className="card">
        <div className="card-title">Устройства и сессии</div>
        <div>Управление перенесено в «Профиль».</div>
      </div>

      {/* Справка */}
      {!hidden("Справка","о приложении")}
      <div className="card">
        <div className="card-title">Справка и о приложении</div>
        <div style={{color:"var(--muted)"}}>Noteo · v1.0.0 · Capacitor + React</div>
      </div>
    </div>
  );
}
