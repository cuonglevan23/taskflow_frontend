import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Management App",
  description: "A modern task management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="max-h-screen bg-white">
        {children}
      </body>
    </html>
  );
}
