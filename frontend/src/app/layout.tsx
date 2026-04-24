import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AgentationWrapper } from "@/components/AgentationWrapper";
import { FocusSessionBar } from "@/components/shared/FocusSessionBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Gamatutor ID",
  description: "Enhanced Kanban PWA for Self-Regulated Learning",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-512x512-secondary.svg",
    shortcut: "/icon-512x512-secondary.svg",
    apple: "/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gamatutor ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <FocusSessionBar />
        <AgentationWrapper />
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: "var(--font-geist-sans)",
              borderRadius: "12px",
              fontSize: "14px",
              padding: "12px 16px",
              boxShadow: "0 8px 30px -4px rgba(0,0,0,0.08)",
            },
          }}
        />
      </body>
    </html>
  );
}
