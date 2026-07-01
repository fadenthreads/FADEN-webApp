import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { LocaleSync } from "@/components/i18n/locale-sync";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600"],
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FADEN — Where Fashion Begins with Trust",
  description: "Discover highly rated boutiques, browse designer portfolios and get your dream outfits created with confidence.",
  keywords: ["boutique", "custom fashion", "tailor", "designer", "lehenga", "saree", "bridal wear"],
  authors: [{ name: "FADEN" }],
  openGraph: {
    type: "website", locale: "en_IN", url: "https://faden.in", siteName: "FADEN",
    title: "FADEN — Where Fashion Begins with Trust",
    description: "Discover highly rated boutiques, browse designer portfolios and get your dream outfits created with confidence.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "FADEN — Where Fashion Begins with Trust" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FADEN — Where Fashion Begins with Trust",
    description: "Discover highly rated boutiques, browse designer portfolios and get your dream outfits created with confidence.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
          <LocaleSync />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
