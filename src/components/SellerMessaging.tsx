import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Search, 
  User, 
  ShoppingBag, 
  Check, 
  CheckCheck, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  Plus, 
  ArrowLeft, 
  ShieldCheck, 
  Store,
  Bot
} from 'lucide-react';
import { useAppContext } from '../store';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  orderBy 
} from 'firebase/firestore';
import toast from 'react-hot-toast';

export interface Conversation {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  productId: string;
  productName: string;
  productImage?: string;
  productPrice?: number;
  lastMessage: string;
  lastMessageAt: string;
  unreadCountSeller?: number;
  unreadCountBuyer?: number;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'buyer' | 'seller';
  text: string;
  createdAt: string;
}

const QUICK_REPLIES = [
  "Yes! This item is currently in stock and ready to ship.",
  "We deliver to Blantyre, Lilongwe, and Zomba within 24–48 hours.",
  "Discounts are available if you are ordering in bulk. How many units do you need?",
  "Feel free to place your order directly on IndeMarket for fast escrow checkout!"
];

// Initial offline fallback conversations if database is empty or offline
const INITIAL_DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-demo-1',
    buyerId: 'buyer-chifundo',
    buyerName: 'Chifundo Banda',
    sellerId: 'current-seller',
    sellerName: 'Inde Store',
    productId: 'prod-macbook',
    productName: 'MacBook Air M2 (8GB RAM, 256GB SSD)',
    productImage: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300&q=80',
    productPrice: 1850000,
    lastMessage: 'Is this price negotiable for a cash payment in Blantyre?',
    lastMessageAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    unreadCountSeller: 1,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'conv-demo-2',
    buyerId: 'buyer-kondwani',
    buyerName: 'Kondwani Phiri',
    sellerId: 'current-seller',
    sellerName: 'Inde Store',
    productId: 'prod-headphones',
    productName: 'Sony WH-1000XM4 Noise Cancelling Headphones',
    productImage: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&q=80',
    productPrice: 350000,
    lastMessage: 'Does this come with official manufacturer warranty?',
    lastMessageAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    unreadCountSeller: 0,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const INITIAL_DEMO_MESSAGES: { [convId: string]: Message[] } = {
  'conv-demo-1': [
    {
      id: 'm1',
      conversationId: 'conv-demo-1',
      senderId: 'buyer-chifundo',
      senderName: 'Chifundo Banda',
      senderRole: 'buyer',
      text: 'Hello! I am interested in buying the MacBook Air M2.',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: 'm2',
      conversationId: 'conv-demo-1',
      senderId: 'buyer-chifundo',
      senderName: 'Chifundo Banda',
      senderRole: 'buyer',
      text: 'Is this price negotiable for a cash payment in Blantyre?',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    }
  ],
  'conv-demo-2': [
    {
      id: 'm3',
      conversationId: 'conv-demo-2',
      senderId: 'buyer-kondwani',
      senderName: 'Kondwani Phiri',
      senderRole: 'buyer',
      text: 'Hi seller, does this come with official manufacturer warranty?',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    }
  ]
};

