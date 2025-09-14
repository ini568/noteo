import express from "express";
import { PrismaClient } from "@prisma/client";
import { hashPassword, comparePassword } from "../utils/hash";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { z } from "zod";
import { getTransporter } from "../utils/mailer";

dotenv.config();

const prisma = new PrismaClient();
const router = express.Router();

function randomCode(len = 6) {
  const chars = "0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: "Email already exists" });

  const hashed = await hashPassword(password);
  const code = randomCode(6);

  await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      isVerified: false,
      verificationCode: code,
      verificationSentAt: new Date()
    }
  });

  try {
    const transporter = await getTransporter();
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: "Код подтверждения / Verification code",
      text: `Ваш код подтверждения: ${code}`,
      html: `<p>Ваш код подтверждения: <b>${code}</b></p>`
    });
  } catch (e) {
    console.error("Mail error (register):", e);
    // Можно вернуть 200, чтобы не палить внутренние детали, но сообщить пользователю:
    // return res.status(500).json({ error: "Mail send error" });
  }

  return res.json({ ok: true, message: "Registered. Check email for verification code.", email });
});

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().min(4)
});

router.post("/verify", async (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const { email, code } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: "Invalid" });

  if (user.isVerified) return res.json({ ok: true, message: "Already verified" });
  if (!user.verificationCode || user.verificationCode !== code)
    return res.status(400).json({ error: "Invalid code" });

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, verificationCode: null, verificationSentAt: null }
  });

  return res.json({ ok: true });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors });

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const ok = await comparePassword(password, user.password);
  if (!ok) return res.status(400).json({ error: "Invalid credentials" });

  if (!user.isVerified) return res.status(403).json({ error: "Email not verified" });

  const secret = process.env.JWT_SECRET || "no_secret";
  const token = jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn: "7d" });

  return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

router.post("/resend", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: "Invalid email" });
  if (user.isVerified) return res.json({ ok: true, message: "Already verified" });

  const code = randomCode(6);

  await prisma.user.update({
    where: { id: user.id },
    data: { verificationCode: code, verificationSentAt: new Date() }
  });

  try {
    const transporter = await getTransporter();
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: "Код подтверждения / Verification code",
      text: `Ваш код подтверждения: ${code}`,
      html: `<p>Ваш код подтверждения: <b>${code}</b></p>`
    });
  } catch (e) {
    console.error("Mail error (resend):", e);
  }

  return res.json({ ok: true });
});

router.post("/forgot", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const user = await prisma.user.findUnique({ where: { email } });
  // Не раскрываем существование/не существование пользователя
  if (!user) return res.json({ ok: true });

  const code = randomCode(6);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetCode: code, resetSentAt: new Date() }
  });

  try {
    const transporter = await getTransporter();
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: "Код восстановления / Password reset code",
      text: `Код восстановления: ${code}`,
      html: `<p>Код восстановления: <b>${code}</b></p>`
    });
  } catch (e) {
    console.error("Mail error (forgot):", e);
  }

  return res.json({ ok: true });
});

router.post("/reset", async (req, res) => {
  const { email, code, password } = req.body;
  if (!email || !code || !password) return res.status(400).json({ error: "Missing fields" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.resetCode || user.resetCode !== code)
    return res.status(400).json({ error: "Invalid code" });

  const hashed = await hashPassword(password);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, resetCode: null, resetSentAt: null }
  });

  return res.json({ ok: true });
});

export default router;
