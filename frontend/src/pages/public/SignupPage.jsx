
import React, { useState } from "react";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { User2, MailCheck, Smartphone } from "lucide-react";

import {
  signUpUser,
  verifyEmail,
  sendSMSOTP,
  verifySMSOTP,
} from "../../services/auth.service";

import toast from "react-hot-toast";
import { useNavigate } from "react-router";

function SignupPage() {
  const navigate = useNavigate();

  // States
  const [showOtp, setShowOtp] = useState(false);
  const [showSmsOtp, setShowSmsOtp] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const [otp, setOtp] = useState("");
  const [smsOtp, setSmsOtp] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsVerifyLoading, setSmsVerifyLoading] = useState(false);

  // Input change
  const handleInputChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));

    setError("");
  };

  // Signup
  const handleSignup = async (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.phoneNumber.trim()
    ) {
      toast.error("All fields are required!");
      return;
    }

    const phone = formData.phoneNumber.trim();

    // E.164 phone number format
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
      toast.error(
        "Enter a valid phone number with country code, e.g. +919876543210"
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await signUpUser({
        ...formData,
        phoneNumber: phone,
      });

      toast.success(
        response?.message || "OTP sent to your email!"
      );

      setShowOtp(true);
    } catch (error) {
      console.error("SIGNUP ERROR:", error);

      const message =
        error?.response?.data?.message ||
        "Signup failed. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Verify Email OTP
  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Please enter the 6-digit email OTP");
      return;
    }

    try {
      setVerifyLoading(true);
      setError("");

      const response = await verifyEmail(formData.email, otp);

      toast.success(
        response?.message || "Email verified successfully!"
      );

      // Preserve form data and move to SMS verification
      setShowOtp(false);
      setOtp("");
      setShowSmsOtp(true);
    } catch (error) {
      console.error("EMAIL OTP VERIFY ERROR:", error);

      const message =
        error?.response?.data?.message ||
        "Invalid or expired email OTP";

      setError(message);
      toast.error(message);
    } finally {
      setVerifyLoading(false);
    }
  };

  // Send SMS OTP
  const handleSendSmsOtp = async () => {
    try {
      setSmsLoading(true);
      setError("");

      const response = await sendSMSOTP(
        formData.phoneNumber.trim()
      );

      toast.success(
        response?.message || "SMS OTP sent successfully!"
      );
    } catch (error) {
      console.error("SEND SMS OTP ERROR:", error);

      const message =
        error?.response?.data?.message ||
        "Unable to send SMS OTP. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setSmsLoading(false);
    }
  };

  // Verify SMS OTP
  const handleVerifySmsOtp = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(smsOtp)) {
      toast.error("Please enter the 6-digit SMS OTP");
      return;
    }

    try {
      setSmsVerifyLoading(true);
      setError("");

      const response = await verifySMSOTP(
        formData.phoneNumber.trim(),
        smsOtp
      );

      toast.success(
        response?.message || "Phone number verified successfully!"
      );

      // Reset form after both verifications
      setFormData({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
      });

      setOtp("");
      setSmsOtp("");
      setShowSmsOtp(false);

      navigate("/login");
    } catch (error) {
      console.error("SMS OTP VERIFY ERROR:", error);

      const message =
        error?.response?.data?.message ||
        "Invalid or expired SMS OTP";

      setError(message);
      toast.error(message);
    } finally {
      setSmsVerifyLoading(false);
    }
  };

  // Clear signup form
  const handleClear = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
    });

    setOtp("");
    setSmsOtp("");
    setError("");
    setShowOtp(false);
    setShowSmsOtp(false);
  };

  // SMS OTP Screen
  if (showSmsOtp) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-center px-4 py-10"
      >
        <Card className="w-full py-10 md:w-1/2 lg:w-1/3">
          <CardHeader className="text-center">
            <Smartphone size={45} className="mx-auto" />

            <CardTitle className="text-2xl font-semibold">
              Verify Your Phone
            </CardTitle>

            <CardDescription>
              Send an SMS OTP to{" "}
              <strong>{formData.phoneNumber}</strong>, then enter
              the 6-digit code.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <p className="py-3 text-center text-red-500">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-5">
              <Button
                type="button"
                size="lg"
                onClick={handleSendSmsOtp}
                disabled={smsLoading}
              >
                {smsLoading ? "Sending SMS OTP..." : "Send SMS OTP"}
              </Button>

              <form
                onSubmit={handleVerifySmsOtp}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="smsOtp">SMS Verification OTP</Label>

                  <Input
                    id="smsOtp"
                    name="smsOtp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit SMS OTP"
                    value={smsOtp}
                    onChange={(event) => {
                      setSmsOtp(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      );
                      setError("");
                    }}
                    className="text-center text-xl tracking-[8px]"
                    autoComplete="one-time-code"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={smsVerifyLoading}
                >
                  {smsVerifyLoading
                    ? "Verifying..."
                    : "Verify Phone & Continue"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowSmsOtp(false);
                    setShowOtp(true);
                    setSmsOtp("");
                    setError("");
                  }}
                >
                  Back to Email Verification
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Email OTP Screen
  if (showOtp) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-center px-4 py-10"
      >
        <Card className="w-full py-10 md:w-1/2 lg:w-1/3">
          <CardHeader className="text-center">
            <MailCheck size={45} className="mx-auto" />

            <CardTitle className="text-2xl font-semibold">
              Verify Your Email
            </CardTitle>

            <CardDescription>
              Enter the 6-digit OTP sent to
              <br />
              <strong>{formData.email}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <p className="py-3 text-center text-red-500">
                {error}
              </p>
            )}

            <form
              onSubmit={handleVerifyOtp}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="otp">Email Verification OTP</Label>

                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(event) => {
                    setOtp(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    );
                    setError("");
                  }}
                  className="text-center text-xl tracking-[8px]"
                  autoComplete="one-time-code"
                  autoFocus
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={verifyLoading}
              >
                {verifyLoading ? "Verifying..." : "Verify Email OTP"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowOtp(false);
                  setOtp("");
                  setError("");
                }}
              >
                Back to Signup
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Signup Screen
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="flex justify-center px-4 py-10"
    >
      <Card className="w-full py-10 md:w-1/2 lg:w-1/3">
        <CardHeader className="text-center">
          <User2 size={45} className="mx-auto" />

          <CardTitle className="text-2xl font-semibold">
            Create Account
          </CardTitle>

          <CardDescription>
            Signup to explore the quizzes
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <p className="py-3 text-red-500">{error}</p>
          )}

          <form
            onSubmit={handleSignup}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                autoComplete="name"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="+919876543210"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                autoComplete="tel"
                required
              />
              <p className="text-xs text-muted-foreground">
                Include country code, e.g. +91 for India.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-3">
              <Button
                disabled={loading}
                type="submit"
                size="lg"
              >
                {loading ? "Creating Account..." : "Signup"}
              </Button>

              <Button
                type="button"
                size="lg"
                variant="destructive"
                onClick={handleClear}
                disabled={loading}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <p>
            Already have an account?{" "}
            <span
              className="cursor-pointer font-medium text-primary"
              onClick={() => navigate("/login")}
            >
              Sign In
            </span>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default SignupPage;
