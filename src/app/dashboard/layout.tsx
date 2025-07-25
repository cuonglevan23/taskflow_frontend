import RoleBasedLayout from "@/layouts/RoleBasedLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleBasedLayout layoutType="private">{children}</RoleBasedLayout>;
}
