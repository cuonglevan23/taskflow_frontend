'use client'

import React, { useState } from 'react'
import Header from './Header'
import { NavBar } from './NavBar'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className='relative'>
      <Header onToggleSidebar={() => setCollapsed(prev => !prev)} />
      <div className="flex">
        <NavBar collapsed={collapsed} />
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout
