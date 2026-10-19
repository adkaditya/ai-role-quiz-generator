
import { useState } from "react";
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
import { LogIn } from "lucide-react";
import { loginUser } from "../../services/auth.service";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { useAuthContext } from "../../context/AuthContext";

function LoginPage() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event) => {
    setLoginData({
      ...loginData,
      [event.target.name]: event.target.value,
    });
    setError("");
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!loginData.email.trim() || !loginData.password.trim()) {
      setError("Email and Password are required");
      toast.error("Email and Password are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await loginUser(loginData);

      login(response.user, response.accessToken);

      toast.success(response.message || "Login successful!");

      setLoginData({
        email: "",
        password: "",
      });

      navigate("/dashboard");
    } catch (error) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message ||
        "Login failed. Please try again.";

      if (status === 403) {
        toast.error(message);

        navigate("/signup", {
          state: {
            email: loginData.email,
            verifyOnly: true,
          },
        });

        return;
      }

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setLoginData({
      email: "",
      password: "",
    });
    setError("");
  };

  const handleGoogleLogin = () => {
    window.location.href =
      "https://ai-role-quiz-generator.onrender.com/api/v1/auth/google";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="flex justify-center py-10 px-4"
    >
      <Card className="w-full md:w-1/2 lg:w-1/3 py-10">
        <CardHeader className="text-center">
          <LogIn size={45} className="mx-auto" />

          <CardTitle className="text-2xl font-semibold">
            Login to Your Account
          </CardTitle>

          <CardDescription>
            Sign in to explore the quizzes
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <p className="text-red-500 py-3">{error}</p>
          )}

          <form
            onSubmit={handleFormSubmit}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={handleInputChange}
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
                value={loginData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="flex justify-center gap-3 pt-3">
              <Button
                type="submit"
                disabled={loading}
                size="lg"
              >
                {loading ? "Please wait..." : "Login"}
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

          <div className="relative flex items-center py-5">
            <div className="flex-grow border-t" />
            <span className="mx-3 text-sm text-muted-foreground">
              OR
            </span>
            <div className="flex-grow border-t" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            <span className="mr-2 font-bold">G</span>
            Continue with Google
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <p>
            Don't have an account?{" "}
            <span
              className="text-primary cursor-pointer font-medium"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </span>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default LoginPage;
