import { Inter, Inconsolata } from "next/font/google";

import "@/styles/globals.css";
import AppShell from "@/components/AppShell";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/contexts/AuthProvider";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inconsolata = Inconsolata({
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
        className={`${inter.variable} ${inconsolata.variable} antialiased bg-slate-50 text-gray-800`}
      >

        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <AppShell>{children}</AppShell>
            </main>
          </div>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
