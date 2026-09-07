import { Inter, Playfair_Display, Lato, Fredoka, Quicksand, Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import "./themes.css";
import { getWebSiteSchema, getOrganizationSchema } from "@/lib/seo";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday.nirbhay.online';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const lato = Lato({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-lato", display: "swap" });
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", display: "swap" });
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-quicksand", display: "swap" });
const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-press-start", display: "swap" });
const vt323 = VT323({ weight: "400", subsets: ["latin"], variable: "--font-vt323", display: "swap" });

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "BirthdayGen | Free Birthday Website Maker",
    template: "%s | BirthdayGen",
  },
  description: "Make a free personalized birthday website in seconds — interactive cards with photos, music, messages and mic-powered candle blowing. No signup, WhatsApp-ready.",
  keywords: [
    "birthday website maker",
    "free birthday website",
    "make a birthday website",
    "birthday website generator",
    "personalized birthday website",
    "birthday card generator",
    "online birthday greeting card",
    "virtual candle blowing card",
    "digital birthday wish maker",
    "interactive birthday card free",
    "birthday photo gallery card",
  ],
  authors: [{ name: "BirthdayGen Team", url: baseUrl }],
  creator: "BirthdayGen",
  publisher: "BirthdayGen",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BirthdayGen | Free Birthday Website Maker",
    description: "Design a beautiful, personalized birthday website with custom message, music, photos, and virtual candles — free, no signup.",
    url: baseUrl,
    siteName: "BirthdayGen",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/api/og?name=Friend&theme=fun",
        width: 1200,
        height: 630,
        alt: "BirthdayGen - Free Birthday Website Maker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BirthdayGen | Free Birthday Website Maker",
    description: "Make someone's birthday unforgettable with a personalized birthday website — cards, photos, music and candle blowing.",
    creator: "@birthdaygen",
    images: ["/api/og?name=Friend&theme=fun"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  themeColor: "#9333ea",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  const websiteSchema = getWebSiteSchema(baseUrl);
  const organizationSchema = getOrganizationSchema(baseUrl);

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${lato.variable} ${fredoka.variable} ${quicksand.variable} ${pressStart.variable} ${vt323.variable}`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
