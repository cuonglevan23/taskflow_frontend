import type { Metadata } from "next";
import { ThemeProvider } from "@/layouts/hooks/useTheme";
import "./globals.css";
import { DetailPanelProvider } from "@/contexts/DetailPanelContext";
import { AppProvider } from "@/contexts/AppProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SWRProvider } from "@/providers/SWRProvider";
import { ChatProvider } from "@/contexts/ChatContext";
import { GlobalDataProvider } from "@/contexts/GlobalDataContext";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ChatManager } from "@/components/chat/ChatManager"; // ✅ THÊM: Import ChatManager

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
        {/* Sử dụng AuthProvider mới thay vì NextAuth - backend JWT only */}
        <AuthProvider>
          <SWRProvider>
            <GlobalDataProvider>
              <ThemeProvider defaultTheme="dark" storageKey="taskmanagement-theme">
                <AppProvider>
                  <ChatProvider>
                    <DetailPanelProvider>
                      {children}
                      {/* ✅ THÊM: ChatManager để render chat windows */}
                      <ChatManager />
                    </DetailPanelProvider>
                  </ChatProvider>
                </AppProvider>
              </ThemeProvider>
            </GlobalDataProvider>
          </SWRProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
