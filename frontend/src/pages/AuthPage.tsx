import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Mail, Phone, User, Landmark, ShieldCheck } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, error } = useAuth();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'broker' | 'client'>('client');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('يرجى تعبئة الحقول الأساسية.');
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name || !phone) {
          setLocalError('يرجى تعبئة كافة الحقول المطلوبة لإنشاء حساب.');
          return;
        }
        await register({ name, email, phone, password, role: 'client' });
      }
    } catch (err: any) {
      // Error is set in AuthContext or thrown
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '20px'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.5 }}
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '450px',
          padding: '40px 30px',
          border: '1px solid var(--border-color)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px' }} className="gradient-text">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isLogin ? 'مرحباً بك مجدداً في منصة أوتاد العقارية' : 'انضم إلينا كعميل للبحث عن العقار المثالي'}
          </p>
        </div>

        {(localError || error) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-sm)',
              color: '#fca5a5',
              padding: '12px',
              fontSize: '0.85rem',
              marginBottom: '20px',
              textAlign: 'center'
            }}
          >
            {localError || error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="form-group">
                  <label className="form-label">الاسم الكامل</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', right: '12px', top: '15px', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="أحمد محمد"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ paddingRight: '40px' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">رقم الهاتف (مع رمز الدولة)</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', right: '12px', top: '15px', color: 'var(--text-muted)' }} />
                    <input 
                      type="tel" 
                      className="form-control" 
                      placeholder="+966500000000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ paddingRight: '40px', direction: 'ltr', textAlign: 'right' }}
                    />
                  </div>
                </div>

{/* Restricted to Client/Buyer role for public registers */}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="form-group">
            <label className="form-label">البريد الإلكتروني</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', right: '12px', top: '15px', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="form-control" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingRight: '40px' }}
                autoComplete="new-email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{ position: 'absolute', right: '12px', top: '15px', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '40px' }}
                autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '15px', padding: '14px' }}>
            {isLogin ? 'تسجيل الدخول' : 'تأكيد الحساب والاشتراك'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary)', 
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب بالفعل؟ تسجيل الدخول'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
