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

  // Check if this is the user's first visit in this session
  useEffect(() => {
    const hasVisitedSpark = sessionStorage.getItem("hasVisitedSpark");
    if (!hasVisitedSpark) {
      setShowWelcomeModal(true);
      sessionStorage.setItem("hasVisitedSpark", "true");
    } //initially sessionStorage is false, and if there is no hasVisitedSpark we will show modal as precaution

    //Load conversations from backend server
    async function fetchConversations() {
      try {
        const { data } = await get_conversations();
        const sorted = [...data].sort(
          (a, b) => new Date(b.last_modified) - new Date(a.last_modified)
        );
        setConversations(sorted);
        if (sorted.length > 0) {
          setActiveConversationId(sorted[0].id);
        }
        setErrorMessage("");
      } catch (error) {
        let msg = "Failed to load conversations.";

        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          msg = error.response.data.error;
        }

        setErrorMessage(msg);
      }
    }
    fetchConversations().then(() => {
      if (conversations.length > 0) {
        handleSelectConversation(conversations[0].id);
      }
    });
  }, []);

  const saveConversations = (updatedConversations) => {
    localStorage.setItem(
      "sparkConversations",
      JSON.stringify(updatedConversations)
    );
  };

  const handleNewConversation = async () => {
    //Refactor: call new conversation from service layer
    const { data } = await create_conversation(); //destructures our response, storing it in data
    const newConversation = {
      id: data.id,
      title: data.title,
      timestamp: new Date(data.created_at).getTime(),
      messages: [],
    };

    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    setActiveConversationId(newConversation.id);
    saveConversations(updatedConversations);
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
      // Remove from local state
      const updatedConversations = conversations.filter(
        (conv) => conv.id !== conversationId
      );
      setConversations(updatedConversations);

      // If the deleted conversation was active, select the next one
      if (activeConversationId === conversationId) {
        if (updatedConversations.length > 0) {
          setActiveConversationId(updatedConversations[0].id);
        } else {
          setActiveConversationId(null);
        }
      }
      // Optionally clear messages if the active conversation was deleted
      // setMessages([]);
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
      // After sending, fetch the updated message list from backend
      const { data } = await get_conversation_messages(activeConversationId);
      const formattedMessages = data.map((msg) => ({
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
    <div className="h-screen flex bg-gray-50">
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        userName="Student" // You can replace this with actual user name from context/props
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
  );
};

export default Spark;
