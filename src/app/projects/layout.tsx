import RoleBasedLayout from "@/layouts/RoleBasedLayout";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleBasedLayout layoutType="private">{children}</RoleBasedLayout>;
}
