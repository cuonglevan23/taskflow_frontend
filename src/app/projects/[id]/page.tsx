import React from 'react'
import Overview from './overview/page'

interface ProjectPageProps {
  params: {
    id: string
  }
}

const ProjectPage = ({ params }: ProjectPageProps) => {
  return (
    <Overview projectId={params.id} />
  )
}

export default ProjectPage