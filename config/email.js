const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
    if (!transporter && process.env.SMTP_HOST && process.env.SMTP_USER) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
    return transporter;
}

async function sendContactNotification(submission) {
    const t = getTransporter();
    if (!t) {
        console.log('Email not configured. Skipping notification for submission:', submission.id);
        return false;
    }

    try {
        await t.sendMail({
            from: `"Arjuna Harjai Website" <${process.env.SMTP_USER}>`,
            to: process.env.NOTIFICATION_EMAIL || 'mail@aartsense.co.uk',
            subject: `New Contact: ${submission.subject} - from ${submission.name}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${submission.name}</p>
                <p><strong>Email:</strong> ${submission.email}</p>
                <p><strong>Subject:</strong> ${submission.subject}</p>
                <p><strong>Message:</strong></p>
                <p>${submission.message}</p>
                <hr>
                <p><small>Sent from arjunaharjai.com contact form</small></p>
            `
        });
        return true;
    } catch (err) {
        console.error('Failed to send email notification:', err.message);
        return false;
    }
}

async function sendPasswordResetEmail(email, resetUrl) {
    const t = getTransporter();
    if (!t) {
        console.log('Email not configured. Cannot send password reset.');
        return false;
    }

    try {
        await t.sendMail({
            from: `"Arjuna Harjai Website" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <h2>Password Reset</h2>
                <p>You requested a password reset. Click the link below to set a new password:</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <p>This link expires in 1 hour.</p>
                <p>If you did not request this, please ignore this email.</p>
            `
        });
        return true;
    } catch (err) {
        console.error('Failed to send reset email:', err.message);
        return false;
    }
}

module.exports = { sendContactNotification, sendPasswordResetEmail };
