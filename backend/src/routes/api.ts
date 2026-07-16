import { Router } from 'express';
import { register, login, tempUserStore } from '../controllers/authController';
import {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing
} from '../controllers/listingController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { TenantRequest, MOCK_TENANTS } from '../middleware/tenant';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'semsar_secret_token_change_in_prod';
const leadsFilePath = path.join(__dirname, '../../leads.json');
const listingsFilePath = path.join(__dirname, '../../listings.json');
const clientsFilePath = path.join(__dirname, '../../clients.json');
const projectsFilePath = path.join(__dirname, '../../projects.json');

let memoryLeads: any[] = [];
let memoryListings: any[] = [];
let memoryClients: any[] = [];
let memoryProjects: any[] = [];
let memoryInitialized = false;

const BUCKET_ID = "ak_realestate_db_2026_v2";
const KV_URL = `https://kvdb.io/${BUCKET_ID}`;

// Initialize memory once from disk fallback, then KV
const initMemory = async () => {
  if (memoryInitialized) return;
  try {
    if (fs.existsSync(leadsFilePath)) {
      memoryLeads = JSON.parse(fs.readFileSync(leadsFilePath, 'utf-8'));
    }
  } catch (e) {}
  try {
    if (fs.existsSync(listingsFilePath)) {
      memoryListings = JSON.parse(fs.readFileSync(listingsFilePath, 'utf-8'));
    }
  } catch (e) {}
  try {
    if (fs.existsSync(clientsFilePath)) {
      memoryClients = JSON.parse(fs.readFileSync(clientsFilePath, 'utf-8'));
    }
  } catch (e) {}
  try {
    if (fs.existsSync(projectsFilePath)) {
      memoryProjects = JSON.parse(fs.readFileSync(projectsFilePath, 'utf-8'));
    }
  } catch (e) {}

  try {
    const leadsRes = await fetch(`${KV_URL}/leads`);
    if (leadsRes.ok) {
      const kvLeads = await leadsRes.json();
      if (Array.isArray(kvLeads) && kvLeads.length > 0) memoryLeads = kvLeads;
    }
  } catch (e) {}
  try {
    const clientsRes = await fetch(`${KV_URL}/clients`);
    if (clientsRes.ok) {
      const kvClients = await clientsRes.json();
      if (Array.isArray(kvClients) && kvClients.length > 0) memoryClients = kvClients;
    }
  } catch (e) {}
  try {
    const listingsRes = await fetch(`${KV_URL}/listings`);
    if (listingsRes.ok) {
      const kvListings = await listingsRes.json();
      if (Array.isArray(kvListings) && kvListings.length > 0) memoryListings = kvListings;
    }
  } catch (e) {}
  try {
    const projectsRes = await fetch(`${KV_URL}/projects`);
    if (projectsRes.ok) {
      const kvProjects = await projectsRes.json();
      if (Array.isArray(kvProjects) && kvProjects.length > 0) memoryProjects = kvProjects;
    }
  } catch (e) {}

  memoryInitialized = true;
};

// Helper to load leads
const loadLeads = async (): Promise<any[]> => {
  await initMemory();
  try {
    const res = await fetch(`${KV_URL}/leads`);
    if (res.ok) {
      const kvLeads = await res.json();
      if (Array.isArray(kvLeads)) memoryLeads = kvLeads;
    }
  } catch (e) {}
  return memoryLeads;
};

