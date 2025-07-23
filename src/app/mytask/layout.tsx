import React from 'react'
import MainLayout from '@/components/layout/MainLayout'

const MyTaskLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <MainLayout>
        {children}
      </MainLayout>
    </div>
  )
}

export default MyTaskLayout