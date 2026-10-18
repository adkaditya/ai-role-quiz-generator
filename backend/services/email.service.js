
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const EMAIL_TIMEOUT_MS = 10000;

export const sendVerificationEmail = async (email, otp) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  if (!process.env.BREVO_SENDER_EMAIL) {
    throw new Error("BREVO_SENDER_EMAIL is not configured");
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("A valid recipient email is required");
  }

  if (!/^\d{6}$/.test(String(otp))) {
    throw new Error("A valid 6-digit OTP is required");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    EMAIL_TIMEOUT_MS
  );

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME || "IntelliQuiz",
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [{ email }],
        subject: "Verify Your IntelliQuiz Account",
        htmlContent: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:40px auto;padding:30px;border:1px solid #e5e7eb;border-radius:12px;background:#ffffff;">
            <h2 style="color:#6366f1;">Welcome to IntelliQuiz 🎓</h2>
            <p>Thank you for creating your IntelliQuiz account.</p>
            <p>Please use the following OTP to verify your email:</p>
            <div style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:25px 0;color:#111827;">
              ${otp}
            </div>
            <p>This OTP will expire in <strong>10 minutes</strong>.</p>
            <p style="color:#6b7280;">If you did not create this account, you can safely ignore this email.</p>
            <hr />
            <p style="font-size:12px;color:#9ca3af;">
              &copy; ${new Date().getFullYear()} IntelliQuiz. All rights reserved.
            </p>
          </div>
        `,
      }),
    });

    const responseText = await response.text();
    let data = {};

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = {};
    }

    if (!response.ok) {
      console.error("Brevo API error:", {
        status: response.status,
        message: data?.message || "Email provider request failed",
        code: data?.code,
      });

      throw new Error(
        data?.message || `Brevo API returned status ${response.status}`
      );
    }

    console.log("Verification email accepted by Brevo:", {
      recipient: email,
      messageId: data?.messageId || "Not provided",
    });

    return {
      success: true,
      messageId: data?.messageId,
      email,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Brevo email request timed out");
      throw new Error("Email service timed out. Please try again.");
    }

    console.error("Email sending failed:", error.message);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
