"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/auth";

// Animation Variants matching the CSS in the HTML
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      const user = useAuthStore.getState().user;
      router.push(user?.role === "admin" ? "/admin/users" : "/dashboard");
    } catch (err) {
      // Error handled in store
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
      {/* Header / Logo */}
      <motion.div
        className="text-center mb-8"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="relative w-44 h-44 mx-auto mb-2 flex items-center justify-center">
          {/* Background Glows */}
          <div className="absolute w-44 h-44 bg-primary/10 rounded-full blur-xl animate-glow-pulse"></div>
          <div className="absolute w-32 h-32 bg-primary/20 rounded-full blur-md animate-glow-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute w-24 h-24 bg-blue-300/30 rounded-full blur-sm animate-glow-pulse" style={{ animationDelay: "2s" }}></div>

          {/* Rotating Ring */}
          <div className="absolute w-32 h-32 rounded-full border border-primary/20 border-dashed animate-rotate-ring"></div>

          {/* Floating Dots */}
          <div className="absolute w-full h-full pointer-events-none">
            <div className="absolute top-[15%] left-[25%] w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_5px_#3B82F6] animate-twinkle"></div>
            <div className="absolute top-[85%] right-[20%] w-2 h-2 bg-blue-300 rounded-full shadow-[0_0_6px_#93C5FD] animate-twinkle" style={{ animationDelay: "1s" }}></div>
            <div className="absolute top-[35%] right-[8%] w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_4px_#22D3EE] animate-twinkle" style={{ animationDelay: "0.5s" }}></div>
          </div>

          {/* Main Icon */}
          <div className="relative z-10 w-16 h-16 bg-white rounded-2xl shadow-[0_8px_20px_rgba(59,130,246,0.15)] border border-neutral-100 flex items-center justify-center text-primary animate-pulse-scale overflow-hidden p-1.5">
             <img src="/logo-only.svg" alt="Gamatutor Logo" className="w-full h-full object-contain relative z-10 drop-shadow-sm" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">Welcome back</h1>
        <p className="text-neutral-500 mt-1.5 text-sm">Log in to manage your study tasks</p>
      </motion.div>

      {/* Login Form */}
      <motion.form
        className="space-y-4"
        onSubmit={handleSubmit}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.1 }}
      >
        <Input
          label="Email"
          type="email"
          id="email"
          placeholder="student@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <PasswordInput
          label="Password"
          id="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          forgotPasswordHref="/forgot-password"
        />

        <div className="pt-4">
          <Button type="submit" isLoading={isLoading}>
            Login
          </Button>
        </div>
      </motion.form>

      {/* Bottom Link */}
      <motion.div
        className="mt-auto pt-8 text-center shrink-0"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.3 }}
      >
        <p className="text-sm text-neutral-500">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
