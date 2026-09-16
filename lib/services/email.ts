import "server-only";

import nodemailer from "nodemailer";
import type { EmailMessage } from "@/lib/contracts/email";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export function sendEmail(message: EmailMessage) {
    const from = process.env.SMTP_FROM_EMAIL;
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !from) {
        throw new Error("SMTP email configuration is incomplete");
    }
    return transporter.sendMail({
        from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
    });
}
