import nodemailer from "nodemailer";

// Log configuration on startup (for debugging production issues)
console.log('📧 Email Configuration:', {
  user: process.env.EMAIL_USER || 'abdofatah410@gmail.com',
  passConfigured: !!(process.env.EMAIL_PASS || 'mwhypmsyhmuggviq'),
  service: 'gmail'
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: process.env.EMAIL_USER || "abdofatah410@gmail.com",
        pass: process.env.EMAIL_PASS || "mwhypmsyhmuggviq"
    },
    tls: {
        rejectUnauthorized: false,
    },
    // Add these options for better debugging
    debug: false, // set to true for detailed SMTP logs
    logger: false
});

// Verify transporter configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Email transporter verification failed:', error.message);
  } else {
    console.log('✅ Email server is ready to send messages');
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
      to,
      error: err.message,
      code: err.code,
      command: err.command,
      response: err.response
    });
    throw err;
  }
}