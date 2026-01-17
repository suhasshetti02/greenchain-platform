import { Geist, Geist_Mono } from "next/font/google";

import "@/styles/globals.css";
import AppShell from "@/components/AppShell";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/contexts/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata = {
  title: "GreenChain | Food-Waste Redistribution",
  description:
    "Operational console for tracking donations, requests, and logistics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-gray-800`}
      >
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <AppShell>{children}</AppShell>
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
