import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

const RECEIVER_EMAIL = 'man@mechanicsetu.tech';

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
        const body = await req.json();
        const { name, email, subject, message } = body || {};

        if (!name || !email || !subject || !message) {
            return Response.json({ message: 'All fields are required.' }, { status: 400 });
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

        await smtpConfig.transporter.sendMail({
            from: `Portfolio Contact <${smtpConfig.from}>`,
            to: smtpConfig.to,
            replyTo: email,
            subject: `New contact form message: ${subject}`,
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
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Message:</strong></p>
                    <p>${message.replace(/\n/g, '<br />')}</p>
                </div>
            `,
        });

        return Response.json({ message: 'Message sent successfully.' }, { status: 200 });
    } catch (error) {
        console.error('Error sending contact email:', error);
        return Response.json({ message: 'Failed to send message.' }, { status: 500 });
    }
}
