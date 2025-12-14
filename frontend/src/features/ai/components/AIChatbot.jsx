import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Lottie from 'lottie-react';
import AiService from '../api/ai-service';
import { useAIContext } from '../../../context/useAIContext';
import aiChatbotAnimation from '../../../assets/lottie/Ai-Chatbot.json';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { pageContext } = useAIContext();

  const [position, setPosition] = useState(() => ({
    x: window.innerWidth - 180,
    y: window.innerHeight - 100,
  }));
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    hasDragged.current = false;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;

      hasDragged.current = true;
      const newX = Math.max(10, Math.min(window.innerWidth - 60, e.clientX - dragOffset.current.x));
      const newY = Math.max(
        10,
        Math.min(window.innerHeight - 60, e.clientY - dragOffset.current.y)
      );

      setPosition({ x: newX, y: newY });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleButtonClick = () => {
    if (!hasDragged.current) {
      setIsOpen(!isOpen);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputValue.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await AiService.chat(newMessages, pageContext);
      if (response.success && response.data?.message) {
        setMessages([...newMessages, { role: 'assistant', content: response.data.message }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, an error occurred. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const buttonWidth = 64;
  const panelWidth = 380;
  const gap = 16;

  const panelStyle = {
    left: `${Math.max(10, position.x - panelWidth - gap)}px`,
    bottom: `${Math.max(
      10,
      Math.min(window.innerHeight - 600 - 10, window.innerHeight - position.y - buttonWidth)
    )}px`,
    maxHeight: 'calc(100vh - 40px)',
  };

  return (
    <>
      <div
        onMouseDown={handleMouseDown}
        onClick={handleButtonClick}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
        className={`fixed z-[9999] w-16 h-16 bg-white rounded-full shadow-lg hover:shadow-xl hover:shadow-gray-400/40 transition-[transform,box-shadow,background] duration-200 flex items-center justify-center ${
          isDragging ? 'scale-110' : 'hover:scale-105'
        }`}
        title="AI Sales Assistant - Drag to move"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-gray-700 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <Lottie
            animationData={aiChatbotAnimation}
            loop={true}
            className="w-12 h-12 pointer-events-none"
          />
        )}
      </div>

      {isOpen &&
        createPortal(
          <div
            style={panelStyle}
            className="fixed z-[9999] w-[380px] h-[600px] bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden animate-fade-in"
          >
            <div className="bg-blue-600 border-b border-blue-700 dark:bg-dark-card dark:border-b-white/10   px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">AI Sales Assistant</h3>
                  <p className="text-white/70 text-xs">Powered by LLaMA</p>
                </div>
              </div>
              <button
                onClick={handleClearChat}
                className="text-white/90 hover:text-white transition-colors text-xs px-2 py-1 rounded hover:bg-white/10"
                title="Clear chat"
              >
                Clear
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8 text-blue-500 dark:text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-gray-900 dark:text-white font-semibold mb-2">
                    Hi! I'm your AI Sales Assistant
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Ask me about sales strategies, pitch scripts, or tips for approaching leads
                  </p>
                  <div className="mt-4 space-y-2 w-full">
                    {[
                      'Analyze the data on this page',
                      'Tips for following up on contacted leads',
                      'Pitch script for managers in their 40s',
                    ].map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputValue(suggestion);
                          inputRef.current?.focus();
                        }}
                        className="w-full text-left text-xs px-3 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                          msg.role === 'user'
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white rounded-bl-md'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-white/10 px-4 py-3 rounded-2xl rounded-bl-md">
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="p-3 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#242424]">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-white/10 rounded-full text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-/20 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4B5563;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #374151;
        }
      `}</style>
    </>
  );
};

export default AIChatbot;
