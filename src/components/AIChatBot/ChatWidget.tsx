'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiChatDotsBold, PiXBold, PiPaperPlaneRightBold, PiSparkleFill } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Title, Text } from '@/components/ui/text';
import { Avatar } from '@/components/ui/avatar';
import cn from '@/utils/class-names';
import apiService from '@/utils/apiService';
import { decryptData } from '@/components/encriptdycriptdata';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your Prosale AI Assistant. How can I help you with your leads today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get user data from localStorage (matching existing pattern in ProfileMenu)
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const ncryptedData = localStorage.getItem('uData');
    if (ncryptedData) {
      setUserData(decryptData(ncryptedData));
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiService.post('/ai-chat', {
        message: userMsg.text,
        userId: userData?.user?.id,
        userType: userData?.user?.user_type || userData?.user?.role,
        name: userData?.user ? `${userData.user.first_name} ${userData.user.last_name}` : 'User',
        permission: userData?.user?.permissions?.permission_level || userData?.user?.permission,
        history: messages.slice(-5).map(m => ({
          role: m.sender === 'bot' ? 'model' : 'user',
          parts: [{ text: m.text }]
        }))
      });

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data?.message || "I'm sorry, I'm having trouble connecting to the AI brain.",
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMsg = error.response?.status === 429 
        ? "⚠️ AI Quota Exceeded. The free tier has a daily limit. Please try again in a few minutes or tomorrow."
        : "⚠️ Connection error. Please check your internet or backend status.";
        
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: errorMsg,
        sender: 'bot',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-primary p-4 text-white" style={{ backgroundColor: '#c95a64' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <PiSparkleFill className="h-6 w-6" />
                </div>
                <div>
                  <Title as="h6" className="text-sm font-bold text-white">AI Assistant</Title>
                  <Text className="text-[10px] text-white/80">Online | Powered by Prosale</Text>
                </div>
              </div>
              <Button
                variant="text"
                onClick={() => setIsOpen(false)}
                className="h-auto p-1 text-white hover:bg-white/10"
              >
                <PiXBold className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex w-full",
                    msg.sender === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "flex gap-2 max-w-[85%]",
                    msg.sender === 'user' ? "flex-row-reverse" : "flex-row"
                  )}>
                    {msg.sender === 'bot' && (
                      <Avatar name="AI" className="h-8 w-8 text-[10px]" style={{ backgroundColor: '#c95a64' }} src="" />
                    )}
                    <div className={cn(
                      "rounded-2xl p-3 shadow-sm",
                      msg.sender === 'user' 
                        ? "bg-primary text-white" 
                        : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    )}
                    style={msg.sender === 'user' ? { backgroundColor: '#c95a64' } : {}}
                    >
                      <Text className="text-sm leading-relaxed">{msg.text}</Text>
                      <div className={cn(
                        "mt-1 text-[10px]",
                        msg.sender === 'user' ? "text-white/60 text-right" : "text-gray-400"
                      )}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                   <div className="flex gap-2 bg-white dark:bg-gray-700 p-3 rounded-2xl shadow-sm italic text-xs text-gray-500">
                     AI is thinking...
                   </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-3 dark:border-gray-700">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <Input
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-grow !border-none !ring-0 focus:!ring-0"
                  inputClassName="h-10 text-sm"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || isLoading}
                  className="bg-primary hover:bg-primary/90"
                  style={{ backgroundColor: '#c95a64' }}
                >
                  <PiPaperPlaneRightBold className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg ring-4 ring-white transition-all hover:shadow-xl dark:ring-gray-800"
        style={{ backgroundColor: '#c95a64' }}
      >
        {isOpen ? (
          <PiXBold className="h-6 w-6 text-white" />
        ) : (
          <PiChatDotsBold className="h-7 w-7 text-white" />
        )}
      </motion.button>
    </div>
  );
}
