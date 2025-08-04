"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  X,
  Clock,
  Users,
  Folder,
  CheckSquare,
  Target,
  Briefcase,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar/Avatar";
import Button from "@/components/ui/Button/Button";

interface SearchPanelProps {
  onSearch: (query: string) => void;
  className?: string;
}

interface SearchResult {
  id: string;
  title: string;
  type: "task" | "project" | "people" | "portfolio" | "goal";
  description?: string;
  avatar?: string;
  completed?: boolean;
}

interface SavedSearch {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface SearchTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const SEARCH_TABS: SearchTab[] = [
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "projects", label: "Projects", icon: Folder },
  { id: "people", label: "People", icon: Users },
  { id: "portfolios", label: "Portfolios", icon: Briefcase },
  { id: "goals", label: "Goals", icon: Target },
];

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  placeholder?: string;
  showShortcut?: boolean;
  className?: string;
}

const SearchInput = ({
  value,
  onChange,
  onFocus,
  placeholder = "Search tasks, projects, and more...",
  showShortcut = true,
  className = "",
}: SearchInputProps) => {
  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search size={16} className="text-gray-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        className="w-full pl-12 pr-20 py-3.5 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition-all duration-200 shadow-sm hover:bg-gray-650"
        style={{
          minWidth: "400px",
          maxWidth: "100%",
        }}
      />
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center space-x-2">
        {value && (
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X size={16} />
          </button>
        )}
        {showShortcut && (
          <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-800 border border-gray-600 rounded">
            ⌘K
          </kbd>
        )}
      </div>
    </div>
  );
};

const SearchResultItem = ({
  item,
  onClick,
}: {
  item: SearchResult;
  onClick?: () => void;
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "task":
        return CheckSquare;
      case "project":
        return Folder;
      case "people":
        return Users;
      case "portfolio":
        return Briefcase;
      case "goal":
        return Target;
      default:
        return CheckSquare;
    }
  };

  const IconComponent = getTypeIcon(item.type);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-left transition-colors group"
    >
      {item.avatar ? (
        <Avatar name={item.avatar} size="sm" className="w-6 h-6" />
      ) : (
        <div className="w-6 h-6 flex items-center justify-center text-gray-400 group-hover:text-gray-600">
          <IconComponent size={16} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {item.title}
        </p>
        {item.description && (
          <p className="text-xs text-gray-500 truncate">{item.description}</p>
        )}
      </div>
    </button>
  );
};

const TabButton = ({
  tab,
  isActive,
  onClick,
}: {
  tab: SearchTab;
  isActive: boolean;
  onClick: () => void;
}) => {
  const IconComponent = tab.icon;
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
        isActive
          ? "bg-orange-100 text-orange-700 border border-orange-200"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent"
      }`}
    >
      <IconComponent size={14} />
      <span>{tab.label}</span>
    </button>
  );
};

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

  return (
    <div className={`relative w-full ${className}`} ref={searchRef}>
      <SearchInput
        value={searchQuery}
        onChange={handleSearchChange}
        onFocus={handleOpenPanel}
        className="max-w-2xl mx-auto"
      />

      {isOpen && (
        <div
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-xl border border-gray-200 overflow-hidden z-[60]"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            minWidth: "600px",
            maxWidth: "90vw",
          }}
        >
          <div className="px-6 pt-6 border-b border-gray-100">
            <div className="flex space-x-2 overflow-x-auto pb-4">
              {SEARCH_TABS.map((tab) => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  onClick={() => handleTabChange(tab.id)}
                />
              ))}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {searchQuery.trim() ? (
              <div className="p-6">
                {isSearching ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 capitalize">
                      {activeTab} ({searchResults.length})
                    </h3>
                    <div className="space-y-1">
                      {searchResults.map((result) => (
                        <SearchResultItem
                          key={result.id}
                          item={result}
                          onClick={() => console.log("Navigate to:", result.id)}
                        />
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                      >
                        <Search size={14} />
                        <span>↵ Return to view all results</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-2">
                      <Search size={24} className="mx-auto" />
                    </div>
                    <p className="text-sm text-gray-500">
                      No results found for &quot;{searchQuery}&quot;
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6">
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Recents
                  </h3>
                  <div className="space-y-1">
                    {recentItems.map((item) => (
                      <SearchResultItem
                        key={item.id}
                        item={item}
                        onClick={() =>
                          console.log("Navigate to recent:", item.id)
                        }
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Saved searches
                  </h3>
                  <div className="space-y-1">
                    {savedSearches.map((search) => (
                      <button
                        key={search.id}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-left transition-colors group"
                        onClick={() =>
                          console.log("Execute saved search:", search.id)
                        }
                      >
                        <div className="w-6 h-6 flex items-center justify-center text-gray-400 group-hover:text-gray-600">
                          <search.icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {search.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {search.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
