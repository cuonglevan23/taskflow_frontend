import React from 'react'
import Header from './Header'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
        <Header />
        <main>
            {children}
        </main>
    </div>
  )
}

export default MainLayout