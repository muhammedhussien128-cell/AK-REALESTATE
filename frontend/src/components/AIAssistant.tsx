import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, HelpCircle, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTenant } from '../context/TenantContext';
import { useAuth } from '../context/AuthContext';

interface Message {
  sender: 'bot' | 'user';
  text: string;
}

export const AIAssistant: React.FC = () => {
  const { language } = useLanguage();
  const { tenant } = useTenant();
  const { token, user } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: language === 'ar' 
        ? 'أهلاً بحضرتك يا فندم في منصة AK. أنا مستشارك العقاري المخصص لمساعدتك في العثور على العقار السكني أو الاستثماري المثالي بمصر. كيف يمكنني إرشادك اليوم؟' 
        : 'Welcome! I am your Senior Property Advisor at AK. How may I assist you today in finding your perfect property in Egypt?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const QUICK_CHIPS = language === 'ar' ? [
    { label: '🏢 شقة بالتجمع', query: 'أبحث عن شقة بالتجمع الخامس' },
    { label: '🏡 فيلا بالشيخ زايد', query: 'عايز فيلا بالشيخ زايد' },
    { label: '🏖️ شاليه بالساحل', query: 'شاليه صف أول بالساحل الشمالي' },
    { label: '🧮 أحسب قسطي', query: 'احسبلي قسط شهري لعقار بقيمة 5 مليون' }
  ] : [
    { label: '🏢 Apartment in Tagamoa', query: 'Search apartment in Fifth Settlement' },
    { label: '🏡 Villa in Zayed', query: 'Search villa in Sheikh Zayed' },
    { label: '🏖️ Chalet in Coast', query: 'Search chalet in North Coast' },
    { label: '🧮 Calculator', query: 'Calculate installments for a 5M property' }
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isTyping]);

  // Periodic heartbeat sync of chatbot transcript to CRM lead
  useEffect(() => {
    const syncChat = async () => {
      if (user && user.email && messages.length > 1) {
        try {
          await fetch('/api/crm/visitor-activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              leadEmail: user.email,
              leadPhone: user.phone,
              chatHistory: messages.map(m => `${m.sender === 'user' ? 'العميل' : 'المساعد'}: ${m.text}`)
            })
          });
        } catch (e) {}
      }
    };
    syncChat();
  }, [messages, user]);

  const triggerCRMLeadSync = async (phone: string, rawText: string) => {
    if (!token) return;
    try {
      await fetch('/api/crm/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': tenant.subdomain
        },
        body: JSON.stringify({
          listing_title: 'طلب تفاصيل عبر مستشار المحادثة الذكي',
          client_name: user?.name || 'عميل مهتم (مستشار AK)',
          phone: phone,
          notes: `تم التقاط رقم الهاتف بأدب من الدردشة: "${rawText}"`,
          lead_source: 'Chatbot'
        })
      });
    } catch (err) {}
  };

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    const userMsg = { sender: 'user' as const, text: messageText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!textToSend) setInput('');

    const phoneRegex = /(01[0-25]\d{8})/g;
    const phoneMatches = messageText.match(phoneRegex);
    
    if (phoneMatches && phoneMatches.length > 0) {
      const extractedPhone = phoneMatches[0];
      triggerCRMLeadSync(extractedPhone, messageText);
    }

    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          userEmail: user ? user.email : null,
          userPhone: user ? user.phone : null
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { sender: 'bot', text: data.text }]);
      } else {
        throw new Error('Chat API error');
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: language === 'ar' ? 'عذراً يا فندم، واجهت مشكلة اتصال مؤقتة. كيف يمكنني مساعدتك اليوم؟' : 'Excuse me, I experienced a temporary network issue. How can I help you today?' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '25px', right: language === 'ar' ? 'auto' : '25px', left: language === 'ar' ? '25px' : 'auto', zIndex: 9999 }}>
      {/* Floating Button */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          color: 'white',
          border: 'none',
          boxShadow: 'var(--shadow-lg)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>

      {/* Chat Panel Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="glass-panel"
            style={{
              position: 'absolute',
              bottom: '80px',
              right: language === 'ar' ? 'auto' : '0',
              left: language === 'ar' ? '0' : 'auto',
              width: '360px',
              height: '480px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '2px solid var(--primary)'
            }}
          >
            {/* Header */}
            <div style={{
              background: 'var(--primary)',
              color: 'white',
              padding: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Bot size={20} />
              <div>
                <strong style={{ fontSize: '0.95rem', display: 'block' }}>
                  {language === 'ar' ? 'المستشار العقاري الذكي' : 'Awtad AI Advisor'}
                </strong>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>نشط لتلبية طلباتك ومساعدتك 24/7</span>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: m.sender === 'user' ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                  color: 'var(--text-main)',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  maxWidth: '80%',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  border: m.sender === 'bot' ? '1px solid var(--border-color)' : 'none'
                }}>
                  {m.text}
                </div>
              ))}
              {isTyping && (
                <div style={{
                  alignSelf: 'flex-start',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-muted)',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  ✍️ {language === 'ar' ? 'جاري التحليل والكتابة...' : 'Typing...'}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Chips Replies Panel */}
            <div style={{
              display: 'flex',
              gap: '6px',
              padding: '8px 12px',
              background: 'var(--bg-primary)',
              borderTop: '1px solid var(--border-color)',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}>
              {QUICK_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.query)}
                  style={{
                    fontSize: '0.75rem',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    padding: '6px 12px',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input Footer Area */}
            <div style={{ padding: '10px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder={language === 'ar' ? 'اسأل عن شقة، فيلا، أو خطط دفع...' : 'Ask about properties or payment plans...'}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              />
              <button onClick={() => handleSend()} className="btn btn-primary" style={{ padding: '8px 12px' }}>
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
