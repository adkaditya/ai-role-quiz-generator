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

import { User2, MailCheck } from "lucide-react";

import {
  signUpUser,
  verifyEmail,
} from "../../services/auth.service";

import toast from "react-hot-toast";
import { useNavigate } from "react-router";

function SignupPage() {
  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================

  const [showOtp, setShowOtp] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [verifyLoading, setVerifyLoading] = useState(false);

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    setError("");
  };

  // ==========================================
  // SIGNUP
  // ==========================================

  const handleSignup = async (event) => {
    event.preventDefault();

    // Validation
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      toast.error("All fields are required!");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Backend register API
      const response = await signUpUser(formData);

      toast.success(
        response?.message || "OTP sent to your email!"
      );

      // Open OTP screen
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

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    try {
      setVerifyLoading(true);
      setError("");

      // Backend verify-email API
      const response = await verifyEmail(
        formData.email,
        otp
      );

      toast.success(
        response?.message ||
          "Email verified successfully!"
      );

      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
      });

      setOtp("");

      // Go to login
      navigate("/login");
    } catch (error) {
      console.error("OTP VERIFY ERROR:", error);

      const message =
        error?.response?.data?.message ||
        "Invalid or expired OTP";

      setError(message);
      toast.error(message);
    } finally {
      setVerifyLoading(false);
    }
  };

  // ==========================================
  // CLEAR SIGNUP FORM
  // ==========================================

  const handleClear = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
    });

    setOtp("");
    setError("");
  };

  // ==========================================
  // OTP SCREEN
  // ==========================================

  if (showOtp) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-center py-10 px-4"
      >
        <Card className="w-full md:w-1/2 lg:w-1/3 py-10">
          <CardHeader className="text-center">
            <MailCheck
              size={45}
              className="mx-auto"
            />

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
              <p className="text-red-500 text-center py-3">
                {error}
              </p>
            )}

            <form
              onSubmit={handleVerifyOtp}
              className="flex flex-col gap-5"
            >
              {/* OTP */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="otp">
                  Verification OTP
                </Label>

                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(event) => {
                    const value = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);

                    setOtp(value);
                    setError("");
                  }}
                  className="text-center text-xl tracking-[8px]"
                  autoFocus
                />
              </div>

              {/* Verify Button */}
              <Button
                type="submit"
                size="lg"
                disabled={verifyLoading}
              >
                {verifyLoading
                  ? "Verifying..."
                  : "Verify OTP"}
              </Button>

              {/* Back Button */}
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

  // ==========================================
  // SIGNUP SCREEN
  // ==========================================

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="flex justify-center py-10 px-4"
    >
      <Card className="w-full md:w-1/2 lg:w-1/3 py-10">
        <CardHeader className="text-center">
          <User2
            size={45}
            className="mx-auto"
          />

          <CardTitle className="text-2xl font-semibold">
            Create Account
          </CardTitle>

          <CardDescription>
            Signup to explore the quizzes
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <p className="text-red-500 py-3">
              {error}
            </p>
          )}

          <form
            onSubmit={handleSignup}
            className="flex flex-col gap-4"
          >
            {/* NAME */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">
                Name
              </Label>

              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* EMAIL */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">
                Password
              </Label>

              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* BUTTONS */}
            <div className="flex justify-center gap-3 pt-3">
              <Button
                disabled={loading}
                type="submit"
                size="lg"
              >
                {loading
                  ? "Sending OTP..."
                  : "Signup"}
              </Button>

              <Button
                type="button"
                size="lg"
                variant="destructive"
                onClick={handleClear}
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
              className="text-primary cursor-pointer font-medium"
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