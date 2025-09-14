import { useState, useEffect } from "react";
import WelcomeModal from "@/components/WelcomeModal";
import ConversationSidebar from "@/components/ConversationSidebar";
import ChatInterface from "@/components/ChatInterface";
import { useSidebar } from "@/components/ui/sidebar";
import {
  create_conversation,
  get_conversations,
  get_conversation_messages,
  get_specific_conversation,
  delete_conversation,
  send_user_message,
} from "@/services/chat";
import { getCurrentUser } from "@/services/auth";

const Spark = () => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);

  // Get main sidebar state
  const { state: mainSidebarState } = useSidebar();
  const isMainSidebarCollapsed = mainSidebarState === "collapsed";

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      const { data } = await getCurrentUser();
      setUserData(data);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  // Helper function to get first name from full name
  const getFirstName = (fullName) => {
    if (!fullName) return "Student";
    return fullName.split(" ")[0];
  };

  // Function to fetch and update conversations
  const fetchConversations = async () => {
    try {
      const { data } = await get_conversations(); //We abstract away logic for fetching conversations in service layer
      const sorted = [...data].sort(
        (a, b) => new Date(b.last_modified) - new Date(a.last_modified)
      );
      setConversations(sorted);
      if (sorted.length > 0 && !activeConversationId) {
        setActiveConversationId(sorted[0].id);
      }
      setErrorMessage("");
      return sorted;
    } catch (error) {
      let msg = "Failed to load conversations.";

      if (error.response && error.response.data && error.response.data.error) {
        msg = error.response.data.error;
      }

      setErrorMessage(msg);
      return [];
    }
  };

  // Check if this is the user's first visit in this session
  useEffect(() => {
    // Fetch user data on component mount
    fetchUserData();

    const hasVisitedSpark = sessionStorage.getItem("hasVisitedSpark");
    if (!hasVisitedSpark) {
      setShowWelcomeModal(true);
      sessionStorage.setItem("hasVisitedSpark", "true");
    } //initially sessionStorage is false, and if there is no hasVisitedSpark we will show modal as precaution

    //Load conversations from backend server
    fetchConversations().then((sorted) => {
      if (sorted.length > 0) {
        handleSelectConversation(sorted[0].id);
      }
    });
  }, []);

  const handleNewConversation = async () => {
    try {
      //Refactor: call new conversation from service layer
      const { data } = await create_conversation(); //destructures our response, storing it in data

      // Refresh conversations list to get the updated data from backend
      await fetchConversations();
      setActiveConversationId(data.id);
      setMessages([]); // Clear messages for new conversation
    } catch (error) {
      setErrorMessage("Failed to create new conversation.");
    }
  };

  const handleSelectConversation = async (conversationId) => {
    setActiveConversationId(conversationId);
    setIsLoading(true);
    try {
      const { data } = await get_conversation_messages(conversationId);
      const formattedMessages = data.map((msg) => ({
        id: msg.id,
        text: msg.content,
        isBot: msg.sender !== "user",
        timestamp: msg.timestamp,
      }));
      setMessages(formattedMessages);
    } catch (error) {
      setMessages([]);
    }
    setIsLoading(false);
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      await delete_conversation(conversationId);

      // Refresh conversations list from backend
      const updatedConversations = await fetchConversations();

      // If the deleted conversation was active, select the next one
      if (activeConversationId === conversationId) {
        if (updatedConversations.length > 0) {
          setActiveConversationId(updatedConversations[0].id);
        } else {
          setActiveConversationId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      // Optionally show an error message
      setErrorMessage("Failed to delete conversation.");
    }
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    let conversationId = activeConversationId;

    // If no active conversation, create one first
    if (!conversationId) {
      try {
        // Create new conversation
        const { data } = await create_conversation();
        conversationId = data.id;

        // Update state with new conversation
        await fetchConversations();
        setActiveConversationId(conversationId);
        setMessages([]); // Clear messages for new conversation
      } catch (error) {
        setErrorMessage("Failed to create new conversation.");
        return;
      }
    }

    // Optimistically add the user's message to the UI
    const userMessage = {
      id: Date.now(),
      text: messageText,
      isBot: false,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      await send_user_message(conversationId, messageText);

      // After sending, fetch both the updated message list and refresh conversations
      const [messagesResponse] = await Promise.all([
        get_conversation_messages(conversationId),
        fetchConversations(),
      ]);

      // Update messages
      const formattedMessages = messagesResponse.data.map((msg) => ({
        id: msg.id,
        text: msg.content,
        isBot: msg.sender !== "user",
        timestamp: msg.timestamp,
      }));
      setMessages(formattedMessages);
    } catch (error) {
      // Optionally show an error message
    }
    setIsLoading(false);
  };

  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId
  );
  const isNewConversation = !activeConversation || messages.length === 0;

  return (
    <div className="h-screen min-h-0 flex overflow-hidden p-0 m-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 fixed inset-0">
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        userName={getFirstName(userData?.name)}
      />

      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        appSidebarCollapsed={isMainSidebarCollapsed}
      />

      <div
        className="flex-1 h-full min-h-0 flex flex-col transition-all duration-300"
        style={{
          marginLeft: `${
            sidebarCollapsed
              ? isMainSidebarCollapsed
                ? 64
                : 256
              : (isMainSidebarCollapsed ? 64 : 256) + 320
          }px`,
        }}
      >
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isNewConversation={messages.length === 0}
        />
        {errorMessage && (
          <div className="text-red-500 text-center py-2">{errorMessage}</div>
        )}
      </div>
    </div>
  );
};

export default Spark;
