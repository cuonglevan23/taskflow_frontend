import React from 'react'
import { PageLayout } from '@/layouts/page'
import { Metadata } from 'next'
import { DynamicTeamProvider } from './components/DynamicTeamProvider'
import { teamsService } from '@/services/teams/teamsService'

interface TeamLayoutProps {
  children: React.ReactNode
  params: Promise<{
    id: string
  }>
}

// Generate metadata for dynamic teams pages
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    // Await params before accessing properties (Next.js 15 requirement)
    const { id } = await params;
    
    // TODO: Implement direct DB access for server-side metadata generation
    // For now, use static metadata to avoid HTTP fetch from server-side
    return {
      title: `Team ${id} - TaskManager`,
      description: 'Team management dashboard',
    };
  } catch (error) {
    return {
      title: 'Team - TaskManager',
      description: 'Team management dashboard',
    };
  }
}

const TeamLayout = async ({ children, params }: TeamLayoutProps) => {
  const resolvedParams = await params;
  
  return (
    <DynamicTeamProvider teamId={resolvedParams.id}>
      <PageLayout>{children}</PageLayout>
    </DynamicTeamProvider>
  )
}

export default TeamLayout