import { randomInt } from "crypto";

// ==========================================
// Generate 6 Digit OTP
// ==========================================

export const generateOTP = () => {
  return randomInt(100000, 1000000).toString();
};