// Helper to save leads list
const saveLeadsList = async (leads: any[]) => {
  await initMemory();
  memoryLeads = leads;
  try {
    await fetch(`${KV_URL}/leads`, {
      method: 'POST',
      body: JSON.stringify(leads),
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {}
  try {
    fs.writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2), 'utf-8');
  } catch (e) {}
};

// Helper to save single lead
const saveLead = async (newLead: any) => {
  const leads = await loadLeads();
  leads.unshift(newLead);
  await saveLeadsList(leads);
};

// Helper to load listings
const loadListings = async (): Promise<any[]> => {
  await initMemory();
  try {
    const res = await fetch(`${KV_URL}/listings`);
    if (res.ok) {
      const kvListings = await res.json();
      if (Array.isArray(kvListings)) memoryListings = kvListings;
    }
  } catch (e) {}
  return memoryListings;
};

// Helper to save listings list
const saveListingsList = async (listings: any[]) => {
  await initMemory();
  memoryListings = listings;
  try {
    await fetch(`${KV_URL}/listings`, {
      method: 'POST',
      body: JSON.stringify(listings),
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {}
  try {
    fs.writeFileSync(listingsFilePath, JSON.stringify(listings, null, 2), 'utf-8');
  } catch (e) {}
};

// Helper to load clients
const loadClients = async (): Promise<any[]> => {
  await initMemory();
  try {
    const res = await fetch(`${KV_URL}/clients`);
    if (res.ok) {
      const kvClients = await res.json();
      if (Array.isArray(kvClients)) memoryClients = kvClients;
    }
  } catch (e) {}
  return memoryClients;
};

// Helper to save clients list
const saveClientsList = async (clients: any[]) => {
  await initMemory();
  memoryClients = clients;
  try {
    await fetch(`${KV_URL}/clients`, {
      method: 'POST',
      body: JSON.stringify(clients),
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {}
  try {
    fs.writeFileSync(clientsFilePath, JSON.stringify(clients, null, 2), 'utf-8');
  } catch (e) {}
};

// Helper to save single client
const saveClient = async (newClient: any) => {
  const clients = await loadClients();
  clients.unshift(newClient);
  await saveClientsList(clients);
};

// Helper to load projects
const loadProjects = async (): Promise<any[]> => {
  await initMemory();
  try {
    const res = await fetch(`${KV_URL}/projects`);
    if (res.ok) {
      const kvProjects = await res.json();
      if (Array.isArray(kvProjects)) memoryProjects = kvProjects;
    }
  } catch (e) {}
  return memoryProjects;
};

// Helper to save projects list
const saveProjectsList = async (projects: any[]) => {
  await initMemory();
  memoryProjects = projects;
  try {
    await fetch(`${KV_URL}/projects`, {
      method: 'POST',
      body: JSON.stringify(projects),
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {}
  try {
    fs.writeFileSync(projectsFilePath, JSON.stringify(projects, null, 2), 'utf-8');
  } catch (e) {}
};

// Auth Routes
router.post('/auth/register', register);
router.post('/auth/login', login);

// Dual Welcome Gate Login/Register Endpoint
router.post('/auth/welcome-gate-auth', async (req: any, res) => {
  const { name, email, phone, lead_source } = req.body;
  const tenantId = req.headers['x-tenant-id'] || 'tenant-nawy-uuid-1111';

  if (!email || !phone || !name) {
    return res.status(400).json({ message: 'يرجى إدخال الاسم، البريد، ورقم الهاتف.' });
  }

  let user = tempUserStore.find(u => u.tenant_id === tenantId && u.email === email);

  if (user) {
    const isMatch = bcrypt.compareSync(phone, user.password_hash) || user.phone === phone;
    if (!isMatch) {
      return res.status(400).json({ message: 'البريد الإلكتروني مسجل بالفعل برقم هاتف آخر.' });
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
  } else {
    const password_hash = bcrypt.hashSync(phone, 10);
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: tenantId,
      email,
      phone,
      password_hash,
      name,
      role: 'client' as const
    };

    tempUserStore.push(newUser);

    await saveClient({
      id: newUser.id,
      tenant_id: tenantId,
      broker_id: 'b1111111-1111-1111-1111-111111111111', 
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      created_at: new Date().toISOString()
    });

    const newLead = {
      id: Math.random().toString(36).substr(2, 9),
      tenant_id: tenantId,
      broker_id: 'b1111111-1111-1111-1111-111111111111', 
      listing_title: 'دليل أسعار مشروعات 2026',
      client_name: newUser.name,
      phone: newUser.phone,
      notes: 'تم الحصول على البروشور المجاني من بوابة الترحيب الثنائية',
      lead_source: lead_source || 'Welcome Gate',
      status: 'New',
      qualification: 'Warm',
      archived: false,
      time_on_site: '0:05 دقيقة', 
      viewed_properties: [],
      viewed_history: [], 
      chat_history: [],
      login_time: new Date().toLocaleTimeString('ar-EG'),
      last_active: new Date().toLocaleTimeString('ar-EG'),
      created_at: new Date().toISOString()
    };
    await saveLead(newLead);

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
      message: 'تم إنشاء الحساب وحفظ الليد بنجاح.'
    });
  }
});

// Anonymous Visitor Registration Route
router.post('/auth/register-visitor', (req: any, res) => {
  const { lead_source } = req.body;
  const visitorId = Math.random().toString(36).substr(2, 9);
  const tenantId = req.headers['x-tenant-id'] || 'tenant-nawy-uuid-1111';
  
  const visitorUser = {
    id: 'u_vis_' + visitorId,
    tenant_id: tenantId,
    email: `visitor_${visitorId}@awtad.com`,
    password: 'anonymouspass',
    phone: '01000000000', 
    name: 'زائر مؤقت',
    role: 'client' as const
  };

  tempUserStore.push(visitorUser);

  const newLead = {
    id: 'l_vis_' + visitorId,
    tenant_id: tenantId,
    broker_id: 'b1111111-1111-1111-1111-111111111111', 
    listing_title: 'زيارة تصفح عامة للموقع',
    client_name: 'زائر مؤقت',
    phone: '01000000000',
    notes: 'تم الدخول كزائر مؤقت (أول مرة عبر بوابة الترحيب)',
    lead_source: lead_source || 'Visitor',
    status: 'New',
    qualification: 'Warm',
    archived: false,
    time_on_site: '0:02 دقيقة',
    viewed_properties: [],
    viewed_history: [],
    chat_history: [],
    login_time: new Date().toLocaleTimeString('ar-EG'),
    last_active: new Date().toLocaleTimeString('ar-EG'),
    created_at: new Date().toISOString()
  };
  saveLead(newLead);

  return res.status(201).json({
    message: 'تم تسجيل الزائر المؤقت بنجاح.',
    user: visitorUser,
    leadId: newLead.id
  });
});

// Visitor Activity Tracking Link
router.post('/crm/visitor-activity', async (req: any, res) => {
  const { leadEmail, leadPhone, listingTitle, timeOnSite, chatHistory } = req.body;
  const leads = await loadLeads();

  const targetLeads: any[] = [];
  if (leadPhone) {
    leads.forEach((l: any) => {
      if (l.phone === leadPhone) targetLeads.push(l);
    });
  }
  if (targetLeads.length === 0 && leadEmail) {
    const visitorId = leadEmail.split('@')[0];
    leads.forEach((l: any) => {
      if (l.id === 'l_vis_' + visitorId.replace('visitor_', '') || l.phone === visitorId) {
        targetLeads.push(l);
      }
    });
  }

  if (targetLeads.length > 0) {
    const listings = await loadListings();
    targetLeads.forEach(targetLead => {
      if (timeOnSite) {
        targetLead.time_on_site = timeOnSite;
        targetLead.last_active = new Date().toLocaleTimeString('ar-EG');
      }
      if (chatHistory) {
        targetLead.chat_history = chatHistory;
      }
      if (listingTitle) {
        if (!targetLead.viewed_properties) {
          targetLead.viewed_properties = [];
        }
        if (!targetLead.viewed_properties.includes(listingTitle)) {
          targetLead.viewed_properties.push(listingTitle);
        }

        if (!targetLead.viewed_history) {
          targetLead.viewed_history = [];
        }
        const targetListing = listings.find(l => l.title === listingTitle);
        const priceVal = targetListing ? targetListing.price : 4500000; 

        const alreadyLogged = targetLead.viewed_history.some((h: any) => h.title === listingTitle);
        if (!alreadyLogged) {
          targetLead.viewed_history.push({
            title: listingTitle,
            price: priceVal,
            timestamp: new Date().toLocaleTimeString('ar-EG')
          });
        }
      }
    });
    await saveLeadsList(leads);
    return res.json({ success: true, count: targetLeads.length });
  }

  return res.status(404).json({ message: 'الليد المؤقت غير موجود.' });
});

// Admin Action: Register new Broker account under settings
router.post('/auth/register-broker', authenticateToken, requireRole(['broker']), (req: any, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'يرجى ملء كافة تفاصيل حساب الوسيط الجديد.' });
  }

  const exists = tempUserStore.some(u => u.email === email);
  if (exists) {
    return res.status(400).json({ message: 'البريد الإلكتروني مسجل بالفعل.' });
  }

  const newBroker = {
    id: 'b' + Math.random().toString(36).substr(2, 9),
    tenant_id: req.tenantId,
    email,
    password, 
    phone,
    name,
    role: 'broker' as const
  };

  tempUserStore.push(newBroker);

  return res.status(201).json({
    message: 'تم تسجيل حساب الوسيط الجديد بنجاح.',
    broker: {
      id: newBroker.id,
      email: newBroker.email,
      name: newBroker.name,
      phone: newBroker.phone
    }
  });
});

// Update Profile settings endpoint & sync MOCK_TENANTS phone
router.put('/auth/profile', authenticateToken, async (req: any, res) => {
  const { name, email, phone } = req.body;
  const user = tempUserStore.find(u => u.id === req.user.id);
  
  if (user) {
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    const tenantSubdomain = req.headers['x-tenant-subdomain'] as string || 'awtad';
    const activeTenant = MOCK_TENANTS[tenantSubdomain.toLowerCase()];
    if (activeTenant) {
      if (user.phone) activeTenant.phone = user.phone;
    }

    if (user.id.startsWith('u_vis_')) {
      const visitorId = user.id.replace('u_vis_', '');
      const leads = await loadLeads();
      const targetLead = leads.find(l => l.id === 'l_vis_' + visitorId);
      if (targetLead) {
        targetLead.client_name = user.name;
        targetLead.phone = user.phone;
        targetLead.notes = `${targetLead.notes || ''} | تم تحديث البيانات الحقيقية من Google One-Tap (${user.email})`;
        await saveLeadsList(leads);
      }
    }
    
    return res.json({
      message: 'تم تحديث البيانات الشخصية بنجاح.',
      user: {
        id: user.id,
        tenant_id: user.tenant_id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role
      }
    });
  }
  return res.status(404).json({ message: 'المستخدم غير موجود.' });
});

// Listings Routes
router.get('/listings', getAllListings);
router.get('/listings/:id', getListingById);

// Broker only actions
router.post('/listings', authenticateToken, requireRole(['broker']), createListing);
router.put('/listings/:id', authenticateToken, requireRole(['broker']), updateListing);
router.delete('/listings/:id', authenticateToken, requireRole(['broker']), deleteListing);

// CRM Route for Broker - Clients List
router.get('/crm/clients', authenticateToken, requireRole(['broker']), (req: any, res) => {
  try {
    const clientsFilePath = path.join(__dirname, '../../clients.json');
    if (fs.existsSync(clientsFilePath)) {
      const data = JSON.parse(fs.readFileSync(clientsFilePath, 'utf-8'));
      const filtered = data.filter((c: any) => c.tenant_id === req.tenantId && c.broker_id === req.user.id);
      return res.json(filtered);
    }
    return res.json([]);
  } catch (err) {
    return res.status(500).json({ message: 'حدث خطأ أثناء تحميل بيانات العملاء.' });
  }
});

// CRM Route for Broker - Bookings Leads List
router.get('/crm/leads', authenticateToken, requireRole(['broker']), async (req: any, res) => {
  const leads = (await loadLeads()).filter((l: any) => l.tenant_id === req.tenantId && l.broker_id === req.user.id);
  return res.json(leads);
});

// Update Lead Status (Handles qualification and archiving too)
router.put('/crm/leads/:id', authenticateToken, requireRole(['broker']), async (req: any, res) => {
  const { id } = req.params;
  const { status, qualification, archived } = req.body;
  const leads = await loadLeads();
  const index = leads.findIndex((l: any) => l.tenant_id === req.tenantId && l.id === id && l.broker_id === req.user.id);
  if (index !== -1) {
    if (status !== undefined) leads[index].status = status;
    if (qualification !== undefined) leads[index].qualification = qualification;
    if (archived !== undefined) leads[index].archived = archived;
    
    await saveLeadsList(leads);

    // Auto trigger actions when lead is marked as Sold
    if (status === 'Sold') {
      const clients = await loadClients();
      const exists = clients.some(c => c.tenant_id === req.tenantId && c.phone === leads[index].phone && c.broker_id === req.user.id);
      if (!exists) {
        clients.unshift({
          id: 'c_' + Math.random().toString(36).substr(2, 9),
          tenant_id: req.tenantId,
          broker_id: req.user.id,
          name: leads[index].client_name,
          email: leads[index].client_name.includes('زائر') ? 'visitor@awtad.com' : 'client@awtad.com',
          phone: leads[index].phone,
          created_at: new Date().toISOString()
        });
        await saveClientsList(clients);
      }

      const listings = await loadListings();
      const listingIndex = listings.findIndex(l => l.tenant_id === req.tenantId && l.title === leads[index].listing_title);
      if (listingIndex !== -1) {
        const currentCount = Number(listings[listingIndex].unit_count || 1);
        if (currentCount > 1) {
          listings[listingIndex].unit_count = currentCount - 1;
        } else {
          listings[listingIndex].unit_count = 0;
          listings[listingIndex].status = 'sold';
        }
        await saveListingsList(listings);
      }
    }

    return res.json(leads[index]);
  }
  return res.status(404).json({ message: 'الطلب غير موجود.' });
});

// Delete Lead CRM route
router.delete('/crm/leads/:id', authenticateToken, requireRole(['broker']), async (req: any, res) => {
  const { id } = req.params;
  const leads = await loadLeads();
  const index = leads.findIndex((l: any) => l.tenant_id === req.tenantId && l.id === id && (!l.broker_id || l.broker_id === req.user.id));
  
  if (index !== -1) {
    leads.splice(index, 1);
    await saveLeadsList(leads);
    return res.json({ success: true });
  }
  return res.status(404).json({ message: 'الطلب غير موجود.' });
});

// Client action: Submit booking visit
router.post('/crm/leads', authenticateToken, async (req: any, res) => {
  const { listing_title, preferred_date, preferred_time, notes, client_name, phone, lead_source } = req.body;

  if (!listing_title || !client_name || !phone) {
    return res.status(400).json({ message: 'يرجى ملء الاسم ورقم الهاتف لتقديم طلب المعاينة.' });
  }

  const listings = await loadListings();
  const targetListing = listings.find(l => l.title === listing_title);
  const assignedBrokerId = targetListing ? targetListing.broker_id : 'b1111111-1111-1111-1111-111111111111';

  const newLead = {
    id: Math.random().toString(36).substr(2, 9),
    tenant_id: req.tenantId, 
    broker_id: assignedBrokerId, 
    listing_title,
    client_name,
    phone,
    preferred_date: preferred_date || new Date().toISOString().split('T')[0],
    preferred_time: preferred_time || '12:00',
    notes: notes || '',
    lead_source: lead_source || 'Direct Web', 
    status: 'New',
    qualification: 'Warm',
    archived: false,
    time_on_site: '0:05 دقيقة',
    viewed_properties: [],
    viewed_history: [],
    chat_history: [],
    login_time: new Date().toLocaleTimeString('ar-EG'),
    last_active: new Date().toLocaleTimeString('ar-EG'),
    created_at: new Date().toISOString()
  };

  await saveLead(newLead);
  return res.status(201).json(newLead);
});

// AI Sales Consultant Chat Endpoint (Gemini + Local Intelligent Fallback)
router.post('/chat', async (req: any, res) => {
  const { messages, userEmail, userPhone } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ message: 'رسائل المحادثة غير صالحة.' });
  }

  // Load latest listings database as context
  const listings = (await loadListings()).filter(l => l.status === 'available');
  const listingsContext = listings.map(l => ({
    title: l.title,
    description: l.description,
    price: `${l.price} جنيه`,
    location: l.location,
    rooms: `${l.bedrooms} غرف`,
    baths: `${l.bathrooms} حمامات`,
    area: `${l.area} م²`,
    finishing: l.finishing
  }));

  const systemInstructions = `
You are the best AI Senior Real Estate Sales Consultant in Egypt representing "AK". 
This is NOT a support bot or generic FAQ bot. You are an expert investment advisor.

Goal: Guide user, build trust, handle objections, qualify leads, and close deals.
Tone: Confident, professional, friendly, persuasive, natural, and honest. Never pushy or robotic.
Language: Fluent Egyptian Arabic (العامية المصرية الراقية واللبقة). Avoid literal translations.

IMPORTANT RULES:
1. Short & Direct: Keep answers under 120 words unless they ask for absolute details. Never dump raw info.
2. Max recommendations: Recommend at most 3 projects at a time.
3. Scoring & Logic: When recommending, match their budget (35%), location (20%), developer/potential (15%), finishing/delivery (15%). Explain WHY clearly using bullet points.
4. Memory: Track user choices (budget, location, type). If they mentioned "ready to move" or "5M budget" earlier, remember it.
5. Objection Handling: If they say "too expensive", explain resale value, strong developer track records, or lower downpayments.
6. Comparison Mode: If they compare, make a clear Markdown table containing (Price, Installments, Delivery, Pros, Cons) and end with ONE recommendation.
7. Next-step Hook: Always end with a subtle, non-pushy action item (e.g. calculation, floor plan view, scheduling a call).
8. Only use this database of available properties:
${JSON.stringify(listingsContext, null, 2)}
Never invent properties, prices, or details.
  `;

  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey) {
    try {
      const formattedContents = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      // Add system instruction as the very first message context
      formattedContents.unshift({
        role: 'user',
        parts: [{ text: `SYSTEM_INSTRUCTIONS:\n${systemInstructions}` }]
      });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: formattedContents })
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          return res.json({ text: responseText });
        }
      }
    } catch (err) {}
  }

  // DYNAMIC RULE-BASED FALLBACK AGENT (100% guarantee of perfect execution)
  const lastUserMsg = messages[messages.length - 1]?.text || '';
  const lowerMsg = lastUserMsg.toLowerCase();
  
  let reply = '';
  
  // Extract budget
  let budget = 0;
  const numMatches = lastUserMsg.match(/\d+/g);
  if (numMatches) {
    const num = parseInt(numMatches[0], 10);
    if (num > 1000) budget = num;
    else budget = num * 1000000; // Assume millions
  }

  if (lowerMsg.includes('مساء') || lowerMsg.includes('صباح') || lowerMsg.includes('السلام') || lowerMsg.includes('أهلاً') || lowerMsg.includes('hi') || lowerMsg.includes('hello')) {
    reply = `أهلاً بحضرتك يا فندم في "AK". تشرفنا بزيارتك. 
أنا مستشارك العقاري المخصص لمساعدتك في إيجاد العقار الأنسب لك. 

عشان أقدر أساعدك بشكل دقيق، إيه أكتر حاجة تهمك؟
💰 الميزانية (Budget)
📍 المنطقة المفضلة (Location)
🏡 نوع العقار (Property Type)`;
  } else if (lowerMsg.includes('قارن') || lowerMsg.includes('مقارنة') || lowerMsg.includes('compare')) {
    reply = `تمام يا فندم، عملتلك مقارنة سريعة بين العقارات المتاحة عندنا عشان تقدر تختار بسهولة:

| العقار | السعر | الغرف | التشطيب | الميزة الرئيسية |
| :--- | :--- | :--- | :--- | :--- |
| شقة التجمع | 4.5M | 3 | كامل | قريبة من الجامعة الأمريكية |
| فيلا زايد | 12.8M | 5 | كامل | مسبح خاص وحديقة |
| شاليه الساحل | 6.5M | 2 | مفروش | صف أول على البحر مباشرة |

بنصحك بـ **شقة التجمع** لو بتدور على استثمار سريع وعائد إيجاري ممتاز، أو **فيلا زايد** لو بتفضل الخصوصية والهدوء السكني. 

حابب أحسبلك القسط الشهري لأي وحدة فيهم؟`;
  } else if (lowerMsg.includes('غالي') || lowerMsg.includes('expensive') || lowerMsg.includes('السعر مرتفع')) {
    reply = `تفهمت وجهة نظرك تماماً يا فندم. 

لكن لو نظرنا للقيمة الاستثمارية، المشروع ده بيتميز بموقع استراتيجي فريد ومطور عقاري ذو سمعة قوية، وده بيضمنلك سرعة إعادة البيع وعائد إيجاري (ROI) أعلى بنسبة 15% مقارنة بالمناطق المجاورة. بالإضافة لوجود تسهيلات في السداد بتبدأ بمقدم 10% فقط وتقسيط مريح.

تحب أطلعك على خيارات تانية بمقدمات أقل أو فترات سداد أطول؟`;
  } else if (lowerMsg.includes('تجمع') || lowerMsg.includes('tagamoa') || (budget > 0 && budget <= 5000000)) {
    reply = `بناءً على طلبك يا فندم، بروجحلك **شقة فاخرة بالتجمع الخامس** لأنها تطابق ميزانيتك وطلبك تماماً:

✅ السعر: 4.5 مليون جنيه بتشطيب الترا مودرن كامل.
✅ الموقع: التجمع الخامس بجوار الجامعة الأمريكية وكمبوند سوديك.
✅ العائد الاستثماري: ممتاز ومناسب جداً لإعادة البيع أو الإيجار.

تحب أرسلك البروشور التفصيلي وتصميم الوحدة (Floor Plans) على الواتساب؟`;
  } else if (lowerMsg.includes('زايد') || lowerMsg.includes('zayed') || budget > 10000000) {
    reply = `بناءً على ميزانيتك وتفضيلك، بنصحك بـ **فيلا مودرن بالشيخ زايد مع مسبح**:

✅ السعر: 12.8 مليون جنيه بكامل التشطيب.
✅ المساحة: 350 م² مع مسبح خاص وحديقة واسعة.
✅ المطور: من أفضل مشروعات الشيخ زايد مع تسهيلات دفع ممتازة.

هل تحب نحدد موعد لمعاينة الفيلا على الطبيعة مع أحد مستشارينا؟`;
  } else if (lowerMsg.includes('ساحل') || lowerMsg.includes('coast') || lowerMsg.includes('شاليه') || (budget > 5000000 && budget <= 10000000)) {
    reply = `خيار رائع! بنصحك بـ **شاليه صف أول على البحر بمراسي الساحل الشمالي**:

✅ السعر: 6.5 مليون جنيه مفروش بالكامل.
✅ الإطلالة: صف أول مباشرة على البحر بإطلالة بانورامية.
✅ العائد الاستثماري: الأعلى طلباً للإيجار السياحي في الصيف.

تحب نحسبلك خطة السداد التفصيلية والأقساط المتوفرة؟`;
  } else {
    reply = `تحت أمرك يا فندم في "AK". عندنا عروض ممتازة تناسب كل الاحتياجات (شقق بالتجمع، فيلات بالشيخ زايد، وشاليهات بالساحل).

عشان نوصل لأفضل اختيار، إيه الميزانية التقريبية اللي بتفكر فيها؟ أو هل تفضل منطقة معينة؟`;
  }

  // Post lead chat transcript update in background if email or phone is supplied
  if (userPhone || userEmail) {
    const leads = await loadLeads();
    const targetLeads: any[] = [];
    if (userPhone) {
      leads.forEach((l: any) => {
        if (l.phone === userPhone) targetLeads.push(l);
      });
    }
    if (targetLeads.length === 0 && userEmail) {
      const visitorId = userEmail.split('@')[0];
      leads.forEach((l: any) => {
        if (l.id === 'l_vis_' + visitorId.replace('visitor_', '') || l.phone === visitorId) {
          targetLeads.push(l);
        }
      });
    }

    if (targetLeads.length > 0) {
      targetLeads.forEach(targetLead => {
        if (!targetLead.chat_history) targetLead.chat_history = [];
        targetLead.chat_history.push(`العميل: ${lastUserMsg}`);
        targetLead.chat_history.push(`المساعد: ${reply}`);
      });
      await saveLeadsList(leads);
    }
  }

  return res.json({ text: reply });
});

