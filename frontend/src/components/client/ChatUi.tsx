import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Joi from 'joi';
import { joiResolver } from '@hookform/resolvers/joi';
import axios from 'axios';

const messageSchema = Joi.object({
  message: Joi.string().min(1).required().messages({
    'string.empty': 'Tin nhắn không được để trống',
    'string.min': 'Tin nhắn không được để trống'
  })
});

const useChatMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const welcomeMessageSent = useRef(false);

  const addMessage = (message) => {
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      ...message,
      timestamp: new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }]);
  };

  const initializeChat = () => {
    if (!welcomeMessageSent.current) {
      addMessage({
        text: 'Xin chào! Tôi có thể giúp gì cho bạn?',
        sender: 'admin'
      });
      welcomeMessageSent.current = true;
    }
  };

  return {
    messages,
    setMessages,
    isTyping,
    setIsTyping,
    addMessage,
    initializeChat
  };
};

const ChatUI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isTyping, setIsTyping, addMessage, initializeChat } = useChatMessages();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: joiResolver(messageSchema),
    defaultValues: {
      message: ''
    }
  });

  // Load initial messages once
  useEffect(() => {
    try {
      initializeChat();
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Không thể tải tin nhắn. Vui lòng thử lại sau!');
    }
  }, []); // Empty dependency array ensures this runs only once

  const onSubmit = async (data) => {
    try {
      const messageData = {
        text: data.message,
        sender: 'user'
      };

      // Add message locally
      addMessage(messageData);

      // Reset form
      reset();

      // Simulate typing response
      setIsTyping(true);
      
      // Simulate API delay and response
      setTimeout(() => {
        setIsTyping(false);
        addMessage({
          text: 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.',
          sender: 'admin'
        });
      }, 2000);

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Không thể gửi tin nhắn. Vui lòng thử lại!');
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all duration-200 ${
          isOpen ? 'hidden' : 'flex items-center gap-2'
        }`}
      >
        <MessageSquare className="w-6 h-6" />
        <span className="hidden md:inline">Chat with GoShoes</span>
      </button>

      {isOpen && (
        <div className="w-80 md:w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col">
          <div className="p-4 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <h3 className="font-medium">GoShoes Support Online</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 p-1 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div 
            id="message-container"
            className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'admin' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white mr-2">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div className="flex flex-col max-w-[75%]">
                  <div
                    className={`p-3 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white shadow-sm rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <User className="w-5 h-5" />
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm inline-block">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  {...register('message')}
                  type="text"
                  placeholder="Enter your message ..."
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.message && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors.message.message}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatUI;