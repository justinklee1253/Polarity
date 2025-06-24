import { useState, useEffect } from "react";
import WelcomeModal from "@/components/WelcomeModal";
import ConversationSidebar from "@/components/ConversationSidebar";
import ChatInterface from "@/components/ChatInterface";

const Spark = () => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if this is the user's first visit in this session
  useEffect(() => {
    const hasVisitedSpark = sessionStorage.getItem("hasVisitedSpark");
    if (!hasVisitedSpark) {
      setShowWelcomeModal(true);
      sessionStorage.setItem("hasVisitedSpark", "true");
    }

    // Load conversations from localStorage
    const savedConversations = localStorage.getItem("sparkConversations");
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations);
      setConversations(parsed);
      if (parsed.length > 0) {
        setActiveConversationId(parsed[0].id);
      }
    }
  }, []);

  const saveConversations = (updatedConversations) => {
    localStorage.setItem(
      "sparkConversations",
      JSON.stringify(updatedConversations)
    );
  };

  const handleNewConversation = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: "New conversation",
      timestamp: Date.now(),
      messages: [],
    };

    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    setActiveConversationId(newConversation.id);
    saveConversations(updatedConversations);
  };

  const handleSelectConversation = (conversationId) => {
    setActiveConversationId(conversationId);
  };

  const handleDeleteConversation = (conversationId) => {
    const updatedConversations = conversations.filter(
      (conv) => conv.id !== conversationId
    );
    setConversations(updatedConversations);

    if (activeConversationId === conversationId) {
      if (updatedConversations.length > 0) {
        setActiveConversationId(updatedConversations[0].id);
      } else {
        setActiveConversationId(null);
      }
    }

    saveConversations(updatedConversations);
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    let currentConversationId = activeConversationId;

    // If no active conversation, create a new one
    if (!currentConversationId) {
      const newConversation = {
        id: Date.now().toString(),
        title:
          messageText.slice(0, 50) + (messageText.length > 50 ? "..." : ""),
        timestamp: Date.now(),
        messages: [],
      };

      const updatedConversations = [newConversation, ...conversations];
      setConversations(updatedConversations);
      setActiveConversationId(newConversation.id);
      currentConversationId = newConversation.id;
      saveConversations(updatedConversations);
    }

    const userMessage = {
      id: Date.now(),
      text: messageText,
      isBot: false,
      timestamp: Date.now(),
    };

    // Update conversation with user message
    const updatedConversations = conversations.map((conv) => {
      if (conv.id === currentConversationId) {
        const updatedMessages = [...conv.messages, userMessage];
        // Update title if this is the first message
        const title =
          conv.messages.length === 0
            ? messageText.slice(0, 50) + (messageText.length > 50 ? "..." : "")
            : conv.title;

        return {
          ...conv,
          messages: updatedMessages,
          title,
          timestamp: Date.now(),
        };
      }
      return conv;
    });

    // If this is a new conversation not yet in the array
    if (!conversations.find((conv) => conv.id === currentConversationId)) {
      const newConv = {
        id: currentConversationId,
        title:
          messageText.slice(0, 50) + (messageText.length > 50 ? "..." : ""),
        timestamp: Date.now(),
        messages: [userMessage],
      };
      updatedConversations.unshift(newConv);
    }

    setConversations(updatedConversations);
    saveConversations(updatedConversations);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        text: "I understand you're looking for financial advice. While I'm still learning about your specific situation, I can help you with general budgeting tips, savings strategies, and financial planning. What specific area would you like to focus on?",
        isBot: true,
        timestamp: Date.now(),
      };

      const finalConversations = updatedConversations.map((conv) => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, botMessage],
            timestamp: Date.now(),
          };
        }
        return conv;
      });

      setConversations(finalConversations);
      saveConversations(finalConversations);
      setIsLoading(false);
    }, 1500);
  };

  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId
  );
  const messages = activeConversation ? activeConversation.messages : [];
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
        isNewConversation={isNewConversation}
      />
    </div>
  );
};

export default Spark;
