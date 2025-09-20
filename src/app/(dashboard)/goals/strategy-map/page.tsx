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
  Plus,
  Minus,
  Maximize2,
  Calendar,
} from "lucide-react";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getAllTeamsProgress, TeamProgress } from "@/services/process/progressService";

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
  const { theme } = useThemeContext();
  const { messages } = useLanguageContext();

  const getCategoryConfig = (category: string) => {
    const configs = {
      Vision: { bg: theme.background.tertiary, border: theme.border.muted, icon: Target, color: '#8b5cf6' },
      Financial: { bg: '#065f46', border: theme.status.success, icon: TrendingUp, color: theme.status.success },
      Customer: { bg: '#7f1d1d', border: theme.status.error, icon: Users, color: theme.status.error },
      Process: { bg: '#581c87', border: '#a855f7', icon: Target, color: '#a855f7' },
      Learning: { bg: '#9a3412', border: theme.status.warning, icon: Lightbulb, color: theme.status.warning }
    };
    return configs[category as keyof typeof configs] || configs.Vision;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return theme.status.success; // green
    if (percentage >= 50) return theme.status.warning; // yellow
    if (percentage >= 25) return theme.status.error; // red
    return theme.text.muted; // gray
  };

  const config = getCategoryConfig(data.category);
  const IconComponent = config.icon;

  return (
    <div 
      className="px-4 py-3 rounded-lg border transition-all duration-200 min-w-[280px] max-w-[320px]"
      style={{
        backgroundColor: theme.background.primary,
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
            <IconComponent size={16} style={{ color: theme.text.primary }} />
          </div>
          <div>
            <h3 
              className="text-sm font-semibold leading-tight"
              style={{ color: theme.text.primary }}
            >
              {data.label}
            </h3>
            <p 
              className="text-xs"
              style={{ color: config.color }}
            >
              {messages.strategyMap.categories[data.category as keyof typeof messages.strategyMap.categories]}
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
            style={{ color: theme.text.muted }}
          >
            {messages.strategyMap.progress.complete}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div 
          className="h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: theme.background.secondary }}
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
          <span style={{ color: theme.text.muted }}>
            {data.completedTasks} {messages.strategyMap.progress.done}
          </span>
          <span style={{ color: theme.text.muted }}>
            {data.totalTasks} {messages.strategyMap.progress.total}
          </span>
        </div>
      </div>

      {/* Team Members */}
      <div className="mb-2">
        <div className="flex items-center gap-1 mb-1">
          <Users size={12} style={{ color: theme.text.muted }} />
          <span
            className="text-xs"
            style={{ color: theme.text.muted }}
          >
            {messages.strategyMap.team.replace('{count}', data.teamMembers.length.toString())}
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
              style={{ borderColor: theme.background.primary }}
            />
          ))}
          
          {data.teamMembers.length > 4 && (
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
              style={{ 
                backgroundColor: theme.background.secondary,
                color: theme.text.muted
              }}
            >
              +{data.teamMembers.length - 4}
            </div>
          )}
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-1 text-xs">
        <Calendar size={10} style={{ color: theme.text.muted }} />
        <span style={{ color: theme.text.muted }}>
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
  
  // Context hooks
  const { theme } = useThemeContext();
  const { messages, isLoading: messagesLoading } = useLanguageContext();

  // State for real team progress data - use correct TeamProgress type
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

  // Create Mission node (always present) - with fallback for when messages aren't loaded
  const missionNode = useMemo<Node>(() => ({
    id: 'mission-center',
    type: 'strategyNode',
    position: { x: 1020, y: 220 },
    data: {
      label: messages?.strategyMap?.missionLabel || 'Company development in the next month',
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
  }), [messages?.strategyMap?.missionLabel]);

  // Combine mission node with team nodes
  const allNodes = useMemo(() => {
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
    
    if (currentNodes.length >= 2) {
      const newEdges = [];
      for (let i = 1; i < currentNodes.length; i++) {
        newEdges.push({
          id: `e${currentNodes[0].id}-${currentNodes[i].id}`,
          source: currentNodes[0].id,
          target: currentNodes[i].id,
          style: { stroke: theme.border.muted, strokeWidth: 2 }
        });
      }
      setEdges(newEdges);
    }
  }, [allNodes, missionNode, setNodes, setEdges, theme.border.muted]);

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
        label: messages?.strategyMap?.newGoal?.replace('{category}', messages?.strategyMap?.categories?.[category] || category) || `New ${category} Goal`,
        category,
        progress: Math.floor(Math.random() * 100),
        totalTasks: Math.floor(Math.random() * 20) + 5,
        completedTasks: Math.floor(Math.random() * 15) + 2,
        lastUpdated: new Date().toISOString(),
        teamMembers: mockTeamMembers.slice(0, Math.floor(Math.random() * 3) + 1)
      } as StrategyNodeData
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, messages]);

  const resetView = useCallback(() => {
    setNodes(allNodes);
    
    if (allNodes.length >= 2) {
      const newEdges = [];
      for (let i = 1; i < allNodes.length; i++) {
        newEdges.push({
          id: `e${allNodes[0].id}-${allNodes[i].id}`,
          source: allNodes[0].id,
          target: allNodes[i].id,
          style: { stroke: theme.border.muted, strokeWidth: 2 }
        });
      }
      setEdges(newEdges);
    }
  }, [allNodes, setNodes, setEdges, theme.border.muted]);

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

  // Safety check - if messages aren't loaded yet, show loading
  if (messagesLoading || !messages || !messages.strategyMap) {
    return (
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{ backgroundColor: theme.background.primary }}
      >
        <div style={{ color: theme.text.primary }} className="text-lg">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full"
      style={{ backgroundColor: theme.background.primary }}
    >
      {/* Loading/Error State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div style={{ color: theme.text.primary }} className="text-lg">
            {messages.strategyMap.loading}
          </div>
        </div>
      )}
      
      {error && !loading && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20">
          <div style={{ backgroundColor: theme.status.error, color: theme.text.primary }} className="px-4 py-2 rounded-lg">
            {messages.strategyMap.errorLoading.replace('{error}', error)}
          </div>
        </div>
      )}

      {/* Floating Action Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div
          className="flex items-center justify-center gap-2 backdrop-blur-sm rounded-lg px-4 py-2 shadow-xl border"
          style={{
            backgroundColor: theme.background.secondary + '90',
            borderColor: theme.border.default
          }}
        >
          {/* Data Source Info */}
          <div className="text-xs mr-2" style={{ color: theme.text.muted }}>
            {teamsProgress.length > 0
              ? messages.strategyMap.missionAndTeams.replace('{count}', teamsProgress.length.toString())
              : messages.strategyMap.missionAndDemoData
            }
          </div>

          {/* Create Goal Button */}
          <button
            onClick={() => addNewNode("Vision")}
            className="flex items-center gap-1 px-2 h-[28px] rounded-md text-[12px] leading-[28px] font-medium transition-colors border"
            style={{
              backgroundColor: theme.background.primary,
              color: theme.text.primary,
              borderColor: theme.border.default,
            }}
            title={messages.strategyMap.buttons.createGoal}
          >
            <span className="text-sm">+</span>
            <span>{messages.strategyMap.buttons.createGoal}</span>
          </button>

          <div
            className="w-px h-6"
            style={{ backgroundColor: theme.border.default }}
          ></div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => zoomIn()}
              className="p-2 rounded-md transition-colors hover:bg-opacity-80"
              style={{ backgroundColor: theme.background.muted }}
              title={messages.strategyMap.buttons.zoomIn}
            >
              <Plus
                className="w-4 h-4"
                style={{ color: theme.text.secondary }}
              />
            </button>
            <button
              onClick={() => zoomOut()}
              className="p-2 rounded-md transition-colors hover:bg-opacity-80"
              style={{ backgroundColor: theme.background.muted }}
              title={messages.strategyMap.buttons.zoomOut}
            >
              <Minus
                className="w-4 h-4"
                style={{ color: theme.text.secondary }}
              />
            </button>
            <button
              onClick={() => fitView()}
              className="p-2 rounded-md transition-colors hover:bg-opacity-80"
              style={{ backgroundColor: theme.background.muted }}
              title={messages.strategyMap.buttons.fitToView}
            >
              <Maximize2
                className="w-4 h-4"
                style={{ color: theme.text.secondary }}
              />
            </button>
          </div>

          <div
            className="w-px h-6"
            style={{ backgroundColor: theme.border.default }}
          ></div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={resetView}
              className="p-2 rounded-md transition-colors hover:bg-opacity-80"
              style={{ backgroundColor: theme.background.muted }}
              title={messages.strategyMap.buttons.resetView}
            >
              <RotateCcw
                className="w-4 h-4"
                style={{ color: theme.text.secondary }}
              />
            </button>
            <button
              onClick={saveMap}
              className="p-2 rounded-md transition-colors hover:bg-opacity-80"
              style={{ backgroundColor: theme.background.muted }}
              title={messages.strategyMap.buttons.save}
            >
              <Save
                className="w-4 h-4"
                style={{ color: theme.text.secondary }}
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
          style={{ backgroundColor: theme.background.primary }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color={theme.border.muted}
            style={{ backgroundColor: theme.background.primary }}
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
