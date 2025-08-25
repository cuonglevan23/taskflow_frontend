import type { Metadata } from "next";
import { ThemeProvider } from "@/layouts/hooks/useTheme";
import "./globals.css";
import { DetailPanelProvider } from "@/contexts/DetailPanelContext";
import { AppProvider } from "@/contexts/AppProvider";
import { NextAuthProvider } from "@/providers";
import { SWRProvider } from "@/providers/SWRProvider";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "TaskManager - Project Management Made Simple",
  description:
    "Streamline your projects management with our comprehensive task management solution. Built for teams of all sizes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {/* Disable StrictMode in production to reduce duplicate renders */}
        <NextAuthProvider>
          <SWRProvider>
            <ThemeProvider defaultTheme="dark" storageKey="taskmanagement-theme">
              <AppProvider>
                <DetailPanelProvider>{children}</DetailPanelProvider>
              </AppProvider>
            </ThemeProvider>
          </SWRProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
