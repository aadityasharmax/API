const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",   // SMTP host
  port: process.env.SMTP_PORT,    // SMTP port
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USERNAME,        //  SMTP username
    pass: process.env.SMTP_PASSWORD,        //  SMTP password
  },
});

async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"Dream Hub Africa Support" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log("✅ Email sent to:", to);
  } catch (err) {
    console.error("❌ Email error:", err);
  }
}



module.exports = sendEmail;