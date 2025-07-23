'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AlignJustify, Search, ChevronDown } from 'lucide-react'
import Image from 'next/image'

interface HeaderProps {
  onToggleSidebar: () => void
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const [open, setOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState<number>(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateSize = () => setWindowWidth(window.innerWidth)
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="w-full h-[50px] bg-white shadow flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-50">
      {/* Left: Menu + Logo */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button onClick={onToggleSidebar} className="p-1 hover:bg-gray-100 rounded">
          <AlignJustify className="w-5 h-5 text-gray-700" />
        </button>
        {windowWidth >= 500 && (
          <Image src="/logo.svg" alt="logo" width={80} height={30} />
        )}
      </div>

      {/* Center: Search */}
      <div className="relative flex-grow max-w-lg mx-4 sm:block">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="w-full h-9 pl-10 pr-3 text-sm rounded-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-150 outline-none"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
      </div>

      {/* Right: Avatar + Dropdown */}
      <div className="relative flex-shrink-0" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1 p-1 hover:bg-gray-100 rounded"
        >
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-medium">
            U
          </div>
          <ChevronDown className="w-4 h-4 text-gray-600" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow z-10 text-sm">
            <ul className="py-1 text-gray-700">
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Thông tin cá nhân</li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Cài đặt</li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Đăng xuất</li>
            </ul>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
