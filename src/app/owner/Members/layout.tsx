import MainLayout from "@/components/layout/MainLayout";
import HeaderProject from "./components/header_team";

export default function MembersLayout({ children }: { children: React.ReactNode }) {
    return <div>

        <MainLayout>
            <div className=''>
                <HeaderProject />   
                <div className=''>
                    {children}
                </div>
            </div>
        </MainLayout>
    </div>;
}