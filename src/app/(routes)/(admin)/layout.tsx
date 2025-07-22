// Admin layout
import { checkAdminAccess } from '@/lib/auth/checkAccess';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication check
  await checkAdminAccess();

  return (
    <div className="min-h-screen flex">
      {/* Admin sidebar will go here */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
