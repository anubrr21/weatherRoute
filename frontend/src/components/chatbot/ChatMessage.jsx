// frontend/src/components/chatbot/ChatMessage.jsx
import React from 'react';
import { User, Bot } from 'lucide-react';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  const formatContent = (content) => {
    // Prevent crashes if content is null/undefined
    if (content === null || content === undefined) {
      return [<p key="empty" className="text-sm">No response</p>];
    }

    // Convert objects into readable text
    if (typeof content !== 'string') {
      try {
        if (content.response) {
          content = content.response;
        } else if (content.text) {
          content = content.text;
        } else {
          content = JSON.stringify(content, null, 2);
        }
      } catch (error) {
        content = String(content);
      }
    }

    return content.split('\n').map((line, i) => {
      if (line.startsWith('•')) {
        return (
          <li key={i} className="ml-4 text-sm">
            {line.substring(1)}
          </li>
        );
      }

      if (line.startsWith('#')) {
        return (
          <h4 key={i} className="font-bold mt-2 mb-1">
            {line.replace('#', '')}
          </h4>
        );
      }

      if (line.trim() === '') {
        return <br key={i} />;
      }

      return (
        <p key={i} className="text-sm">
          {line}
        </p>
      );
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`flex max-w-[80%] ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <div className={`flex-shrink-0 ${isUser ? 'ml-2' : 'mr-2'}`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isUser ? 'bg-primary-500' : 'bg-gray-500'
            }`}
          >
            {isUser ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>
        </div>

        <div
          className={`rounded-lg p-3 ${
            isUser
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 dark:bg-dark-300 text-gray-800 dark:text-gray-200'
          }`}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {formatContent(message.content)}
          </div>

          <div
            className={`text-xs mt-1 ${
              isUser ? 'text-primary-100' : 'text-gray-400'
            }`}
          >
            {message.timestamp
              ? new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;