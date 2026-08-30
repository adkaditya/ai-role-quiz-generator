// ======================================================
// EMAIL SERVICE
// ======================================================

import { Resend } from "resend";

// Resend only initialize when API key exists
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// ======================================================
// SEND VERIFICATION OTP
// ======================================================

export const sendVerificationEmail = async (email, otp) => {
  try {
    // ==================================================
    // DEVELOPMENT MODE
    // ==================================================
    // Abhi domain ki zarurat nahi hai.
    // OTP backend terminal mein show hoga.
    // ==================================================

    if (process.env.NODE_ENV !== "production") {
      console.log("\n========================================");
      console.log("🔐 INTELLIQUIZ DEVELOPMENT OTP");
      console.log("📧 Email:", email);
      console.log("🔢 OTP:", otp);
      console.log("⏰ Valid for: 10 minutes");
      console.log("========================================\n");

      return {
        id: "development-otp",
        email,
        otp,
      };
    }

    // ==================================================
    // PRODUCTION MODE
    // ==================================================

    if (!resend) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      "IntelliQuiz <onboarding@resend.dev>";

    const { data, error } = await resend.emails.send({
      from: fromEmail,

      to: [email],

      subject: "Verify Your IntelliQuiz Account",

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 40px auto;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            background: #ffffff;
          "
        >

          <h2 style="color: #6366f1;">
            Welcome to IntelliQuiz 🎓
          </h2>

          <p>
            Thank you for creating your IntelliQuiz account.
          </p>

          <p>
            Please use the following OTP to verify your email:
          </p>

          <div
            style="
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 25px 0;
              color: #111827;
            "
          >
            ${otp}
          </div>

          <p>
            This OTP will expire in
            <strong>10 minutes</strong>.
          </p>

          <p style="color: #6b7280;">
            If you did not create this account,
            you can safely ignore this email.
          </p>

          <hr />

          <p style="font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()}
            IntelliQuiz. All rights reserved.
          </p>

        </div>
      `,
    });

    if (error) {
      console.error("❌ RESEND ERROR:", error);

      throw new Error(
        error.message || "Unable to send verification email"
      );
    }

    console.log("✅ Verification email sent:", data?.id);

    return data;

  } catch (error) {
    console.error("❌ EMAIL SEND ERROR:", error);

    throw new Error(
      error.message || "Unable to send verification email"
    );
  }
};