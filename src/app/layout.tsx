import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KoopManager - Influencer-Kooperationen verwalten",
  description:
    "Zentrale Plattform für Social Media Manager und Agenturen zur Verwaltung von Influencer-Kooperationen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">{children}</body>
    </html>
  );
}
