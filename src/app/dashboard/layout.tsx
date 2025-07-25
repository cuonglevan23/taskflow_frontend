import PrivateLayout from "@/layouts/private/PrivateLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PrivateLayout>{children}</PrivateLayout>;
}
