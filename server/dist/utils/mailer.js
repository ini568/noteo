"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransporter = getTransporter;
const nodemailer_1 = __importDefault(require("nodemailer"));
async function getTransporter() {
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = port === 465; // 465 = TLS, 587 = STARTTLS
    return nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        tls: { minVersion: "TLSv1.2", servername: "smtp.gmail.com" }
    });
}
