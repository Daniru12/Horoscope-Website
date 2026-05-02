import type { Metadata } from "next";
import { Noto_Sans_Sinhala, Abhaya_Libre } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const notoSansSinhala = Noto_Sans_Sinhala({
  variable: "--font-inter", // keeping the variable name the same so we don't have to change globals.css
  subsets: ["sinhala", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const abhayaLibre = Abhaya_Libre({
  variable: "--font-playfair", // keeping the variable name the same
  subsets: ["sinhala", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "සුභද්‍රා ආරත්නායක ජ්‍යෝතිෂ්‍ය | ඔබගේ තරු මාර්ගෝපදේශකයා",
  description: "සුභද්‍රා ආරත්නායක සමඟින් ඔබේ දෛනික පලාපල, ලග්න විස්තර සහ පෞද්ගලීකරණය කළ ජ්‍යෝතිෂ්‍ය කියවීම් සොයා ගන්න.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="si" className={`${notoSansSinhala.variable} ${abhayaLibre.variable}`}>
      <body className="galaxy-bg text-foreground min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
