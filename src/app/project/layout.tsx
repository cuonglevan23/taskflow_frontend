import MainLayout from '@/components/layout/MainLayout'
import React from 'react'
import HeaderProject from './components/header_project'

const ProjectLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>

      <MainLayout>
        <div className=''>
          <HeaderProject/>
          {children}
        </div>
      </MainLayout>
    </div>
  )
}

export default ProjectLayout