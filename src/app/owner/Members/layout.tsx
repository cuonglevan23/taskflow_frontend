import { PageLayout } from "@/layouts/page";

export default function MembersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <PageLayout>{children}</PageLayout>;
}