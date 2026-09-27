// ======================================================
// EMAIL SERVICE - BREVO HTTPS API
// ======================================================

export const sendVerificationEmail = async (email, otp) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is not configured");
    }

    if (!process.env.BREVO_SENDER_EMAIL) {
      throw new Error("BREVO_SENDER_EMAIL is not configured");
    }

    const response = await fetch(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",

        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },

        body: JSON.stringify({
          sender: {
            name:
              process.env.BREVO_SENDER_NAME ||
              "IntelliQuiz",

            email: process.env.BREVO_SENDER_EMAIL,
          },

          to: [
            {
              email,
            },
          ],

          subject: "Verify Your IntelliQuiz Account",

          htmlContent: `
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
                If you did not create this account,
                you can safely ignore this email.
              </p>

              <hr />

              <p style="
                font-size: 12px;
                color: #9ca3af;
              ">
                © ${new Date().getFullYear()}
                IntelliQuiz. All rights reserved.
              </p>

            </div>
          `,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ BREVO ERROR:", data);

      throw new Error(
        data?.message ||
          "Unable to send verification email"
      );
    }

    console.log("✅ OTP EMAIL SENT");
    console.log("📧 To:", email);
    console.log(
      "📨 Brevo Message ID:",
      data?.messageId
    );

    return {
      success: true,
      messageId: data?.messageId,
      email,
    };
  } catch (error) {
    console.error("❌ EMAIL SEND ERROR:", error);

    throw new Error(
      error.message ||
        "Unable to send verification email"
    );
  }
};