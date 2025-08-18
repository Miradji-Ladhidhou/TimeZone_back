const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, 
  port: process.env.SMTP_PORT, 
  secure: process.env.SMTP_PORT == 465, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendEmail({ to, subject, text, html }) {
  const mailOptions = {
    from: `"TimeZone App" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email envoyé à', to);
  } catch (err) {
    console.error('Erreur envoi email:', err);
    throw err;
  }
}

module.exports = { sendEmail };
