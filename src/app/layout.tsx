import type { Metadata } from "next";
import { Space_Mono, DM_Sans, Poppins, Oswald } from "next/font/google";
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

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-oswald",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "KnowLattice",
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
      className={`${display.variable} ${body.variable} ${oswald.variable} ${poppins.variable} antialiased`}
    >
      <body className="min-h-screen bg-canvas text-text-primary">
        <Providers>{children}</Providers>
        <ClientToaster />
      </body>
    </html>
  );
}
