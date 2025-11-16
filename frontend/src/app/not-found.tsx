import Link from "next/link";
import { AlertTriangle, ArrowLeft, Home, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 relative overflow-hidden"
      style={{ backgroundImage: "url('/assets/background.webp')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      <div className="relative w-[95%] sm:w-[560px] bg-white/5 backdrop-blur-xl text-white border border-white/15 shadow-2xl rounded-2xl p-8 space-y-7 overflow-hidden">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-52 w-52 rounded-full bg-indigo-600/25 blur-3xl" />

        <div className="flex items-center gap-3 text-indigo-50">
          <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-yellow-300" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">
              Error 404
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">
              Page not found
            </h1>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-white/80 text-lg">
            We tracked the route you were looking for, but it has been moved or does not exist.
          </p>
          <p className="text-white/60">
            Try one of these quick links, or check the address and try again.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button asChild className="w-full bg-white text-black hover:bg-gray-100">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Go to dashboard
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full border-white/30 text-white hover:bg-white/10"
          >
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-white/70">
          <Compass className="h-4 w-4 text-indigo-200" />
          <span>Need another destination? Contact support to get directions.</span>
        </div>
      </div>
    </div>
  );
}
