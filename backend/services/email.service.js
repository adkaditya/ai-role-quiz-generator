// ======================================================
// EMAIL SERVICE - GMAIL SMTP
// ======================================================

import nodemailer from "nodemailer";

// ======================================================
// GMAIL TRANSPORTER
// ======================================================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ======================================================
// SEND VERIFICATION OTP
// ======================================================

export const sendVerificationEmail = async (email, otp) => {
  try {
    if (!process.env.GMAIL_USER) {
      throw new Error("GMAIL_USER is not configured");
    }

    if (!process.env.GMAIL_APP_PASSWORD) {
      throw new Error("GMAIL_APP_PASSWORD is not configured");
    }

    const mailOptions = {
      from: `"IntelliQuiz" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verify Your IntelliQuiz Account",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 40px auto;
          padding: 30px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #ffffff;
        ">

          <h2 style="color: #6366f1;">
            Welcome to IntelliQuiz 🎓
          </h2>

          <p>
            Thank you for creating your IntelliQuiz account.
          </p>

          <p>
            Please use the following OTP to verify your email:
          </p>

          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 25px 0;
            color: #111827;
          ">
            ${otp}
          </div>

          <p>
            This OTP will expire in
            <strong>10 minutes</strong>.
          </p>

          <p style="color: #6b7280;">
            If you did not create this account, you can safely ignore
            this email.
          </p>

          <hr />

          <p style="font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()}
            IntelliQuiz. All rights reserved.
          </p>

        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ OTP EMAIL SENT");
    console.log("📧 To:", email);
    console.log("📨 Message ID:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
      email,
    };

  } catch (error) {
    console.error("❌ EMAIL SEND ERROR:", error);

    throw new Error(
      error.message || "Unable to send verification email"
    );
  }
};