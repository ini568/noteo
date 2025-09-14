import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

import authRoutes from "./routes/auth";
import notesRoutes from "./routes/notes";
import attachmentsRoutes from "./routes/attachments";
import { getTransporter } from "./utils/mailer";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT || 4000);

// ——— базовая гигиена
app.disable("x-powered-by");

// ——— минимальный лог (видно preflight и фактические запросы)
app.use((req, _res, next) => { console.log(req.method, req.url); next(); });

// ——— CORS до роутов (важно)
app.use(
  cors({
    origin: true, // dev: разрешаем всё; в проде сузить до своих доменов/Capacitor
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    optionsSuccessStatus: 204,
  })
);
app.options("*", cors()); // явный preflight

// ——— парсеры
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ——— статика для вложений
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ——— роуты API
app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);
app.use("/attachments", attachmentsRoutes);

// ——— healthcheck
app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

// ——— фоновый воркер напоминаний (email)
async function startReminderWorker() {
  const intervalMs = 60_000;
  setInterval(async () => {
    try {
      const now = new Date();
      const dueNotes = await prisma.note.findMany({
        where: { reminderAt: { lte: now }, user: { is: { isVerified: true } } },
        include: { user: true },
      });
      if (!dueNotes.length) return;

      const from = process.env.FROM_EMAIL || process.env.SMTP_USER;
      if (!from || !process.env.SMTP_HOST || !process.env.SMTP_PASS) {
        console.warn("Reminder worker: SMTP is not configured; skipping.");
        return;
      }

      const transporter = await getTransporter();
      for (const note of dueNotes) {
        const to = note.user.email;
        const title = note.title || "Заметка";
        const appUrl = process.env.APP_URL || "";
        const link = appUrl ? `${appUrl}/notes/${note.id}` : "";
        const subject = `Напоминание: ${title}`;
        const text = `Напоминание по заметке: ${title}\n\n${link ? `Открыть: ${link}` : ""}`.trim();
        const html = `<div>Напоминание по заметке: <b>${title}</b></div>${
          link ? `<div style="margin-top:8px"><a href="${link}">Открыть заметку</a></div>` : ""
        }`;

        try {
          await transporter.sendMail({ to, from, subject, text, html });
          await prisma.note.update({ where: { id: note.id }, data: { reminderAt: null } });
        } catch (e) {
          console.error("Reminder worker: failed to send for note", note.id, e);
        }
      }
    } catch (e) {
      console.error("Reminder worker error", e);
    }
  }, intervalMs);
}

// ——— старт сервера
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  startReminderWorker();
});

