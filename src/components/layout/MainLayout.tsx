'use client'

import React, { useEffect, useState } from 'react'
import Header from './Header'
import { NavBar } from './SideBar'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  // Tự động ẩn sidebar nếu dưới 500px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 550) {
        setShowSidebar(false)
        setCollapsed(false) // reset collapsed khi ẩn sidebar
      } else {
        setShowSidebar(true)
      }
    }

    handleResize() // chạy lần đầu
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Toggle khi bấm icon menu
  const toggleSidebar = () => {
    if (window.innerWidth < 550) {
      setShowSidebar(!showSidebar)
    } else {
      setCollapsed(!collapsed)
    }
  }

  return (
    <div>
      <Header onMenuClick={toggleSidebar} />
      <div className="flex">
        {showSidebar && <NavBar collapsed={collapsed} />}
        <main
          className="flex-1 p-4 transition-all"
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout
