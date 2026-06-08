import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContex';
import { 
  MessageSquare, Send, X, Trash2, Edit2, Check, Search, 
  Info, ChevronLeft, User, MapPin, ShoppingBag, 
  MessageCircle, Loader2, Phone, Video, Smile,
  Paperclip, Hash, LogOut, Heart, Plus, MessageCircleOff, MessageCircleX
} from 'lucide-react';

const API = import.meta.env.VITE_VERCEL_URI;
const SOCKET = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? import.meta.env.VITE_SOCKET_URI
  : import.meta.env.VITE_PROD_SOCKET_URI;

export default function Chat() {
  const { user, isLoggedIn, loggedId } = useAuth();
  
  // ─── STATE ───────────────────────────────────────────────────
  const [conversations, setConversations] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [users, setUsers] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [showInfo, setShowInfo] = useState(true);
  const [otherUserItems, setOtherUserItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);
  const searchRef = useRef(null);

  const username = user?.fName || 'Anonymous';

  // ─── ROOM DETERMINATION ─────────────────────────────────────
  const currentRoom = selectedUser 
    ? `dm_${[loggedId, selectedUser._id].sort().join('_')}`
    : selectedChannel;

  // ─── SCROLL TO BOTTOM ───────────────────────────────────────
  const scrollDown = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  // ─── FETCH CONVERSATIONS ──────────────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!loggedId) return;
    try {
      setLoadingConvs(true);
      const { data } = await axios.get(`${API}/api/conversations/${loggedId}`, { withCredentials: true });
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoadingConvs(false);
    }
  }, [loggedId]);

  // ─── FETCH USERS (for search) ─────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const { data } = await axios.get(`${API}/api/users`, { withCredentials: true });
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // ─── FETCH USER ITEMS ──────────────────────────────────────
  const fetchUserItems = async (userId) => {
    try {
      setLoadingItems(true);
      const { data } = await axios.get(`${API}/api/users/${userId}`, { withCredentials: true });
      if (data && data.itemsHistory) {
        setOtherUserItems(data.itemsHistory);
      } else {
        setOtherUserItems([]);
      }
    } catch (err) {
      console.error('Failed to fetch user items:', err);
      setOtherUserItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  // ─── INITIAL LOAD ───────────────────────────────────────────
  useEffect(() => {
    if (isLoggedIn && loggedId) {
      fetchConversations();
      fetchUsers();
    }
  }, [isLoggedIn, loggedId, fetchConversations, fetchUsers]);

  useEffect(() => {
    if (selectedUser) {
      fetchUserItems(selectedUser._id);
    } else {
      setOtherUserItems([]);
    }
  }, [selectedUser]);

  // ─── REFETCH CONVERSATIONS AFTER NEW DM MESSAGE ────────────
  useEffect(() => {
    if (messages.length > 0 && currentRoom?.startsWith('dm_')) {
      const timer = setTimeout(() => fetchConversations(), 1000);
      return () => clearTimeout(timer);
    }
  }, [messages.length, currentRoom, fetchConversations]);

  // ─── SOCKET CONNECTION ──────────────────────────────────────
  useEffect(() => {
    if (!currentRoom || !isLoggedIn) return;

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

    socket.on('user_typing', ({ username: name }) => {
      setTypingUser(`${name} is typing...`);
    });
    
    socket.on('user_stop_typing', () => {
      setTypingUser('');
    });

    socket.on('message_error', (err) => {
      console.error('Socket error:', err);
    });

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
  }, [currentRoom, username, isLoggedIn, scrollDown]);

  // ─── SEND MESSAGE ───────────────────────────────────────────
  const sendMessage = async () => {
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

  // ─── EDIT / DELETE ──────────────────────────────────────────
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
      console.error('Delete message failed:', err);
    }
  };

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
      console.error('Edit message failed:', err);
    }
  };

  // ─── HELPERS ────────────────────────────────────────────────
  const isOwn = (msg) => msg.userId === loggedId || msg.username === username;
  
  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatRelativeTime = (ts) => {
    const now = new Date();
    const date = new Date(ts);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
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

  // ─── OPEN DM WITH USER ────────────────────────────────────
  const openDM = useCallback((targetUser) => {
    if (!targetUser || !targetUser._id) return;
    setSelectedChannel('');
    setSelectedUser({
      _id: targetUser._id,
      fName: targetUser.fName || '',
      lName: targetUser.lName || '',
      email: targetUser.email || '',
      profilePic: targetUser.profilePic || null
    });
    setSearchText('');
    setShowSearchResults(false);
  }, []);

  // ─── FILTER USERS FOR SEARCH ──────────────────────────────
  const filteredUsers = users.filter((u) => {
    if (u._id === loggedId) return false;
    const query = searchText.toLowerCase().trim();
    if (!query) return false;
    const fullName = `${u.fName || ''} ${u.lName || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  // ─── CLOSE SEARCH ON CLICK OUTSIDE ────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── LOGIN CHECK ────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-8 rounded-2xl shadow-xl max-w-sm w-full flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 animate-bounce">
            <MessageSquare size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reweard Chat</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Please log in or register to join rooms and connect with buyers & sellers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-slate-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 overflow-hidden font-sans border-t border-slate-200 dark:border-gray-800">
      
      {/* ─── SIDEBAR ─────────────────────────────────────────────── */}
      <aside className={`${
        selectedUser || selectedChannel ? 'hidden md:flex' : 'flex'
      } flex-col w-full md:w-80 border-r border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0`}>
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <MessageCircle size={24} className="text-purple-600" />
            Chats
          </h1>
        </div>

        {/* People Search */}
        <div className="p-3 border-b border-slate-200 dark:border-gray-800 relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Find someone to message..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                if (e.target.value.length > 0) setShowSearchResults(true);
              }}
              onFocus={() => { if (searchText.length > 0) setShowSearchResults(true); }}
              className="w-full bg-slate-100 dark:bg-gray-800 border-none rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-gray-100 text-gray-900"
            />
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchText.length > 0 && (
            <div className="absolute left-3 right-3 top-full mt-1 z-50 max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
              {loadingUsers ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={16} className="animate-spin text-purple-600" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-xs text-gray-400 text-center py-4">No users found</div>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => openDM(u)}
                    className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors border-b border-slate-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {getAvatarFallback(u)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{u.fName} {u.lName}</div>
                      <div className="text-xs text-gray-400 truncate">{u.email}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Sidebar List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          
          {/* Public Channels */}
          <div>
            <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Public Channels
            </div>
            <div className="space-y-1">
              {['general', 'trades'].map((roomName) => {
                const isActive = !selectedUser && selectedChannel === roomName;
                return (
                  <button
                    key={roomName}
                    onClick={() => {
                      setSelectedUser(null);
                      setSelectedChannel(roomName);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors ${
                      isActive 
                        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold' 
                        : 'hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                      isActive 
                        ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300' 
                        : 'bg-slate-100 dark:bg-gray-800 text-gray-500'
                    }`}>
                      <Hash size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">#{roomName}</div>
                      <div className="text-xs text-gray-400 truncate">
                        {roomName === 'general' ? 'Public chit-chat' : 'Barter deals'}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Mail Support */}
              <a
                href="mailto:reweard.tn@gmail.com"
                className="w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 group"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-slate-100 dark:bg-gray-800 text-gray-500 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20ZM10.1393 9.43877C10.9581 9.43877 14.9393 7.20001 14.9393 7.20001L14.9457 6.80001C14.9457 6.35841 14.5873 6.00001 14.1445 6.00001H6.13413C5.69173 6.00001 5.33333 6.35841 5.33333 6.80001V7.15641C5.33333 7.15641 9.35813 9.43877 10.1393 9.43877ZM5.33973 8.40004C5.33933 8.40004 9.35813 10.5388 10.1393 10.5388C10.9957 10.5388 14.9393 8.40004 14.9393 8.40004L14.9457 13.2C14.9457 13.6416 14.5873 14 14.1445 14H6.13413C5.69213 14 5.33333 13.6416 5.33333 13.2L5.33973 8.40004Z" fill="currentColor"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate font-medium">Support</div>
                  <div className="text-xs text-gray-400 truncate">Email us at reweard.tn@gmail.com</div>
                </div>
              </a>
            </div>
          </div>

          {/* Direct Messages */}
          <div>
            <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Direct Messages</span>
              {loadingConvs && <Loader2 size={12} className="animate-spin text-purple-600" />}
            </div>
            <div className="space-y-1">
              {conversations.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-gray-400">
                  <MessageCircleOff size={20} className="mx-auto mb-1 opacity-40" />
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => {
                  const isActive = selectedUser && selectedUser._id === conv.otherUser?._id;
                  const other = conv.otherUser;
                  if (!other) return null;
                  
                  return (
                    <button
                      key={conv.room}
                      onClick={() => openDM(other)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all ${
                        isActive 
                          ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold' 
                          : 'hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        {other.profilePic?.url ? (
                          <img src={other.profilePic.url} alt={other.fName} className="w-10 h-10 rounded-full object-cover border-2 border-transparent" />
                        ) : (
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(other._id)} text-white flex items-center justify-center text-sm font-bold shadow-sm`}>
                            {getAvatarFallback(other)}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-sm truncate font-medium">{other.fName} {other.lName}</span>
                          {conv.lastMessage && (
                            <span className="text-[10px] text-gray-400 flex-shrink-0">{formatRelativeTime(conv.lastMessage.createdAt)}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {conv.lastMessage ? (
                            conv.lastMessage.isDeleted ? (
                              <span className="italic opacity-60">Message deleted</span>
                            ) : (
                              conv.lastMessage.message
                            )
                          ) : (
                            <span className="italic opacity-50">No messages</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CHAT AREA ───────────────────────────────────────── */}
      <main className={`${
        !selectedUser && !selectedChannel ? 'hidden md:flex' : 'flex'
      } flex-col flex-grow bg-white dark:bg-gray-900`}>
        
        {/* Chat Header */}
        <header className="p-4 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSelectedUser(null); setSelectedChannel(''); }}
              className="md:hidden p-1 text-gray-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full"
            >
              <ChevronLeft size={20} />
            </button>

            {selectedUser ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  {selectedUser.profilePic?.url ? (
                    <img src={selectedUser.profilePic.url} alt={selectedUser.fName} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(selectedUser._id)} text-white flex items-center justify-center text-sm font-bold`}>
                      {getAvatarFallback(selectedUser)}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                </div>
                <div>
                  <h2 className="text-sm font-bold leading-tight">{selectedUser.fName} {selectedUser.lName}</h2>
                  <p className="text-[10px] text-green-500 font-medium">Direct Message</p>
                </div>
              </div>
            ) : selectedChannel ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Hash size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-bold leading-tight">#{selectedChannel}</h2>
                  <p className="text-[10px] text-gray-400">Public Room</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {selectedUser && (
              <button
                onClick={() => setShowInfo(!showInfo)}
                className={`p-2 rounded-full transition-colors ${
                  showInfo 
                    ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' 
                    : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800'
                }`}
              >
                <Info size={18} />
              </button>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-slate-50/50 dark:bg-gray-950/20">
          {loadingMessages ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <Loader2 className="animate-spin text-purple-600" size={32} />
              <span className="text-xs text-gray-400">Loading history...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400 dark:text-gray-500">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-800 flex items-center justify-center mb-3">
                <MessageSquare size={24} className="opacity-40" />
              </div>
              <p className="font-semibold text-sm">No messages yet</p>
              <p className="text-xs opacity-75">Send a message to break the ice!</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((msg) => {
                const mine = isOwn(msg);
                return (
                  <div key={msg._id} className={`flex items-end gap-2.5 ${mine ? 'justify-end' : 'justify-start'}`}>
                    
                    {!mine && (
                      <button
                        onClick={() => {
                          const foundUser = users.find((u) => {
                            const matchByFullName = `${u.fName} ${u.lName}`.toLowerCase() === msg.username?.toLowerCase();
                            const matchByFName = u.fName?.toLowerCase() === msg.username?.toLowerCase();
                            const matchById = String(u._id) === String(msg.userId);
                            return matchByFullName || matchByFName || matchById;
                          });
                          if (foundUser) {
                            openDM(foundUser);
                          } else {
                            console.warn('User not found for username:', msg.username);
                          }
                        }}
                        className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        title={`Send a DM to ${msg.username}`}
                      >
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarGradient(msg.userId)} text-white flex items-center justify-center text-xs font-bold`}>
                          {msg.username?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      </button>
                    )}

                    <div className={`group relative max-w-[70%] flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                      
                      {/* Clickable Username in Channel Messages */}
                      {!selectedUser && !mine && (
                        <button
                          onClick={() => {
                            const foundUser = users.find((u) => {
                              const matchByFullName = `${u.fName} ${u.lName}`.toLowerCase() === msg.username?.toLowerCase();
                              const matchByFName = u.fName?.toLowerCase() === msg.username?.toLowerCase();
                              const matchById = String(u._id) === String(msg.userId);
                              return matchByFullName || matchByFName || matchById;
                            });
                            if (foundUser) {
                              openDM(foundUser);
                            } else {
                              console.warn('User not found for username:', msg.username);
                            }
                          }}
                          className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mb-1 ml-2 hover:text-purple-800 dark:hover:text-purple-300 transition-colors cursor-pointer hover:underline"
                          title={`Send a DM to ${msg.username}`}
                        >
                          @{msg.username}
                        </button>
                      )}

                      <div className={`relative px-4 py-2.5 rounded-2xl shadow-sm transition-all duration-200 ${
                        mine 
                          ? 'bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white rounded-br-none' 
                          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-slate-200 dark:border-gray-800 rounded-bl-none'
                      }`}>
                        
                        {mine && !msg.isDeleted && editingId !== msg._id && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-8 right-2 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-full shadow-md border border-slate-200 dark:border-gray-700 px-1.5 py-0.5 z-10">
                            <button onClick={() => startEdit(msg)} className="p-1 hover:text-purple-600 text-gray-500 transition-colors" title="Edit">
                              <Edit2 size={12} />
                            </button>
                            <button onClick={() => deleteMessage(msg._id)} className="p-1 hover:text-red-600 text-gray-500 transition-colors" title="Delete">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}

                        {editingId === msg._id ? (
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && saveEdit(msg._id)}
                              className="flex-grow px-2 py-1 rounded bg-slate-100 dark:bg-gray-700 border border-purple-400 text-xs focus:outline-none dark:text-white text-black"
                              autoFocus
                            />
                            <button onClick={() => saveEdit(msg._id)} className="p-1 text-green-500 hover:scale-105 transition-transform">
                              <Check size={14} />
                            </button>
                            <button onClick={cancelEdit} className="p-1 text-red-500 hover:scale-105 transition-transform">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <p className={`text-sm break-words whitespace-pre-line leading-relaxed ${
                            msg.isDeleted ? 'italic text-gray-400/80 dark:text-gray-500' : ''
                          }`}>
                            {msg.message}
                          </p>
                        )}
                      </div>

                      <span className="text-[9px] text-gray-400 mt-1 px-1">
                        {formatTime(msg.createdAt)}
                        {msg.isEdited && <span className="italic ml-1">(edited)</span>}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {typingUser && (
            <div className="flex items-center gap-1 text-purple-500 dark:text-purple-400 text-xs italic animate-pulse max-w-3xl mx-auto px-12">
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
              <span className="ml-1 text-[11px]">{typingUser}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <footer className="p-4 border-t border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={handleTyping}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder={selectedUser ? `Message ${selectedUser.fName}...` : `Message #${selectedChannel}...`}
              disabled={sending}
              className="flex-grow py-2.5 px-4 bg-slate-100 dark:bg-gray-800 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400 dark:text-gray-100 text-gray-900"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </footer>

      </main>

      {/* ─── INFO PANEL ───────────────────────────────────────────── */}
      {showInfo && selectedUser && (
        <aside className="hidden lg:flex flex-col w-80 border-l border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
          <div className="p-6 flex flex-col items-center border-b border-slate-200 dark:border-gray-800 text-center">
            {selectedUser.profilePic?.url ? (
              <img src={selectedUser.profilePic.url} alt={selectedUser.fName} className="w-20 h-20 rounded-full object-cover mb-3 ring-4 ring-purple-100 dark:ring-purple-900/30" />
            ) : (
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getAvatarGradient(selectedUser._id)} text-white flex items-center justify-center text-2xl font-bold mb-3 shadow-md`}>
                {getAvatarFallback(selectedUser)}
              </div>
            )}
            <h3 className="text-base font-bold text-gray-900 dark:text-white">{selectedUser.fName} {selectedUser.lName}</h3>
            <p className="text-xs text-gray-400">{selectedUser.email}</p>
            {selectedUser.rewards && (
              <div className="flex gap-2 mt-4 items-center bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-full text-purple-600 dark:text-purple-400 text-xs font-semibold">
                <Heart size={14} className="fill-current animate-pulse" />
                <span>Level {selectedUser.rewards.level || 1} • {selectedUser.rewards.points || 0} pts</span>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShoppingBag size={14} />
              Listed Items ({otherUserItems.length})
            </h4>
            {loadingItems ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-600" size={20} /></div>
            ) : otherUserItems.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400 bg-slate-50 dark:bg-gray-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-gray-800">No active marketplace listings.</div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {otherUserItems.map((item) => {
                  const image = item.itemPics && item.itemPics[0] ? item.itemPics[0] : '/logo/shopping.png';
                  return (
                    <div key={item._id} onClick={() => window.open(`/items/${item._id}`, '_blank')} className="group/item cursor-pointer flex flex-col bg-slate-50 dark:bg-gray-800 rounded-xl overflow-hidden border border-slate-200 dark:border-gray-700/80 hover:shadow-md transition-all hover:scale-[1.02]">
                      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                        <img src={image} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-110" />
                        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{item.price} DT</span>
                      </div>
                      <div className="p-2 min-w-0">
                        <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{item.title}</div>
                        <div className="text-[10px] text-gray-400 truncate capitalize">Size: {item.size} • {item.condition}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      )}

    </div>
  );
}