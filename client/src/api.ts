import axios from "axios";
import { Capacitor } from "@capacitor/core";

const STORAGE_KEY = "apiBaseURL";

function resolveBaseURLNoOverride() {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && String(envUrl).trim()) return String(envUrl).trim();
  const platform = Capacitor.getPlatform?.() || "web";
  if (platform === "android") return "http://10.0.2.2:4000"; // Android emulator
  return "http://localhost:4000";
}

function resolveBaseURL() {
  try {
    const override = localStorage.getItem(STORAGE_KEY);
    if (override && override.trim()) return override.trim();
  } catch {}
  return resolveBaseURLNoOverride();
}

const API = axios.create({ baseURL: resolveBaseURL(), headers: { "Content-Type": "application/json" } });

try { console.log("[API baseURL]", API.defaults.baseURL); } catch {}

API.interceptors.request.use(cfg => {
  const t = localStorage.getItem("token");
  if (t) {
    const v = `Bearer ${t}`;
    if ((cfg.headers as any)?.set) (cfg.headers as any).set("Authorization", v);
    else cfg.headers = { ...(cfg.headers||{}), Authorization: v } as any;
  }
  return cfg;
});

export default API;

// Helpers for runtime override via UI
export function getApiBaseURL() {
  return API.defaults.baseURL || resolveBaseURL();
}
export function getApiBaseURLOverride() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
export function setApiBaseURL(url: string) {
  const v = url.trim();
  try { localStorage.setItem(STORAGE_KEY, v); } catch {}
  API.defaults.baseURL = v;
  try { console.log("API baseURL overridden ->", v); } catch {}
}
export function clearApiBaseURLOverride() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
  const v = resolveBaseURLNoOverride();
  API.defaults.baseURL = v;
  try { console.log("API baseURL override cleared ->", v); } catch {}
}
