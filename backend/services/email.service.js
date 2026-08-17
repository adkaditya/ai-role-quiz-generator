import nodemailer from "nodemailer";

// ==========================================
// Create Email Transporter
// ==========================================
// Transporter decide karta hai ki email
// kis email service/server ke through jayega.

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    // Sender email .env se milega
    user: process.env.EMAIL_USER,

    // Gmail App Password .env se milega
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ==========================================
// Send Verification OTP
// ==========================================

export const sendVerificationEmail = async (email, otp) => {
  // Email ki details
  const mailOptions = {
    // Email kis naam se send hoga
    from: `"IntelliQuiz" <${process.env.EMAIL_USER}>`,

    // User ka email
    to: email,

    // Email subject
    subject: "Verify Your IntelliQuiz Account",

    // Email ka HTML content
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
          "
        >
          ${otp}
        </div>

        <p>
          This OTP will expire in <strong>10 minutes</strong>.
        </p>

        <p style="color: #6b7280;">
          If you did not create this account, you can safely ignore
          this email.
        </p>

        <hr />

        <p style="font-size: 12px; color: #9ca3af;">
          © ${new Date().getFullYear()} IntelliQuiz. All rights reserved.
        </p>

      </div>
    `,
  };

  // Actual email send hoga
  await transporter.sendMail(mailOptions);
};