import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Remotion Studio — AI Animation Review",
  description: "Review, pick, and remix AI-generated animation variants for video production",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${mono.variable} dark`}>
      <body className="min-h-screen bg-[#0a0a12] text-white font-mono">{children}</body>
    </html>
  );
}
