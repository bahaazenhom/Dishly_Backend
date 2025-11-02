import sgMail from "@sendgrid/mail";

// Initialize SendGrid
if (!process.env.SENDGRID_API_KEY) {
  throw new Error("Missing SENDGRID_API_KEY in environment variables.");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
console.log("📧 Email Configuration: Using Twilio SendGrid");

// Main reusable function
export async function sendMail({ to, subject, html }) {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || "no-reply@yourdomain.com",
      subject,
      html,
    };

    const response = await sgMail.send(msg);
    console.log(`✅ Email sent via SendGrid to ${to}`);
    return response;
  } catch (err) {
    console.error("❌ Failed to send email via SendGrid:", {
      to,
      error: err.message,
      code: err.code,
      response: err.response?.body || null,
    });
    throw err;
  }
}
