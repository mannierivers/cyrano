import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// --- Font Configuration ---
// Inter is the industry standard for ultra-modern tech interfaces.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// --- Viewport Configuration ---
// This ensures the app looks like a native "OS" on mobile devices.
export const viewport: Viewport = {
  themeColor: "#020202",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Fix for notch-displays on modern phones
};

// --- SEO Metadata ---
// Optimized for search visibility and "Open Graph" social sharing.
export const metadata: Metadata = {
  title: {
    default: "SUBTX // Neural Social Intelligence",
    template: "%s | SUBTX",
  },
  description: "Decode the unsaid. SUBTX is a real-time neural social intelligence layer providing latent subtext analysis and social scaffolding for high-stakes communication.",
  keywords: [
    "Social Intelligence AI", 
    "Neurodivergent Scaffolding", 
    "Real-time Social Coaching", 
    "Subtext Analysis", 
    "SUBTX OS",
    "Social AI PWA"
  ],
  authors: [{ name: "Mannie Rivers" }], 
  metadataBase: new URL("https://subtx.link"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SUBTX // Neural Social Intelligence",
    description: "Establish your link to the social subtext. Real-time neural AI for neurodivergent success.",
    url: "https://subtx.link",
    siteName: "SUBTX",
    images: [
      {
        url: "/og-image.png", 
        width: 1200,
        height: 630,
        alt: "SUBTX Neural Interface Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SUBTX // Neural Social Intelligence",
    description: "Decode the unsaid. Real-time social AI for high-stakes social environments.",
    images: ["/og-image.png"],
    creator: "@your_handle",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // --- Structured Data (JSON-LD) ---
  // This helps Google's AI understand your app is a high-tech tool.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SUBTX",
    "description": "Real-time neural social intelligence protocol providing social scaffolding and sentiment analysis.",
    "operatingSystem": "iOS, Android, Windows, macOS",
    "applicationCategory": "HealthApplication, MultimediaApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "author": {
      "@type": "Person",
      "name": "Your Name",
    },
  };

  return (
    <html lang="en" className="dark">
      <head>
        {/* Injecting Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* PWA Specific Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${inter.variable} font-sans bg-[#020202] text-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}