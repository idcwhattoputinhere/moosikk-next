import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Rey's Moosikk 🎵",
  description: "A lightweight music player built with Next.js.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon-1024.png",
  },
  authors: {
    name: "Reyansh",
    url: "https://github.com/reyansh-khobragade",
  },
  manifest: "/manifest.json",
  keywords: [
    "moosikk",
    "next.js",
    "react",
    "typescript",
    "tailwindcss",
    "server-side",
    "web",
    "api",
    "search",
    "stream",
    "audio",
    "music",
    "youtube",
  ],
  creator: "Rey",
  applicationName: "Moosikk",
  referrer: "origin-when-cross-origin",
  publisher: "Rey",
  openGraph: {
    title: "Rey's Moosikk 🎵",
    description: "A lightweight music player built with Next.js.",
    url: "https://github.com/reyansh-khobragade",
    siteName: "Rey's Moosikk",
    images: [
      {
        url: "https://moosikk.vercel.app/icon-512.png",
        width: 512,
        height: 512,
        alt: "Moosikk Cover",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Rey's Moosikk 🎵",
    description: "Moosikk Reborn in Next.js!",
    creator: "@elonmusk",
    images: [
      "https://moosikk.vercel.app/icon-512.png",
    ],
  },
  robots: {
    index: true,
    follow: true,
    noimageindex: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="mx-auto max-w-4xl p-4">
          {children}
          <Toaster richColors position="top-right" />
        </div>
      </body>
    </html>
  );
}
