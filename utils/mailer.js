const nodemailer = require('nodemailer');
require('dotenv').config();

class Mailer {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendMail(to, subject, text, html = null) {
        const mailOptions = {
            from: `"FynTheFox" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        }
        return await this.transporter.sendMail(mailOptions);
    }
}

module.exports = new Mailer();