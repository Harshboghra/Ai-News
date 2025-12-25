import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "AI News Blend",
  description: "Real-time AI-powered news aggregation and search",
  keywords: ["news", "AI", "aggregation", "search", "real-time"],
  authors: [{ name: "AI News Team" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  openGraph: {
    title: "AI News Blend",
    description: "Real-time AI-powered news aggregation and search",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
