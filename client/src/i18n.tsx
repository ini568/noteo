import React, { createContext, useContext, useMemo, useState } from "react";

type Dict = Record<string, string>;

const ru: Dict = {
  notes: "Заметки",
  new_note: "Новая заметка",
  search: "Поиск",
  cancel: "Отмена",
  save: "Сохранить",
  close: "Закрыть",

  // Профиль/Настройки
  profile: "Профиль",
  settings: "Настройки",
  interface: "Интерфейс",
  theme: "Тема",
  theme_system: "Системная",
  theme_light: "Светлая",
  theme_dark: "Тёмная",
  text_size: "Размер текста",
  density: "Плотность списка",
  sort: "Сортировка",
  language: "Язык",
  date_format: "Формат даты",
  security: "Безопасность",
  sessions: "Устройства и сессии",
  data_storage: "Данные и хранилище",
  help_about: "Справка и о приложении",
  sync_now: "Синхронизировать сейчас",
  export_data: "Экспорт данных",
  backup: "Резервная копия",
  danger_zone: "Опасные действия",
  logout: "Выйти",
  confirm_logout: "Выйти из аккаунта?",
  back: "Назад",
  Free: "Бесплатно",
  free: "Бесплатно",
};

const en: Dict = {
  notes: "Notes",
  new_note: "New note",
  search: "Search",
  cancel: "Cancel",
  save: "Save",
  close: "Close",

  profile: "Profile",
  settings: "Settings",
  interface: "Interface",
  theme: "Theme",
  theme_system: "System",
  theme_light: "Light",
  theme_dark: "Dark",
  text_size: "Text size",
  density: "List density",
  sort: "Sort",
  language: "Language",
  date_format: "Date format",
  security: "Security",
  sessions: "Devices & sessions",
  data_storage: "Data & storage",
  help_about: "Help & About",
  sync_now: "Sync now",
  export_data: "Export data",
  backup: "Backup",
  danger_zone: "Danger zone",
  logout: "Sign out",
  confirm_logout: "Sign out of account?",
  back: "Back",
  Free: "Free",
  free: "Free",
};

const dicts = { ru, en };

type I18nCtx = {
  lang: keyof typeof dicts;
  setLang: (l: keyof typeof dicts) => void;
  t: (k: string) => string;
};

const I18nContext = createContext<I18nCtx | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<keyof typeof dicts>("ru");
  const value = useMemo<I18nCtx>(() => ({
    lang,
    setLang,
    t: (k: string) => dicts[lang][k] ?? k,
  }), [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
};
