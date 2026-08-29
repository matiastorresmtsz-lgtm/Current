import type { Metadata } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "./context/ThemeContext";
import { AppSettingsProvider } from "./context/AppSettingsContext";
import { NotificationProvider } from './context/NotificationContext';
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://www.currentsocial.xyz'
  ),
  title: "Current — Social investing for crypto",
  description: "Track your crypto portfolio, AI advisory, and interactive learning.",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

//TODO: change metadata for social media

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className="h-full antialiased light"
      >
        <head>
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7915731043407251"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        </head>
        <body className="min-h-full flex flex-col bg-white text-gray-900 font-sans">
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
