import PrivateLayout from "@/layouts/private/PrivateLayout";

export default function MembersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PrivateLayout>
            {children}
        </PrivateLayout>
    )
}