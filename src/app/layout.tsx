import type { Metadata } from "next";
import { Lora, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin", "latin-ext"],
  variable: "--font-lora",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bärenstuben Ferienwohnungen | Esens an der Oldendorfer Straße",
    template: "%s | Bärenstuben Ferienwohnungen",
  },
  description:
    "Komfortable Ferienwohnungen in Esens. Modern eingerichtete Apartments für Ihren erholsamen Aufenthalt – zentral gelegen, liebevoll ausgestattet.",
  keywords: [
    "Ferienwohnung",
    "Esens",
    "Apartment",
    "Unterkunft",
    "Bärenstuben",
    "Ferienwohnung Esens",
  ],
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Bärenstuben Ferienwohnungen",
  },
  icons: {
    icon: "/favbär.svg",
    shortcut: "/favbär.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${lora.variable} ${sourceSans.variable}`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
