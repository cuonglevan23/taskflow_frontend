import React from 'react'
import { PageLayout } from '@/layouts/page'
import { Metadata } from 'next'
import { DynamicProjectProvider } from './components/DynamicProjectProvider'

interface ProjectLayoutProps {
  children: React.ReactNode
  params: Promise<{
    id: string
  }>
}

// Generate metadata for dynamic project pages
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    // Await params before accessing properties (Next.js 15 requirement)
    const { id } = await params;
    
    // In a real app, you'd fetch from your API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/projects`, {
      cache: 'no-store'
    });
    const projects = await response.json();
    const project = projects.find((p: any) => p.id === id);
    
    return {
      title: project ? `${project.name} - TaskManager` : 'Project - TaskManager',
      description: project ? project.description : 'Project management dashboard',
    };
  } catch (error) {
    return {
      title: 'Project - TaskManager',
      description: 'Project management dashboard',
    };
  }
}

const ProjectLayout = ({ children, params }: ProjectLayoutProps) => {
  return (
    <DynamicProjectProvider>
      <PageLayout>{children}</PageLayout>
    </DynamicProjectProvider>
  )
}

export default ProjectLayout