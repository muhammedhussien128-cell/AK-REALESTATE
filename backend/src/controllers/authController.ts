import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { TenantRequest } from '../middleware/tenant';

const JWT_SECRET = process.env.JWT_SECRET || 'semsar_secret_token_change_in_prod';
const clientsFilePath = path.join(__dirname, '../../clients.json');

// Helper to load clients from file
const loadClients = (): any[] => {
  try {
    if (fs.existsSync(clientsFilePath)) {
      return JSON.parse(fs.readFileSync(clientsFilePath, 'utf-8'));
    }
  } catch (error) {
    console.error('Error reading clients file', error);
  }
  return [];
};

// Helper to save client to file (scoped to tenant)
const saveClient = (newClient: any) => {
  try {
    const clients = loadClients();
    clients.unshift(newClient);
    fs.writeFileSync(clientsFilePath, JSON.stringify(clients, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving client', error);
  }
};

// Simple store for demo/development (each user record has tenant_id)
export const tempUserStore: any[] = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    tenant_id: 'tenant-nawy-uuid-1111',
    email: 'broker@semsar.com',
    phone: '01027484938',
    password_hash: bcrypt.hashSync('broker123', 10),
    name: 'Ahmed Khaled',
    role: 'broker'
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    tenant_id: 'tenant-aqar-uuid-2222',
    email: 'broker@aqar.com',
    phone: '+201000000003',
    password_hash: bcrypt.hashSync('broker123', 10),
    name: 'أحمد عقار (Aqar)',
    role: 'broker'
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    tenant_id: 'tenant-nawy-uuid-1111',
    email: 'client@semsar.com',
    phone: '+201000000002',
    password_hash: bcrypt.hashSync('client123', 10),
    name: 'خالد المشتري',
    role: 'client'
  }
];

export const register = async (req: TenantRequest, res: Response) => {
  try {
    const { email, phone, password, name, role } = req.body;

    if (!email || !phone || !password || !name || !role) {
      return res.status(400).json({ message: 'يرجى إكمال جميع الحقول المطلوبة.' });
    }

    if (role !== 'broker' && role !== 'client') {
      return res.status(400).json({ message: 'دور المستخدم غير صحيح.' });
    }

    // Basic Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'البريد الإلكتروني المدخل غير صالح.' });
    }

    // Check duplicate (scoped to tenant)
    const userExists = tempUserStore.find(u => u.tenant_id === req.tenantId && (u.email === email || u.phone === phone));
    if (userExists) {
      return res.status(400).json({ message: 'البريد الإلكتروني أو رقم الهاتف مسجل بالفعل لدى هذه الشركة.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: req.tenantId,
      email,
      phone,
      password_hash,
      name,
      role
    };

    tempUserStore.push(newUser);

    if (role === 'client') {
      saveClient({
        id: newUser.id,
        tenant_id: req.tenantId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        created_at: new Date().toISOString()
      });
    }

    const token = jwt.sign(
      { id: newUser.id, tenant_id: newUser.tenant_id, email: newUser.email, phone: newUser.phone, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        tenant_id: newUser.tenant_id,
        email: newUser.email,
        phone: newUser.phone,
        name: newUser.name,
        role: newUser.role
      },
      message: 'تم إنشاء الحساب بنجاح.'
    });
  } catch (error) {
    return res.status(500).json({ message: 'حدث خطأ في الخادم أثناء التسجيل.' });
  }
};

export const login = async (req: TenantRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.' });
    }

    // Scoped query to dynamic tenantId
    const user = tempUserStore.find(u => u.tenant_id === req.tenantId && u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
    }

    const token = jwt.sign(
      { id: user.id, tenant_id: user.tenant_id, email: user.email, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        tenant_id: user.tenant_id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role
      },
      message: 'تم تسجيل الدخول بنجاح.'
    });
  } catch (error) {
    return res.status(500).json({ message: 'حدث خطأ في الخادم أثناء تسجيل الدخول.' });
  }
};
