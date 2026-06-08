import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../../context/AuthContex';
import {
  MessageCircle, Send, X, Minus, ChevronDown, ChevronLeft,
  Search, Hash, Edit2, Check, Loader2, MessageCircleOff, User, Trash2,
  Sparkles
} from 'lucide-react';

const API = import.meta.env.VITE_VERCEL_URI;
// const SOCKET = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
//   ? import.meta.env.VITE_SOCKET_URI
//   : import.meta.env.VITE_PROD_SOCKET_URI;
const SOCKET = VITE_PROD_SOCKET_URI
/**
 * ChatWidget – Modern floating chat popup with channel rooms,
 * user search, DM conversations, and message editing.
 */
export default function ChatWidget() {
  const { user, isLoggedIn, loggedId } = useAuth();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Navigation: 'channels' | 'search' | 'dm'
  const [view, setView] = useState('channels');

  // Room state
  const [room, setRoom] = useState('general');
  const [selectedUser, setSelectedUser] = useState(null);

  // Data
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [input, setInput] = useState('');
  const [searchText, setSearchText] = useState('');

  // UI state
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [typingUser, setTypingUser] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);
  const prevMsgCount = useRef(0);
  const popupRef = useRef(null);

  const username = user?.fName || 'Anonymous';

  // ─── ENTRANCE ANIMATION ─────────────────────────────────────
  useEffect(() => {
    if (open) {
      setAnimating(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
      const timer = setTimeout(() => setAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // ─── CLOSE ON ESC ───────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // ─── DERIVED ROOM ─────────────────────────────────────────────
  const currentRoom = selectedUser
    ? `dm_${[loggedId, selectedUser._id].sort().join('_')}`
    : room;

  // ─── SCROLL ───────────────────────────────────────────────────
  const scrollDown = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  // ─── UNREAD COUNTER ──────────────────────────────────────────
  useEffect(() => {
    if (!open || minimized) {
      if (messages.length > prevMsgCount.current) {
        setUnread((u) => u + (messages.length - prevMsgCount.current));
      }
    } else {
      setUnread(0);
    }
    prevMsgCount.current = messages.length;
  }, [messages.length, open, minimized]);

  // ─── FETCH CONVERSATIONS ──────────────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!loggedId) return;
    try {
      setLoadingConversations(true);
      const { data } = await axios.get(`${API}/api/conversations/${loggedId}`, { withCredentials: true });
      if (data.success) setConversations(data.conversations);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [loggedId]);

  // ─── FETCH USERS ─────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const { data } = await axios.get(`${API}/api/users`, { withCredentials: true });
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // ─── SOCKET ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn || !currentRoom) return;

    setLoadingMessages(true);
    const socket = io(SOCKET, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.emit('join_room', { room: currentRoom, username });

    socket.on('message_history', (history) => {
      setMessages(history);
      setLoadingMessages(false);
      if (open && !minimized) scrollDown();
    });

    socket.on('receive_message', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      if (open && !minimized) scrollDown();
      if (currentRoom?.startsWith('dm_')) {
        setTimeout(() => fetchConversations(), 500);
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, currentRoom, username, open, minimized]);

  // ─── LOAD CONVERSATIONS & USERS ON OPEN ──────────────────────
  useEffect(() => {
    if (open && isLoggedIn) {
      fetchConversations();
      fetchUsers();
    }
  }, [open, isLoggedIn, fetchConversations, fetchUsers]);

  // ─── RESET VIEW WHEN OPENING ────────────────────────────────
  const handleOpen = () => {
    setOpen(true);
    setMinimized(false);
    setUnread(0);
  };

  const handleClose = () => {
    setOpen(false);
    setMinimized(false);
    setView('channels');
    setSelectedUser(null);
    setRoom('general');
  };

  // ─── NAVIGATION HELPERS ──────────────────────────────────────
  const goToRoom = (roomName) => {
    setRoom(roomName);
    setSelectedUser(null);
    setView('channels');
  };

  const openDM = (targetUser) => {
    if (!targetUser || !targetUser._id) return;
    setSelectedUser({
      _id: targetUser._id,
      fName: targetUser.fName || '',
      lName: targetUser.lName || '',
      email: targetUser.email || '',
      profilePic: targetUser.profilePic || null
    });
    setSearchText('');
    setView('dm');
  };

  // ─── SEND MESSAGE ─────────────────────────────────────────────
  const sendMessage = () => {
    if (!input.trim() || sending || !socketRef.current) return;
    setSending(true);
    try {
      socketRef.current.emit('send_message', {
        room: currentRoom,
        username,
        userId: loggedId,
        message: input,
        messageType: 'text',
      });
      setInput('');
      socketRef.current.emit('stop_typing', { room: currentRoom, username });
      clearTimeout(typingTimer.current);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!socketRef.current) return;
    socketRef.current.emit('typing', { room: currentRoom, username });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current.emit('stop_typing', { room: currentRoom, username });
    }, 1500);
  };

  // ─── DELETE MESSAGE ─────────────────────────────────────────
  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`${API}/api/messages/${messageId}`, {
        data: { userId: loggedId },
        withCredentials: true,
      });
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, message: '[Deleted]' } : m,
        ),
      );
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // ─── EDIT MESSAGE ──────────────────────────────────────────
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

  // ─── HELPERS ──────────────────────────────────────────────────
  const isOwn = (msg) => msg.userId === loggedId || msg.username === username;
  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatRelativeTime = (ts) => {
    const now = new Date();
    const date = new Date(ts);
    const diffMins = Math.floor((now - date) / 60000);
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const getAvatarFallback = (u) => {
    if (!u) return '?';
    const first = u.fName ? u.fName.charAt(0).toUpperCase() : '';
    const last = u.lName ? u.lName.charAt(0).toUpperCase() : '';
    return `${first}${last}` || '?';
  };

  const getAvatarGradient = (userId) => {
    const gradients = [
      'from-fuchsia-500 to-purple-600',
      'from-violet-500 to-indigo-600',
      'from-blue-500 to-cyan-500',
      'from-teal-500 to-emerald-500',
      'from-orange-400 to-red-500',
      'from-pink-500 to-rose-600',
    ];
    const index = userId ? userId.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length : 0;
    return gradients[index];
  };

  /** Check if messages in a row are close in time (within 3 min) */
  const isSameMinute = (ts1, ts2) => {
    if (!ts1 || !ts2) return false;
    const d1 = new Date(ts1);
    const d2 = new Date(ts2);
    return Math.abs(d1 - d2) < 180000; // 3 minutes
  };

  const filteredUsers = users.filter((u) => {
    if (u._id === loggedId) return false;
    const query = searchText.toLowerCase().trim();
    if (!query) return false;
    const fullName = `${u.fName || ''} ${u.lName || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  // Don't render anything if not logged in
  if (!isLoggedIn) return null;

  return (
    <>
      {/* ── FLOATING BUBBLE ─────────────────────────────────── */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-purple-500/30 animate-[bubble-pulse_2s_ease-in-out_infinite]"
      >
        <MessageCircle size={26} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-[bounce-in_0.3s_ease-out]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* ── CHAT POPUP ──────────────────────────────────────── */}
      {animating && (
        <div
          ref={popupRef}
          className={`fixed bottom-6 right-6 z-[9999] w-[400px] max-w-[calc(100vw-32px)] h-[600px] max-h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-purple-200/60 dark:border-purple-800/30 overflow-hidden transition-all duration-300 ease-out ${
            visible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
          }`}
        >
          {/* ── HEADER ──────────────────────────────────────── */}
          <div className="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white px-4 py-3 flex items-center gap-2 flex-shrink-0 relative overflow-hidden">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-[0.05]" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '20px 20px'
            }} />
            
            {/* Back button */}
            {view !== 'channels' && (
              <button
                onClick={() => { setView('channels'); setSelectedUser(null); setRoom('general'); setSearchText(''); }}
                className="p-1 hover:bg-white/20 rounded-full transition relative z-10"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 relative z-10 backdrop-blur-sm border border-white/10">
              {view === 'dm' && selectedUser ? (
                <span className="text-xs font-bold">{getAvatarFallback(selectedUser)}</span>
              ) : (
                <MessageCircle size={16} />
              )}
            </div>
            <div className="flex-1 min-w-0 relative z-10">
              {view === 'dm' && selectedUser ? (
                <>
                  <h3 className="text-sm font-bold leading-tight truncate">{selectedUser.fName} {selectedUser.lName}</h3>
                  <p className="text-[10px] opacity-60 truncate">Direct Message</p>
                </>
              ) : view === 'search' ? (
                <>
                  <h3 className="text-sm font-bold leading-tight">Find People</h3>
                  <p className="text-[10px] opacity-60">Search users to message</p>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-bold leading-tight truncate">Messages</h3>
                  <p className="text-[10px] opacity-60 truncate">#{room}</p>
                </>
              )}
            </div>
            {/* Actions */}
            {view === 'channels' && (
              <>
                <button
                  onClick={() => { setView('search'); setSearchText(''); }}
                  className="p-1.5 hover:bg-white/20 rounded-full transition text-white/70 hover:text-white relative z-10"
                  title="Find someone to message"
                >
                  <Search size={14} />
                </button>
                <div className="relative z-10">
                  <select
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="text-[10px] bg-white/20 rounded-lg px-2 py-1.5 outline-none cursor-pointer border border-white/20 text-white appearance-none pr-6 backdrop-blur-sm hover:bg-white/30 transition"
                  >
                    <option value="general" className="text-gray-900">#general</option>
                    <option value="trades" className="text-gray-900">#trades</option>
                  </select>
                  <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-white/50" />
                </div>
              </>
            )}
            <button onClick={() => setMinimized(!minimized)} className="p-1 hover:bg-white/20 rounded-full transition relative z-10">
              {minimized ? <MessageCircle size={14} /> : <Minus size={14} />}
            </button>
            <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded-full transition relative z-10">
              <X size={14} />
            </button>
          </div>

          {/* ── MINIMIZED VIEW ──────────────────────────────── */}
          {minimized ? (
            <div className="flex-1 flex items-center justify-center p-4 text-center text-purple-300 dark:text-purple-600 bg-gradient-to-b from-purple-50/50 to-white dark:from-purple-950/20 dark:to-gray-900">
              <div className="animate-pulse">
                <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">Chat minimized</p>
                <p className="text-xs opacity-60">Click the icon to expand</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              {/* ── CHANNELS VIEW ────────────────────────────── */}
              {view === 'channels' && (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* DM Avatars - Horizontal Scrollable */}
                  <div className="flex-shrink-0 px-3 py-2.5 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-950/30 dark:to-pink-950/20 border-b border-purple-100/60 dark:border-purple-800/30">
                    <div className="text-[9px] font-semibold text-purple-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                      <span>Direct Messages</span>
                      {loadingConversations && <Loader2 size={10} className="animate-spin text-purple-400" />}
                    </div>
                    
                    {conversations.length === 0 && !loadingConversations ? (
                      <div className="py-2 text-center text-purple-300 dark:text-purple-600">
                        <MessageCircleOff size={16} className="mx-auto mb-1 opacity-30" />
                        <p className="text-[9px]">No conversations yet</p>
                      </div>
                    ) : (
                      <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1 -mx-1 px-1">
                        {conversations.map((conv) => {
                          const other = conv.otherUser;
                          if (!other) return null;
                          const isActive = selectedUser && selectedUser._id === other._id;
                          return (
                            <button
                              key={conv.room}
                              onClick={() => openDM(other)}
                              className="flex flex-col items-center gap-1 flex-shrink-0 group"
                              title={`${other.fName} ${other.lName}`}
                            >
                              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarGradient(other._id)} text-white flex items-center justify-center text-xs font-bold shadow-sm transition-all duration-200 group-hover:scale-110 group-hover:shadow-md ${
                                isActive
                                  ? 'ring-2 ring-purple-600 dark:ring-purple-400 scale-110 shadow-purple-200 dark:shadow-purple-900/50'
                                  : 'ring-1 ring-transparent'
                              }`}>
                                {getAvatarFallback(other)}
                              </div>
                              <span className="text-[8px] text-purple-400 truncate max-w-[40px] text-center leading-tight">
                                {other.fName?.split(' ')[0] || '?'}
                              </span>
                              {conv.lastMessage && (
                                <span className="text-[7px] text-purple-300 dark:text-purple-600 -mt-0.5">
                                  {formatRelativeTime(conv.lastMessage.createdAt)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Channel quick switch */}
                  <div className="flex-shrink-0 px-3 py-2 border-b border-purple-100/60 dark:border-purple-800/30 bg-white/80 dark:bg-gray-900/80">
                    <div className="flex gap-1.5">
                      {['general', 'trades'].map((ch) => (
                        <button
                          key={ch}
                          onClick={() => goToRoom(ch)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-200 ${
                            room === ch && !selectedUser
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                              : 'bg-purple-50 dark:bg-purple-950/40 text-purple-500 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/60'
                          }`}
                        >
                          <Hash size={9} />
                          {ch}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Messages for current channel */}
                  <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2 bg-gradient-to-b from-white via-purple-50/20 to-white dark:from-gray-900 dark:via-purple-950/10 dark:to-gray-900 scrollbar-thin">
                    {/* Date divider */}
                    {messages.length > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 h-px bg-purple-200/60 dark:bg-purple-800/40" />
                        <span className="text-[9px] font-medium text-purple-400 uppercase tracking-widest">
                          #{room} · {messages.length} messages
                        </span>
                        <div className="flex-1 h-px bg-purple-200/60 dark:bg-purple-800/40" />
                      </div>
                    )}

                    {loadingMessages ? (
                      <div className="flex justify-center py-10">
                        <div className="flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin text-purple-400" />
                          <span className="text-xs text-purple-400">Loading...</span>
                        </div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-purple-300 dark:text-purple-600 py-8">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-purple-200 dark:border-purple-700 flex items-center justify-center mb-2">
                          <MessageCircle size={20} className="opacity-40" />
                        </div>
                        <p className="text-xs font-medium text-purple-400 dark:text-purple-500">No messages yet</p>
                        <p className="text-[10px] opacity-50">Say hello to #{room}!</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg, idx) => {
                          const mine = isOwn(msg);
                          const prev = idx > 0 ? messages[idx - 1] : null;
                          const showAvatar = !mine && (!prev || prev.userId !== msg.userId || !isSameMinute(prev.createdAt, msg.createdAt));
                          const showTimestamp = !mine && (!prev || prev.userId !== msg.userId || !isSameMinute(prev.createdAt, msg.createdAt));
                          
                          return (
                            <div
                              key={msg._id}
                              className={`flex ${mine ? 'justify-end' : 'justify-start'} items-end gap-1.5 ${
                                mine ? 'pl-10' : 'pr-10'
                              } animate-[fade-in_0.2s_ease-out]`}
                              style={{ animationDelay: '0ms' }}
                            >
                              {/* Avatar for others */}
                              {!mine && showAvatar ? (
                                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getAvatarGradient(msg.userId)} text-white flex items-center justify-center text-[8px] font-bold flex-shrink-0 shadow-sm mb-0.5`}>
                                  {msg.username?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                              ) : (
                                !mine && <div className="w-6 flex-shrink-0" />
                              )}

                              <div className={`group relative max-w-[85%] flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                                {/* Username label for others */}
                                {!mine && showTimestamp && (
                                  <span className="text-[9px] font-medium text-purple-500 mb-0.5 ml-1">{msg.username}</span>
                                )}

                                {/* Message bubble */}
                                <div className={`relative px-3 py-2 rounded-2xl shadow-sm transition-all duration-200 ${
                                  mine
                                    ? 'bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white rounded-br-md shadow-purple-200/50 dark:shadow-purple-900/30'
                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md border border-purple-200/50 dark:border-purple-700/50'
                                }`}>
                                  {/* Edit/Delete buttons */}
                                  {mine && !msg.isDeleted && editingId !== msg._id && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 absolute -top-8 right-0 flex items-center gap-0.5 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-purple-200 dark:border-purple-700 px-1.5 py-1 z-10">
                                      <button onClick={() => startEdit(msg)} className="p-0.5 hover:text-purple-600 text-gray-400 transition-colors" title="Edit">
                                        <Edit2 size={9} />
                                      </button>
                                      <button onClick={() => deleteMessage(msg._id)} className="p-0.5 hover:text-red-500 text-gray-400 transition-colors" title="Delete">
                                        <Trash2 size={9} />
                                      </button>
                                    </div>
                                  )}

                                  {/* Editing vs display */}
                                  {editingId === msg._id ? (
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(msg._id)}
                                        className="flex-1 px-2 py-1 rounded-lg border border-purple-300 dark:border-purple-600 text-[11px] focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white min-w-[120px]"
                                        autoFocus
                                      />
                                      <button onClick={() => saveEdit(msg._id)} className="p-0.5 text-green-500 hover:scale-110 transition-transform">
                                        <Check size={11} />
                                      </button>
                                      <button onClick={cancelEdit} className="p-0.5 text-red-400 hover:scale-110 transition-transform">
                                        <X size={11} />
                                      </button>
                                    </div>
                                  ) : (
                                    <p className={`text-xs break-words leading-relaxed ${msg.isDeleted ? 'italic opacity-40' : ''}`}>
                                      {msg.message}
                                    </p>
                                  )}

                                  {/* Timestamp */}
                                  <div className={`flex items-center gap-1 mt-1 ${mine ? 'text-white/50' : 'text-purple-300'} text-[8px]`}>
                                    <span>{formatTime(msg.createdAt)}</span>
                                    {msg.isEdited && <span className="italic">edited</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}

                    {/* Typing indicator */}
                    {typingUser && (
                      <div className="flex items-center gap-1.5 text-purple-400 text-xs pl-8 animate-[fade-in_0.2s_ease-out]">
                        <div className="flex gap-0.5">
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]" />
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                        <span className="text-[10px]">{typingUser}</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="flex-shrink-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-purple-200/60 dark:border-purple-800/30 px-3 py-2.5 flex items-center gap-2">
                    <input
                      value={input}
                      onChange={handleTyping}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                      placeholder={`Message #${room}`}
                      disabled={sending}
                      className="flex-1 py-2 px-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-800 transition-all text-xs disabled:opacity-50 placeholder-purple-300 dark:placeholder-purple-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || sending}
                      className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* ── SEARCH VIEW ────────────────────────────────── */}
              {view === 'search' && (
                <div className="flex flex-col flex-1 min-h-0">
                  {/* Search input */}
                  <div className="px-4 py-3 border-b border-purple-100/60 dark:border-purple-800/30 bg-white/50 dark:bg-gray-900/50">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        autoFocus
                        className="w-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-700 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-700 dark:text-gray-100 text-gray-900 transition-all placeholder-purple-300 dark:placeholder-purple-500"
                      />
                    </div>
                  </div>

                  {/* Results */}
                  <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-0.5 bg-gradient-to-b from-white via-purple-50/20 to-white dark:from-gray-900 dark:via-purple-950/10 dark:to-gray-900 scrollbar-thin">
                    {loadingUsers ? (
                      <div className="flex justify-center py-8">
                        <Loader2 size={16} className="animate-spin text-purple-400" />
                      </div>
                    ) : searchText.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-purple-300 dark:text-purple-600 py-8">
                        <Search size={24} className="mb-2 opacity-30" />
                        <p className="text-xs font-medium text-purple-400 dark:text-purple-500">Find someone to chat with</p>
                        <p className="text-[9px] opacity-60">Start typing a name or email</p>
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-purple-300 dark:text-purple-600 py-8">
                        <User size={24} className="mb-2 opacity-30" />
                        <p className="text-xs font-medium text-purple-400 dark:text-purple-500">No users found</p>
                        <p className="text-[9px] opacity-60">Try a different search term</p>
                      </div>
                    ) : (
                      <>
                        <div className="text-[9px] font-semibold text-purple-400 uppercase tracking-widest px-3 py-1.5">
                          Results ({filteredUsers.length})
                        </div>
                        {filteredUsers.map((u) => (
                          <button
                            key={u._id}
                            onClick={() => openDM(u)}
                            className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2.5 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                          >
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarGradient(u._id)} text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow-sm`}>
                              {getAvatarFallback(u)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-medium truncate text-gray-800 dark:text-gray-200">{u.fName} {u.lName}</div>
                              <div className="text-[9px] text-purple-400 truncate">{u.email}</div>
                            </div>
                            <span className="text-[9px] text-purple-500 font-medium flex-shrink-0 px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50">Message</span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ── DM VIEW ────────────────────────────────────── */}
              {view === 'dm' && selectedUser && (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Messages */}
                  <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2 bg-gradient-to-b from-white via-purple-50/20 to-white dark:from-gray-900 dark:via-purple-950/10 dark:to-gray-900 scrollbar-thin">
                    {loadingMessages ? (
                      <div className="flex justify-center py-10">
                        <div className="flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin text-purple-400" />
                          <span className="text-xs text-purple-400">Loading...</span>
                        </div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-purple-300 dark:text-purple-600">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-800 dark:to-pink-800 flex items-center justify-center mb-3 shadow-sm">
                          <MessageCircle size={22} className="opacity-40" />
                        </div>
                        <p className="text-sm font-medium text-purple-400 dark:text-purple-500">No messages yet</p>
                        <p className="text-xs opacity-50 mt-0.5">Start a conversation with {selectedUser.fName}!</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg, idx) => {
                          const mine = isOwn(msg);
                          const prev = idx > 0 ? messages[idx - 1] : null;
                          const showAvatar = !mine && (!prev || prev.userId !== msg.userId || !isSameMinute(prev.createdAt, msg.createdAt));
                          return (
                            <div
                              key={msg._id}
                              className={`flex ${mine ? 'justify-end' : 'justify-start'} items-end gap-1.5 ${
                                mine ? 'pl-10' : 'pr-10'
                              } animate-[fade-in_0.2s_ease-out]`}
                            >
                              {/* Avatar for others */}
                              {!mine && showAvatar ? (
                                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getAvatarGradient(msg.userId)} text-white flex items-center justify-center text-[8px] font-bold flex-shrink-0 shadow-sm mb-0.5`}>
                                  {msg.username?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                              ) : (
                                !mine && <div className="w-6 flex-shrink-0" />
                              )}

                              <div className={`group relative max-w-[85%] flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                                {/* Message bubble */}
                                <div className={`relative px-3 py-2 rounded-2xl shadow-sm transition-all duration-200 ${
                                  mine
                                    ? 'bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white rounded-br-md shadow-purple-200/50 dark:shadow-purple-900/30'
                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md border border-purple-200/50 dark:border-purple-700/50'
                                }`}>
                                  {/* Edit/Delete buttons */}
                                  {mine && !msg.isDeleted && editingId !== msg._id && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 absolute -top-8 right-0 flex items-center gap-0.5 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-purple-200 dark:border-purple-700 px-1.5 py-1 z-10">
                                      <button onClick={() => startEdit(msg)} className="p-0.5 hover:text-purple-600 text-gray-400 transition-colors" title="Edit">
                                        <Edit2 size={9} />
                                      </button>
                                      <button onClick={() => deleteMessage(msg._id)} className="p-0.5 hover:text-red-500 text-gray-400 transition-colors" title="Delete">
                                        <Trash2 size={9} />
                                      </button>
                                    </div>
                                  )}

                                  {/* Editing vs display */}
                                  {editingId === msg._id ? (
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(msg._id)}
                                        className="flex-1 px-2 py-1 rounded-lg border border-purple-300 dark:border-purple-600 text-[11px] focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white dark:bg-gray-700 dark:text-white min-w-[120px]"
                                        autoFocus
                                      />
                                      <button onClick={() => saveEdit(msg._id)} className="p-0.5 text-green-500 hover:scale-110 transition-transform">
                                        <Check size={11} />
                                      </button>
                                      <button onClick={cancelEdit} className="p-0.5 text-red-400 hover:scale-110 transition-transform">
                                        <X size={11} />
                                      </button>
                                    </div>
                                  ) : (
                                    <p className={`text-xs break-words leading-relaxed ${msg.isDeleted ? 'italic opacity-40' : ''}`}>
                                      {msg.message}
                                    </p>
                                  )}

                                  {/* Timestamp */}
                                  <div className={`flex items-center gap-1 mt-1 ${mine ? 'text-white/50' : 'text-purple-300'} text-[8px]`}>
                                    <span>{formatTime(msg.createdAt)}</span>
                                    {msg.isEdited && <span className="italic">edited</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}

                    {/* Typing indicator */}
                    {typingUser && (
                      <div className="flex items-center gap-1.5 text-purple-400 text-xs animate-[fade-in_0.2s_ease-out]">
                        <div className="flex gap-0.5">
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]" />
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                        <span className="text-[10px]">{typingUser}</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="flex-shrink-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-purple-200/60 dark:border-purple-800/30 px-3 py-2.5 flex items-center gap-2">
                    <input
                      value={input}
                      onChange={handleTyping}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                      placeholder={`Message ${selectedUser.fName}...`}
                      disabled={sending}
                      className="flex-1 py-2 px-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-700 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-800 transition-all text-xs disabled:opacity-50 placeholder-purple-300 dark:placeholder-purple-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || sending}
                      className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── STYLE SHEET ───────────────────────────────────────── */}
      <style>{`
        @keyframes bubble-pulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
          50% { box-shadow: 0 4px 30px rgba(147, 51, 234, 0.4); }
        }
        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(4px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.25);
          border-radius: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.45);
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(126, 34, 206, 0.3);
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(126, 34, 206, 0.5);
        }
      `}</style>
    </>
  );
}