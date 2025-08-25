"use client";

import React, { useCallback, useRef, useMemo, useState, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  useReactFlow,
  type Node,
  type Edge,
  type OnConnect,
  BackgroundVariant,
  Handle,
  Position,
} from "@xyflow/react";
import {
  Target,
  TrendingUp,
  Users,
  Lightbulb,
  Save,
  RotateCcw,
  Sun,
  Moon,
  Plus,
  Minus,
  Maximize2,
  Calendar,
} from "lucide-react";
import { DARK_THEME } from "@/constants/theme";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getAllTeamsProgress, TeamProgress } from "@/services/progressService";

import "@xyflow/react/dist/style.css";

// Custom Strategy Node Component
interface StrategyNodeData extends Record<string, unknown> {
  label: string;
  category: 'Vision' | 'Financial' | 'Customer' | 'Process' | 'Learning';
  progress: number;
  totalTasks: number;
  completedTasks: number;
  lastUpdated: string;
  teamMembers: Array<{
    userId: string;
    displayName: string;
    email: string;
    avatarUrl?: string;
  }>;
}

function StrategyNode({ data }: { data: StrategyNodeData }) {
  const getCategoryConfig = (category: string) => {
    const configs = {
      Vision: { bg: '#374151', border: '#6b7280', icon: Target, color: '#8b5cf6' },
      Financial: { bg: '#065f46', border: '#10b981', icon: TrendingUp, color: '#10b981' },
      Customer: { bg: '#7f1d1d', border: '#ef4444', icon: Users, color: '#ef4444' },
      Process: { bg: '#581c87', border: '#a855f7', icon: Target, color: '#a855f7' },
      Learning: { bg: '#9a3412', border: '#f97316', icon: Lightbulb, color: '#f97316' }
    };
    return configs[category as keyof typeof configs] || configs.Vision;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return '#10b981'; // green
    if (percentage >= 50) return '#f59e0b'; // yellow
    if (percentage >= 25) return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  const config = getCategoryConfig(data.category);
  const IconComponent = config.icon;

  return (
    <div 
      className="px-4 py-3 rounded-lg border transition-all duration-200 min-w-[280px] max-w-[320px]"
      style={{
        backgroundColor: DARK_THEME.background.secondary,
        borderColor: config.border,
        borderWidth: '2px'
      }}
    >
      <Handle type="target" position={Position.Top} />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="p-1.5 rounded-md"
            style={{ backgroundColor: config.bg }}
          >
            <IconComponent size={16} style={{ color: 'white' }} />
          </div>
          <div>
            <h3 
              className="text-sm font-semibold leading-tight"
              style={{ color: DARK_THEME.text.primary }}
            >
              {data.label}
            </h3>
            <p 
              className="text-xs"
              style={{ color: config.color }}
            >
              {data.category}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div 
            className="text-lg font-bold"
            style={{ color: getProgressColor(data.progress) }}
          >
            {Math.round(data.progress)}%
          </div>
          <p 
            className="text-xs"
            style={{ color: DARK_THEME.text.secondary }}
          >
            complete
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div 
          className="h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: DARK_THEME.background.primary }}
        >
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${data.progress}%`,
              backgroundColor: getProgressColor(data.progress)
            }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs">
          <span style={{ color: DARK_THEME.text.secondary }}>
            {data.completedTasks} done
          </span>
          <span style={{ color: DARK_THEME.text.secondary }}>
            {data.totalTasks} total
          </span>
        </div>
      </div>

      {/* Team Members */}
      <div className="mb-2">
        <div className="flex items-center gap-1 mb-1">
          <Users size={12} style={{ color: DARK_THEME.text.secondary }} />
          <span 
            className="text-xs"
            style={{ color: DARK_THEME.text.secondary }}
          >
            Team ({data.teamMembers.length})
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {data.teamMembers.slice(0, 4).map((member) => (
            <UserAvatar
              key={member.userId}
              name={member.displayName}
              email={member.email}
              avatar={member.avatarUrl}
              size="xs"
              className="border"
              style={{ borderColor: DARK_THEME.background.secondary }}
            />
          ))}
          
          {data.teamMembers.length > 4 && (
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
              style={{ 
                backgroundColor: DARK_THEME.background.primary,
                color: DARK_THEME.text.secondary 
              }}
            >
              +{data.teamMembers.length - 4}
            </div>
          )}
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-1 text-xs">
        <Calendar size={10} style={{ color: DARK_THEME.text.secondary }} />
        <span style={{ color: DARK_THEME.text.secondary }}>
          {new Date(data.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function StrategyMapContent() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  
  // State for real team progress data
  const [teamsProgress, setTeamsProgress] = useState<TeamProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real teams progress data
  useEffect(() => {
    const fetchTeamsProgress = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllTeamsProgress();
        setTeamsProgress(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch teams progress');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamsProgress();
  }, []);

  // Custom node types
  const nodeTypes = useMemo(() => ({
    strategyNode: StrategyNode
  }), []);

  // Helper function to convert TeamProgress to StrategyNodeData
  const convertTeamToStrategyNode = useCallback((team: TeamProgress, index: number): Node => {
    // Determine category based on team name or use a round-robin approach
    const categories: Array<'Vision' | 'Financial' | 'Customer' | 'Process' | 'Learning'> = 
      ['Vision', 'Financial', 'Customer', 'Process', 'Learning'];
    
    // Simple category assignment based on keywords in team name
    let category: 'Vision' | 'Financial' | 'Customer' | 'Process' | 'Learning' = categories[index % categories.length];
    
    const teamName = team.teamName.toLowerCase();
    if (teamName.includes('revenue') || teamName.includes('financial') || teamName.includes('profit') || teamName.includes('cost') || teamName.includes('finance')) {
      category = 'Financial';
    } else if (teamName.includes('customer') || teamName.includes('client') || teamName.includes('satisfaction') || teamName.includes('marketing') || teamName.includes('sales')) {
      category = 'Customer';
    } else if (teamName.includes('process') || teamName.includes('operation') || teamName.includes('efficiency') || teamName.includes('product') || teamName.includes('development')) {
      category = 'Process';
    } else if (teamName.includes('learning') || teamName.includes('training') || teamName.includes('skill') || teamName.includes('development') || teamName.includes('hr') || teamName.includes('people')) {
      category = 'Learning';
    } else if (teamName.includes('vision') || teamName.includes('mission') || teamName.includes('strategy') || teamName.includes('management') || teamName.includes('leadership')) {
      category = 'Vision';
    }

    // Convert real team members data
    const teamMembers = team.teamMembers.map(member => ({
      userId: member.userId.toString(),
      displayName: member.displayName,
      email: member.email,
      avatarUrl: member.avatarUrl
    }));

    // Calculate positions - team nodes arranged horizontally below mission
    const nodeIndex = index;
    const totalNodes = teamsProgress?.length || 3;
    const spacing = 350;
    // Center the nodes by calculating proper startX
    const totalWidth = (totalNodes - 1) * spacing;
    const startX = 400 - totalWidth / 2; // Center around x=400
    const position = { x: startX + nodeIndex * spacing, y: 300 };
    
    
    return {
      id: `team-${team.teamId}`,
      type: 'strategyNode',
      position: position,
      data: {
        label: team.teamName,
        category,
        progress: team.completionPercentage,
        totalTasks: team.totalTasks,
        completedTasks: team.completedTasks,
        lastUpdated: team.lastUpdated,
        teamMembers: teamMembers
      } as StrategyNodeData,
    };
  }, [teamsProgress?.length]);

  // Convert teams progress to nodes
  const teamNodes = useMemo(() => {
    if (!teamsProgress || teamsProgress.length === 0) return [];
    return teamsProgress.map(convertTeamToStrategyNode);
  }, [teamsProgress, convertTeamToStrategyNode]);

  // Create Mission node (always present)
  const missionNode = useMemo<Node>(() => ({
    id: 'mission-center',
    type: 'strategyNode',
    position: { x: 1020, y: 220 },
    data: {
      label: 'Phát triển công ty trong 1 tháng tới',
      category: 'Vision',
      progress: 85,
      totalTasks: 12,
      completedTasks: 10,
      lastUpdated: new Date().toISOString(),
      teamMembers: [
        { userId: 'ceo', displayName: 'CEO', email: 'ceo@company.com', avatarUrl: '' },
        { userId: 'cto', displayName: 'CTO', email: 'cto@company.com', avatarUrl: '' },
        { userId: 'cfo', displayName: 'CFO', email: 'cfo@company.com', avatarUrl: '' },
      ]
    } as StrategyNodeData,
  }), []);

  // Combine mission node with team nodes
  const allNodes = useMemo(() => {
    // Update team nodes positions to be below mission
    const updatedTeamNodes = teamNodes.map((node, index) => ({
      ...node,
      position: {
        x: 900 + index * 350,
        y: 500
      }
    }));
    
    return [missionNode, ...updatedTeamNodes];
  }, [missionNode, teamNodes]);



  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  // Update nodes and edges when team data is loaded
  useEffect(() => {
    const currentNodes = allNodes.length > 1 ? allNodes : [missionNode];
    setNodes(currentNodes);
    
    // Generate edges - all team nodes connect to mission
    if (currentNodes.length >= 2) {
      const newEdges = [];
      // Connect all nodes (except mission) to mission node
      for (let i = 1; i < currentNodes.length; i++) {
        newEdges.push({
          id: `e${currentNodes[0].id}-${currentNodes[i].id}`,
          source: currentNodes[0].id, // Mission node
          target: currentNodes[i].id,
          style: { stroke: '#6b7280', strokeWidth: 2 }
        });
      }
      setEdges(newEdges);
    }
  }, [allNodes, missionNode, setNodes, setEdges]);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNewNode = useCallback((category: 'Vision' | 'Financial' | 'Customer' | 'Process' | 'Learning') => {
    const mockTeamMembers = [
      { userId: '1', displayName: 'Team Lead', email: 'lead@example.com', avatarUrl: '' },
      { userId: '2', displayName: 'Member 1', email: 'member1@example.com', avatarUrl: '' },
      { userId: '3', displayName: 'Member 2', email: 'member2@example.com', avatarUrl: '' },
    ];

    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: 'strategyNode',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 200 },
      data: {
        label: `New ${category} Goal`,
        category,
        progress: Math.floor(Math.random() * 100),
        totalTasks: Math.floor(Math.random() * 20) + 5,
        completedTasks: Math.floor(Math.random() * 15) + 2,
        lastUpdated: new Date().toISOString(),
        teamMembers: mockTeamMembers.slice(0, Math.floor(Math.random() * 3) + 1)
      } as StrategyNodeData
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const resetView = useCallback(() => {
    setNodes(allNodes);
    
    // Generate edges for all nodes - all team nodes connect to mission center
    if (allNodes.length >= 2) {
      const newEdges = [];
      // Connect all team nodes to the mission node
      for (let i = 1; i < allNodes.length; i++) {
        newEdges.push({
          id: `e${allNodes[0].id}-${allNodes[i].id}`,
          source: allNodes[0].id,
          target: allNodes[i].id,
          style: { stroke: '#6b7280', strokeWidth: 2 }
        });
      }
      setEdges(newEdges);
    }
  }, [allNodes, setNodes, setEdges]);

  const saveMap = useCallback(() => {
    const mapData = { nodes, edges, timestamp: new Date().toISOString() };
    localStorage.setItem("strategy-map", JSON.stringify(mapData));

    const dataStr = JSON.stringify(mapData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileName = `strategy-map-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const link = document.createElement("a");
    link.setAttribute("href", dataUri);
    link.setAttribute("download", exportFileName);
    link.click();
  }, [nodes, edges]);

  return (
    <div
      className="relative w-full h-full"
      style={{ backgroundColor: "#1e1e1e" }}
    >
      {/* Loading/Error State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-white text-lg">Loading team goals...</div>
        </div>
      )}
      
      {error && !loading && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-red-600 text-white px-4 py-2 rounded-lg">
            Error loading team goals: {error}
          </div>
        </div>
      )}

      {/* Floating Action Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center justify-center gap-2 bg-gray-800/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-xl border border-gray-700">
          {/* Data Source Info */}
          <div className="text-xs text-gray-400 mr-2">
            {teamsProgress.length > 0 ? `Mission + ${teamsProgress.length} Teams` : 'Mission + Demo Data'}
          </div>

          {/* Create Goal Button */}
          <button
            onClick={() => addNewNode("Vision")}
            className="
    flex items-center gap-1
    px-2
    h-[28px]
    bg-[#1e1f21] 
    hover:bg-[#2a2b2e]
    text-white 
    rounded-md 
    text-[12px] 
    leading-[28px] 
    font-medium
    transition-colors
    border border-white
    active:border active:border-[#a2a0a2]
  "
            title="Create Goal"
          >
            <span className="text-sm">+</span>
            <span>Goal</span>
          </button>

          <div
            className="w-px h-6"
            style={{ backgroundColor: "var(--color-border-default)" }}
          ></div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => zoomIn()}
              className="p-2 strategy-button-hover rounded-md transition-colors"
              title="Zoom In"
            >
              <Plus
                className="w-4 h-4"
                style={{ color: "var(--color-text-secondary)" }}
              />
            </button>
            <button
              onClick={() => zoomOut()}
              className="p-2 strategy-button-hover rounded-md transition-colors"
              title="Zoom Out"
            >
              <Minus
                className="w-4 h-4"
                style={{ color: "var(--color-text-secondary)" }}
              />
            </button>
            <button
              onClick={() => fitView()}
              className="p-2 strategy-button-hover rounded-md transition-colors"
              title="Fit to View"
            >
              <Maximize2
                className="w-4 h-4"
                style={{ color: "var(--color-text-secondary)" }}
              />
            </button>
          </div>

          <div
            className="w-px h-6"
            style={{ backgroundColor: "var(--color-border-default)" }}
          ></div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={resetView}
              className="p-2 strategy-button-hover rounded-md transition-colors"
              title="Reset View"
            >
              <RotateCcw
                className="w-4 h-4"
                style={{ color: "var(--color-text-secondary)" }}
              />
            </button>
            <button
              onClick={saveMap}
              className="p-2 strategy-button-hover rounded-md transition-colors"
              title="Save"
            >
              <Save
                className="w-4 h-4"
                style={{ color: "var(--color-text-secondary)" }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* React Flow Canvas - Full screen */}
      <div ref={reactFlowWrapper} className="w-screen h-screen">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
           defaultViewport={{ x: -200, y: -50, zoom: 0.8 }}
          attributionPosition="bottom-left"
          className="w-full h-full"
          style={{ backgroundColor: "#1e1e1e" }}
        >
          <Background
            variant={BackgroundVariant.Cross}
            gap={20}
            size={1}
            color="#333333"
            style={{ backgroundColor: "#1e1e1e" }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function StrategyMapPage() {
  return (
    <ReactFlowProvider>
      <StrategyMapContent />
    </ReactFlowProvider>
  );
}
