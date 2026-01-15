import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Import the font
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Cyrano",
  description: "Your friendly social buddy",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Apply the font variable to the body */}
      <body className={`${inter.variable} font-sans bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}