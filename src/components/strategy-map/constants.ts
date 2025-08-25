import { type Node, type Edge } from '@xyflow/react';

export interface StrategyMapData {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: Date;
  updatedAt: Date;
}

export const STRATEGY_CATEGORIES = {
  vision: { label: 'Vision & Mission', color: '#4f46e5' },
  financial: { label: 'Financial', color: '#059669' },
  customer: { label: 'Customer', color: '#dc2626' },
  process: { label: 'Internal Process', color: '#7c3aed' },
  learning: { label: 'Learning & Growth', color: '#ea580c' },
} as const;

export type StrategyCategory = keyof typeof STRATEGY_CATEGORIES;

export const DEFAULT_NODES: Node[] = [
  {
    id: '1',
    type: 'goal',
    position: { x: 300, y: 50 },
    data: { 
      label: 'Vision & Mission',
      description: 'Our overarching purpose and aspirations',
      category: 'vision'
    },
  },
  {
    id: '2',
    type: 'strategy',
    position: { x: 100, y: 200 },
    data: { 
      label: 'Revenue Growth',
      description: 'Increase annual revenue by 25%',
      category: 'financial',
      progress: 65
    },
  },
  {
    id: '3',
    type: 'strategy',
    position: { x: 350, y: 200 },
    data: { 
      label: 'Cost Efficiency',
      description: 'Reduce operational costs by 15%',
      category: 'financial',
      progress: 40
    },
  },
  {
    id: '4',
    type: 'strategy',
    position: { x: 600, y: 200 },
    data: { 
      label: 'Market Expansion',
      description: 'Enter 3 new markets',
      category: 'financial',
      progress: 20
    },
  },
  {
    id: '5',
    type: 'strategy',
    position: { x: 50, y: 350 },
    data: { 
      label: 'Customer Satisfaction',
      description: 'Achieve 95% customer satisfaction',
      category: 'customer',
      progress: 75
    },
  },
  {
    id: '6',
    type: 'strategy',
    position: { x: 300, y: 350 },
    data: { 
      label: 'Digital Experience',
      description: 'Launch mobile-first platform',
      category: 'customer',
      progress: 55
    },
  },
  {
    id: '7',
    type: 'strategy',
    position: { x: 550, y: 350 },
    data: { 
      label: 'Product Innovation',
      description: 'Release 5 new features quarterly',
      category: 'customer',
      progress: 30
    },
  },
  {
    id: '8',
    type: 'strategy',
    position: { x: 100, y: 500 },
    data: { 
      label: 'Process Automation',
      description: 'Automate 70% of manual tasks',
      category: 'process',
      progress: 45
    },
  },
  {
    id: '9',
    type: 'strategy',
    position: { x: 400, y: 500 },
    data: { 
      label: 'Quality Assurance',
      description: 'Implement ISO 9001 standards',
      category: 'process',
      progress: 80
    },
  },
  {
    id: '10',
    type: 'strategy',
    position: { x: 200, y: 650 },
    data: { 
      label: 'Team Development',
      description: 'Upskill 100% of workforce',
      category: 'learning',
      progress: 60
    },
  },
  {
    id: '11',
    type: 'strategy',
    position: { x: 500, y: 650 },
    data: { 
      label: 'Innovation Culture',
      description: 'Foster continuous learning',
      category: 'learning',
      progress: 35
    },
  },
];

export const DEFAULT_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  { id: 'e1-3', source: '1', target: '3', type: 'smoothstep' },
  { id: 'e1-4', source: '1', target: '4', type: 'smoothstep' },
  { id: 'e2-5', source: '2', target: '5', type: 'smoothstep' },
  { id: 'e3-6', source: '3', target: '6', type: 'smoothstep' },
  { id: 'e4-7', source: '4', target: '7', type: 'smoothstep' },
  { id: 'e5-8', source: '5', target: '8', type: 'smoothstep' },
  { id: 'e6-8', source: '6', target: '8', type: 'smoothstep' },
  { id: 'e7-9', source: '7', target: '9', type: 'smoothstep' },
  { id: 'e8-10', source: '8', target: '10', type: 'smoothstep' },
  { id: 'e9-11', source: '9', target: '11', type: 'smoothstep' },
];
