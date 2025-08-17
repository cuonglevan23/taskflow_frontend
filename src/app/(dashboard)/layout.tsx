import { ChatBot } from "@/components/ChatBot";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      {/* ChatBot - Available only in dashboard/private pages */}
      <ChatBot />
    </>
  );
}