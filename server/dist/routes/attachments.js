"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
const UPLOAD_DIR = path_1.default.join(process.cwd(), "uploads");
if (!fs_1.default.existsSync(UPLOAD_DIR))
    fs_1.default.mkdirSync(UPLOAD_DIR);
// NOTE: не объявляем некорректные опциональные типы для cb — используем точную сигнатуру, которую ожидает multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${unique}${ext}`);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});
router.post("/upload", auth_1.authMiddleware, upload.single("file"), async (req, res) => {
    const file = req.file;
    const noteId = Number(req.body?.noteId || 0);
    if (!file)
        return res.status(400).json({ error: "No file" });
    if (!noteId) {
        // удалить сохранённый файл если noteId не передан
        try {
            fs_1.default.unlinkSync(path_1.default.join(UPLOAD_DIR, file.filename));
        }
        catch (e) { }
        return res.status(400).json({ error: "noteId required" });
    }
    // проверим, что заметка принадлежит пользователю
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note || note.userId !== req.user.userId) {
        try {
            fs_1.default.unlinkSync(path_1.default.join(UPLOAD_DIR, file.filename));
        }
        catch (e) { }
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
router.delete("/:id", auth_1.authMiddleware, async (req, res) => {
    const id = Number(req.params.id);
    const att = await prisma.attachment.findUnique({ where: { id } });
    if (!att)
        return res.status(404).json({ error: "Not found" });
    const note = await prisma.note.findUnique({ where: { id: att.noteId } });
    if (!note || note.userId !== req.user.userId)
        return res.status(403).json({ error: "Forbidden" });
    const filename = path_1.default.basename(att.url);
    const full = path_1.default.join(UPLOAD_DIR, filename);
    try {
        if (fs_1.default.existsSync(full))
            fs_1.default.unlinkSync(full);
    }
    catch (e) { }
    await prisma.attachment.delete({ where: { id } });
    res.json({ ok: true });
});
exports.default = router;
