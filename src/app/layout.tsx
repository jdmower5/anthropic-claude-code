import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Green Touch Business Hub",
  description: "Manage communications, financials, marketing, and crew efficiency for Green Touch.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
