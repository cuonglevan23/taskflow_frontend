import type { Metadata } from "next";
import { ThemeProvider } from "@/layouts/hooks/useTheme";
import "./globals.css";
import { DetailPanelProvider } from "@/components/DetailPanel";
import { AppProvider } from "@/contexts/AppProvider";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "TaskManager - Project Management Made Simple",
  description:
    "Streamline your project management with our comprehensive task management solution. Built for teams of all sizes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="dark" storageKey="taskmanagement-theme">
          <AppProvider>
            <DetailPanelProvider>{children}</DetailPanelProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
