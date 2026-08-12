import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "./context/ThemeContext";
import { AppSettingsProvider } from "./context/AppSettingsContext";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Current — Smart Crypto Portfolio & Market Intelligence",
  description: "Track your crypto portfolio, market analytics, and interactive learning powered by Current.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-[#161616] text-gray-100 font-sans">
          <ThemeProvider>
            <AppSettingsProvider>
              {children}
              <Analytics />
            </AppSettingsProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
