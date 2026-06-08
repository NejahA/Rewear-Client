import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../../context/AuthContex';
import { Send, Trash2, Edit2, Check, X, MessageCircle, User } from 'lucide-react';

const API = import.meta.env.VITE_VERCEL_URI;
const SOCKET = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? import.meta.env.VITE_SOCKET_URI
  : import.meta.env.VITE_PROD_SOCKET_URI;

/**
 * ChatRoom – a full‑featured chat UI that uses the REST API for
 * fetching / editing / deleting messages, and Socket.IO for real‑time.
 */
export default function ChatRoom({ roomId, onBack }) {
  const { user, isLoggedIn, loggedId } = useAuth();

  // ─── state ───────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);

  const username = user?.fName || 'Anonymous';
  const room = roomId;

  // ─── scroll to bottom ─────────────────────────────────────────
  const scrollDown = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  // ─── fetch messages via REST API ──────────────────────────────
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/api/messages/${room}`, { withCredentials: true });
      if (data.success) setMessages(data.messages);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [room]);

  // ─── socket.io setup ──────────────────────────────────────────
  useEffect(() => {
    if (!room) return;

    const socket = io(SOCKET, { 
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.emit('join_room', { room, username });

    socket.on('message_history', (history) => {
      setMessages(history);
      scrollDown();
    });

    socket.on('receive_message', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      scrollDown();
    });

    socket.on('message_edited', (edited) => {
      setMessages((prev) => prev.map((m) => (m._id === edited._id ? edited : m)));
    });

    socket.on('message_deleted', ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, message: '[Deleted]' } : m,
        ),
      );
    });

    socket.on('user_typing', ({ username: name }) => setTypingUser(`${name} is typing...`));
    socket.on('user_stop_typing', () => setTypingUser(''));
    socket.on('message_error', (err) => console.error(err.error));

    return () => {
      socket.off('message_history');
      socket.off('receive_message');
      socket.off('message_edited');
      socket.off('message_deleted');
      socket.off('user_typing');
      socket.off('user_stop_typing');
      socket.off('message_error');
      socket.disconnect();
    };
  }, [room, username, scrollDown]);

  // ─── send message ─────────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      socketRef.current.emit('send_message', {
        room,
        username,
        userId: loggedId,
        message: input,
        messageType: 'text',
      });
      setInput('');
      socketRef.current.emit('stop_typing', { room, username });
      clearTimeout(typingTimer.current);
    } finally {
      setSending(false);
    }
  };

  // ─── typing indicator ─────────────────────────────────────────
  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!socketRef.current) return;
    socketRef.current.emit('typing', { room, username });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current.emit('stop_typing', { room, username });
    }, 1500);
  };

  // ─── delete message (REST API) ────────────────────────────────
  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`${API}/api/messages/${messageId}`, {
        data: { userId: loggedId },
        withCredentials: true,
      });
      // optimistically update UI
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, message: '[Deleted]' } : m,
        ),
      );
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // ─── edit message (REST API) ──────────────────────────────────
  const startEdit = (msg) => {
    setEditingId(msg._id);
    setEditText(msg.message);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = async (messageId) => {
    if (!editText.trim()) return;
    try {
      const { data } = await axios.patch(
        `${API}/api/messages/${messageId}`,
        { message: editText, userId: loggedId },
        { withCredentials: true },
      );
      if (data.success) {
        setMessages((prev) => prev.map((m) => (m._id === messageId ? data.message : m)));
        setEditingId(null);
        setEditText('');
      }
    } catch (err) {
      console.error('Edit failed:', err);
    }
  };

  // ─── helpers ──────────────────────────────────────────────────
  const isOwn = (msg) => msg.userId === loggedId || msg.username === username;
  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // ─── render ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-purple-50 dark:from-gray-950 dark:to-purple-950 rounded-2xl overflow-hidden shadow-2xl border border-purple-200 dark:border-purple-800">
      {/* ── header ─────────────────────────────────────────── */}
      <header className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white px-5 py-4 flex items-center gap-3 shadow-lg">
        {onBack && (
          <button onClick={onBack} className="p-1 hover:bg-white/20 rounded-full transition">
            <X size={20} />
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <MessageCircle size={20} />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold leading-tight">Chat Room</h2>
          <p className="text-xs opacity-80">{room}</p>
        </div>
        <div className="text-right text-xs opacity-80">
          <div className="flex items-center gap-1 justify-end">
            <User size={12} />
            <span>{username}</span>
          </div>
        </div>
      </header>

      {/* ── messages ───────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-[url('https://images.unsplash.com/photo-1557683311-973673bafdeb?auto=format&fit=crop&q=80')] bg-cover bg-fixed opacity-[0.04] dark:opacity-[0.08]">
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="text-center py-16 text-purple-400 dark:text-purple-500">
              <MessageCircle size={48} className="mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm opacity-60">Be the first to say something!</p>
            </div>
          )}

          {messages.map((msg) => {
            const mine = isOwn(msg);
            return (
              <div key={msg._id} className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
                {/* avatar (other) */}
                {!mine && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex-shrink-0 shadow-md flex items-center justify-center text-white text-xs font-bold">
                    {msg.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}

                {/* bubble */}
                <div
                  className={`group relative max-w-[75%] px-4 py-2.5 rounded-2xl shadow-md transition-all hover:shadow-lg ${
                    mine
                      ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white rounded-br-md'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md border border-purple-200 dark:border-purple-700'
                  }`}
                >
                  {/* header row */}
                  <div className="flex items-center justify-between gap-3 mb-0.5">
                    <span className={`text-xs font-semibold ${mine ? 'text-white/80' : 'text-purple-600 dark:text-purple-400'}`}>
                      {mine ? 'You' : msg.username}
                    </span>
                    <div className={`flex items-center gap-1 ${mine ? 'opacity-0 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'} transition`}>
                      {mine && !msg.isDeleted && editingId !== msg._id && (
                        <>
                          <button onClick={() => startEdit(msg)} className="p-0.5 hover:scale-110 transition" title="Edit">
                            <Edit2 size={13} className={mine ? 'text-white/70 hover:text-white' : 'text-purple-400 hover:text-purple-600'} />
                          </button>
                          <button onClick={() => deleteMessage(msg._id)} className="p-0.5 hover:scale-110 transition" title="Delete">
                            <Trash2 size={13} className={mine ? 'text-red-300 hover:text-red-100' : 'text-red-400 hover:text-red-600'} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* editing vs display */}
                  {editingId === msg._id ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(msg._id)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        autoFocus
                      />
                      <button onClick={() => saveEdit(msg._id)} className="p-1 text-green-500 hover:scale-110 transition">
                        <Check size={16} />
                      </button>
                      <button onClick={cancelEdit} className="p-1 text-red-400 hover:scale-110 transition">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <p className={`text-sm leading-relaxed break-words ${msg.isDeleted ? 'italic opacity-60' : ''}`}>
                      {msg.message}
                    </p>
                  )}

                  {/* timestamp + edited badge */}
                  <div className={`flex items-center gap-2 mt-1.5 ${mine ? 'text-white/60' : 'text-gray-400 dark:text-gray-500'} text-[11px]`}>
                    <span>{formatTime(msg.createdAt)}</span>
                    {msg.isEdited && <span className="italic">(edited)</span>}
                  </div>
                </div>

                {/* avatar (mine) */}
                {mine && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex-shrink-0 shadow-md flex items-center justify-center text-white text-xs font-bold">
                    {username.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
            );
          })}

          {/* typing indicator */}
          {typingUser && (
            <div className="flex items-center gap-2 pl-12 text-purple-500 dark:text-purple-400 text-sm italic animate-pulse">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
              {typingUser}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* ── input bar ──────────────────────────────────────── */}
      <footer className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-purple-200 dark:border-purple-800 px-4 py-3 shadow-inner">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <input
            value={input}
            onChange={handleTyping}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 py-3 px-5 bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-600 rounded-full focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400 transition text-sm disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md hover:shadow-lg active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
}