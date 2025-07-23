'use client'

import React, { useState } from 'react'
import Header from './Header'
import { NavBar } from './SideBar'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className='relative'>
      <Header onToggleSidebar={() => setCollapsed(prev => !prev)} />
      <div className="flex">
        <NavBar collapsed={collapsed} />
        <main className="flex flex-col w-full h-full pt-4 pl-4 mt-[50px] ml-[250px]">
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout
