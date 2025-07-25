import PrivateLayout from "@/layouts/private/PrivateLayout";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PrivateLayout>{children}</PrivateLayout>;
}
