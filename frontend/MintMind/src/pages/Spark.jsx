import { useState, useEffect } from "react";
import WelcomeModal from "@/components/WelcomeModal";
import ConversationSidebar from "@/components/ConversationSidebar";
import ChatInterface from "@/components/ChatInterface";
import {
  create_conversation,
  get_conversations,
  get_conversation_messages,
  get_specific_conversation,
  delete_conversation,
  send_user_message,
} from "@/services/chat";

const Spark = () => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Function to fetch and update conversations
  const fetchConversations = async () => {
    try {
      const { data } = await get_conversations();
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
    if (!activeConversationId || !messageText.trim()) return;

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
      await send_user_message(activeConversationId, messageText);

      // After sending, fetch both the updated message list and refresh conversations
      const [messagesResponse] = await Promise.all([
        get_conversation_messages(activeConversationId),
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
    <div className="h-screen min-h-0 flex bg-gray-50 overflow-hidden p-0 m-0">
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        userName="Student"
      />

      <ConversationSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 h-full min-h-0 flex flex-col">
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
