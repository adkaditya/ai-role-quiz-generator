import nodemailer from "nodemailer";

// ======================================================
// EMAIL TRANSPORTER
// ======================================================

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",

  // Port 587 = TLS/STARTTLS
  port: 587,

  // 587 ke saath false
  secure: false,

  auth: {
    // Render Environment Variables se values aayengi
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },

  // Connection timeout
  connectionTimeout: 10000,

  // Socket timeout
  socketTimeout: 10000,

  // Greeting timeout
  greetingTimeout: 10000,
});

// ======================================================
// VERIFY SMTP CONNECTION
// ======================================================

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ EMAIL SMTP ERROR:", error.message);
  } else {
    console.log("✅ Email SMTP server is ready");
  }
});

// ======================================================
// SEND VERIFICATION OTP
// ======================================================

export const sendVerificationEmail = async (email, otp) => {
  try {
    const mailOptions = {
      // Sender
      from: `"IntelliQuiz" <${process.env.EMAIL_USER}>`,

      // Receiver
      to: email,

      // Subject
      subject: "Verify Your IntelliQuiz Account",

      // HTML Email
      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
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
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Verification email sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("❌ EMAIL SEND ERROR:", error);

    throw new Error("Unable to send verification email");
  }
};