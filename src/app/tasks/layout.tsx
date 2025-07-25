import PrivateLayout from "@/layouts/private/PrivateLayout";

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PrivateLayout>{children}</PrivateLayout>;
}
