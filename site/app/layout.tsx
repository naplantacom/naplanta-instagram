import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { getSiteConfig } from "@/services/site";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://naplanta.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NaPlanta Imobiliária — Imóveis em São José e Florianópolis",
    template: "%s · NaPlanta",
  },
  description:
    "Da planta às chaves. Apartamentos, casas e lançamentos para comprar e alugar em São José, Florianópolis e região.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "NaPlanta Imobiliária",
    url: SITE_URL,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { modo_copa } = await getSiteConfig();
  return (
    <html lang="pt-BR" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans">
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppFab modoCopa={modo_copa} />
      </body>
    </html>
  );
}
