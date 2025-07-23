import MainLayout from '@/components/layout/MainLayout'
import ItemList from '@/app/project/list/page'
import React from 'react'

const ProjectLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <MainLayout>
        {/* <h1>ProjectLayout</h1> */}
        {children}
        {/* <ItemList/> */}
      </MainLayout>
    </div>
  )
}

export default ProjectLayout