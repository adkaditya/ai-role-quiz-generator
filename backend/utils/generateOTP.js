// ==========================================
// Generate 6 Digit OTP
// ==========================================

// Ye function ek random 6-digit OTP generate karega
export const generateOTP = () => {
  // Example OTP:
  // 482931
  // 719204
  // 163850

  const otp = Math.floor(100000 + Math.random() * 900000);

  // OTP ko String mein convert kar rahe hain
  // Kyunki database/email ke liye string use karna convenient hai
  return otp.toString();
};