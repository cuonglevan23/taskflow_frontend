import React from 'react'
import HeaderProject from './header_project'
import PrivateLayout from '@/layouts/private/PrivateLayout'

const ProjectLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>

      <PrivateLayout>
        <div className=''>
          <HeaderProject/>
          <div className=''>
            {children}
          </div>
        </div>
      </PrivateLayout>
    </div>
  )
}

export default ProjectLayout