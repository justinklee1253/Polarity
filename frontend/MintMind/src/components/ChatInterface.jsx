import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, Sparkles } from "lucide-react";

const EmptyState = ({
  inputMessage,
  setInputMessage,
  handleSend,
  handleKeyPress,
  isLoading,
  onSendMessage,
}) => (
  <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-4">
    <div className="text-center max-w-3xl w-full">
      <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Sparkles className="h-8 w-8 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-3">
        What can I help with?
      </h2>
      <p className="text-gray-600 mb-8 text-lg">
        Ask me anything about budgeting, saving, investing, or financial
        planning.
      </p>

      {/* Input bar in center */}
      <div className="relative mb-8 max-w-2xl mx-auto">
        <Input
          placeholder="Ask Spark anything about finance..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full pr-12 py-6 text-base border-gray-300 focus:border-sky-500 focus:ring-sky-500 bg-white rounded-xl shadow-sm h-14"
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={!inputMessage.trim() || isLoading}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 w-8 h-8 p-0 rounded-lg"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Recommendations below input */}
      <div className="grid grid-cols-2 gap-2">
        {[
          "Help me create a monthly budget",
          "What's the best way to save for college?",
          "How should I start investing as a student?",
          "Tips for managing student debt",
        ].map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="text-left justify-start border-gray-200 hover:border-sky-300 hover:bg-sky-50 text-sm py-2 px-3 h-auto whitespace-normal"
            onClick={() => onSendMessage(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  </div>
);

const ChatInterface = ({
  messages,
  onSendMessage,
  isLoading,
  isNewConversation,
}) => {
  const [inputMessage, setInputMessage] = useState("");

  const handleSend = () => {
    if (!inputMessage.trim() || isLoading) return;
    onSendMessage(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {isNewConversation && messages.length === 0 ? (
        <EmptyState
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSend={handleSend}
          handleKeyPress={handleKeyPress}
          isLoading={isLoading}
          onSendMessage={onSendMessage}
        />
      ) : (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ScrollArea className="h-full p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${
                      message.isBot ? "justify-start" : "justify-end"
                    }`}
                  >
                    {message.isBot && (
                      <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] p-4 rounded-2xl ${
                        message.isBot
                          ? "bg-white border border-gray-200 text-gray-800"
                          : "bg-gradient-to-r from-sky-500 to-cyan-500 text-white ml-auto"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.text}
                      </p>
                    </div>
                    {!message.isBot && (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 p-4 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-sky-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-shrink-0 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto p-6">
              <div className="relative">
                <Input
                  placeholder="Ask Spark anything about finance..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pr-12 py-6 text-base border-gray-300 focus:border-sky-500 focus:ring-sky-500 bg-white rounded-xl shadow-sm h-14"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputMessage.trim() || isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 w-8 h-8 p-0 rounded-lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatInterface;
