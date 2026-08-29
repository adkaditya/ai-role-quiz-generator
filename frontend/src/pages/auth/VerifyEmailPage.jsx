import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { verifyEmail } from "../../services/auth.service";

function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email not found. Please signup again.");
      navigate("/signup");
      return;
    }

    if (!otp || otp.length !== 6) {
      toast.error("Please enter 6 digit OTP");
      return;
    }

    try {
      setLoading(true);

      await verifyEmail(email, otp);

      toast.success("Email verified successfully!");

      navigate("/login");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-10">
      <Card className="w-full md:w-1/2 lg:w-1/3">
        <CardHeader className="text-center">
          <CardTitle>Verify Your Email</CardTitle>

          <CardDescription>
            Enter the OTP sent to your email
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerify} className="flex flex-col gap-5">

            <div className="flex flex-col gap-2">
              <Label>Email</Label>

              <Input
                value={email}
                disabled
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="otp">6 Digit OTP</Label>

              <Input
                id="otp"
                name="otp"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter 6 digit OTP"
                inputMode="numeric"
                maxLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default VerifyEmailPage;