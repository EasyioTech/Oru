
import nodemailer from 'nodemailer';
import { AppError } from '../../utils/errors.js';
import { db } from '../database/index.js';
import { systemSettings } from '../database/schemas/system.js';
import { decrypt } from '../../utils/encryption.js';

const getTransporter = async () => {
    // 1. Fetch settings from DB
    const [settings] = await db.select().from(systemSettings).limit(1);

    // 2. Determine credentials (DB > Env)
    // Default to SMTP for now, but can expand to SendGrid/others based on settings.emailProvider
    const host = settings?.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = settings?.smtpPort || parseInt(process.env.SMTP_PORT || '587');
    const user = settings?.smtpUser || process.env.SMTP_USER;

    let pass = process.env.SMTP_PASS;
    if (settings?.smtpPasswordEncrypted) {
        try {
            pass = decrypt(settings.smtpPasswordEncrypted);
        } catch (error) {
            console.error('Failed to decrypt SMTP password, falling back to env', error);
        }
    }

    const from = settings?.smtpFromEmail || process.env.SMTP_FROM || 'noreply@oru.com';

    // 3. Create Transporter
    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass,
        },
    });

    return { transporter, from };
};

export const sendSystemEmail = async (to: string, subject: string, html: string) => {
    try {
        const { transporter, from } = await getTransporter();
        const info = await transporter.sendMail({
            from,
            to,
            subject,
            html,
        });
        return info;
    } catch (error) {
        console.error('Email send error:', error);
        throw new AppError('Failed to send email', 500, 'EMAIL_SEND_ERROR');
    }
};

export const verifyConnection = async () => {
    try {
        const { transporter } = await getTransporter();
        await transporter.verify();
        return true;
    } catch (error) {
        console.error('Email connection verification failed:', error);
        return false;
    }
};
