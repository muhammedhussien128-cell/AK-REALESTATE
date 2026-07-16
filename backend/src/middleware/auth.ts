import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'semsar_secret_token_change_in_prod';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    phone: string;
    role: 'broker' | 'client';
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'الوصول غير مصرح به. يرجى تسجيل الدخول.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'الجلسة منتهية الصلاحية أو الرمز غير صالح.' });
    }
    req.user = decoded as AuthenticatedRequest['user'];
    next();
  });
};

export const requireRole = (roles: Array<'broker' | 'client'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'ليس لديك الصلاحيات الكافية للقيام بهذا الإجراء.' });
    }
    next();
  };
};
