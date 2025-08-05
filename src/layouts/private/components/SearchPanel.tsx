"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Clock,
  Users,
  Folder,
  CheckSquare,
  Target,
  Briefcase,
} from "lucide-react";
import { SearchInput } from "@/components/ui/SearchInput";
import { SearchDropdown, SearchResult, SavedSearch, SearchTab } from "@/components/ui/SearchDropdown";

interface SearchPanelProps {
  onSearch: (query: string) => void;
  className?: string;
}



const SEARCH_TABS: SearchTab[] = [
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "projects", label: "Projects", icon: Folder },
  { id: "people", label: "People", icon: Users },
  { id: "portfolios", label: "Portfolios", icon: Briefcase },
  { id: "goals", label: "Goals", icon: Target },
];

export default function SearchPanel({
  onSearch,
  className = "",
}: SearchPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("tasks");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentItems, setRecentItems] = useState<SearchResult[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const mockSearchResults: Record<string, SearchResult[]> = useMemo(
    () => ({
      tasks: [
        {
          id: "1",
          title: "Draft project brief",
          type: "task",
          description: "Cross-functional project plan",
          avatar: "LC",
        },
        {
          id: "2",
          title: "Schedule kickoff meeting",
          type: "task",
          description: "Cross-functional project plan",
          avatar: "JD",
        },
      ],
      projects: [
        {
          id: "3",
          title: "Cross-functional project plan",
          type: "project",
          description: "K",
          avatar: "K",
        },
        {
          id: "4",
          title: "K 1 project",
          type: "project",
          description: "Marketing initiative",
        },
      ],
      people: [
        {
          id: "5",
          title: "John Doe",
          type: "people",
          description: "Product Manager",
          avatar: "JD",
        },
      ],
    }),
    []
  );

  const mockRecentItems = useMemo(
    () => [
      {
        id: "r1",
        title: "Cross-functional project plan",
        type: "project",
        description: "K",
        avatar: "K",
      },
      {
        id: "r2",
        title: "Schedule kickoff meeting",
        type: "task",
        description: "Cross-functional project plan",
        avatar: "LC",
      },
      {
        id: "r3",
        title: "Draft project brief",
        type: "task",
        description: "Cross-functional project plan",
        avatar: "LC",
      },
    ],
    []
  );

  const mockSavedSearches = useMemo(
    () => [
      {
        id: "s1",
        title: "Tasks I've created",
        description: "→ Tasks I've assigned to others",
        icon: CheckSquare,
      },
      {
        id: "s2",
        title: "Recently completed tasks",
        description: "● Recently completed tasks",
        icon: Clock,
      },
    ],
    []
  );

  useEffect(() => {
    setRecentItems(mockRecentItems);
    setSavedSearches(mockSavedSearches);
  }, [mockRecentItems, mockSavedSearches]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsOpen(true);
      } else if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        const results = mockSearchResults[activeTab] || [];
        const filtered = results.filter(
          (item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, activeTab, mockSearchResults]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      onSearch(value);
    },
    [onSearch]
  );

  const handleOpenPanel = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  const handleResultClick = useCallback((result: SearchResult) => {
    console.log("Navigate to:", result.id);
    setIsOpen(false);
  }, []);

  const handleSavedSearchClick = useCallback((search: SavedSearch) => {
    console.log("Execute saved search:", search.id);
    setIsOpen(false);
  }, []);

  const handleRecentClick = useCallback((item: SearchResult) => {
    console.log("Navigate to recent:", item.id);
    setIsOpen(false);
  }, []);

  return (
    <div className={`relative w-full ${className}`} ref={searchRef}>
      <SearchInput
        value={searchQuery}
        onChange={handleSearchChange}
        onFocus={handleOpenPanel}
        placeholder="Search tasks, projects, and more..."
        showShortcut={true}
        size="md"
        variant="default"
        className="max-w-2xl mx-auto"
      />

      <SearchDropdown
        isOpen={isOpen}
        searchQuery={searchQuery}
        searchResults={searchResults}
        recentItems={recentItems}
        savedSearches={savedSearches}
        isSearching={isSearching}
        activeTab={activeTab}
        tabs={SEARCH_TABS}
        onTabChange={handleTabChange}
        onResultClick={handleResultClick}
        onSavedSearchClick={handleSavedSearchClick}
        onRecentClick={handleRecentClick}
        position="center"
      />
    </div>
  );
}
