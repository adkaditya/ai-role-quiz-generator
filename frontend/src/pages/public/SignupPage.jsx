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
import { LogIn, User2 } from "lucide-react";

import { signUpUser } from "../../services/auth.service";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
  });

  const [error, setError] = useState(undefined);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleFormSubmit = async (event) => {
    //form submit logic
    event.preventDefault();
    //
    console.log(formData);
    //validations
    if (
      formData.email === "" ||
      formData.name === "" ||
      formData.password === ""
    ) {
      // setError("All fields are required!");
      toast.error("All fields are required!");
      return;
    }

    try {
      setLoading(true);
      const responseData = await signUpUser(formData);
      toast.success("Signup successful!");
      //data clean form
      setFormData({
        email: "",
        name: "",
        password: "",
      });
      console.log(responseData);
      navigate("/login");
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
          <User2 size={40} className="mx-auto" />
          <CardTitle className="text-2xl font-semibold">Signup Here</CardTitle>
          <CardDescription>Signup to explore the quizzes..</CardDescription>
        </CardHeader>
        <CardContent>
          <div>{error && <p className="text-red-500">{error}</p>}</div>

          <form
            onSubmit={handleFormSubmit}
            className="flex  flex-col gap-3 mt-3"
          >
            {/* email field */}
            <div className="flex gap-2 flex-col">
              <Label htmlFor="name">Name</Label>
              <Input
                onChange={handleInputChange}
                name="name"
                id="name"
                placeholder="Enter your name"
                type="text"
                required
              />
            </div>

            {/* email field */}
            <div className="flex gap-2 flex-col">
              <Label htmlFor="email">Email</Label>
              <Input
                onChange={handleInputChange}
                name="email"
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
                onChange={handleInputChange}
                name="password"
                id="password"
                placeholder="Enter your password"
                type="password"
                required
              />
            </div>

            <div className="flex justify-center gap-2">
              <Button disabled={loading} type="submit" size="lg">
                {loading ? "Creating account..." : "Signup"}
              </Button>
              <Button type="reset" size="lg" variant="destructive">
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <p>
            Already have an account?{" "}
            <span className="text-primary cursor-pointer">Sign In</span>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default SignupPage;