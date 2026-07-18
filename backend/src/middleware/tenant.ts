import { Request, Response, NextFunction } from 'express';

export interface TenantRequest extends Request {
  tenantId?: string;
  tenantConfig?: {
    name: string;
    subdomain: string;
    primaryColor: string;
    secondaryColor: string;
    phone: string;
  };
}

// Map subdomains to dynamic tenant contact phone configurations
export const MOCK_TENANTS: Record<string, { id: string; name: string; primaryColor: string; secondaryColor: string; phone: string }> = {
  "awtad": {
    id: "tenant-nawy-uuid-1111",
    name: "أوتاد مصر (Awtad Egypt)",
    primaryColor: "#1e4164",
    secondaryColor: "#7dcbc1",
    phone: "+201027484938" 
  },
  "aqar": {
    id: "tenant-aqar-uuid-2222",
    name: "عقار مصر (Aqar Misr)",
    primaryColor: "#0f766e",
    secondaryColor: "#2dd4bf",
    phone: "+201000000003"
  }
};

export const resolveTenant = (req: TenantRequest, res: Response, next: NextFunction) => {
  let subdomain = (req.headers['x-tenant-subdomain'] as string) || (req.query.tenant as string) || 'awtad';

  subdomain = subdomain.toLowerCase();
  
  if (subdomain === 'nawy') {
    subdomain = 'awtad';
  }

  const tenant = MOCK_TENANTS[subdomain] || MOCK_TENANTS['awtad'];

  req.tenantId = tenant.id;
  req.tenantConfig = {
    subdomain,
    name: tenant.name,
    primaryColor: tenant.primaryColor,
    secondaryColor: tenant.secondaryColor,
    phone: tenant.phone
  };

  res.setHeader('X-Tenant-ID', tenant.id);
  next();
};
