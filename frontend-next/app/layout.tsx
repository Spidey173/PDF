import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leaf Archives — Scroll Deciphering & Retrieval Jutsu",
  description:
    "RAG-Powered Scroll Archive and Deciphering system. Upload shinobi scrolls and documents, get instant answers with citation grounding, chakra records analysis, and executive summaries.",
  keywords: [
    "Naruto",
    "Scroll Archives",
    "Shinobi",
    "RAG",
    "Jutsu",
    "Deciphering Engine",
    "AI",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Permanent+Marker&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0b0c10] text-[#f1f5f9] antialiased">
        {children}
      </body>
    </html>
  );
}

