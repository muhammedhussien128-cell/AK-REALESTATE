import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

type Translations = Record<string, Record<Language, string>>;

export const translations: Translations = {
  appName: { ar: 'AK', en: 'AK' },
  appTagline: { ar: 'منصة العقارات الاستثمارية الأولى', en: 'The Premier Real Estate Investment Platform' },
  searchTitle: { ar: 'ابحث عن عقارك المثالي بكل سهولة', en: 'Find Your Perfect Property Effortlessly' },
  searchDesc: { ar: 'تصفح مئات العقارات السكنية والتجارية المقدمة من أفضل الوسطاء المعتمدين في مصر.', en: 'Browse hundreds of residential and commercial properties from top certified brokers in Egypt.' },
  searchPlaceholder: { ar: 'ابحث بالاسم، الكلمات الدلالية، أو الوصف...', en: 'Search by title, keywords, or description...' },
  governorate: { ar: 'المحافظة', en: 'Governorate' },
  region: { ar: 'المنطقة / الحي', en: 'Area / Neighborhood' },
  allGovs: { ar: 'كل المحافظات', en: 'All Governorates' },
  allAreas: { ar: 'كل المناطق', en: 'All Areas' },
  all: { ar: 'الكل', en: 'All' },
  searchBtn: { ar: 'بحث', en: 'Search' },
  currency: { ar: 'جنيه', en: 'EGP' },
  contactDetails: { ar: 'تفاصيل الاتصال', en: 'Contact Details' },
  rooms: { ar: 'غرف', en: 'Rooms' },
  baths: { ar: 'حمامات', en: 'Baths' },
  area: { ar: 'مساحة', en: 'Area' },
  finishing: { ar: 'تشطيب', en: 'Finishing' },
  available: { ar: 'متاح', en: 'Available' },
  reserved: { ar: 'محجوز', en: 'Reserved' },
  sold: { ar: 'تم البيع', en: 'Sold' },
  login: { ar: 'تسجيل الدخول', en: 'Sign In' },
  logout: { ar: 'تسجيل الخروج', en: 'Sign Out' },
  register: { ar: 'إنشاء حساب', en: 'Sign Up' },
  brokerDashboard: { ar: 'لوحة تحكم الوسيط', en: 'Broker Dashboard' },
  crmTab: { ar: 'إدارة العملاء (CRM)', en: 'CRM Dashboard' },
  myListings: { ar: 'عقاراتي المنشورة', en: 'My Listings' },
  addProperty: { ar: 'إضافة عقار جديد', en: 'Add Property' },
  calcInstallment: { ar: 'حاسبة الأقساط', en: 'Installment Calculator' },
  compareTab: { ar: 'المقارنة العقارية', en: 'Compare Properties' },
  aiAssistant: { ar: 'المستشار العقاري الذكي', en: 'AI Real Estate Assistant' },
  leadTitle: { ar: 'طلب معاينة أو حجز موعد', en: 'Book Viewing / Schedule Visit' },
  bookBtn: { ar: 'حجز الموعد الآن', en: 'Book Visit Now' },
  nameLabel: { ar: 'الاسم الكامل', en: 'Full Name' },
  phoneLabel: { ar: 'رقم الهاتف', en: 'Phone Number' },
  emailLabel: { ar: 'البريد الإلكتروني', en: 'Email Address' },
  dateLabel: { ar: 'التاريخ المفضل', en: 'Preferred Date' },
  timeLabel: { ar: 'الوقت المفضل', en: 'Preferred Time' },
  notesLabel: { ar: 'ملاحظات إضافية', en: 'Additional Notes' }
};

interface LanguageContextType {
  language: Language;
  t: (key: keyof typeof translations | string) => string;
  toggleLanguage: () => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    const savedLang = localStorage.getItem('semsar_lang') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    // Dynamic body adjustments for RTL/LTR
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    document.body.style.direction = dir;
    document.body.style.textAlign = language === 'ar' ? 'right' : 'left';
    
    // Change font family dynamically
    const fontFamily = language === 'ar' ? "'Cairo', sans-serif" : "'Inter', sans-serif";
    document.documentElement.style.setProperty('--font-family', fontFamily);
    document.documentElement.style.setProperty('--direction', dir);
    
    localStorage.setItem('semsar_lang', language);
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (translation) {
      return translation[language];
    }
    return key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
