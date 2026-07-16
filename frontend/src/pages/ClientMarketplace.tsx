import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTenant } from '../context/TenantContext';
import { Search, MapPin, Tag, PlusCircle, LogIn, LogOut, Phone, Mail, Bed, Bath, Maximize2, Sparkles, ArrowRight, User, Filter, Sliders, ChevronDown, Check, X, GitCompare, Calculator, Calendar, Clock, Award, Shield, CheckCircle2, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GOVERNORATES, EGYPT_LOCATIONS } from '../utils/locations';

export interface Listing {
  id: string;
  broker_id: string;
  broker_name: string;
  broker_phone?: string;
  title: string;
  description: string;
  price: number;
  location: string;
  unit_count: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  finishing?: string;
  status: 'available' | 'reserved' | 'sold';
  images: string[];
  tags: string[];
}

const DEFAULT_MOCK_LISTINGS: Listing[] = [
  {
    id: 'l1',
    broker_id: 'b1111111-1111-1111-1111-111111111111',
    broker_name: 'أحمد السمسار',
    title: 'شقة فاخرة بالتجمع الخامس',
    description: 'شقة سكنية مميزة بتشطيب الترا مودرن وموقف خاص ودخول ذكي في أرقى أحياء التجمع الخامس بالقرب من الجامعة الأمريكية وبجانب كمبوند سوديك.',
    price: 4500000,
    location: 'القاهرة - التجمع الخامس (القاهرة الجديدة)',
    unit_count: 1,
    bedrooms: 3,
    bathrooms: 2,
    area: 160,
    finishing: 'كامل التشطيب',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'],
    tags: ['شقة', 'التجمع الخامس', 'بيع']
  },
  {
    id: 'l2',
    broker_id: 'b1111111-1111-1111-1111-111111111111',
    broker_name: 'أحمد السمسار',
    title: 'فيلا مودرن بالشيخ زايد مع مسبح',
    description: 'فيلا واسعة المساحة بتصميم هندسي فريد ومسبح وحديقة واسعة ونظام تكييف مركزي متكامل في قلب الشيخ زايد بالقرب من هايبر وان.',
    price: 12800000,
    location: 'الجيزة - الشيخ زايد',
    unit_count: 1,
    bedrooms: 5,
    bathrooms: 4,
    area: 350,
    finishing: 'كامل التشطيب',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80'],
    tags: ['فيلا', 'الشيخ زايد', 'مسبح']
  },
  {
    id: 'l3',
    broker_id: 'b1111111-1111-1111-1111-111111111111',
    broker_name: 'أحمد السمسار',
    title: 'شاليه صف أول على البحر بالساحل الشمالي',
    description: 'شاليه مميز مفروش بالكامل صف أول على البحر مباشرة بإطلالة بانورامية رائعة في أرقى قرى الساحل الشمالي بموقع استراتيجي ممتاز.',
    price: 6500000,
    location: 'الساحل الشمالي - سيدي عبد الرحمن (قرية مراسي)',
    unit_count: 1,
    bedrooms: 2,
    bathrooms: 2,
    area: 110,
    finishing: 'مفروش بالكامل',
    status: 'available',
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'],
    tags: ['شاليه', 'الساحل الشمالي', 'إيجار']
  }
];

