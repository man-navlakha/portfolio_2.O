import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

const RECEIVER_EMAIL = 'man@mechanicsetu.tech';

// ─── Security: Allowed origins for CSRF protection ────────────────────────────
const ALLOWED_ORIGINS = [
    'https://man-navlakha.netlify.app',
    'http://localhost:3000',
    'http://localhost:3001',
];

// ─── Security: HTML escape to prevent XSS in email templates ──────────────────
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ─── Security: Basic email format validation ──────────────────────────────────
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

function getSmtpConfig() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = process.env.SMTP_SECURE
        ? String(process.env.SMTP_SECURE) === 'true'
        : port === 465;
    const to = RECEIVER_EMAIL;
    const from = process.env.CONTACT_FROM_EMAIL || user;

    if (!user || !pass || !to || !from) {
        return null;
    }

    return {
        transporter: nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user,
                pass,
            },
        }),
        to,
        from,
    };
}

export async function POST(req) {
    try {
        // ── CSRF: Validate request origin ───────────────────────────────────
        const origin = req.headers.get('origin');
        if (origin && !ALLOWED_ORIGINS.includes(origin)) {
            return Response.json({ message: 'Forbidden.' }, { status: 403 });
        }

        const body = await req.json();
        const { name, email, subject, message } = body || {};

        if (!name || !email || !subject || !message) {
            return Response.json({ message: 'All fields are required.' }, { status: 400 });
        }

        // ── Security: Input length limits ───────────────────────────────────
        if (name.length > 100 || subject.length > 200 || message.length > 5000) {
            return Response.json({ message: 'Input exceeds maximum length.' }, { status: 400 });
        }

        // ── Security: Email format validation ───────────────────────────────
        if (!isValidEmail(email)) {
            return Response.json({ message: 'Invalid email format.' }, { status: 400 });
        }

        const smtpConfig = getSmtpConfig();

        if (!smtpConfig) {
            return Response.json(
                {
                    message: 'Mail is not configured.',
                },
                { status: 500 }
            );
        }

        // ── Security: Escape all user input before injecting into HTML ──────
        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeSubject = escapeHtml(subject);
        const safeMessage = escapeHtml(message);

        await smtpConfig.transporter.sendMail({
            from: `Portfolio Contact <${smtpConfig.from}>`,
            to: smtpConfig.to,
            replyTo: email,
            subject: `New contact form message: ${safeSubject}`,
            text: [
                `Name: ${name}`,
                `Email: ${email}`,
                `Subject: ${subject}`,
                '',
                message,
            ].join('\n'),
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
                    <h2>New contact form message</h2>
                    <p><strong>Name:</strong> ${safeName}</p>
                    <p><strong>Email:</strong> ${safeEmail}</p>
                    <p><strong>Subject:</strong> ${safeSubject}</p>
                    <p><strong>Message:</strong></p>
                    <p>${safeMessage.replace(/\n/g, '<br />')}</p>
                </div>
            `,
        });

        return Response.json({ message: 'Message sent successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Error sending contact email:', error);
        return Response.json({ message: 'Failed to send message.' }, { status: 500 });
    }
}
