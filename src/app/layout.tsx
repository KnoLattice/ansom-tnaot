import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { ClientToaster } from "@/components/providers/ClientToaster";
import "./globals.css";

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});

const body = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
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
      className={`${display.variable} ${body.variable} antialiased`}
    >
      <body className="min-h-screen bg-canvas text-text-primary">
        <Providers>{children}</Providers>
        <ClientToaster />
      </body>
    </html>
  );
}
