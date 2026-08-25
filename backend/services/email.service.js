// ======================================================
// RESEND EMAIL SERVICE
// ======================================================

// Resend SDK
import { Resend } from "resend";

// Resend API key .env / Render Environment Variables se
const resend = new Resend(process.env.RESEND_API_KEY);

// ======================================================
// SEND VERIFICATION OTP
// ======================================================

export const sendVerificationEmail = async (email, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      // Resend testing ke liye ye sender use kar sakte ho
      from: "IntelliQuiz <onboarding@resend.dev>",

      // User ka email
      to: [email],

      // Email subject
      subject: "Verify Your IntelliQuiz Account",

      // Email HTML
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
    });

    // Resend API error
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