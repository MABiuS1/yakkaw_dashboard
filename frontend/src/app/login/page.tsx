"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import qs from 'qs';
import { Loader2, Eye, EyeOff, User, Lock, LogIn } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  useEffect(() => {
    // Check for remembered credentials
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      setFormData(prev => ({ ...prev, username: savedUsername, rememberMe: true }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    if (loginAttempts >= 5) {
      setError('Too many login attempts. Please try again later.');
      return;
    }
  
    setIsLoading(true);
    setError('');
  
    try {
      const response = await axios.post(
        'http://localhost:8080/login',
        qs.stringify({
          username: formData.username.trim(),
          password: formData.password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
          withCredentials: true,
        }
      );
  
      // Handle Remember Me functionality
      if (formData.rememberMe) {
        localStorage.setItem('rememberedUsername', formData.username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }
      
      router.push('/dashboard');
    } catch (err) {
      setLoginAttempts(prev => prev + 1);
      setError(
        err.response?.data?.message ||
        'Failed to login. Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Y A K K A W</h1>
          <p className="text-gray-600 mt-2">Secure access to your account</p>
        </div>
        
        <Card className="w-full shadow-xl border-0 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <CardHeader className="space-y-1 pb-4 pt-6">
            <CardTitle className="text-2xl font-bold text-center text-gray-800">
              Welcome to Yakkaw Admin
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-5">
              {error && (
                <Alert variant="destructive" className="animate-pulse border border-red-200 bg-red-50 text-red-800">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 font-medium">Username</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="pl-10 bg-gray-50 hover:bg-white focus:bg-white transition-colors border-gray-200 hover:border-indigo-300 focus:border-indigo-500 rounded-md"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                  <Button 
                    variant="link" 
                    className="px-0 font-normal text-indigo-600 hover:text-indigo-800"
                    type="button"
                    onClick={() => router.push('/forgot-password')}
                  >
                    Forgot password?
                  </Button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="pl-10 pr-10 bg-gray-50 hover:bg-white focus:bg-white transition-colors border-gray-200 hover:border-indigo-300 focus:border-indigo-500 rounded-md"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                  Remember me
                </Label>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 pt-2 pb-6">
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 h-11 rounded-md transition-colors"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in
                  </>
                )}
              </Button>
              
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>
              
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Button 
                  variant="link" 
                  className="px-0 text-indigo-600 hover:text-indigo-800 font-medium"
                  type="button"
                  onClick={() => router.push('/register')}
                >
                  Sign up
                </Button>
              </p>
            </CardFooter>
          </form>
        </Card>
        
        <p className="text-center text-xs text-gray-500 mt-8">
          © {new Date().getFullYear()} YAKKAW. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;