'use client'

import React, { useState } from 'react'
import {
  Plus,
  Home,
  CheckSquare,
  Inbox,
  TrendingUp,
  Briefcase,
  Target,
  FolderOpen,
  Users,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import Link from 'next/link'

export function NavBar({ collapsed = false }: { collapsed?: boolean }) {
  const [expandedSections, setExpandedSections] = useState({
    insights: false,
    projects: false,
    teams: false,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className={`flex flex-col h-[calc(100vh-50px)] fixed mt-[50px] bg-white border border-gray-200 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Create Button */}
      <div className="p-4">
        <button className={`w-full flex items-center justify-center ${collapsed ? 'justify-center' : 'gap-2'} bg-red-500 hover:bg-red-600 text-white font-medium text-sm py-2 px-3 rounded-lg transition-all cursor-pointer`}>
          <Plus className="w-4 h-4" />
          {!collapsed && <span>Create</span>}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        <SidebarItem icon={Home} label="Home" collapsed={collapsed} link="/" />
        <SidebarItem icon={CheckSquare} label="My tasks" collapsed={collapsed} link="/mytask" />
        <SidebarItem icon={Inbox} label="Inbox" collapsed={collapsed} link="/inbox" />

        {/* Sections */}
        <div className="mt-6 space-y-2">
          <SidebarSection
            title="Insights"
            isExpanded={expandedSections.insights}
            onToggle={() => toggleSection('insights')}
            collapsed={collapsed}
          >
            <SidebarItem icon={TrendingUp} label="Reporting" collapsed={collapsed} />
            <SidebarItem icon={Briefcase} label="Portfolios" collapsed={collapsed} />
            <SidebarItem icon={Target} label="Goals" collapsed={collapsed} />
          </SidebarSection>

          <SidebarSection
            title="Projects"
            isExpanded={expandedSections.projects}
            onToggle={() => toggleSection('projects')}
            collapsed={collapsed}
          >
            <SidebarItem icon={FolderOpen} label="Cross-functional project pl..." hasIndicator collapsed={collapsed} link="/project" />
          </SidebarSection>

          <SidebarSection
            title="Teams"
            isExpanded={expandedSections.teams}
            onToggle={() => toggleSection('teams')}
            collapsed={collapsed}
          >
            <SidebarItem icon={Users} label="DiNH's first team" hasChevron collapsed={collapsed} />
            {!collapsed && (
              <div className="ml-6 mt-1">
                <button className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors">
                  Browse teams
                </button>
              </div>
            )}
          </SidebarSection>
        </div>
      </nav>

      {/* Trial Notification */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-teal-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-900">Advanced free trial</span>
            </div>
            <p className="text-sm text-gray-600">14 days left</p>
          </div>

          <div className="space-y-2">
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm py-2 px-3 rounded-lg transition-colors">
              Add billing info
            </button>
            <button className="w-full flex items-center justify-center gap-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 py-2 px-3 rounded-lg transition-colors">
              <Inbox className="w-4 h-4" />
              Invite teammates
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  hasIndicator?: boolean
  hasChevron?: boolean
  collapsed?: boolean
  link?: string
}

function SidebarItem({ icon: Icon, label, hasIndicator, hasChevron, collapsed, link }: SidebarItemProps) {
  return (
      <Link href={link || '/'}>
    <div className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md group cursor-pointer">
        <Icon className="w-4 h-4 text-gray-500" />
      {!collapsed && <span className="ml-3 flex-1 text-left">{label}</span>}
      {hasIndicator && !collapsed && <div className="w-2 h-2 bg-teal-500 rounded-full"></div>}
      {hasChevron && !collapsed && <ChevronRight className="w-4 h-4 text-gray-400" />}
    </div>
      </Link>
  )
}

interface SidebarSectionProps {
  title: string
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
  collapsed?: boolean
}

function SidebarSection({ title, isExpanded, onToggle, children, collapsed }: SidebarSectionProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-md"
      >
        {!collapsed && <span>{title}</span>}
        {!collapsed && (
          <div className="flex items-center">
            <Plus className="w-4 h-4 text-gray-400 mr-1" />
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </div>
        )}
      </button>
      {isExpanded && !collapsed && <div className="ml-3 mt-1 space-y-1">{children}</div>}
    </div>
  )
}
