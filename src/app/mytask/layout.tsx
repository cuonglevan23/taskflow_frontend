import React from "react";
import PrivateLayout from "@/layouts/private/PrivateLayout";
import HeaderMyTask from "./header_mytask";

const MyTaskLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <PrivateLayout>
        <div className='p-6'>
          <HeaderMyTask/>
          <div className=''>
            {children}
          </div>
        </div>
      </PrivateLayout>
    </div>
  )
};

export default MyTaskLayout;
