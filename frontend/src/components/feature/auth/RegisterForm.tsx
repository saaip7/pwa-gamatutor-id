"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

// Animation Variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) return;
    
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      console.log("Registered:", { name, email, password });
      // router.push("/onboarding");
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
      {/* Header / Logo */}
      <motion.div
        className="text-center mb-10"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-[15px] mb-4 overflow-hidden">
          <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect x="5" y="5" width="502" height="502" rx="115" fill="#F8F9FA"/>
            <rect x="5" y="5" width="502" height="502" rx="115" stroke="#E5E7EB" strokeWidth="10"/>
            <path d="M290.536 163.071C308.147 166.078 324.534 173.106 338.72 183.144C327.616 184.972 318.165 194.96 318.165 206.33C318.165 218.918 326.989 222.908 339.578 222.908C349.692 220.246 355.701 211.429 360.139 202.467C378.663 223.624 390 251.204 390 280.928C388.111 316.059 372.77 348.504 348.648 370.694L331.979 357.598C327.835 361.282 319.41 368.787 318.856 369.34C318.304 369.893 301.127 375.097 292.608 377.629C276.264 380.392 243.442 386.053 242.877 386.608C242.407 387.078 238.904 391.248 236.451 394.183C207.649 384.207 183.354 363.036 168.704 336.292L194.525 313.392L233.206 278.166L249.093 263.66L278.794 288.526L279.345 289.001C285.027 293.801 289.998 295.433 298.134 295.433C316.826 295.433 331.979 279.971 331.979 260.897C331.979 241.823 316.826 226.361 298.134 226.361C295.521 226.361 292.978 226.663 290.536 227.235V207.021H301.588V207.004C301.817 207.014 302.048 207.021 302.279 207.021C311.053 207.021 318.165 199.908 318.165 191.134C318.165 182.361 311.053 175.248 302.279 175.248C302.048 175.248 301.817 175.253 301.588 175.263V175.248H290.536V163.071Z" fill="#83B2FF"/>
            <mask id="mask0_32_5" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="168" y="163" width="222" height="232">
              <path opacity="0.5" d="M290.536 163.071C308.147 166.078 324.533 173.106 338.719 183.144C327.615 184.972 318.165 194.961 318.165 206.33C318.165 218.919 326.989 222.907 339.577 222.907C349.692 220.246 355.701 211.429 360.14 202.466C378.664 223.623 390 251.203 390 280.928C388.111 316.059 372.771 348.505 348.648 370.695L331.979 357.598C327.835 361.282 319.408 368.788 318.856 369.34C318.303 369.893 301.127 375.096 292.608 377.629C276.261 380.392 243.429 386.056 242.876 386.608C242.406 387.079 238.906 391.248 236.453 394.183C207.651 384.208 183.355 363.037 168.705 336.292L194.526 313.392L233.206 278.165L249.093 263.66L278.794 288.526C284.71 293.693 289.736 295.433 298.134 295.433C316.826 295.433 331.979 279.971 331.979 260.897C331.979 254.762 330.41 249.003 327.661 244.009L330.705 240.557L324.558 239.32C318.356 231.421 308.825 226.361 298.134 226.361C295.522 226.361 292.979 226.663 290.536 227.235V207.021H301.588V207.003C301.817 207.013 302.047 207.021 302.278 207.021C311.052 207.021 318.165 199.908 318.165 191.134C318.165 182.36 311.052 175.248 302.278 175.248C302.047 175.248 301.817 175.254 301.588 175.264V175.248H290.536V163.071Z" fill="#D9D9D9"/>
            </mask>
            <g mask="url(#mask0_32_5)">
              <path d="M291.226 332.041V291.289L280.175 282.309L249.092 260.206L226.989 279.547L291.226 332.041Z" fill="#3B82F6"/>
            </g>
            <path d="M206.268 151.763L291.918 82V283L249.093 245.701L206.268 283V151.763Z" fill="#3B82F6"/>
            <mask id="mask1_32_5" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="206" y="82" width="86" height="202">
              <path d="M206.268 151.763L291.918 82V283L249.093 245.701L206.268 283V151.763Z" fill="#D9D9D9"/>
            </mask>
            <g mask="url(#mask1_32_5)">
              <path d="M302.279 159.361L206.268 231.887L202.124 234.65L201.433 290.598H297.444L302.279 159.361Z" fill="#2C71E2"/>
            </g>
            <path d="M193.835 313.392L233.206 278.165L334.504 359.6C311.984 382.253 280.796 396.279 246.33 396.279C177.665 396.279 122 340.614 122 271.949C122 222.042 151.405 179.003 193.835 159.213V313.392Z" fill="#3B82F6"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-neutral-800 tracking-tight">Create an account</h1>
        <p className="text-neutral-500 mt-1.5 text-sm">Sign up to start managing your study tasks</p>
      </motion.div>

      {/* Register Form */}
      <motion.form
        className="space-y-4"
        onSubmit={handleSubmit}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.1 }}
      >
        <Input
          label="Full Name"
          type="text"
          id="name"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />

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
          autoComplete="new-password"
        />

        {/* Terms & Conditions Checkbox */}
        <div className="flex items-start gap-3 pt-2">
          <div className="flex items-center h-5">
            <input
              id="terms"
              type="checkbox"
              className="w-4 h-4 bg-neutral-50 border-neutral-200 rounded text-primary focus:ring-primary focus:ring-2 accent-primary"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              required
            />
          </div>
          <label htmlFor="terms" className="text-xs text-neutral-500 font-medium leading-tight">
            I agree to the{" "}
            <Link href="/terms" className="text-primary hover:text-primary-hover transition-colors">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:text-primary-hover transition-colors">
              Privacy Policy
            </Link>
          </label>
        </div>

        <div className="pt-4">
          <Button type="submit" isLoading={isLoading} disabled={!termsAccepted}>
            Create Account
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
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
