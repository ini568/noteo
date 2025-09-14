import React from "react";
import * as L from "lucide-react";

export type IconName =
  | "user" | "settings" | "search" | "plus" | "trash" | "arrow-left"
  | "pin" | "download" | "upload" | "refresh" | "rotate-ccw"
  | "logout" | "log-out" | "alert-triangle" | "logo";

const MAP: Record<string, React.ComponentType<any>> = {
  user: L.User,
  settings: L.Settings,
  search: L.Search,
  plus: L.Plus,
  trash: L.Trash2,
  "arrow-left": L.ArrowLeft,
  pin: L.Pin,
  download: L.Download,
  upload: L.Upload,
  refresh: L.RefreshCw,
  "rotate-ccw": L.RotateCcw,
  logout: L.LogOut,
  "log-out": L.LogOut,
  "alert-triangle": L.AlertTriangle,
  // наш логотип в хедере
  logo: L.NotebookText, // можно заменить на любой другой из lucide
};

export default function Icon({
  name,
  size = 18,
  className,
  label,
}: {
  name: IconName | string;
  size?: number;
  className?: string;
  label?: string;
}) {
  const Cmp = MAP[name] ?? L.CircleAlert;
  return <Cmp aria-label={label} size={size} className={className} />;
}
