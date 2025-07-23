import React from 'react'
import MainLayout from '@/components/layout/MainLayout'
import HeaderMyTask from '@/app/mytask/components/header_mytask'

const MyTaskLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <MainLayout>
        <HeaderMyTask/>
        {children}
      </MainLayout>
    </div>
  )
}

export default MyTaskLayout