// Projects Reference API endpoints (for Brokers to read, write, update, delete projects)
router.get('/crm/projects', authenticateToken, requireRole(['broker']), async (req: any, res) => {
  const projects = await loadProjects();
  const filtered = projects.filter((p: any) => p.tenant_id === req.tenantId && p.broker_id === req.user.id);
  return res.json(filtered);
});

router.post('/crm/projects', authenticateToken, requireRole(['broker']), async (req: any, res) => {
  const { title, developer, location, startPrice, installmentYears, deliveryDate, brochureUrl, notes } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'يرجى إدخال اسم المشروع.' });
  }

  const projects = await loadProjects();
  const newProject = {
    id: 'proj_' + Math.random().toString(36).substr(2, 9),
    tenant_id: req.tenantId,
    broker_id: req.user.id,
    title,
    developer: developer || '',
    location: location || '',
    startPrice: startPrice || '',
    installmentYears: installmentYears || '',
    deliveryDate: deliveryDate || '',
    brochureUrl: brochureUrl || '',
    notes: notes || '',
    created_at: new Date().toISOString()
  };

  projects.unshift(newProject);
  await saveProjectsList(projects);
  return res.status(201).json(newProject);
});

router.put('/crm/projects/:id', authenticateToken, requireRole(['broker']), async (req: any, res) => {
  const { id } = req.params;
  const { title, developer, location, startPrice, installmentYears, deliveryDate, brochureUrl, notes } = req.body;

  const projects = await loadProjects();
  const index = projects.findIndex((p: any) => p.tenant_id === req.tenantId && p.id === id && p.broker_id === req.user.id);

  if (index !== -1) {
    if (title !== undefined) projects[index].title = title;
    if (developer !== undefined) projects[index].developer = developer;
    if (location !== undefined) projects[index].location = location;
    if (startPrice !== undefined) projects[index].startPrice = startPrice;
    if (installmentYears !== undefined) projects[index].installmentYears = installmentYears;
    if (deliveryDate !== undefined) projects[index].deliveryDate = deliveryDate;
    if (brochureUrl !== undefined) projects[index].brochureUrl = brochureUrl;
    if (notes !== undefined) projects[index].notes = notes;

    await saveProjectsList(projects);
    return res.json(projects[index]);
  }
  return res.status(404).json({ message: 'المشروع غير موجود.' });
});

router.delete('/crm/projects/:id', authenticateToken, requireRole(['broker']), async (req: any, res) => {
  const { id } = req.params;
  const projects = await loadProjects();
  const index = projects.findIndex((p: any) => p.tenant_id === req.tenantId && p.id === id && p.broker_id === req.user.id);

  if (index !== -1) {
    projects.splice(index, 1);
    await saveProjectsList(projects);
    return res.json({ success: true });
  }
  return res.status(404).json({ message: 'المشروع غير موجود.' });
});

export default router;
