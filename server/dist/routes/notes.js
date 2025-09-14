"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
const noteCreateSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    content: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    pinned: zod_1.z.boolean().optional(),
    archived: zod_1.z.boolean().optional(),
    reminderAt: zod_1.z.string().optional() // ISO string from client
});
router.use(auth_1.authMiddleware);
router.get("/", async (req, res) => {
    const q = String(req.query.q || "");
    const userId = req.user.userId;
    const notes = await prisma.note.findMany({
        where: {
            userId,
            OR: [
                { title: { contains: q } },
                { content: { contains: q } }
            ]
        },
        orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
        include: { tags: true, attachments: true }
    });
    res.json(notes);
});
// List all tags (for suggestions)
router.get("/tags", async (_req, res) => {
    const tags = await prisma.tag.findMany({ select: { name: true }, orderBy: { name: "asc" } });
    res.json(tags.map(t => t.name));
});
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0)
        return res.status(400).json({ error: "Invalid id" });
    const userId = req.user.userId;
    const note = await prisma.note.findFirst({ where: { id, userId }, include: { tags: true, attachments: true } });
    if (!note)
        return res.status(404).json({ error: "Not found" });
    res.json(note);
});
router.post("/", async (req, res) => {
    const parsed = noteCreateSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.errors });
    const { title = "", content = "", tags = [], pinned = false, archived = false, reminderAt } = parsed.data;
    const userId = req.user.userId;
    const tagRecords = await Promise.all(tags.map(async (t) => {
        const existing = await prisma.tag.findFirst({ where: { name: t } });
        if (existing)
            return existing;
        return prisma.tag.create({ data: { name: t } });
    }));
    const createData = {
        title,
        content,
        pinned,
        archived,
        reminderAt: reminderAt ? new Date(reminderAt) : undefined,
        user: { connect: { id: userId } }
    };
    if (tagRecords.length > 0) {
        createData.tags = { connect: tagRecords.map(tr => ({ id: tr.id })) };
    }
    const note = await prisma.note.create({
        data: createData,
        include: { tags: true, attachments: true }
    });
    res.json(note);
});
router.put("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const parsed = noteCreateSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.errors });
    const { title, content, tags = [], pinned, archived, reminderAt } = parsed.data;
    const userId = req.user.userId;
    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId)
        return res.status(404).json({ error: "Not found" });
    const tagRecords = await Promise.all(tags.map(async (t) => {
        const ex = await prisma.tag.findFirst({ where: { name: t } });
        if (ex)
            return ex;
        return prisma.tag.create({ data: { name: t } });
    }));
    const note = await prisma.note.update({
        where: { id },
        data: {
            title: title ?? existing.title,
            content: content ?? existing.content,
            pinned: pinned ?? existing.pinned,
            archived: archived ?? existing.archived,
            reminderAt: reminderAt ? new Date(reminderAt) : (reminderAt === null ? null : existing.reminderAt),
            tags: { set: tagRecords.map(tr => ({ id: tr.id })) }
        },
        include: { tags: true, attachments: true }
    });
    res.json(note);
});
router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const userId = req.user.userId;
    const note = await prisma.note.findUnique({ where: { id } });
    if (!note || note.userId !== userId)
        return res.status(404).json({ error: "Not found" });
    // attachments will be deleted separately by attachments route (or cascade if configured)
    await prisma.note.delete({ where: { id } });
    res.json({ ok: true });
});
exports.default = router;
