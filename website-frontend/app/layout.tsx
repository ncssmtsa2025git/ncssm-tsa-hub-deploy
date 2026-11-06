import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { AuthProvider } from "./contexts/AuthContext";
// Head not needed with app router metadata

// One family, two voices: condensed heavy for display, normal width for reading.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NCSSM Durham TSA",
    template: "%s | NCSSM Durham TSA",
  },
  icons: {
    icon: "/static/favicon.ico",
  },
  description: "Student dashboard and resources for NCSSM Durham TSA",
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
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
