import type { Metadata } from "next";
import { Noto_Sans_Sinhala, Abhaya_Libre } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/AuthProvider";

const notoSansSinhala = Noto_Sans_Sinhala({
  variable: "--font-inter",
  subsets: ["sinhala", "latin"],
  weight: ["400", "600", "700"], // reduced from 5 to 3 weights
  display: "swap",              // prevent render-blocking
  preload: true,
});

const abhayaLibre = Abhaya_Libre({
  variable: "--font-playfair",
  subsets: ["sinhala", "latin"],
  weight: ["400", "700", "800"], // reduced from 5 to 3 weights
  display: "swap",              // prevent render-blocking
  preload: false,               // only preload body font, not serif
});

export const metadata: Metadata = {
  title: "සුභද්‍රා ආරත්නායක ජ්‍යෝතිෂ්‍ය | ඔබගේ තරු මාර්ගෝපදේශකයා",
  description: "සුභද්‍රා ආරත්නායක සමඟින් ඔබේ දෛනික පලාපල, ලග්න විස්තර සහ පෞද්ගලීකරණය කළ ජ්‍යෝතිෂ්‍ය කියවීම් සොයා ගන්න.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="si" className={`${notoSansSinhala.variable} ${abhayaLibre.variable}`}>
      <head>
        {/* Preconnect to external domains for faster resource fetching */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://horoscope-app-api.vercel.app" />
        <link rel="dns-prefetch" href="https://translate.googleapis.com" />
      </head>
      <body className="galaxy-bg text-foreground min-h-screen flex flex-col antialiased">
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1a1f36',
              color: '#fff',
              border: '1px solid #3f4766',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
