
import twilio from "twilio";

const getTwilioClient = () => {
  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
  } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error("Twilio credentials are not configured");
  }

  return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
};

// Send SMS OTP using Twilio Verify
export const sendSmsOTP = async (phoneNumber) => {
  if (!process.env.TWILIO_VERIFY_SERVICE_SID) {
    throw new Error("Twilio Verify Service SID is not configured");
  }

  if (!/^\+[1-9]\d{7,14}$/.test(phoneNumber)) {
    throw new Error(
      "Enter a valid phone number with country code, e.g. +919876543210"
    );
  }

  const client = getTwilioClient();

  return client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({
      to: phoneNumber,
      channel: "sms",
    });
};

// Verify the OTP received by SMS
export const verifySmsOTP = async (phoneNumber, code) => {
  if (!process.env.TWILIO_VERIFY_SERVICE_SID) {
    throw new Error("Twilio Verify Service SID is not configured");
  }

  if (!/^\+[1-9]\d{7,14}$/.test(phoneNumber)) {
    throw new Error("Enter a valid phone number with country code");
  }

  if (!/^\d{4,10}$/.test(String(code))) {
    throw new Error("Enter a valid OTP");
  }

  const client = getTwilioClient();

  return client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({
      to: phoneNumber,
      code: String(code),
    });
};
