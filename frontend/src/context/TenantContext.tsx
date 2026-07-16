import React, { createContext, useContext, useState, useEffect } from 'react';

type TenantSubdomain = 'awtad' | 'aqar';

interface TenantConfig {
  subdomain: TenantSubdomain;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  phone: string; // Dynamic contact phone
}

const TENANT_PRESETS: Record<TenantSubdomain, TenantConfig> = {
  awtad: {
    subdomain: 'awtad',
    name: 'AK',
    primaryColor: '#1e4164', 
    secondaryColor: '#7dcbc1',
    phone: '01027484938' 
  },
  aqar: {
    subdomain: 'aqar',
    name: 'عقار مصر (Aqar Misr)',
    primaryColor: '#0f766e', 
    secondaryColor: '#2dd4bf',
    phone: '+201000000003'
  }
};

interface TenantContextType {
  tenant: TenantConfig;
  switchTenant: (subdomain: TenantSubdomain) => void;
  updateTenantPhone: (phone: string) => void; // State syncer
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subdomain, setSubdomain] = useState<TenantSubdomain>('awtad');
  const [tenantState, setTenantState] = useState<Record<TenantSubdomain, TenantConfig>>(TENANT_PRESETS);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tenantParam = params.get('tenant') as string;
    
    if (tenantParam) {
      if (tenantParam === 'awtad' || tenantParam === 'aqar') {
        setSubdomain(tenantParam as TenantSubdomain);
      } else if (tenantParam === 'nawy') {
        setSubdomain('awtad');
      }
    }
  }, []);

  useEffect(() => {
    const activeConfig = tenantState[subdomain];
    document.documentElement.style.setProperty('--primary', activeConfig.primaryColor);
    document.documentElement.style.setProperty('--accent', activeConfig.secondaryColor);
  }, [subdomain, tenantState]);

  const switchTenant = (newSub: TenantSubdomain) => {
    setSubdomain(newSub);
    const url = new URL(window.location.href);
    url.searchParams.set('tenant', newSub);
    window.history.pushState({}, '', url.toString());
  };

  const updateTenantPhone = (newPhone: string) => {
    setTenantState(prev => ({
      ...prev,
      [subdomain]: {
        ...prev[subdomain],
        phone: newPhone
      }
    }));
  };

  const value = {
    tenant: tenantState[subdomain],
    switchTenant,
    updateTenantPhone
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