const InstallmentCalculator: React.FC<{ propertyPrice: number }> = ({ propertyPrice }) => {
  const { t, language } = useLanguage();
  const [downPayment, setDownPayment] = useState(propertyPrice * 0.1); 
  const [years, setYears] = useState(7); 
  const [interest, setInterest] = useState(8); 
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    const principal = propertyPrice - downPayment;
    const rate = (interest / 100) / 12;
    const months = years * 12;
    
    let payment = 0;
    if (rate === 0) {
      payment = principal / months;
    } else {
      payment = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    }
    
    setMonthlyPayment(Math.round(payment));
    setTotalCost(Math.round((payment * months) + downPayment));
  }, [propertyPrice, downPayment, years, interest]);

  return (
    <div className="glass-panel" style={{ padding: '25px', marginTop: '20px' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }} className="gradient-text">
        <Calculator size={18} /> {t('calcInstallment')}
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">{language === 'ar' ? 'المقدم (جنيه)' : 'Down Payment (EGP)'}</label>
            <input 
              type="number" 
              className="form-control" 
              value={downPayment} 
              onChange={e => setDownPayment(Number(e.target.value))} 
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">{language === 'ar' ? 'فترة السداد (سنوات)' : 'Duration (Years)'}</label>
            <select className="form-control" value={years} onChange={e => setYears(Number(e.target.value))}>
              {[3, 5, 7, 10, 15].map(y => (
                <option key={y} value={y}>{y} {language === 'ar' ? 'سنوات' : 'Years'}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">{language === 'ar' ? 'نسبة الفائدة السنوية (%)' : 'Interest Rate (%)'}</label>
            <input 
              type="number" 
              className="form-control" 
              value={interest} 
              onChange={e => setInterest(Number(e.target.value))} 
            />
          </div>
        </div>

        <div style={{
          background: 'var(--bg-primary)',
          padding: '15px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'القسط الشهري التقريبي' : 'Monthly Payment'}</div>
            <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>{monthlyPayment.toLocaleString('ar-EG')} {t('currency')}</strong>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'إجمالي تكلفة العقار' : 'Total Property Cost'}</div>
            <strong style={{ fontSize: '1.25rem' }}>{totalCost.toLocaleString('ar-EG')} {t('currency')}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ClientMarketplace: React.FC<{ onNavigateToAuth: () => void; onNavigateToBroker: () => void }> = ({ onNavigateToAuth, onNavigateToBroker }) => {
  const { user, token, register, updateProfile } = useAuth();
  const { t, language } = useLanguage();
  const { tenant } = useTenant();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  
  // Basic Search States
  const [search, setSearch] = useState('');
  const [gov, setGov] = useState('الكل');
  const [area, setArea] = useState('الكل');
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  
  // Advanced Filter Panel States
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [beds, setBeds] = useState('الكل');
  const [baths, setBaths] = useState('الكل');
  const [finishingFilter, setFinishingFilter] = useState('الكل');
  const [propType, setPropType] = useState('الكل');

  // Property Comparison List State
  const [compareList, setCompareList] = useState<Listing[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Detailed view page state
  const [viewedListing, setViewedListing] = useState<Listing | null>(null);

  // Welcome Gate States
  const [showWelcomeGate, setShowWelcomeGate] = useState(false);
  const [gateName, setGateName] = useState('');
  const [gatePhone, setGatePhone] = useState('');
  const [gateEmail, setGateEmail] = useState('');
  const [gateError, setGateError] = useState<string | null>(null);

  // Silent Google One-Tap Trigger State
  const [showOneTap, setShowOneTap] = useState(false);
  const [oneTapPhone, setOneTapPhone] = useState('');

  // Lead Conversion Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [leadSource, setLeadSource] = useState('Direct Web');

  // Parse lead source from UTM tags or referrer
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utm = params.get('utm_source');
    if (utm) {
      setLeadSource(utm);
    } else if (document.referrer.includes('facebook.com')) {
      setLeadSource('Facebook Ads');
    } else if (document.referrer.includes('google.com')) {
      setLeadSource('Google Search');
    }
  }, []);

  useEffect(() => {
    const gateCompleted = localStorage.getItem('awtad_welcome_gate_completed');
    if (user || gateCompleted) {
      setShowWelcomeGate(false);
    } else {
      setShowWelcomeGate(true);
    }
  }, [user]);

  // Trigger silent Google One-Tap helper popup after 3 seconds for anonymous visitors
  useEffect(() => {
    if (user && user.id.startsWith('u_vis_')) {
      const timer = setTimeout(() => {
        setShowOneTap(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setClientName(user.name);
      setClientPhone(user.phone);
    }
  }, [user]);

  // Dual Registration/Login trigger on Welcome Gate submit
  const handleWelcomeGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateError(null);

    if (!gateName || !gatePhone || !gateEmail) {
      setGateError(language === 'ar' ? 'يرجى إكمال جميع الحقول.' : 'Please fill all fields.');
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const referralSource = searchParams.get('ref') || 'Direct Web';

    try {
      const response = await fetch('/api/auth/welcome-gate-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Subdomain': tenant.subdomain
        },
        body: JSON.stringify({
          name: gateName,
          email: gateEmail,
          phone: gatePhone,
          lead_source: referralSource
        })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('semsar_token', data.token);
        localStorage.setItem('semsar_user', JSON.stringify(data.user));
        localStorage.setItem('awtad_welcome_gate_completed', 'true');
        setShowWelcomeGate(false);
        // Force context reload
        window.location.reload();
      } else {
        setGateError(data.message || 'فشل تفعيل الحساب.');
      }
    } catch (err) {
      setGateError(language === 'ar' ? 'فشل الاتصال بالخادم.' : 'Connection failure.');
    }
  };

  // Skip and register as dynamic anonymous visitor in background
  const handleSkipWelcomeGate = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const referralSource = searchParams.get('ref') || 'Visitor';

    try {
      const response = await fetch('/api/auth/register-visitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Subdomain': tenant.subdomain
        },
        body: JSON.stringify({
          lead_source: referralSource
        })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('semsar_token', 'visitor_session_token_123');
        localStorage.setItem('semsar_user', JSON.stringify(data.user));
        window.location.reload();
      }
    } catch (e) {}

    localStorage.setItem('awtad_welcome_gate_completed', 'true');
    setShowWelcomeGate(false);
  };

  const parseJwt = (token: string) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  // Initialize and render Google sign-in button with polling safety
  useEffect(() => {
    if (!showWelcomeGate) return;
    
    const interval = setInterval(() => {
      if ((window as any).google) {
        clearInterval(interval);
        try {
          (window as any).google.accounts.id.initialize({
            client_id: "1095228004373-up76829dorkc4ptealn5hu730jd7bbi3.apps.googleusercontent.com",
            callback: (response: any) => {
              const payload = parseJwt(response.credential);
              if (payload) {
                setGateName(payload.name || '');
                setGateEmail(payload.email || '');
              }
            }
          });
          const container = document.getElementById("google-login-button-div");
          if (container) {
            (window as any).google.accounts.id.renderButton(
              container,
              { theme: "filled_blue", size: "large", width: 380 }
            );
          }
        } catch (err) {
          console.error("Google button render error:", err);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [showWelcomeGate]);

  // Google One-Tap Silent submission logic
  const handleGoogleOneTapConfirm = async () => {
    if (!oneTapPhone) {
      alert(language === 'ar' ? 'يرجى كتابة رقم الهاتف للتفعيل.' : 'Please enter your phone number to complete.');
      return;
    }
    try {
      await updateProfile('يوسف محمد (Google)', oneTapPhone);
      setShowOneTap(false);
    } catch (err) {}
  };

  const handleGoogleOneTap = () => {
    try {
      if ((window as any).google) {
        (window as any).google.accounts.id.prompt();
      }
    } catch (err) {
      setGateName('عميل جوجل التجريبي');
      setGateEmail('google.client@gmail.com');
    }
  };

  // Session duration timer tracking
  const [secondsOnSite, setSecondsOnSite] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsOnSite(prev => {
        const next = prev + 1;
        // Periodic heartbeat report every 15 seconds to update duration in CRM
        if (next % 15 === 0 && user && user.email) {
          const formatted = `${Math.floor(next / 60)}:${(next % 60).toString().padStart(2, '0')} دقيقة`;
          fetch('/api/crm/visitor-activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leadEmail: user.email, leadPhone: user.phone, timeOnSite: formatted })
          }).catch(() => {});
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [user]);

  // Tracking user property viewing behavior dynamically
  const trackActivity = async (listingTitle: string) => {
    if (user && user.email) {
      try {
        const formattedTime = `${Math.floor(secondsOnSite / 60)}:${(secondsOnSite % 60).toString().padStart(2, '0')} دقيقة`;
        await fetch('/api/crm/visitor-activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            leadEmail: user.email,
            leadPhone: user.phone,
            listingTitle: listingTitle,
            timeOnSite: formattedTime
          })
        });
      } catch (e) {}
    }
  };

  const handleViewListing = (listing: Listing) => {
    setViewedListing(listing);
    trackActivity(listing.title);
  };

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('/api/listings', {
          headers: {
            'X-Tenant-Subdomain': tenant.subdomain
          }
        });
        if (response.ok) {
          const data = await response.json();
          setListings(data);
        } else {
          setListings(DEFAULT_MOCK_LISTINGS);
        }
      } catch (e) {
        setListings(DEFAULT_MOCK_LISTINGS);
      }
    };
    fetchListings();
  }, [tenant]);

  // Update regions based on selected Governorate
  useEffect(() => {
    if (gov === 'الكل') {
      setAvailableAreas([]);
      setArea('الكل');
    } else {
      setAvailableAreas(EGYPT_LOCATIONS[gov] || []);
      setArea('الكل');
    }
  }, [gov]);

  // Apply Advanced Filtering Logic
  useEffect(() => {
    let result = listings.filter(l => {
      const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase()) || l.description.toLowerCase().includes(search.toLowerCase());
      
      let matchesGov = true;
      let matchesArea = true;
      let matchesMinPrice = true;
      let matchesMaxPrice = true;
      let matchesBeds = true;
      let matchesBaths = true;
      let matchesFinishing = true;
      let matchesPropType = true;

      const parts = l.location.split(' - ');
      const listGov = parts[0]?.trim() || '';
      const listArea = parts[1]?.trim() || '';

      if (gov !== 'الكل') matchesGov = listGov === gov;
      if (area !== 'الكل') matchesArea = listArea === area;
      if (minPrice) matchesMinPrice = l.price >= Number(minPrice);
      if (maxPrice) matchesMaxPrice = l.price <= Number(maxPrice);
      if (beds !== 'الكل') matchesBeds = l.bedrooms === Number(beds);
      if (baths !== 'الكل') matchesBaths = l.bathrooms === Number(baths);
      if (finishingFilter !== 'الكل') matchesFinishing = l.finishing === finishingFilter;
      if (propType !== 'الكل') {
        matchesPropType = l.title.includes(propType) || l.tags.includes(propType);
      }

      return matchesSearch && matchesGov && matchesArea && matchesMinPrice && matchesMaxPrice && matchesBeds && matchesBaths && matchesFinishing && matchesPropType;
    });
    setFilteredListings(result);
  }, [search, gov, area, minPrice, maxPrice, beds, baths, finishingFilter, propType, listings]);

  const toggleCompare = (listing: Listing, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (compareList.some(item => item.id === listing.id)) {
      setCompareList(compareList.filter(item => item.id !== listing.id));
    } else {
      if (compareList.length >= 3) {
        alert(language === 'ar' ? 'يمكنك مقارنة 3 عقارات كحد أقصى.' : 'You can compare up to 3 properties.');
        return;
      }
      setCompareList([...compareList, listing]);
    }
  };

  const handleBookVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !viewedListing) return;

    try {
      const response = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': tenant.subdomain
        },
        body: JSON.stringify({
          listing_title: viewedListing.title,
          client_name: clientName,
          phone: clientPhone,
          notes: bookingNotes,
          lead_source: leadSource 
        })
      });

      if (response.ok) {
        setBookingSuccess(true);
        setBookingNotes('');
        setTimeout(() => setBookingSuccess(false), 5000);
      }
    } catch (err) {}
  };

  // Full Unit Detail Page View
  if (viewedListing) {
    const parsedLocation = viewedListing.location.split(' - ');
    const displayGov = parsedLocation[0] || '';
    const displayArea = parsedLocation[1] || viewedListing.location;
    
    const downPaymentValue = Math.round(viewedListing.price * 0.1).toLocaleString('ar-EG');
    const monthlyPaymentValue = Math.round((viewedListing.price * 0.9) / (7 * 12)).toLocaleString('ar-EG');

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        style={{ padding: '20px 0' }}
      >
        <button 
          onClick={() => setViewedListing(null)} 
          className="btn btn-secondary" 
          style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowRight size={18} /> {language === 'ar' ? 'الرجوع إلى سوق العقارات' : 'Back to Marketplace'}
        </button>

        <div className="glass-panel" style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ width: '100%', height: '400px', overflow: 'hidden', position: 'relative' }}>
            <img src={viewedListing.images[0]} alt={viewedListing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              padding: '40px 30px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <div>
                <span style={{ backgroundColor: 'var(--accent)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  {displayGov}
                </span>
                <h1 style={{ color: 'white', fontSize: '2rem', marginTop: '5px' }}>{viewedListing.title}</h1>
              </div>
              <div style={{ color: 'white', textAlign: 'left' }}>
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{language === 'ar' ? 'سعر الوحدة' : 'Price'}</span>
                <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                  {viewedListing.price.toLocaleString('ar-EG')} <span style={{ fontSize: '1.2rem' }}>{t('currency')}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '40px 30px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              <div style={{
                background: 'linear-gradient(135deg, rgba(30,65,100,0.05), rgba(125,203,193,0.15))',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--accent)',
                display: 'flex',
                justifyContent: 'space-around',
                flexWrap: 'wrap',
                gap: '15px',
                textAlign: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'مقدم حجز يبدأ من (10%)' : 'Down Payment starts at (10%)'}</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary)', marginTop: '4px' }}>{downPaymentValue} {t('currency')}</div>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)', height: '40px', alignSelf: 'center' }}></div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'أقساط شهرية متساوية على 7 سنين' : 'Monthly installments over 7 yrs'}</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary)', marginTop: '4px' }}>{monthlyPaymentValue} {t('currency')}</div>
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '15px', color: 'var(--primary)' }}>{t('contactDetails')}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '15px' }}>
                  <div className="glass-panel" style={{ padding: '15px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Bed size={24} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('rooms')}</span>
                    <strong style={{ fontSize: '1.1rem' }}>{viewedListing.bedrooms || 0} {t('rooms')}</strong>
                  </div>
                  <div className="glass-panel" style={{ padding: '15px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Bath size={24} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('baths')}</span>
                    <strong style={{ fontSize: '1.1rem' }}>{viewedListing.bathrooms || 0} {t('baths')}</strong>
                  </div>
                  <div className="glass-panel" style={{ padding: '15px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Maximize2 size={24} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('area')}</span>
                    <strong style={{ fontSize: '1.1rem' }}>{viewedListing.area || 0} م²</strong>
                  </div>
                  <div className="glass-panel" style={{ padding: '15px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={24} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('finishing')}</span>
                    <strong style={{ fontSize: '1.1rem' }}>{viewedListing.finishing || 'كامل'}</strong>
                  </div>
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '15px', color: 'var(--primary)' }}>{language === 'ar' ? 'الوصف التفصيلي' : 'Description'}</h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '1rem', whiteSpace: 'pre-line' }}>{viewedListing.description}</p>
              </div>

              <InstallmentCalculator propertyPrice={viewedListing.price} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '25px', border: '1px solid var(--primary)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', textAlign: 'center' }}>{language === 'ar' ? 'معلومات الاتصال' : 'Broker Info'}</h3>
                {user ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                      <User size={20} style={{ color: 'var(--accent)' }} />
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('nameLabel')}</div>
                        <strong>{viewedListing.broker_name}</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                      <Phone size={20} style={{ color: 'var(--accent)' }} />
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('phoneLabel')}</div>
                        <strong style={{ direction: 'ltr', display: 'inline-block' }}>{viewedListing.broker_phone || '+20 100 000 0000'}</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6 }}>
                      {language === 'ar' ? 'معلومات الاتصال مشفرة ومتاحة فقط للأعضاء المسجلين.' : 'Contact info encrypted. Sign up to view contact details.'}
                    </p>
                    <button onClick={onNavigateToAuth} className="btn btn-primary" style={{ width: '100%' }}>{t('register')}</button>
                  </div>
                )}
              </div>

              {user && (
                <div className="glass-panel" style={{ padding: '25px', border: '1px solid var(--accent)' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} style={{ color: 'var(--accent)' }} /> {language === 'ar' ? 'طلب معاينة أو إبداء الاهتمام' : 'Book a Tour / Express Interest'}
                  </h4>
                  
                  {bookingSuccess ? (
                    <div style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: 'var(--success)',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      textAlign: 'center'
                    }}>
                      {language === 'ar' ? 'تم تقديم طلب المعاينة وإرساله للـ CRM بنجاح!' : 'Tour request submitted and sent to CRM successfully!'}
                    </div>
                  ) : (
                    <form onSubmit={handleBookVisit}>
                      <div className="form-group">
                        <label className="form-label">{t('nameLabel')}</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={clientName} 
                          onChange={e => setClientName(e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">{t('phoneLabel')}</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={clientPhone} 
                          onChange={e => setClientPhone(e.target.value)} 
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">{t('notesLabel')} ({language === 'ar' ? 'اختياري' : 'Optional'})</label>
                        <textarea 
                          className="form-control" 
                          rows={2} 
                          value={bookingNotes} 
                          onChange={e => setBookingNotes(e.target.value)} 
                        />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                        {language === 'ar' ? 'إرسال الطلب الآن' : 'Submit Interest Now'}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div style={{ padding: '20px 0' }}>
      
      {/* Dynamic Welcome Gate Overlay Modal */}
      <AnimatePresence>
        {showWelcomeGate && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(30, 65, 100, 0.95)', 
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: '450px',
                padding: '40px 30px',
                textAlign: 'center',
                border: '2px solid var(--accent)',
                backgroundColor: 'rgba(255,255,255,0.08)'
              }}
            >
              <h2 style={{ fontSize: '1.6rem', color: 'white', marginBottom: '15px', fontWeight: 800 }}>
                {language === 'ar' ? 'أهلاً بك في منصة AK!' : 'Welcome to AK!'}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginBottom: '30px', lineHeight: 1.6 }}>
                {language === 'ar' 
                  ? 'لتجربة مخصصة والحصول على دليل أسعار مشروعات 2026 الحصرية مجاناً، برجاء تسجيل دخولك السريع.'
                  : 'For a personalized experience and to download the exclusive 2026 price guides, please sign up.'}
              </p>

              {/* Official Google Sign-In Button Container */}
              <div 
                id="google-login-button-div" 
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  marginBottom: '20px' 
                }}
              ></div>

              <div style={{ position: 'relative', margin: '20px 0', height: '1px', background: 'rgba(255,255,255,0.2)' }}>
                <span style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: '#1e4164',
                  padding: '0 10px',
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.6)'
                }}>{language === 'ar' ? 'أو أدخل بياناتك' : 'or enter details'}</span>
              </div>

              {gateError && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: 'var(--danger)',
                  padding: '8px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  marginBottom: '15px'
                }}>
                  {gateError}
                </div>
              )}

              {/* Three Consecutive Form Fields */}
              <form onSubmit={handleWelcomeGateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                  value={gateName}
                  onChange={e => setGateName(e.target.value)}
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                  required
                />

                <input 
                  type="email" 
                  className="form-control" 
                  placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                  value={gateEmail}
                  onChange={e => setGateEmail(e.target.value)}
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                  required
                />
                
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={language === 'ar' ? 'رقم الهاتف والواتساب' : 'Phone / WhatsApp'}
                  value={gatePhone}
                  onChange={e => setGatePhone(e.target.value)}
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                  required
                />

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '10px', backgroundColor: 'var(--accent)', color: 'var(--primary)', fontWeight: 'bold' }}
                >
                  {language === 'ar' ? 'احصل على دليل الأسعار مجاناً' : 'Get Price Catalog Free'}
                </button>
              </form>

              <button 
                onClick={onNavigateToAuth}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', marginTop: '20px', cursor: 'pointer', textDecoration: 'underline', display: 'block', margin: '20px auto 0 auto', fontWeight: 'bold' }}
              >
                {language === 'ar' ? 'هل لديك حساب بالفعل؟' : 'Already have an account?'}
              </button>

              <button 
                onClick={onNavigateToBroker}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '10px', cursor: 'pointer', textDecoration: 'underline', display: 'block', margin: '10px auto 0 auto' }}
              >
                {language === 'ar' ? 'تسجيل دخول المستشار العقاري' : 'Advisor / Broker Sign In'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Silent Google One-Tap Widget */}
      <AnimatePresence>
        {showOneTap && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="glass-panel"
            style={{
              position: 'fixed',
              top: '85px',
              right: language === 'ar' ? 'auto' : '30px',
              left: language === 'ar' ? '30px' : 'auto',
              width: '320px',
              padding: '20px',
              border: '2px solid var(--accent)',
              zIndex: 9999,
              backgroundColor: 'var(--bg-secondary)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Chrome size={18} style={{ color: '#4285F4' }} />
                <strong style={{ fontSize: '0.85rem' }}>Google One-Tap</strong>
              </div>
              <button onClick={() => setShowOneTap(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={14} />
              </button>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              {language === 'ar' ? 'أكمل تسجيل دخولك بـ Google لمزامنة الأسعار.' : 'Complete Google Sign-In to sync project brochures.'}
            </p>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder={language === 'ar' ? 'رقم الهاتف للتأكيد' : 'Confirm Phone'} 
                value={oneTapPhone}
                onChange={e => setOneTapPhone(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '6px' }}
              />
            </div>

            <button 
              onClick={handleGoogleOneTapConfirm} 
              className="btn btn-primary" 
              style={{ width: '100%', fontSize: '0.8rem', padding: '6px' }}
            >
              {language === 'ar' ? 'المتابعة كـ يوسف محمد' : 'Continue as Youssef'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BRANDING ADVANTAGES LANDING PAGE HERO */}
      <div style={{
        textAlign: 'center',
        padding: '80px 20px',
        background: 'linear-gradient(135deg, rgba(30,65,100,0.1), rgba(125,203,193,0.1))',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '40px',
        border: '1px solid var(--border-color)'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '15px' }} className="gradient-text">
          {tenant.name} | {t('appTagline')}
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto 40px auto', fontSize: '1.1rem', lineHeight: 1.6 }}>
          {t('searchDesc')}
        </p>

        {/* Real Estate Portal Core Brand Competitive Advantages */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Award size={32} style={{ color: 'var(--primary)' }} />
            <strong style={{ fontSize: '1.05rem' }}>{language === 'ar' ? 'تغطية كاملة للمشروعات' : 'Complete Project Coverage'}</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'تغطية شاملة لكل الكومبوندات الفاخرة بمصر' : 'All premium developments in Egypt'}</span>
          </div>

          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Shield size={32} style={{ color: 'var(--primary)' }} />
            <strong style={{ fontSize: '1.05rem' }}>{language === 'ar' ? 'استشارة عقارية مجانية' : 'Free Property Advisory'}</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'مستشار عقاري مخصص لمساعدتك مجاناً' : 'Get guided by certified advisors'}</span>
          </div>

          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={32} style={{ color: 'var(--primary)' }} />
            <strong style={{ fontSize: '1.05rem' }}>{language === 'ar' ? 'أفضل خطط سداد مخصصة' : 'Best Custom Payment Plans'}</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'تسهيلات في السداد وأطول فترات تقسيط' : 'Longest amortization period options'}</span>
          </div>
        </div>
      </div>

      {/* ADVANCED CASCADING SEARCH FILTER ENGINE */}
      <div className="glass-panel" style={{
        padding: '30px',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Core Search & Location Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ flex: 2, minWidth: '220px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', right: '15px', top: '15px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingRight: '45px' }}
            />
          </div>
          
          <div style={{ flex: 1, minWidth: '150px' }}>
            <select className="form-control" value={gov} onChange={(e) => setGov(e.target.value)} style={{ height: '100%' }}>
              <option value="الكل">{t('allGovs')}</option>
              {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '150px' }}>
            <select className="form-control" value={area} onChange={(e) => setArea(e.target.value)} disabled={gov === 'الكل'} style={{ height: '100%' }}>
              <option value="الكل">{t('allAreas')}</option>
              {availableAreas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <button 
            onClick={() => setShowAdvanced(!showAdvanced)} 
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Filter size={16} /> {language === 'ar' ? 'خيارات متقدمة' : 'Filters'}
          </button>

          <button 
            className="btn" 
            style={{
              backgroundColor: '#ea580c', 
              color: 'white',
              padding: '10px 24px',
              fontWeight: 'bold',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-md)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {language === 'ar' ? 'ابحث الآن' : 'Search Now'}
          </button>
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '15px',
                paddingTop: '20px',
                borderTop: '1px solid var(--border-color)'
              }}>
                <div className="form-group">
                  <label className="form-label">{language === 'ar' ? 'السعر من' : 'Min Price'}</label>
                  <input type="number" className="form-control" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">{language === 'ar' ? 'السعر إلى' : 'Max Price'}</label>
                  <input type="number" className="form-control" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="50,000,000" />
                </div>
                <div className="form-group">
                  <label className="form-label">{language === 'ar' ? 'عدد الغرف' : 'Bedrooms'}</label>
                  <select className="form-control" value={beds} onChange={e => setBeds(e.target.value)}>
                    <option value="الكل">{t('all')}</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5+</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{language === 'ar' ? 'نوع العقار' : 'Property Type'}</label>
                  <select className="form-control" value={propType} onChange={e => setPropType(e.target.value)}>
                    <option value="الكل">{t('all')}</option>
                    <option value="شقة">{language === 'ar' ? 'شقة' : 'Apartment'}</option>
                    <option value="فيلا">{language === 'ar' ? 'فيلا' : 'Villa'}</option>
                    <option value="شاليه">{language === 'ar' ? 'شاليه' : 'Chalet'}</option>
                    <option value="مكتب">{language === 'ar' ? 'مكتب تجاري' : 'Office'}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('finishing')}</label>
                  <select className="form-control" value={finishingFilter} onChange={e => setFinishingFilter(e.target.value)}>
                    <option value="الكل">{t('all')}</option>
                    <option value="كامل التشطيب">{language === 'ar' ? 'كامل التشطيب' : 'Fully Finished'}</option>
                    <option value="نصف تشطيب">{language === 'ar' ? 'نصف تشطيب' : 'Semi Finished'}</option>
                    <option value="بدون تشطيب">{language === 'ar' ? 'بدون تشطيب' : 'Unfinished'}</option>
                    <option value="مفروش بالكامل">{language === 'ar' ? 'مفروش بالكامل' : 'Fully Furnished'}</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid listing views */}
      <div className="grid-container">
        <AnimatePresence>
          {filteredListings.map((listing) => {
            const isCompared = compareList.some(c => c.id === listing.id);
            return (
              <motion.div 
                key={listing.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="glass-panel"
                style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => handleViewListing(listing)}
              >
                <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
                  <img src={listing.images[0]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(0,0,0,0.65)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    color: '#ffffff',
                    fontWeight: 'bold'
                  }}>
                    {listing.location.split(' - ')[1] || listing.location}
                  </span>

                  <button 
                    onClick={(e) => toggleCompare(listing, e)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: isCompared ? 'var(--primary)' : 'rgba(0,0,0,0.65)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    <GitCompare size={16} />
                  </button>
                </div>
                
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {listing.tags.map(t => (
                      <span key={t} style={{ fontSize: '0.75rem', background: 'var(--bg-tertiary)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '4px' }}>
                        #{t}
                      </span>
                    ))}
                  </div>

                  <h3 style={{ fontSize: '1.2rem', margin: '4px 0' }}>{listing.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', flex: 1, lineBreak: 'anywhere' }}>
                    {listing.description.length > 90 ? `${listing.description.substring(0, 90)}...` : listing.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    background: 'var(--bg-primary)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    color: 'var(--text-main)',
                    margin: '8px 0',
                    border: '1px solid var(--border-color)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Bed size={14} style={{ color: 'var(--accent)' }} /> {listing.bedrooms || 0} {t('rooms')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Bath size={14} style={{ color: 'var(--accent)' }} /> {listing.bathrooms || 0} {t('baths')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Maximize2 size={14} style={{ color: 'var(--accent)' }} /> {listing.area || 0} م²
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Sparkles size={14} style={{ color: 'var(--accent)' }} /> {listing.finishing || 'كامل'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                    <div>
                      <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {listing.price.toLocaleString('ar-EG')}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> {t('currency')}</span>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewListing(listing);
                      }} 
                      className="btn btn-secondary" 
                      style={{ padding: '8px 14px' }}
                    >
                      {t('contactDetails')}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Floating Comparison Action Bar */}
      {compareList.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--bg-secondary)',
          border: '2px solid var(--primary)',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 25px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          zIndex: 900
        }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
            {language === 'ar' ? `المقارنة (${compareList.length} عقارات)` : `Compare (${compareList.length} items)`}
          </span>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {compareList.map(item => (
              <span key={item.id} style={{
                fontSize: '0.8rem',
                backgroundColor: 'var(--bg-tertiary)',
                padding: '4px 10px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {item.title.substring(0, 15)}...
                <X size={12} style={{ cursor: 'pointer', color: 'var(--danger)' }} onClick={(e) => { e.stopPropagation(); setCompareList(compareList.filter(c => c.id !== item.id)); }} />
              </span>
            ))}
          </div>

          <button 
            onClick={() => setShowComparisonModal(true)} 
            className="btn btn-primary" 
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            disabled={compareList.length < 2}
          >
            {t('compareTab')}
          </button>
        </div>
      )}

      {/* Comparison Details Modal */}
      {showComparisonModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel"
            style={{ width: '100%', maxWidth: '850px', padding: '30px', position: 'relative' }}
          >
            <button 
              onClick={() => setShowComparisonModal(false)}
              style={{ position: 'absolute', top: '15px', left: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.5rem', marginBottom: '25px', textAlign: 'center' }} className="gradient-text">
              {language === 'ar' ? 'المقارنة العقارية التفصيلية' : 'Side-by-Side Comparison'}
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '10px', textAlign: 'right' }}>{language === 'ar' ? 'المواصفات' : 'Spec'}</th>
                    {compareList.map(item => (
                      <th key={item.id} style={{ padding: '10px' }}>{item.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', textAlign: 'right' }}>{language === 'ar' ? 'السعر' : 'Price'}</td>
                    {compareList.map(item => (
                      <td key={item.id}>{item.price.toLocaleString('ar-EG')} {t('currency')}</td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', textAlign: 'right' }}>{language === 'ar' ? 'الموقع' : 'Location'}</td>
                    {compareList.map(item => (
                      <td key={item.id}>{item.location.split(' - ')[1] || item.location}</td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', textAlign: 'right' }}>{t('rooms')}</td>
                    {compareList.map(item => (
                      <td key={item.id}>{item.bedrooms || 0} غرف</td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', textAlign: 'right' }}>{t('baths')}</td>
                    {compareList.map(item => (
                      <td key={item.id}>{item.bathrooms || 0} حمام</td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', textAlign: 'right' }}>{t('area')}</td>
                    {compareList.map(item => (
                      <td key={item.id}>{item.area || 0} م²</td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', textAlign: 'right' }}>{t('finishing')}</td>
                    {compareList.map(item => (
                      <td key={item.id}>{item.finishing || 'غير محدد'}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '25px' }}>
              <button onClick={() => setShowComparisonModal(false)} className="btn btn-secondary">{language === 'ar' ? 'إغلاق المقارنة' : 'Close Comparison'}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
