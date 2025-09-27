import type { Metadata } from "next";
import { Toaster } from 'react-hot-toast';
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
import GlobalTrialBanner from "@/components/Banner/GlobalTrialBanner";

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

// Inner component to access AuthProvider context
function AppContent({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders
      defaultTheme="dark"
      enableBackendSync={true}
      // Remove hardcoded values - let providers handle their own auth state
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
                  <AppProvider>
                    {/* 🎯 Global Trial Banner - Shows on ALL authenticated pages */}
                    <GlobalTrialBanner />
                    {children}
                  </AppProvider>
                </DetailPanelProvider>
              </NotificationProvider>
            </ChatBotProvider>
          </ChatProvider>
        </StripeProvider>
      </SWRProvider>
    </AppProviders>
  );
}

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
          <AppContent>
            {children}
          </AppContent>
        </AuthProvider>

        {/* Add Toaster component for react-hot-toast notifications */}
        <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: "text-white rounded-lg shadow-lg", // áp dụng chung
              success: {
                className: "bg-green-500 text-white", // background xanh chuẩn Tailwind
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                className: "bg-red-500 text-white", // background đỏ chuẩn Tailwind
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
        />

      </body>
    </html>
  );
}
