import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Niche Generator | Expert Freedom",
  description:
    "Find the AI services you're best positioned to sell. Answer 5 questions about your background and find your AI service sweet spot in 3 minutes.",
  openGraph: {
    title: "AI Niche Generator | Expert Freedom",
    description: "Find the AI services you're best positioned to sell. Takes 3 minutes.",
    siteName: "Expert Freedom",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fjalla+One&family=Instrument+Serif:ital@0;1&family=Karla:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Prata&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
