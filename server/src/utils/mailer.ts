import nodemailer from "nodemailer";

export async function getTransporter() {
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = port === 465; // 465 = TLS, 587 = STARTTLS
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
    tls: { minVersion: "TLSv1.2", servername: "smtp.gmail.com" }
  });
}
