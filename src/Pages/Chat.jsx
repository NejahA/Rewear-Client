import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Send, Trash2 } from 'lucide-react';

const socket = io('http://localhost:8001');

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [room, setRoom] = useState('');
  const [username, setUsername] = useState('');
  const [joined, setJoined] = useState(false);
  const [typing, setTyping] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    socket.on('message_history', (history) => setMessages(history));
    socket.on('receive_message', (msg) => setMessages((prev) => [...prev, msg]));
    socket.on('message_edited', (edited) =>
      setMessages((prev) => prev.map((m) => (m._id === edited._id ? edited : m)))
    );
    socket.on('message_deleted', ({ messageId }) =>
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, message: '[Deleted]' } : m
        )
      )
    );
    socket.on('user_typing', ({ username }) => setTyping(`${username} is typing...`));
    socket.on('user_stop_typing', () => setTyping(''));
    socket.on('message_error', (err) => alert(err.error));

    return () => {
      socket.off('message_history');
      socket.off('receive_message');
      socket.off('message_edited');
      socket.off('message_deleted');
      socket.off('user_typing');
      socket.off('user_stop_typing');
      socket.off('message_error');
    };
  }, []);

  const joinRoom = () => {
    if (room.trim() && username.trim()) {
      socket.emit('join_room', { room, username });
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !joined) return;
    socket.emit('send_message', { room, username, message: input, messageType: 'text' });
    setInput('');
    socket.emit('stop_typing', { room, username });
    clearTimeout(typingTimeoutRef.current);
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!joined) return;

    socket.emit('typing', { room, username });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { room, username });
    }, 1500);
  };

  const deleteMessage = (messageId) => {
    socket.emit('delete_message', { messageId, room });
  };

  if (!joined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md border border-purple-200/50">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome to Rew eord Chat
          </h2>
          <input
            placeholder="Your nickname"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-4 mb-5 rounded-2xl border border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-400 outline-none bg-white/70"
          />
          <input
            placeholder="Room name (e.g. AA)"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full p-4 mb-6 rounded-2xl border border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-400 outline-none bg-white/70"
          />
          <button
            onClick={joinRoom}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-2xl shadow-lg transform transition hover:scale-[1.02]"
          >
            Join Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-50 to-purple-50 dark:from-gray-950 dark:to-purple-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white py-4 px-6 shadow-xl">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Room: {room}</h1>
          <p className="text-sm opacity-90">You → {username}</p>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://images.unsplash.com/photo-1557683311-973673bafdeb?auto=format&fit=crop&q=80')] bg-cover bg-fixed opacity-40 dark:opacity-20">
        <div className="max-w-4xl mx-auto space-y-5">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex items-end gap-3 ${msg.username === username ? 'justify-end' : 'justify-start'}`}
            >
              {msg.username !== username && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex-shrink-0 shadow-md" />
              )}

              <div
                className={`group relative max-w-[70%] px-5 py-3 rounded-3xl shadow-md transition-all hover:shadow-xl ${
                  msg.username === username
                    ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-br-none'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none border border-purple-200 dark:border-purple-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">
                    {msg.username === username ? 'You' : msg.username}
                  </span>
                  {msg.username === username && !msg.isDeleted && (
                    <button
                      onClick={() => deleteMessage(msg._id)}
                      className="opacity-0 group-hover:opacity-100 transition text-red-300 hover:text-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <p className={msg.isDeleted ? 'italic opacity-70' : ''}>{msg.message}</p>

                <div className="text-xs mt-2 opacity-70 flex items-center gap-2">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {msg.isEdited && <span className="italic">(edited)</span>}
                </div>
              </div>

              {msg.username === username && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex-shrink-0 shadow-md" />
              )}
            </div>
          ))}

          {typing && <div className="text-purple-600 dark:text-purple-400 italic pl-14 animate-pulse">{typing}</div>}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-purple-200 dark:border-purple-800 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <input
            value={input}
            onChange={handleTyping}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder="Type something colorful..."
            className="flex-1 py-4 px-6 bg-purple-50 dark:bg-purple-950/50 border border-purple-300 dark:border-purple-700 rounded-full focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400 transition"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition shadow-md"
          >
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}