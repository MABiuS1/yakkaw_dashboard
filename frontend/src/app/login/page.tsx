"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import qs from "qs";
import {
  Loader2,
  Eye,
  EyeOff,
  User,
  Lock,
  LogIn,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    if (savedUsername) {
      setFormData((prev) => ({
        ...prev,
        username: savedUsername,
        rememberMe: true,
      }));
    }
  }, []);

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (loginAttempts >= 5) {
      setError("Too many login attempts. Please try again later.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8080/login",
        qs.stringify({
          username: formData.username.trim(),
          password: formData.password,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 10000,
          withCredentials: true,
        }
      );

      if (formData.rememberMe) {
        localStorage.setItem("rememberedUsername", formData.username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      router.push("/dashboard");
    } catch (err) {
      setLoginAttempts((prev) => prev + 1);
      setError("Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/assets/background.webp')",
      }}
    >
      <Card className="w-[90%] sm:w-[400px] bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg rounded-xl p-6">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold">
            Login Form
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert
                variant="destructive"
                className="border border-red-300 bg-red-100 text-red-800"
              >
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="username">Enter your username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="pl-10 bg-white/10 text-white placeholder-white/60 border-white/30 focus:border-white focus:ring-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Enter your password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="pl-10 pr-10 bg-white/10 text-white placeholder-white/60 border-white/30 focus:border-white focus:ring-white"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-white/70" />
                  ) : (
                    <Eye className="h-4 w-4 text-white/70" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-white">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="accent-white"
                />
                <Label htmlFor="rememberMe">Remember me</Label>
              </div>
              <Button
                type="button"
                variant="link"
                className="text-white hover:underline"
                onClick={() => router.push("/forgot-password")}
              >
                Forgot password?
              </Button>
            </div>
          </CardContent>

          <CardFooter className="mt-4 flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-gray-100"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Log In"
              )}
            </Button>

            <p className="text-sm text-white text-center">
              Don't have an account?{" "}
              <Button
                type="button"
                variant="link"
                className="px-0 text-indigo-500 hover:text-indigo-700 font-medium"
                onClick={() => router.push("/register")}
              >
                Register
              </Button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
