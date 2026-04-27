"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative blurred blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-blue-300/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        {/* Lost compass illustration */}
        <motion.div
          className="relative w-40 h-40 mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-neutral-200 animate-[spin_12s_linear_infinite]" />
          {/* Inner ring */}
          <div className="absolute inset-4 rounded-full border border-neutral-100" />
          {/* Center compass */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: [0, 10, -10, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Compass className="w-16 h-16 text-primary/80" strokeWidth={1.5} />
          </motion.div>
          {/* Floating dots */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary/40 rounded-full" />
          <div className="absolute bottom-4 right-6 w-1.5 h-1.5 bg-blue-400/50 rounded-full" />
          <div className="absolute bottom-8 left-5 w-1 h-1 bg-neutral-300 rounded-full" />
        </motion.div>

        {/* Error code */}
        <motion.h1
          className="text-7xl font-bold text-neutral-900 tracking-tight mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          404
        </motion.h1>

        {/* Title */}
        <motion.h2
          className="text-xl font-semibold text-neutral-700 mb-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Tersesat di Perjalanan?
        </motion.h2>

        {/* Description */}
        <motion.p
          className="text-neutral-500 text-sm leading-relaxed mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Sepertinya halaman yang kamu cari tidak ada di peta pembelajaran ini.
          Jangan khawatir, setiap perjalanan pasti punya jalan pulang.
        </motion.p>

        {/* Action buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 w-full"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20"
          >
            <Home className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-100 text-neutral-700 font-medium text-sm hover:bg-neutral-200 transition-colors"
          >
            Halaman Sebelumnya
          </button>
        </motion.div>
      </div>
    </div>
  );
}
