import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YouPulse • Day of Integration | YouCode Youssoufia",
  description:
    "Official YouCode Day of Integration Platform by YouPulse (BDE YouCode Youssoufia). Live games rotation, scoring, station roadmap & clue hunt.",
  icons: {
    icon: "/youpulse-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#07090e] text-[#ffffff] antialiased selection:bg-[#0066ff] selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
