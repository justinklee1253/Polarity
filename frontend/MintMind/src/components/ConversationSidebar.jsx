import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ConversationSidebar = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [hoveredId, setHoveredId] = useState(null);

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

  if (isCollapsed) {
    return (
      <div className="w-16 bg-white/80 backdrop-blur-sm border-r border-gray-200 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="w-10 h-10 p-0 mb-4"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onNewConversation}
          className="w-10 h-10 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-1"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold text-gray-800">Conversations</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewConversation}
            className="p-1"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={onNewConversation}
          className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Either there are no conversations --> or we map each conversation*/}
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group relative p-3 rounded-lg cursor-pointer transition-all",
                    activeConversationId === conversation.id
                      ? "bg-sky-100 border border-sky-200"
                      : "hover:bg-gray-50"
                  )}
                  onClick={() => onSelectConversation(conversation.id)}
                  onMouseEnter={() => setHoveredId(conversation.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {formatTimestamp(conversation.created_at)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Last message:{" "}
                        {formatTimestamp(conversation.last_modified)}
                      </p>
                    </div>
                    {hoveredId === conversation.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conversation.id);
                        }}
                        className="p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
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
