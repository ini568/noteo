import express from "express";
import multer from "multer";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import fs from "fs";

const prisma = new PrismaClient();
const router = express.Router();

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// NOTE: не объявляем некорректные опциональные типы для cb — используем точную сигнатуру, которую ожидает multer
const storage = multer.diskStorage({
  destination: (req: express.Request, file: Express.Multer.File, cb: (err: Error | null, destination: string) => void) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req: express.Request, file: Express.Multer.File, cb: (err: Error | null, filename: string) => void) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});

// локальный тип: AuthRequest + возможный file от multer
type MulteredAuthRequest = AuthRequest & { file?: Express.Multer.File; body: any };

router.post("/upload", authMiddleware, upload.single("file"), async (req: MulteredAuthRequest, res) => {
  const file = req.file;
  const noteId = Number(req.body?.noteId || 0);
  if (!file) return res.status(400).json({ error: "No file" });
  if (!noteId) {
    // удалить сохранённый файл если noteId не передан
    try { fs.unlinkSync(path.join(UPLOAD_DIR, file.filename)); } catch (e) {}
    return res.status(400).json({ error: "noteId required" });
  }

  // проверим, что заметка принадлежит пользователю
  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note || note.userId !== req.user!.userId) {
    try { fs.unlinkSync(path.join(UPLOAD_DIR, file.filename)); } catch (e) {}
    return res.status(403).json({ error: "Forbidden" });
  }

  const url = `/uploads/${file.filename}`;
  const attach = await prisma.attachment.create({
    data: {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url,
      note: { connect: { id: noteId } }
    }
  });

  res.json(attach);
});

router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const att = await prisma.attachment.findUnique({ where: { id } });
  if (!att) return res.status(404).json({ error: "Not found" });

  const note = await prisma.note.findUnique({ where: { id: att.noteId } });
  if (!note || note.userId !== req.user!.userId) return res.status(403).json({ error: "Forbidden" });

  const filename = path.basename(att.url);
  const full = path.join(UPLOAD_DIR, filename);
  try { if (fs.existsSync(full)) fs.unlinkSync(full); } catch (e) {}

  await prisma.attachment.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
