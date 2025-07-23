'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import clsx from 'clsx'
import { ClipboardList, ListTodo, LayoutDashboard, Calendar, FileText, User } from 'lucide-react'

const navItems = [
  { label: 'Overview', href: '/project', icon: <ClipboardList className='w-4 h-4' /> },
  { label: 'List', href: '/project/list', icon: <ListTodo className='w-4 h-4' /> },
  { label: 'Board', href: '/project/board', icon: <LayoutDashboard className='w-4 h-4' /> },
  { label: 'Calendar', href: '/project/calendar', icon: <Calendar className='w-4 h-4' /> },
  { label: 'Dashboard', href: '/project/dashboard', icon: <LayoutDashboard className='w-4 h-4' /> },
  { label: 'File', href: '/project/file', icon: <FileText className='w-4 h-4' /> },
]

const HeaderProject = () => {
  const pathname = usePathname()

  return (
    <div className='flex flex-col gap-2 border-b border-gray-200'>
      <div className='flex items-center gap-2'>
        <div className='w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center'>
          <User className='w-6 h-6' />
        </div>
        <div className='text-lg font-bold'>My Project</div>
      </div>
      <div>
        <ul className='flex items-center gap-5'>
          {navItems.map((item) => (
            <div
              key={item.href}
              className={clsx(
                'flex items-center gap-1',
                pathname === item.href && 'font-semibold text-black border-b-2 border-black', 
                pathname !== item.href && 'text-gray-500 hover:text-black'
              )}
            >
              <Link href={item.href} className='flex items-center gap-1'>
                {item.icon}
                <span className='font-medium'>{item.label}</span>
              </Link>
            </div>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default HeaderProject
