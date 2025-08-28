import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ConversationSidebar = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isCollapsed,
  onToggleCollapse,
  appSidebarCollapsed = false, // Add this prop to know AppSidebar state
}) => {
  const [hoveredId, setHoveredId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    if (isNaN(date)) return "N/A";
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // Generate a better title from the conversation or use a default
  const getConversationTitle = (conversation) => {
    if (conversation.title && conversation.title.trim() !== "") {
      return conversation.title;
    }
    // If no title, create one from the conversation ID or use a default
    return `Conversation ${conversation.id}`;
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter((conversation) =>
    getConversationTitle(conversation)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Adjust positioning based on main sidebar state
  const sidebarPositioning = appSidebarCollapsed ? "left-16" : "left-64"; // Position based on main sidebar width

  if (isCollapsed) {
    return (
      <div
        className={cn(
          "w-16 flex flex-col items-center py-4 fixed top-0 h-full z-40 transition-all duration-300",
          sidebarPositioning
        )}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="w-12 h-12 p-0 mb-4 text-slate-300 hover:text-emerald-400 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-80 backdrop-blur-xl bg-slate-900/40 flex flex-col transition-all duration-300 ease-in-out relative overflow-hidden fixed top-0 h-full z-40",
        sidebarPositioning
      )}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 via-transparent to-cyan-900/10" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />

      <div className="p-6 border-b border-white/10 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          <h2 className="font-bold text-white text-lg bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Conversations
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-emerald-500/50 rounded-xl h-10"
          />
        </div>

        <Button
          onClick={onNewConversation}
          className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl h-11 font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/25"
        >
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 relative z-10">
        <div className="p-4">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-500 opacity-50" />
              <p className="text-sm text-slate-400">
                {searchTerm ? "No conversations found" : "No conversations yet"}
              </p>
              {searchTerm && (
                <p className="text-xs text-slate-500 mt-1">
                  Try a different search term
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredConversations.map((conversation, index) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group relative backdrop-blur-xl border rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden",
                    activeConversationId === conversation.id
                      ? "bg-emerald-500/20 border-emerald-500/30 shadow-lg shadow-emerald-500/25 scale-105"
                      : "bg-white/5 border-white/10 hover:shadow-lg hover:shadow-emerald-500/20 hover:border-emerald-500/20"
                  )}
                  onClick={() => onSelectConversation(conversation.id)}
                  onMouseEnter={() => setHoveredId(conversation.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Active indicator */}
                  {activeConversationId === conversation.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-r-full" />
                  )}

                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-white truncate leading-snug">
                            {getConversationTitle(conversation)}
                          </p>
                          {hoveredId === conversation.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteConversation(conversation.id);
                              }}
                              className="p-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-all duration-300 ml-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg hover:scale-110"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400">
                            Created: {formatTimestamp(conversation.created_at)}
                          </p>
                          <p className="text-xs text-slate-400">
                            Updated:{" "}
                            {formatTimestamp(conversation.last_modified)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationSidebar;
