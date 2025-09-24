import type { Metadata } from "next";
import { AppProviders } from "@/providers";
import "./globals.css";
import { DetailPanelProvider } from "@/contexts/DetailPanelContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ChatBotProvider } from "@/contexts/ChatBotContext";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SWRProvider } from "@/providers/SWRProvider";
import { StripeProvider } from "@/providers/StripeProvider";
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
        <AuthProvider>
          <AppProviders
            defaultTheme="dark"
            enableBackendSync={true}
            isAuthenticated={true}
            isAuthLoading={false}
          >
            <SWRProvider>
              <StripeProvider>
                <ChatProvider>
                  <ChatBotProvider
                    autoLoadConversations={true}
                    autoLoadConfig={true}
                  >
                    <NotificationProvider>
                      <DetailPanelProvider>
                        <AppProvider>{children}</AppProvider>
                      </DetailPanelProvider>
                    </NotificationProvider>
                  </ChatBotProvider>
                </ChatProvider>
              </StripeProvider>
            </SWRProvider>
          </AppProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
