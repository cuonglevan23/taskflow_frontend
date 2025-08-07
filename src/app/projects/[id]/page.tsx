import React from 'react'
import Overview from './overview/page'

interface ProjectPageProps {
  params: Promise<{
    id: string
  }>
}

const ProjectPage = async ({ params }: ProjectPageProps) => {
  const { id } = await params;
  
  return (
    <Overview projectId={id} />
  )
}

export default ProjectPage