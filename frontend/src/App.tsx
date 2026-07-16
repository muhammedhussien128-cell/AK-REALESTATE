import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { TenantProvider, useTenant } from './context/TenantContext';
import { ClientMarketplace } from './pages/ClientMarketplace';
import { BrokerDashboard } from './pages/BrokerDashboard';
import { AuthPage } from './pages/AuthPage';
import { AIAssistant } from './components/AIAssistant';
import { Building2, User, LogOut, Landmark, Globe, Layers, PhoneCall, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Navigation: React.FC<{ activeTab: string, setActiveTab: (tab: string) => void }> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { tenant, switchTenant } = useTenant();

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="glass-panel desktop-nav" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 30px',
        marginBottom: '30px',
        borderRadius: 'var(--radius-md)',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setActiveTab('marketplace')}>
            <Building2 size={28} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '1.4rem', fontWeight: 800 }} className="gradient-text">
              {tenant.name.split(' ')[0]}
            </span>
          </div>

          {/* Tenant Subdomain Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', background: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: '15px' }}>
            <Layers size={14} style={{ color: 'var(--primary)' }} />
            <select 
              value={tenant.subdomain} 
              onChange={(e) => switchTenant(e.target.value as any)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              <option value="awtad">AK</option>
              <option value="aqar">Aqar Agency</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <a 
            href={`tel:${tenant.phone}`}
            className="btn"
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              textDecoration: 'none',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <PhoneCall size={14} />
            {language === 'ar' ? 'اتصل الآن' : 'Call Now'}
          </a>

          <button 
            onClick={toggleLanguage} 
            className="btn btn-secondary" 
            style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Globe size={16} />
            {language === 'ar' ? 'English' : 'عربي'}
          </button>

          <button 
            onClick={() => setActiveTab('marketplace')} 
            className={`btn ${activeTab === 'marketplace' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px' }}
          >
            {language === 'ar' ? 'السوق العقاري' : 'Marketplace'}
          </button>

          {user && user.role === 'broker' && (
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px' }}
            >
              {t('brokerDashboard')}
            </button>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {user.role === 'broker' ? <Landmark size={14} style={{ color: 'var(--primary)' }} /> : <User size={14} />}
                {user.name}
              </span>
              <button onClick={logout} className="btn btn-secondary" style={{ padding: '8px 12px', color: 'var(--danger)' }}>
                <LogOut size={16} /> {t('logout')}
              </button>
            </div>
          ) : (
            <button onClick={() => setActiveTab('auth')} className="btn btn-primary" style={{ padding: '8px 16px' }}>
              {t('login')}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Thin Top Header */}
      <div className="mobile-header-bar" style={{
        display: 'none',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 15px',
        background: 'var(--glass)',
        backdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => setActiveTab('marketplace')}>
          <Building2 size={24} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '1.2rem', fontWeight: 800 }} className="gradient-text">
            {tenant.name.split(' ')[0]}
          </span>
        </div>
        
        {/* Compact Tenant Switcher */}
        <select 
          value={tenant.subdomain} 
          onChange={(e) => switchTenant(e.target.value as any)}
          style={{ background: 'var(--bg-tertiary)', border: 'none', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', padding: '4px 8px', borderRadius: '10px' }}
        >
          <option value="awtad">AK</option>
          <option value="aqar">Aqar</option>
        </select>
      </div>

      {/* Mobile Sticky Bottom Tab Bar */}
      <div className="mobile-nav-bar" style={{ display: 'none' }}>
        <button 
          onClick={() => setActiveTab('marketplace')} 
          className={`mobile-nav-item ${activeTab === 'marketplace' ? 'active' : ''}`}
        >
          <Building2 size={20} />
          <span>{language === 'ar' ? 'السوق' : 'Market'}</span>
        </button>

        {user && user.role === 'broker' && (
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <Landmark size={20} />
            <span>{language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</span>
          </button>
        )}

        <button 
          onClick={toggleLanguage} 
          className="mobile-nav-item"
        >
          <Globe size={20} />
          <span>{language === 'ar' ? 'English' : 'عربي'}</span>
        </button>

        <a 
          href={`tel:${tenant.phone}`}
          className="mobile-nav-item"
        >
          <PhoneCall size={20} style={{ color: 'var(--success)' }} />
          <span>{language === 'ar' ? 'اتصل' : 'Call'}</span>
        </a>

        {user ? (
          <button onClick={logout} className="mobile-nav-item" style={{ color: 'var(--danger)' }}>
            <LogOut size={20} />
            <span>{language === 'ar' ? 'خروج' : 'Logout'}</span>
          </button>
        ) : (
          <button 
            onClick={() => setActiveTab('auth')} 
            className={`mobile-nav-item ${activeTab === 'auth' ? 'active' : ''}`}
          >
            <User size={20} />
            <span>{language === 'ar' ? 'دخول' : 'Login'}</span>
          </button>
        )}
      </div>
    </>
  );
};

const MainContent: React.FC<{ activeTab: string, setActiveTab: (tab: string) => void }> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();

  useEffect(() => {
    // Redirect broker to dashboard only when they are on auth/login screens upon login
    if (user && user.role === 'broker') {
      localStorage.setItem('awtad_welcome_gate_completed', 'true');
      if (activeTab === 'auth' || activeTab === 'broker-login') {
        setActiveTab('dashboard');
      }
    }
  }, [user, activeTab]);

  if (activeTab === 'dashboard' && (!user || user.role !== 'broker')) {
    return <ClientMarketplace onNavigateToAuth={() => setActiveTab('auth')} onNavigateToBroker={() => setActiveTab('broker-login')} />;
  }

  if ((activeTab === 'auth' || activeTab === 'broker-login') && user) {
    return <ClientMarketplace onNavigateToAuth={() => setActiveTab('auth')} onNavigateToBroker={() => setActiveTab('broker-login')} />;
  }

  switch (activeTab) {
    case 'dashboard':
      return <BrokerDashboard />;
    case 'auth':
    case 'broker-login':
      return <AuthPage />;
    default:
      return <ClientMarketplace onNavigateToAuth={() => setActiveTab('auth')} onNavigateToBroker={() => setActiveTab('broker-login')} />;
  }
};

function AppContent() {
  const [activeTab, setActiveTab] = useState('marketplace');
  const { language } = useLanguage();
  const { tenant } = useTenant();

  // Listen to secure broker hash route triggers e.g. #/broker-login or #/admin
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#/broker-login' || window.location.hash === '#/admin') {
        setActiveTab('broker-login');
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  return (
    <div style={{ maxWidth: '1280px', width: '95%', margin: '0 auto', padding: '20px 0' }}>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <MainContent activeTab={activeTab} setActiveTab={setActiveTab} />
      <AIAssistant />

      {/* Floating Sticky WhatsApp CTA Button */}
      <motion.a 
        href={`https://wa.me/${tenant.phone.replace(/[\s+]/g, '')}`} 
        target="_blank" 
        rel="noopener noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '25px',
          left: language === 'ar' ? 'auto' : '20px',
          right: language === 'ar' ? '20px' : 'auto',
          backgroundColor: '#25D366', 
          color: 'white',
          padding: '12px 24px',
          borderRadius: '30px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          zIndex: 999
        }}
      >
        <MessageCircle size={20} />
        {language === 'ar' ? 'تواصل مع مستشارك العقاري' : 'Advisory WhatsApp'}
      </motion.a>
    </div>
  );
}

function App() {
  return (
    <TenantProvider>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </TenantProvider>
  );
}

export default App;
