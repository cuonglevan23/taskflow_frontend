import RoleBasedLayout from "@/layouts/RoleBasedLayout";

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleBasedLayout layoutType="private">{children}</RoleBasedLayout>;
}
