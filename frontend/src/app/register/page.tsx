'use client';

import { useEffect, useMemo, useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, EyeOff, User, Lock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';

type FormData = {
  username: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formError, setFormError] = useState('');     // error แบบรวมจาก API หรือ validation ใหญ่ ๆ
  const [fieldErrors, setFieldErrors] = useState<{[K in keyof FormData]?: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // พรีโหลดหน้า /login ให้สลับหน้าเร็วขึ้นหลังสมัครเสร็จ
    router.prefetch('/login');
  }, [router]);

  const validate = (data: FormData) => {
    const errs: {[K in keyof FormData]?: string} = {};

    const username = data.username.trim();
    if (!username) {
      errs.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9._-]{3,20}$/.test(username)) {
      errs.username = '3–20 chars: letters, numbers, dot, underscore, hyphen';
    }

    const pwd = data.password;
    if (!pwd) {
      errs.password = 'Password is required';
    } else {
      const tooShort = pwd.length < 8;
      const hasLower = /[a-z]/.test(pwd);
      const hasUpper = /[A-Z]/.test(pwd);
      const hasNumber = /[0-9]/.test(pwd);
      if (tooShort || !hasLower || !hasUpper || !hasNumber) {
        errs.password = 'Min 8 chars, include upper/lowercase and a number';
      }
    }

    if (!data.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (data.confirmPassword !== pwd) {
      errs.confirmPassword = 'Passwords do not match';
    }

    return errs;
  };

  // เพื่อปิดปุ่มเมื่อฟอร์มยังไม่พร้อม
  const isFormValid = useMemo(() => {
    const errs = validate(formData);
    return Object.keys(errs).length === 0;
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
    // อัปเดต error แบบ realtime ของช่องนั้น ๆ
    const next = { ...formData, [e.target.name]: e.target.value };
    setFieldErrors(validate(next));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const errs = validate(formData);
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ส่งเฉพาะที่จำเป็น ไม่ต้องส่ง confirmPassword
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
        }),
        // ถ้าเซิร์ฟเวอร์ส่งคุกกี้หลังสมัคร (เช่น auto-login) ให้เปิดบรรทัดนี้
        // credentials: 'include',
        signal: AbortSignal.timeout(10000),
      });

      let data: any = null;
      try { data = await res.json(); } catch { /* ถ้า body ว่างก็ผ่านไป */ }

      if (!res.ok) {
        // พยายามดึงข้อความ error จากเซิร์ฟเวอร์ (เช่น {error: "..."} หรือ {message: "..."})
        const msg = data?.error || data?.message || (res.status === 409
          ? 'Username already exists'
          : 'Registration failed');
        throw new Error(msg);
      }

      // สมัครสำเร็จ → ไปหน้า login (ใช้ transition ให้ UI ไม่ค้าง)
      startTransition(() => {
        router.push('/login');
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/background.webp')" }}
    >
      <Card className="w-[90%] sm:w-[400px] bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg rounded-xl p-6">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold">Register Form</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-5">

            {formError && (
              <Alert variant="destructive" className="border border-red-300 bg-red-100 text-red-800">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {/* Username */}
            <div>
              <Label htmlFor="username">Enter your username</Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="h-4 w-4 text-white/70" />
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
                  autoComplete="username"
                  required
                />
              </div>
              {fieldErrors.username && (
                <p className="mt-1 text-xs text-red-300">{fieldErrors.username}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Enter your password</Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-4 w-4 text-white/70" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="pl-10 pr-10 bg-white/10 text-white placeholder-white/60 border-white/30 focus:border-white focus:ring-white"
                  autoComplete="new-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-300" /> : <Eye className="h-4 w-4 text-gray-300" />}
                </Button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-300">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-4 w-4 text-white/70" />
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
                  autoComplete="new-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-300" /> : <Eye className="h-4 w-4 text-gray-300" />}
                </Button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-300">{fieldErrors.confirmPassword}</p>
              )}
            </div>

          </CardContent>

          <CardFooter className="mt-4 flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-gray-100 disabled:opacity-70"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>Create account</>
              )}
            </Button>

            <div className="relative my-2">
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 text-white/70">Or</span>
              </div>
            </div>

            <p className="text-sm text-white text-center">
              Already have an account?{' '}
              <Button
                variant="link"
                className="px-0 text-indigo-400 hover:text-indigo-300 font-medium"
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
