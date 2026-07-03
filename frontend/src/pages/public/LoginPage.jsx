import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardAction,
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

  const [error, setError] = useState(undefined);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event) => {
    setLoginData({
      ...loginData,
      [event.target.name]: event.target.value,
    });
  };

  const handleFormSubmit = async (event) => {
    //form submit logic
    event.preventDefault();
    //
    console.log(loginData);
    //validations
    if (loginData.email === "" || loginData.password === "") {
      setError("All fields are required!");
      return;
    }

    try {
      setLoading(true);
      const responseData = await loginUser(loginData);
      console.log(responseData);
      toast.success("Login successful!");
      login(responseData.user, responseData.accessToken);
      //data clean form
      setLoginData({
        email: "",
        password: "",
      });
      navigate("/dashboard");
    } catch (error) {
      console.log(error.response);
      setError(error.response.data.message);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="flex justify-center py-5"
    >
      <Card className="w-full md:w-1/2 lg:w-1/3 py-10 ">
        <CardHeader className="text-center">
          <LogIn size={40} className="mx-auto" />
          <CardTitle className="text-2xl font-semibold">
            Login to your account{" "}
          </CardTitle>
          <CardDescription>
            Sign in to your account for explore the quizzes..
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 py-3">{error}</p>}
          <form
            onSubmit={handleFormSubmit}
            className="flex  flex-col gap-3 mt-3"
          >
            {/* email field */}
            <div className="flex gap-2 flex-col">
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                onChange={handleInputChange}
                id="email"
                placeholder="Enter your email"
                type="email"
                required
              />
            </div>

            {/* email field */}
            <div className="flex gap-2 flex-col">
              <Label htmlFor="password">Password</Label>
              <Input
                name="password"
                onChange={handleInputChange}
                id="password"
                placeholder="Enter your password"
                type="password"
                required
              />
            </div>

            <div>
              <div className="flex justify-center gap-2">
                <Button disabled={loading} size="lg">
                  {loading ? "Please wait..." : "Login"}
                </Button>
                <Button size="lg" variant="destructive">
                  Clear
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <p>
            Don't have an account?{" "}
            <span className="text-primary cursor-pointer">Sign Up</span>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default LoginPage;