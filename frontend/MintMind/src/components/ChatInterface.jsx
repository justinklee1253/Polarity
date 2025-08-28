import { useState, useEffect, useRef } from "react";
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
  <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-4 relative">
    {/* Animated Background Elements */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-500/3 to-cyan-500/3 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>
    </div>

    <div className="text-center max-w-3xl w-full relative z-10">
      <h2 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 bg-clip-text text-transparent">
        What can I help with?
      </h2>
      <p className="text-slate-300 mb-10 text-xl leading-relaxed">
        Ask me anything about budgeting, saving, investing, or financial
        planning.
      </p>

      {/* Input bar in center with glassmorphism */}
      <div className="relative mb-10 max-w-2xl mx-auto">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/20">
          <Input
            placeholder="Ask Spark anything about finance..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pr-12 py-6 text-base bg-transparent border-0 focus:ring-0 text-white placeholder:text-slate-400 h-14 text-lg"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!inputMessage.trim() || isLoading}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 w-10 h-10 p-0 rounded-xl hover:scale-110 transition-all duration-200 shadow-lg shadow-emerald-500/25"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Recommendations with glassmorphism cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          "Help me create a monthly budget",
          "What's the best way to save for college?",
          "How should I start investing as a student?",
          "Tips for managing student debt",
        ].map((suggestion, index) => (
          <Button
            key={index}
            variant="ghost"
            className="text-left justify-start backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-sm py-4 px-4 h-auto whitespace-normal rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/10"
            onClick={() => onSendMessage(suggestion)}
            style={{ animationDelay: `${index * 100}ms` }}
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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    <div className="flex flex-col h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-500/3 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 left-20 w-64 h-64 bg-cyan-500/3 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute top-1/3 left-1/3 w-48 h-48 bg-emerald-500/2 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "3s" }}
        ></div>
      </div>

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
        <div className="flex flex-col h-full relative z-10">
          {/* Combined Chat Container */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl m-4 shadow-2xl shadow-black/20 overflow-hidden flex flex-col h-full">
            {/* Messages Area */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <ScrollArea className="h-full p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex gap-4 transition-all duration-500 ease-out ${
                        message.isBot ? "justify-start" : "justify-end"
                      }`}
                      style={{
                        opacity: 0,
                        transform: "translateY(20px)",
                        animation: `slideIn 0.5s ease-out ${
                          index * 0.1
                        }s forwards`,
                      }}
                    >
                      {message.isBot && (
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                          message.isBot
                            ? "backdrop-blur-xl bg-white/10 border border-white/10 text-white shadow-lg shadow-black/10"
                            : "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white ml-auto shadow-lg shadow-emerald-500/25"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.text}
                        </p>
                      </div>
                      {!message.isBot && (
                        <div className="w-10 h-10 backdrop-blur-xl bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/10">
                          <User className="h-5 w-5 text-slate-300" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-4 justify-start">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div className="backdrop-blur-xl bg-white/10 border border-white/10 p-5 rounded-2xl shadow-lg shadow-black/10">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Input Area - Connected to Messages */}
            <div className="border-t border-white/10 bg-white/5">
              <div className="max-w-3xl mx-auto p-6">
                <div className="relative">
                  <Input
                    placeholder="Ask Spark anything about finance..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pr-14 py-6 text-base bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/25 text-white placeholder:text-slate-400 rounded-xl h-14 backdrop-blur-xl transition-all duration-300"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputMessage.trim() || isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 w-10 h-10 p-0 rounded-xl hover:scale-110 transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
