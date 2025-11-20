import { Inter, Playfair_Display, Lato, Fredoka, Quicksand, Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import "./themes.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const lato = Lato({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-lato" });
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka" });
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-quicksand" });
const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-press-start" });
const vt323 = VT323({ weight: "400", subsets: ["latin"], variable: "--font-vt323" });

export const metadata = {
  title: "BirthdayGen - Create Magic",
  description: "Generate personalized birthday pages in seconds.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${lato.variable} ${fredoka.variable} ${quicksand.variable} ${pressStart.variable} ${vt323.variable}`}>
        {children}
      </body>
    </html>
  );
}
