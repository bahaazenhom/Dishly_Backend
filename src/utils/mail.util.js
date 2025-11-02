import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";

// Determine which email service to use
const USE_SENDGRID = !!process.env.SENDGRID_API_KEY;

if (USE_SENDGRID) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('📧 Email Configuration: Using SendGrid');
} else {
  console.log('📧 Email Configuration:', {
    user: process.env.EMAIL_USER || 'abdofatah410@gmail.com',
    passConfigured: !!(process.env.EMAIL_PASS || 'mwhypmsyhmuggviq'),
    service: 'gmail'
  });
}

// Gmail transporter (fallback)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: process.env.EMAIL_USER || "abdofatah410@gmail.com",
        pass: process.env.EMAIL_PASS || "mwhypmsyhmuggviq"
    },
    tls: {
        rejectUnauthorized: false,
    },
    connectionTimeout: 10000, // 10 seconds timeout
    greetingTimeout: 10000,
});

// Only verify Gmail if not using SendGrid
if (!USE_SENDGRID) {
  transporter.verify(function (error, success) {
    if (error) {
      console.warn('⚠️  Gmail SMTP verification failed:', error.message);
      console.warn('💡 Consider using SendGrid: Set SENDGRID_API_KEY environment variable');
    } else {
      console.log('✅ Gmail SMTP is ready to send messages');
    }
  });
}

export async function sendMail({ to, subject, html }) {
  try {
    if (USE_SENDGRID) {
      // Use SendGrid
      const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER || "abdofatah410@gmail.com",
        subject,
        html,
      };
      const result = await sgMail.send(msg);
      console.log(`✅ Email sent via SendGrid to ${to}`);
      return result;
    } else {
      // Use Gmail
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER || "abdofatah410@gmail.com",
        to,
        subject,
        html
      });
      console.log(`✅ Email sent via Gmail to ${to}:`, info.messageId);
      return info;
    }
  } catch (err) {
    console.error("❌ Mail send failed:", {
      to,
      service: USE_SENDGRID ? 'SendGrid' : 'Gmail',
      error: err.message,
      code: err.code,
    });
    throw err;
  }
}