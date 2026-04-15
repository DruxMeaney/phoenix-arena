import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { EmberEffect } from "@/components/ember-effect";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Phoenix Arena — Plataforma Competitiva de Habilidad",
  description: "Compite, demuestra tu habilidad y gana premios reales. La plataforma competitiva de referencia para jugadores de LATAM.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Phoenix Arena",
    description: "Donde la habilidad se convierte en premio. Retos 1v1, torneos y ranking profesional para jugadores de LATAM.",
    url: "https://phoenix-arena.vercel.app",
    siteName: "Phoenix Arena",
    images: [
      {
        url: "https://phoenix-arena.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Phoenix Arena — Plataforma Competitiva",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  other: {
    "og:image:width": "1200",
    "og:image:height": "630",
    "og:image:type": "image/jpeg",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phoenix Arena — Plataforma Competitiva de Habilidad",
    description: "Donde la habilidad se convierte en premio. Retos 1v1, torneos y ranking profesional para jugadores de LATAM.",
    images: ["https://phoenix-arena.vercel.app/og-image.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-dvh flex flex-col relative">
        <EmberEffect />
        <Navbar />
        <main className="flex-1 relative z-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
