import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "./context/ThemeContext";
import { AppSettingsProvider } from "./context/AppSettingsContext";
import { NotificationProvider } from './context/NotificationContext';
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Current — Smart Crypto Portfolio & Market Intelligence",
  description: "Track your crypto portfolio, market analytics, and interactive learning powered by Current.",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
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
        className="h-full antialiased"
      >
        <body className="min-h-full flex flex-col bg-[#161616] text-gray-100 font-sans">
          <ThemeProvider>
            <AppSettingsProvider>
              <NotificationProvider>
                {children}
                <Analytics />
              </NotificationProvider>
            </AppSettingsProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
