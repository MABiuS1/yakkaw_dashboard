'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff, User, Lock, LogIn } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";


export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Registration successful, redirect to login
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  return (
    <div  className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/assets/background.webp')",
      }}>
          
          <Card className="w-[90%] sm:w-[400px] bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg rounded-xl p-6">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold">
            Register Form
          </CardTitle>
        </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
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
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="pl-10 bg-white/10 text-white placeholder-white/60 border-white/30 focus:border-white focus:ring-white"
                      required
                    />
                  </div>
                </div>
                
                <div >
                  <Label htmlFor="password">Enter your password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                       className="pl-10 pr-10 bg-white/10 text-white placeholder-white/60 border-white/30 focus:border-white focus:ring-white"
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

                <div className="space-y-2">
                <Label htmlFor="password">Confirm password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                       className="pl-10 pr-10 bg-white/10 text-white placeholder-white/60 border-white/30 focus:border-white focus:ring-white"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
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
                      Creating account...
                    </>
                  ) : (
                    <>
                      
                      Create account
                    </>
                  )}
                </Button>
                
                <div className="relative my-2">
                  
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="px-2 text-white-500">Or</span>
                  </div>
                </div>
                
                <p className="text-sm text-white text-center">
                  Already have an account?{' '}
                  <Button 
                    variant="link" 
                    className="px-0 text-indigo-500 hover:text-indigo-700 font-medium"
                    type="button"
                    onClick={() => router.push('/login')}
                  >
                    Sign in
                  </Button>
                </p>
              </CardFooter>
            </form>
          </Card>
          
        
        </div>
 

  );
} 