import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: process.env.EMAIL_USER || "abdofatah410@gmail.com",
        pass: process.env.EMAIL_PASS || "mwhypmsyhmuggviq"
    },
    tls: {
        rejectUnauthorized: false,
    }
});

export async function sendMail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER || "abdofatah410@gmail.com",
      to,
      subject,
      html
    });
    console.log(`✅ Email sent successfully to ${to}:`, info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Mail send failed:", {
      error: err.message,
      code: err.code,
      command: err.command,
      response: err.response
    });
    throw err;
  }
}