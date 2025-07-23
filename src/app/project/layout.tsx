import MainLayout from '@/components/layout/MainLayout'
import ItemList from '@/app/project/list/page'
import React from 'react'
import ProjectNavbar from './page'
import HeaderProject from './components/header_project'

const ProjectLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex flex-col w-full h-full'>

      <MainLayout>
        {/* <h1>ProjectLayout</h1> */}
        {children}
        {/* <ItemList/> */}
      </MainLayout>
    </div>
  )
}

export default ProjectLayout