import type { Metadata } from "next";
import { Spline_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const splineSans = Spline_Sans({
  variable: "--font-spline-sans",
  subsets: ["latin"],
});

import Providers from "@/components/providers/Providers";
import OfflineGuard from "@/components/layout/OfflineGuard";

export const metadata: Metadata = {
  title: "monityai.com - Effortless Expense Tracking",
  description: "The smartest way to track expenses. Powered by AI, designed for humans.",
  appleWebApp: {
    capable: true,
    title: "monityai",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${splineSans.variable} antialiased font-display min-h-screen flex flex-col overflow-x-hidden`}
      >
        <OfflineGuard>
          <Providers>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
            </ThemeProvider>
          </Providers>
        </OfflineGuard>
      </body>
    </html>
  );
}
