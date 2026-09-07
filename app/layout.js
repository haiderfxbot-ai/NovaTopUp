import "./globals.css";

export const metadata = {
  title: "NovaTopUp — Instant Game & Social Top-Ups",
  description:
    "Buy Free Fire Diamonds, PUBG UC, TikTok Coins and more, with instant tracked orders.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
