import React from 'react'
import MainLayout from '@/components/layout/MainLayout'
import HeaderMyTask from '@/app/owner/mytask/components/header_mytask'

const MyTaskLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <MainLayout>
        <div>
          <HeaderMyTask/>
          {children}
        </div>
      </MainLayout>
    </div>
  )
}

export default MyTaskLayout