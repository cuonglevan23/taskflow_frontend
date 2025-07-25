import React from 'react'
import PrivateLayout from '@/layouts/private/PrivateLayout'
import HeaderMyTask from './header_mytask'

const MyTaskLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <PrivateLayout>
        <div>
          <HeaderMyTask/>
          {children}
        </div>
      </PrivateLayout>
    </div>
  )
}

export default MyTaskLayout