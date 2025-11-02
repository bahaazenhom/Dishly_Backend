import sgMail from "@sendgrid/mail";


// Main reusable function
export async function sendMail({ to, subject, html }) {
  try {  
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log("📧 Email Configuration: Using Twilio SendGrid");
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
