'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useSocket } from '@/providers/SocketProvider';
import { apiFetch } from '@/lib/api';
import Header from '@/components/layout/Header';
import type { Message } from '@tfe/shared';

export default function ChatPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const { token, user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load message history
  useEffect(() => {
    if (!token || !matchId) return;
    apiFetch<Message[]>(`/chat/${matchId}/messages`, { token })
      .then(msgs => setMessages(msgs.reverse()))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, matchId]);

  // Socket events
  useEffect(() => {
    if (!socket || !matchId) return;

    socket.emit('chat:join', { matchId });
    socket.emit('chat:read', { matchId });

    const handleMessage = (msg: Message) => {
      if (msg.matchId === matchId) {
        setMessages(prev => [...prev, msg]);
      }
    };

    socket.on('chat:message', handleMessage);

    return () => {
      socket.off('chat:message', handleMessage);
      socket.emit('chat:leave', { matchId });
    };
  }, [socket, matchId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    socket.emit('chat:send', { matchId, body: input.trim() });
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header title="Chat" showBack />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No messages yet</p>
            <p className="text-sm mt-1">Say hello!</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMine = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                  isMine
                    ? 'bg-primary-500 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }`}>
                  <p className="text-sm">{msg.body}</p>
                  <p className={`text-xs mt-1 ${isMine ? 'text-primary-200' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    {isMine && msg.isRead && ' ✓✓'}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 px-4 py-3 bg-white">
        <div className="flex items-center gap-2">
          <input
            className="input-field flex-1"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="btn-primary px-4 py-3"
            onClick={sendMessage}
            disabled={!input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