export function SellerMessaging() {
  const { user, formatPrice } = useAppContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [creatingSample, setCreatingSample] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Subscribe to real-time conversations from Firestore
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const setupListener = () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'inquiry_conversations')
        );

        unsubscribe = onSnapshot(q, (snap) => {
          if (!snap.empty) {
            const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Conversation[];
            // Filter conversations relevant to seller or show all for seller dashboard
            fetched.sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime());
            setConversations(fetched);
            if (!selectedConvId && fetched.length > 0) {
              setSelectedConvId(fetched[0].id);
            }
          } else {
            // If empty in Firestore, check local storage or use initial demo conversations
            const savedLocal = localStorage.getItem('inde_seller_conversations');
            if (savedLocal) {
              try {
                const parsed = JSON.parse(savedLocal);
                setConversations(parsed);
                if (parsed.length > 0 && !selectedConvId) setSelectedConvId(parsed[0].id);
              } catch (e) {
                setConversations(INITIAL_DEMO_CONVERSATIONS);
                setSelectedConvId(INITIAL_DEMO_CONVERSATIONS[0].id);
              }
            } else {
              setConversations(INITIAL_DEMO_CONVERSATIONS);
              setSelectedConvId(INITIAL_DEMO_CONVERSATIONS[0].id);
            }
          }
          setLoading(false);
        }, (err) => {
          console.warn('Conversations real-time snapshot error, falling back to cache:', err);
          setConversations(INITIAL_DEMO_CONVERSATIONS);
          if (!selectedConvId) setSelectedConvId(INITIAL_DEMO_CONVERSATIONS[0].id);
          setLoading(false);
        });
      } catch (err) {
        console.warn('Failed to listen to conversations:', err);
        setConversations(INITIAL_DEMO_CONVERSATIONS);
        setSelectedConvId(INITIAL_DEMO_CONVERSATIONS[0].id);
        setLoading(false);
      }
    };

    setupListener();
    return () => unsubscribe();
  }, []);

  // 2. Subscribe to real-time messages for selected conversation
  useEffect(() => {
    if (!selectedConvId) return;

    let unsubscribeMessages: () => void = () => {};

    const setupMessageListener = () => {
      try {
        const q = query(
          collection(db, 'inquiry_messages'),
          where('conversationId', '==', selectedConvId)
        );

        unsubscribeMessages = onSnapshot(q, (snap) => {
          if (!snap.empty) {
            const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
            fetched.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            setMessages(fetched);
          } else {
            // Local fallback if empty
            const savedLocalMsgs = localStorage.getItem(`inde_msgs_${selectedConvId}`);
            if (savedLocalMsgs) {
              try {
                setMessages(JSON.parse(savedLocalMsgs));
              } catch (e) {
                setMessages(INITIAL_DEMO_MESSAGES[selectedConvId] || []);
              }
            } else {
              setMessages(INITIAL_DEMO_MESSAGES[selectedConvId] || []);
            }
          }
        }, (err) => {
          console.warn('Messages snapshot error, using local fallback:', err);
          setMessages(INITIAL_DEMO_MESSAGES[selectedConvId] || []);
        });
      } catch (err) {
        console.warn('Failed to listen to messages:', err);
        setMessages(INITIAL_DEMO_MESSAGES[selectedConvId] || []);
      }
    };

    setupMessageListener();

    // Clear unread count for seller when opening
    setConversations(prev => prev.map(c => c.id === selectedConvId ? { ...c, unreadCountSeller: 0 } : c));

    return () => unsubscribeMessages();
  }, [selectedConvId]);

  // Handle Sending a Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !selectedConvId) return;

    const currentConv = conversations.find(c => c.id === selectedConvId);
    if (!currentConv) return;

    const newMessageData: Omit<Message, 'id'> = {
      conversationId: selectedConvId,
      senderId: user?.id || 'current-seller',
      senderName: user?.name || 'Seller Support',
      senderRole: 'seller',
      text,
      createdAt: new Date().toISOString(),
    };

    setInputText('');

    try {
      // 1. Add to Firestore
      let msgId = `msg-${Date.now()}`;
      try {
        const docRef = await addDoc(collection(db, 'inquiry_messages'), newMessageData);
        msgId = docRef.id;
      } catch (err) {
        console.warn('Firestore message save error:', err);
      }

      const createdMsg: Message = { id: msgId, ...newMessageData };
      const updatedMsgs = [...messages, createdMsg];
      setMessages(updatedMsgs);
      localStorage.setItem(`inde_msgs_${selectedConvId}`, JSON.stringify(updatedMsgs));

      // 2. Update conversation last message in Firestore & local state
      const updatedConv: Conversation = {
        ...currentConv,
        lastMessage: text,
        lastMessageAt: newMessageData.createdAt,
        unreadCountSeller: 0,
      };

      try {
        await updateDoc(doc(db, 'inquiry_conversations', selectedConvId), {
          lastMessage: text,
          lastMessageAt: newMessageData.createdAt,
          unreadCountSeller: 0,
        });
      } catch (err) {
        console.warn('Firestore conversation update error:', err);
      }

      const updatedConvList = conversations.map(c => c.id === selectedConvId ? updatedConv : c);
      setConversations(updatedConvList);
      localStorage.setItem('inde_seller_conversations', JSON.stringify(updatedConvList));

    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    }
  };

  // Create Sample Customer Inquiry Thread
  const handleCreateSampleInquiry = async () => {
    try {
      setCreatingSample(true);
      const newConvId = `conv-${Date.now()}`;
      const sampleConv: Omit<Conversation, 'id'> = {
        buyerId: `buyer-${Math.floor(Math.random() * 900) + 100}`,
        buyerName: 'Mercy Chilima',
        sellerId: user?.id || 'current-seller',
        sellerName: user?.name || 'Inde Store',
        productId: 'prod-smartwatch',
        productName: 'Smart Fitness Watch with Heart Rate Monitor',
        productImage: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300&q=80',
        productPrice: 120000,
        lastMessage: 'Hi! Is delivery available to Lilongwe area today?',
        lastMessageAt: new Date().toISOString(),
        unreadCountSeller: 1,
        createdAt: new Date().toISOString(),
      };

      let finalConvId = newConvId;
      try {
        const ref = await addDoc(collection(db, 'inquiry_conversations'), sampleConv);
        finalConvId = ref.id;
      } catch (e) {
        console.warn(e);
      }

      const createdConv: Conversation = { id: finalConvId, ...sampleConv };
      const initialMsg: Message = {
        id: `msg-${Date.now()}`,
        conversationId: finalConvId,
        senderId: createdConv.buyerId,
        senderName: createdConv.buyerName,
        senderRole: 'buyer',
        text: 'Hi! Is delivery available to Lilongwe area today?',
        createdAt: new Date().toISOString(),
      };

      try {
        await addDoc(collection(db, 'inquiry_messages'), initialMsg);
      } catch (e) {
        console.warn(e);
      }

      const nextConvs = [createdConv, ...conversations];
      setConversations(nextConvs);
      setSelectedConvId(finalConvId);
      setMessages([initialMsg]);

      localStorage.setItem('inde_seller_conversations', JSON.stringify(nextConvs));
      localStorage.setItem(`inde_msgs_${finalConvId}`, JSON.stringify([initialMsg]));

      toast.success('Sample customer inquiry generated!');
    } catch (err) {
      console.error(err);
      toast.error('Could not create sample inquiry');
    } finally {
      setCreatingSample(false);
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedConvId);

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.buyerName?.toLowerCase().includes(q) ||
      c.productName?.toLowerCase().includes(q) ||
      c.lastMessage?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row h-[680px]">
      
      {/* LEFT SIDEBAR: Conversation Threads List */}
      <div className={`w-full lg:w-80 border-r border-gray-100 flex flex-col bg-gray-50/50 ${
        selectedConvId ? 'hidden lg:flex' : 'flex'
      }`}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-100 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              Customer Inquiries
            </h2>
            <button
              onClick={handleCreateSampleInquiry}
              disabled={creatingSample}
              className="p-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 border border-indigo-100"
              title="Add Sample Buyer Query"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simulate</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search buyers or products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-100/80 border border-transparent focus:border-indigo-300 focus:bg-white rounded-xl text-xs text-gray-900 outline-none transition-all"
            />
          </div>
        </div>

        {/* Conversation List Scroll Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-xs text-gray-400">Loading messages...</div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              const hasUnread = (conv.unreadCountSeller || 0) > 0;

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full p-3.5 text-left transition-all flex items-start gap-3 hover:bg-indigo-50/40 relative ${
                    isSelected ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'bg-white'
                  }`}
                >
                  {/* Buyer Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {conv.buyerName?.charAt(0).toUpperCase() || 'B'}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>

                  {/* Thread Content Preview */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs truncate font-bold ${
                        hasUnread ? 'text-gray-900 font-extrabold' : 'text-gray-900'
                      }`}>
                        {conv.buyerName}
                      </span>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-indigo-600 truncate flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3 text-indigo-500 inline shrink-0" />
                      {conv.productName}
                    </p>

                    <p className={`text-xs truncate ${
                      hasUnread ? 'text-gray-900 font-bold' : 'text-gray-500'
                    }`}>
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {hasUnread && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-2" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs font-bold text-gray-700">No inquiry messages</p>
              <p className="text-[11px] text-gray-400">Buyers inquiring about products will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT CHAT THREAD VIEW */}
      <div className={`flex-1 flex flex-col bg-white ${
        !selectedConvId ? 'hidden lg:flex items-center justify-center' : 'flex'
      }`}>
        
        {selectedConversation ? (
          <>
            {/* Active Thread Top Bar */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-2xs">
              <div className="flex items-center gap-3">
                {/* Back button for mobile view */}
                <button
                  onClick={() => setSelectedConvId(null)}
                  className="lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Buyer & Product Info */}
                <div className="flex items-center gap-3">
                  {selectedConversation.productImage ? (
                    <img
                      src={selectedConversation.productImage}
                      alt={selectedConversation.productName}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">{selectedConversation.buyerName}</h3>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md">
                        Product Inquiry
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium line-clamp-1">
                      {selectedConversation.productName} {selectedConversation.productPrice ? `• ${formatPrice(selectedConversation.productPrice)}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Chat Session
              </div>
            </div>

            {/* Chat Messages Timeline */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
              
              {/* Context Banner */}
              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100/80 text-center text-xs text-indigo-900 space-y-1 my-2">
                <p className="font-bold flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  IndeMarket Verified Inquiry
                </p>
                <p className="text-indigo-700 text-[11px]">
                  You are chatting with buyer <span className="font-semibold">{selectedConversation.buyerName}</span> regarding <span className="font-semibold">{selectedConversation.productName}</span>.
                </p>
              </div>

              {messages.map((msg) => {
                const isSeller = msg.senderRole === 'seller';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isSeller ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[10px] font-bold text-gray-400">
                        {msg.senderName} ({isSeller ? 'You' : 'Buyer'})
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[82%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        isSeller
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-white text-gray-900 border border-gray-200/80 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Canned Replies Bar */}
            <div className="px-4 py-2 bg-gray-50/80 border-t border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" /> Quick Replies:
              </span>
              {QUICK_REPLIES.map((reply, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(reply)}
                  className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 border border-gray-200 hover:border-indigo-200 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 shadow-2xs"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Chat Input Field Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 sm:p-4 border-t border-gray-100 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type your response to the buyer..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md hover:shadow-indigo-200 disabled:opacity-40 flex items-center gap-1.5 shrink-0"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="p-12 text-center space-y-3">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-800">Select an Inquiry Thread</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Choose a customer inquiry from the left sidebar to start messaging in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
