"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect to home if user is already authenticated
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  if (user) {
    return null; // Or a loading state while redirecting
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md border-slate-200 shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <div className="bg-indigo-600 w-10 h-10 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">VL</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">Welcome to Virtual Lab</CardTitle>
            <CardDescription className="text-slate-600">
              Access the lab as a guest and explore our experiments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <button
                className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 transition-colors"
                onClick={() => router.push("/")}
              >
                Enter as Guest
              </button>
            </div>

            <p className="mt-6 text-xs text-center text-slate-500">
              Authentication is currently disabled.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}