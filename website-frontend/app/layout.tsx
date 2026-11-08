import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import AnnouncementBar from "./components/AnnouncementBar";
import { AuthProvider } from "./contexts/AuthContext";
// Head not needed with app router metadata

// One family, two voices: condensed heavy for display, normal width for reading.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const description =
  "The Technology Student Association chapter at NCSSM Durham: this season's events, key dates, resources and photos.";

export const metadata: Metadata = {
  // Absolute URLs for link previews (app/opengraph-image.jpg is picked up automatically)
  metadataBase: new URL(process.env.NEXT_PUBLIC_SELF_URL || "https://ncssm-tsa-hub.vercel.app"),
  title: {
    default: "NCSSM Durham TSA",
    template: "%s | NCSSM Durham TSA",
  },
  icons: {
    icon: "/static/favicon.ico",
    apple: "/static/apple-touch-icon.png",
  },
  description,
  openGraph: { siteName: "NCSSM Durham TSA", type: "website", description },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Browser extensions (e.g. Grammarly) add attributes to <body> before React loads. */}
      <body className={`${archivo.variable} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <Header />
          <AnnouncementBar />
          {children}
          <Footer />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
