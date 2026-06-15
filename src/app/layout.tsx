import type { Metadata } from "next";
import { Space_Mono, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { ClientToaster } from "@/components/providers/ClientToaster";
import "./globals.css";

const display = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
});

const body = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Adaptify",
  description: "Adaptive learning platform for self-paced mastery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="ink"
      className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}
    >
      <body className="min-h-screen bg-canvas text-text-primary">
        <Providers>{children}</Providers>
        <ClientToaster />
      </body>
    </html>
  );
}
