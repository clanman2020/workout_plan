import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workout Plan Builder",
  description: "Build a simple workout plan from your goals and equipment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
