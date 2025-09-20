import type { Metadata } from "next";
import { AppProviders } from "@/providers";
import "./globals.css";
import { DetailPanelProvider } from "@/contexts/DetailPanelContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SWRProvider } from "@/providers/SWRProvider";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AppProvider } from "@/contexts/AppProvider";
import { NotificationProvider } from "@/components/ui/NotificationProvider";

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
        <AppProviders defaultTheme="dark" enableBackendSync={true}>
          <AuthProvider>
            <SWRProvider>
              <ChatProvider>
                <NotificationProvider>
                  <DetailPanelProvider>
                    <AppProvider>{children}</AppProvider>
                  </DetailPanelProvider>
                </NotificationProvider>
              </ChatProvider>
            </SWRProvider>
          </AuthProvider>
        </AppProviders>
      </body>
    </html>
  );
}
