import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTenant } from '../context/TenantContext';
import { Plus, Trash2, Edit, CheckCircle, Home, Image, Tag, ArrowRight, Bed, Bath, Maximize2, Sparkles, Users, User, Phone, Mail, Calendar, BarChart2, TrendingUp, Compass, Award, Link, Settings, ShieldAlert, Key, Copy, Check, Clock, Globe, ArrowUpRight, X, Search, Archive, MessageSquare, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Listing } from './ClientMarketplace';
import { GOVERNORATES, EGYPT_LOCATIONS } from '../utils/locations';

interface CRMClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

interface ViewedItem {
  title: string;
  price: number;
  timestamp: string;
}

interface Lead {
  id: string;
  listing_title: string;
  client_name: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  notes: string;
  status: 'New' | 'Contacted' | 'Viewing' | 'Negotiation' | 'Sold' | 'Lost';
  lead_source?: string;
  time_on_site?: string;
  viewed_properties?: string[];
  viewed_history?: ViewedItem[];
  chat_history?: string[];
  qualification?: 'Hot' | 'Warm' | 'Cold';
  archived?: boolean;
  login_time?: string;
  last_active?: string;
  created_at: string;
}

export const BrokerDashboard: React.FC = () => {
  const { user, token, updateProfile } = useAuth();
  const { t, language } = useLanguage();
  const { tenant, updateTenantPhone } = useTenant();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [crmClients, setCrmClients] = useState<CRMClient[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  
  const [dashboardSubTab, setDashboardSubTab] = useState<'analytics' | 'listings' | 'crm' | 'settings' | 'projects'>('analytics');
  
  // Projects Reference Module States
  interface DeveloperDetails {
    id: string;
    name: string;
    startPrice: string;
    installmentYears: string;
    deliveryDate: string;
    brochureUrl: string;
    notes: string;
  }
  interface Project {
    id: string;
    tenant_id: string;
    broker_id: string;
    title: string;
    location: string;
    developers: DeveloperDetails[];
    created_at: string;
  }
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectEditor, setShowProjectEditor] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projSearchQuery, setProjSearchQuery] = useState('');

  const [projTitle, setProjTitle] = useState('');
  const [projLocation, setProjLocation] = useState('');
  const [projDevelopers, setProjDevelopers] = useState<DeveloperDetails[]>([]);

  // State to hold inputs for a single developer being added/edited
  const [tempDevId, setTempDevId] = useState<string | null>(null);
  const [tempDevName, setTempDevName] = useState('');
  const [tempDevStartPrice, setTempDevStartPrice] = useState('');
  const [tempDevInstallment, setTempDevInstallment] = useState('');
  const [tempDevDelivery, setTempDevDelivery] = useState('');
  const [tempDevBrochure, setTempDevBrochure] = useState('');
  const [tempDevNotes, setTempDevNotes] = useState('');
  const [showDevForm, setShowDevForm] = useState(false);
  // Developer Registry States
  interface DevProfile {
    id: string;
    tenant_id: string;
    broker_id: string;
    name: string;
    about: string;
    foundedYear: string;
    notes: string;
    projectsList?: string;
    created_at: string;
  }
  const [devProfiles, setDevProfiles] = useState<DevProfile[]>([]);
  const [showDevProfileEditor, setShowDevProfileEditor] = useState(false);
  const [editingDevProfile, setEditingDevProfile] = useState<DevProfile | null>(null);
  const [devProfSearchQuery, setDevProfSearchQuery] = useState('');

  // Selected developer info modal
  const [activeDevInfo, setActiveDevInfo] = useState<DevProfile | null>(null);
  const [showDevInfoModal, setShowDevInfoModal] = useState(false);

  // Dev Profile fields
  const [devNameField, setDevNameField] = useState('');
  const [devAboutField, setDevAboutField] = useState('');
  const [devFoundedField, setDevFoundedField] = useState('');
  const [devNotesField, setDevNotesField] = useState('');
  const [devProjectsListField, setDevProjectsListField] = useState('');

  // Tab mode for Projects Reference (either 'projects' or 'developers')
  const [projectsTabMode, setProjectsTabMode] = useState<'projects' | 'developers'>('projects');
  const [showEditor, setShowEditor] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  // Selected Lead details modal state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showChatTranscript, setShowChatTranscript] = useState<boolean>(false);

  // Lead search and filters state
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  const [qualFilter, setQualFilter] = useState<'All' | 'Hot' | 'Warm' | 'Cold'>('All');
  const [viewArchive, setViewArchive] = useState<boolean>(false);

  // Broker settings fields
  const [brokerName, setBrokerName] = useState(user?.name || '');
  const [brokerPhone, setBrokerPhone] = useState(user?.phone || '');
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // UTM Link Generator states
  const [selectedRefPlatform, setSelectedRefPlatform] = useState<string>('facebook');
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Admin: Create new broker fields
  const [newBrokerName, setNewBrokerName] = useState('');
  const [newBrokerPhone, setNewBrokerPhone] = useState('');
  const [newBrokerEmail, setNewBrokerEmail] = useState('');
  const [newBrokerPass, setNewBrokerPass] = useState('');
  const [newBrokerAgency, setNewBrokerAgency] = useState(tenant.name);
  const [adminSuccess, setAdminSuccess] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Form Fields for Listing
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unitCount, setUnitCount] = useState('1');
  const [imgUrl, setImgUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Detailed Unit Specs Fields
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [area, setArea] = useState('120');
  const [finishing, setFinishing] = useState('كامل التشطيب');

  // Cascading Location Selector States
  const [selectedGov, setSelectedGov] = useState('القاهرة');
  const [selectedArea, setSelectedArea] = useState('');
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);

  // Update available areas when governorate changes
  useEffect(() => {
    const areas = EGYPT_LOCATIONS[selectedGov] || [];
    setAvailableAreas(areas);
    if (areas.length > 0 && !areas.includes(selectedArea)) {
      setSelectedArea(areas[0]);
    }
  }, [selectedGov]);

  const fetchBrokerListings = async () => {
    try {
      const response = await fetch('/api/listings', {
        headers: {
          'X-Tenant-Subdomain': tenant.subdomain
        }
      });
      if (response.ok) {
        const data: Listing[] = await response.json();
        setListings(data.filter(l => l.broker_id === user?.id));
      }
    } catch (e) {}
  };

  const fetchCRMLeads = async () => {
    try {
      const response = await fetch('/api/crm/leads', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': tenant.subdomain
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (e) {}
  };

  const fetchCRMUsers = async () => {
    try {
      const response = await fetch('/api/crm/clients', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': tenant.subdomain
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCrmClients(data);
      }
    } catch (e) {}
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/crm/projects', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': tenant.subdomain
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (err) {}
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle) return;

    const payload = {
      title: projTitle,
      location: projLocation,
      developers: projDevelopers
    };

    try {
      const url = editingProject ? `/api/crm/projects/${editingProject.id}` : '/api/crm/projects';
      const method = editingProject ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': tenant.subdomain
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchProjects();
        setShowProjectEditor(false);
        setEditingProject(null);
        setProjTitle('');
        setProjLocation('');
        setProjDevelopers([]);
      }
    } catch (err) {}
  };

  const handleEditProject = (proj: Project) => {
    setEditingProject(proj);
    setProjTitle(proj.title);
    setProjLocation(proj.location);
    setProjDevelopers(proj.developers || []);
    setShowProjectEditor(true);
  };

  const handleAddTempDeveloper = () => {
    if (!tempDevName) return;

    const newDev: DeveloperDetails = {
      id: tempDevId || 'dev_' + Math.random().toString(36).substr(2, 9),
      name: tempDevName,
      startPrice: tempDevStartPrice,
      installmentYears: tempDevInstallment,
      deliveryDate: tempDevDelivery,
      brochureUrl: tempDevBrochure,
      notes: tempDevNotes
    };

    if (tempDevId) {
      setProjDevelopers(projDevelopers.map(d => d.id === tempDevId ? newDev : d));
    } else {
      setProjDevelopers([...projDevelopers, newDev]);
    }

    setTempDevId(null);
    setTempDevName('');
    setTempDevStartPrice('');
    setTempDevInstallment('');
    setTempDevDelivery('');
    setTempDevBrochure('');
    setTempDevNotes('');
    setShowDevForm(false);
  };

  const handleEditTempDeveloper = (dev: DeveloperDetails) => {
    setTempDevId(dev.id);
    setTempDevName(dev.name);
    setTempDevStartPrice(dev.startPrice);
    setTempDevInstallment(dev.installmentYears);
    setTempDevDelivery(dev.deliveryDate);
    setTempDevBrochure(dev.brochureUrl);
    setTempDevNotes(dev.notes);
    setShowDevForm(true);
  };

  const handleRemoveTempDeveloper = (devId: string) => {
    setProjDevelopers(projDevelopers.filter(d => d.id !== devId));
  };

  const handleDeleteProject = async (projId: string) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من رغبتك في حذف هذا المشروع تماماً؟' : 'Are you sure you want to delete this project?')) return;
    try {
      const response = await fetch(`/api/crm/projects/${projId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': tenant.subdomain
        }
      });
      if (response.ok) {
        fetchProjects();
      }
    } catch (err) {}
  };

  const fetchDevProfiles = async () => {
    try {
      const response = await fetch('/api/crm/dev-profiles', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': tenant.subdomain
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDevProfiles(data);
      }
    } catch (err) {}
  };

  const handleDevProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devNameField) return;

    const payload = {
      name: devNameField,
      about: devAboutField,
      foundedYear: devFoundedField,
      notes: devNotesField,
      projectsList: devProjectsListField
    };

    try {
      const url = editingDevProfile ? `/api/crm/dev-profiles/${editingDevProfile.id}` : '/api/crm/dev-profiles';
      const method = editingDevProfile ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': tenant.subdomain
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchDevProfiles();
        setShowDevProfileEditor(false);
        setEditingDevProfile(null);
        setDevNameField('');
        setDevAboutField('');
        setDevFoundedField('');
        setDevNotesField('');
        setDevProjectsListField('');
      }
    } catch (err) {}
  };

  const handleEditDevProfile = (prof: DevProfile) => {
    setEditingDevProfile(prof);
    setDevNameField(prof.name);
    setDevAboutField(prof.about);
    setDevFoundedField(prof.foundedYear);
    setDevNotesField(prof.notes);
    setDevProjectsListField(prof.projectsList || '');
    setShowDevProfileEditor(true);
  };

  const handleDeleteDevProfile = async (profId: string) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المطور تماماً؟ سيتم إزالته من السجل العقاري.' : 'Are you sure you want to delete this developer profile?')) return;
    try {
      const response = await fetch(`/api/crm/dev-profiles/${profId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': tenant.subdomain
        }
      });
      if (response.ok) {
        fetchDevProfiles();
      }
    } catch (err) {}
  };

  const handleViewDeveloperProfile = (devName: string) => {
    const matchedProfile = devProfiles.find(p => p.name.toLowerCase().includes(devName.toLowerCase()) || devName.toLowerCase().includes(p.name.toLowerCase()));
    if (matchedProfile) {
      setActiveDevInfo(matchedProfile);
    } else {
      setActiveDevInfo({
        id: 'temp',
        tenant_id: tenant.subdomain,
        broker_id: user?.id || '',
        name: devName,
        about: language === 'ar' ? 'لم يتم إضافة نبذة تاريخية لهذا المطور بعد في سجل المطورين. يمكنك إضافته من تبويب سجل المطورين.' : 'No profile history added for this developer yet. You can add them from the Developers Registry tab.',
        foundedYear: '—',
        notes: '',
        created_at: ''
      });
    }
    setShowDevInfoModal(true);
  };

  useEffect(() => {
    fetchBrokerListings();
    fetchCRMLeads();
    fetchCRMUsers();
    fetchProjects();
    fetchDevProfiles();
  }, [user, tenant]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(brokerName, brokerPhone);
      updateTenantPhone(brokerPhone);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 4000);
    } catch (error) {}
  };

  useEffect(() => {
    const origin = window.location.origin;
    setGeneratedLink(`${origin}/?tenant=${tenant.subdomain}&ref=${selectedRefPlatform}`);
  }, [selectedRefPlatform, tenant]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleCreateBroker = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminSuccess(false);

    try {
      const response = await fetch('/api/auth/register-broker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': tenant.subdomain
        },
        body: JSON.stringify({
          name: newBrokerName,
          email: newBrokerEmail,
          password: newBrokerPass,
          phone: newBrokerPhone
        })
      });

      const data = await response.json();
      if (response.ok) {
        setAdminSuccess(true);
        setNewBrokerName('');
        setNewBrokerPhone('');
        setNewBrokerEmail('');
        setNewBrokerPass('');
      } else {
        setAdminError(data.message || 'فشل تسجيل حساب الوسيط.');
      }
    } catch (err) {
      setAdminError('فشل الاتصال بالخادم.');
    }
  };

  const handleOpenCreate = () => {
    setEditingListing(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setSelectedGov('القاهرة');
    setSelectedArea(EGYPT_LOCATIONS['القاهرة'][0]);
    setUnitCount('1');
    setBedrooms('3');
    setBathrooms('2');
    setArea('120');
    setFinishing('كامل التشطيب');
    setImgUrl('');
    setTagsInput('');
    setShowEditor(true);
  };

  const handleOpenEdit = (listing: Listing) => {
    setEditingListing(listing);
    setTitle(listing.title);
    setDescription(listing.description);
    setPrice(listing.price.toString());
    setUnitCount(listing.unit_count?.toString() || '1');
    setBedrooms(listing.bedrooms?.toString() || '3');
    setBathrooms(listing.bathrooms?.toString() || '2');
    setArea(listing.area?.toString() || '120');
    setFinishing(listing.finishing || 'كامل التشطيب');
    setImgUrl(listing.images[0] || '');
    setTagsInput(listing.tags.join(', '));

    const parts = listing.location.split(' - ');
    const govPart = parts[0] || 'القاهرة';
    const areaPart = parts[1] || '';
    
    setSelectedGov(govPart);
    setSelectedArea(areaPart);
    setShowEditor(true);
  };

  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title,
      description,
      price: Number(price),
      location: `${selectedGov} - ${selectedArea}`,
      unit_count: Number(unitCount),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      area: Number(area),
      finishing,
      images: imgUrl ? [imgUrl] : undefined,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    };

    try {
      let response;
      if (editingListing) {
        response = await fetch(`/api/listings/${editingListing.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Subdomain': tenant.subdomain
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('/api/listings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Subdomain': tenant.subdomain
          },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        fetchBrokerListings();
        setShowEditor(false);
      }
    } catch (err) {}
  };

  const handleDeleteListing = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا العقار نهائياً؟')) return;

    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': tenant.subdomain
        }
      });
      if (response.ok) {
        fetchBrokerListings();
      }
    } catch (e) {}
  };

  const handleUpdateStatus = async (id: string, newStatus: 'available' | 'reserved' | 'sold') => {
    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': tenant.subdomain
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchBrokerListings();
      }
    } catch (e) {}
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: Lead['status']) => {
    try {
      const response = await fetch(`/api/crm/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': tenant.subdomain
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchCRMLeads();
      }
    } catch (e) {}
  };

  const handleUpdateLeadQualification = async (leadId: string, newQual: Lead['qualification']) => {
    try {
      const response = await fetch(`/api/crm/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': tenant.subdomain
        },
        body: JSON.stringify({ qualification: newQual })
      });
      if (response.ok) {
        fetchCRMLeads();
      }
    } catch (e) {}
  };

  const handleToggleLeadArchive = async (leadId: string, currentArchived: boolean) => {
    try {
      const response = await fetch(`/api/crm/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': tenant.subdomain
        },
        body: JSON.stringify({ archived: !currentArchived })
      });
      if (response.ok) {
        fetchCRMLeads();
      }
    } catch (e) {}
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm(language === 'ar' ? 'هل أنت متأكد من رغبتك في حذف هذا العميل تماماً؟' : 'Are you sure you want to permanently delete this lead?')) return;
    try {
      const response = await fetch(`/api/crm/leads/${leadId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Subdomain': tenant.subdomain
        }
      });
      if (response.ok) {
        fetchCRMLeads();
      } else {
        let errMsg = 'Unknown error';
        try {
          const errData = await response.json();
          errMsg = errData.message || errMsg;
        } catch (jsonErr) {
          try {
            errMsg = await response.text();
          } catch (textErr) {}
        }
        alert(language === 'ar' ? `فشل الحذف (${response.status}): ${errMsg.slice(0, 150)}` : `Delete failed (${response.status}): ${errMsg.slice(0, 150)}`);
      }
    } catch (e: any) {
      alert(language === 'ar' ? `حدث خطأ في الاتصال: ${e.message}` : `Connection error: ${e.message}`);
    }
  };

  const isSuperAdmin = user?.id === 'b1111111-1111-1111-1111-111111111111';

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Header and Toggle Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem' }} className="gradient-text">
            {language === 'ar' ? 'لوحة تحكم إدارة المبيعات والوساطة' : 'Sales & Brokerage Command Panel'}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>{user?.name} | {tenant.name}</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setDashboardSubTab('analytics')} 
            className={`btn ${dashboardSubTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <BarChart2 size={16} /> {language === 'ar' ? 'تحليلات الأداء وCRM' : 'Analytics & CRM'}
          </button>
          <button 
            onClick={() => setDashboardSubTab('listings')} 
            className={`btn ${dashboardSubTab === 'listings' ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t('myListings')}
          </button>
          <button 
            onClick={() => setDashboardSubTab('projects')} 
            className={`btn ${dashboardSubTab === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Layers size={16} /> {language === 'ar' ? 'مرجع المشاريع' : 'Projects Reference'}
          </button>
          <button 
            onClick={() => {
              setDashboardSubTab('crm');
              fetchCRMUsers();
            }} 
            className={`btn ${dashboardSubTab === 'crm' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Users size={16} /> {language === 'ar' ? 'قائمة المشترين' : 'Buyers Database'}
          </button>
          <button 
            onClick={() => setDashboardSubTab('settings')} 
            className={`btn ${dashboardSubTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Settings size={16} /> {language === 'ar' ? 'الإعدادات' : 'Settings'}
          </button>
        </div>
      </div>

      {dashboardSubTab === 'analytics' ? (
        // ANALYTICS & CRM LEAD PIPELINE TAB
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Top Analytic KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px'
          }}>
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Home size={32} style={{ color: 'var(--accent)' }} />
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{language === 'ar' ? 'إجمالي العقارات' : 'Total Listings'}</div>
                <strong style={{ fontSize: '1.5rem' }}>{listings.length}</strong>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <TrendingUp size={32} style={{ color: 'var(--accent)' }} />
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{language === 'ar' ? 'طلبات المعاينة (Leads)' : 'Total Leads'}</div>
                <strong style={{ fontSize: '1.5rem' }}>{leads.length}</strong>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Users size={32} style={{ color: 'var(--accent)' }} />
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{language === 'ar' ? 'المشترين المسجلين' : 'Registered Clients'}</div>
                <strong style={{ fontSize: '1.5rem' }}>{crmClients.length}</strong>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Award size={32} style={{ color: 'var(--accent)' }} />
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{language === 'ar' ? 'معدل التحويل (Conversion)' : 'Conversion Rate'}</div>
                <strong style={{ fontSize: '1.5rem' }}>
                  {leads.length > 0 ? `${Math.round((leads.filter(l => l.status === 'Sold').length / leads.length) * 100)}%` : '0%'}
                </strong>
              </div>
            </div>
          </div>

          {/* Lead pipeline management view */}
          <div className="glass-panel" style={{ padding: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
              <h3 style={{ fontSize: '1.3rem', margin: 0 }}>
                {language === 'ar' ? 'قمع وإدارة صفقات العملاء' : 'CRM Sales Lead Pipeline'}
              </h3>

              {/* Toggle Tab Active Leads vs Archive */}
              <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '8px' }}>
                <button 
                  onClick={() => setViewArchive(false)}
                  className={`btn ${!viewArchive ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
                >
                  📁 {language === 'ar' ? 'الطلبات النشطة' : 'Active Leads'}
                </button>
                <button 
                  onClick={() => setViewArchive(true)}
                  className={`btn ${viewArchive ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
                >
                  🗄️ {language === 'ar' ? 'الأرشيف' : 'Archive'}
                </button>
              </div>
            </div>

            {/* Smart Filters bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '15px', marginBottom: '20px' }}>
              {/* Smart Search Input */}
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={language === 'ar' ? 'ابحث باسم العميل، رقم الهاتف، أو عنوان العقار...' : 'Search by client name, phone number, or unit title...'}
                  value={leadSearchQuery}
                  onChange={e => setLeadSearchQuery(e.target.value)}
                  style={{ paddingRight: '38px', fontSize: '0.85rem' }}
                />
              </div>

              {/* Qualification Filter Buttons */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'التصنيف:' : 'Filter:'}</span>
                {['All', 'Hot', 'Warm', 'Cold'].map(q => (
                  <button 
                    key={q} 
                    onClick={() => setQualFilter(q as any)}
                    className={`btn ${qualFilter === q ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      backgroundColor: qualFilter === q ? (
                        q === 'Hot' ? '#ef4444' : q === 'Warm' ? '#f59e0b' : q === 'Cold' ? '#3b82f6' : 'var(--primary)'
                      ) : 'var(--bg-tertiary)',
                      color: qualFilter === q ? 'white' : 'var(--text-main)'
                    }}
                  >
                    {q === 'All' ? (language === 'ar' ? 'الكل' : 'All') : q}
                  </button>
                ))}
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              {leads.filter(lead => {
                const matchesArchive = !!lead.archived === viewArchive;
                const matchesSearch = lead.client_name.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
                  lead.phone.includes(leadSearchQuery) ||
                  lead.listing_title.toLowerCase().includes(leadSearchQuery.toLowerCase());
                const matchesQual = qualFilter === 'All' || lead.qualification === qualFilter;
                return matchesArchive && matchesSearch && matchesQual;
              }).map(lead => {
                // Determine qualification color code
                const qualColor = lead.qualification === 'Hot' ? '#ef4444' : lead.qualification === 'Warm' ? '#f59e0b' : '#3b82f6';
                
                return (
                  <div 
                    key={lead.id} 
                    onClick={() => { setSelectedLead(lead); setShowChatTranscript(false); }}
                    className="glass-panel" 
                    style={{
                      padding: '20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '15px',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                      borderRight: `6px solid ${qualColor}`,
                      borderLeft: `5px solid ${
                        lead.status === 'New' ? '#3b82f6' : 
                        lead.status === 'Contacted' ? '#f59e0b' : 
                        lead.status === 'Viewing' ? '#10b981' : 
                        lead.status === 'Negotiation' ? '#8b5cf6' : 
                        lead.status === 'Sold' ? '#22c55e' : '#ef4444'
                      }`
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{lead.listing_title}</h4>
                        <span style={{
                          fontSize: '0.75rem',
                          background: 'rgba(234, 88, 12, 0.15)',
                          color: '#ea580c',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontWeight: 'bold',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Link size={12} /> {lead.lead_source || 'Direct Web'}
                        </span>

                        {/* Visual rating dot */}
                        <span style={{
                          fontSize: '0.75rem',
                          backgroundColor: `${qualColor}20`,
                          color: qualColor,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontWeight: 'bold'
                        }}>
                          🔥 {lead.qualification || 'Warm'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                        👤 {lead.client_name} • 📞 {lead.phone}
                      </span>
                      {lead.notes && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', background: 'var(--bg-primary)', padding: '6px 12px', borderRadius: '4px' }}>
                          {lead.notes}
                        </p>
                      )}

                      {/* Viewed Properties Micro Tags */}
                      {lead.viewed_properties && lead.viewed_properties.length > 0 && (
                        <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {language === 'ar' ? 'العقارات المتصفحة:' : 'Viewed:'}
                          </span>
                          {lead.viewed_properties.map((prop: string, idx: number) => (
                            <span key={idx} style={{
                              fontSize: '0.75rem',
                              backgroundColor: 'var(--bg-tertiary)',
                              color: 'var(--text-main)',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              border: '1px solid var(--border-color)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              👀 {prop}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ textAlign: 'left', fontSize: '0.85rem' }}>
                        <div>📅 {lead.preferred_date}</div>
                        <div>⏰ {lead.preferred_time}</div>
                        {lead.time_on_site && (
                          <div style={{ color: 'var(--accent)', marginTop: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            ⏱️ {language === 'ar' ? 'البناء:' : 'Duration:'} {lead.time_on_site}
                          </div>
                        )}
                      </div>

                      {/* Dropdowns to toggle qualification degree */}
                      <select
                        value={lead.qualification || 'Warm'}
                        onChange={e => handleUpdateLeadQualification(lead.id, e.target.value as any)}
                        style={{
                          padding: '6px 10px',
                          fontSize: '0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          border: `1px solid ${qualColor}`,
                          color: qualColor,
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Hot">🔥 Hot</option>
                        <option value="Warm">⚡ Warm</option>
                        <option value="Cold">❄️ Cold</option>
                      </select>

                      <select 
                        className="form-control"
                        value={lead.status}
                        onChange={e => handleUpdateLeadStatus(lead.id, e.target.value as any)}
                        style={{ width: '130px', padding: '6px' }}
                      >
                        <option value="New">{language === 'ar' ? 'جديد' : 'New'}</option>
                        <option value="Contacted">{language === 'ar' ? 'تم التواصل' : 'Contacted'}</option>
                        <option value="Viewing">{language === 'ar' ? 'معاينة مجدولة' : 'Viewing'}</option>
                        <option value="Negotiation">{language === 'ar' ? 'مفاوضات' : 'Negotiation'}</option>
                        <option value="Sold">{language === 'ar' ? 'تم البيع بنجاح' : 'Sold'}</option>
                        <option value="Lost">{language === 'ar' ? 'عميل مستبعد' : 'Lost'}</option>
                      </select>

                      {/* Action buttons: Archive & Delete */}
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          onClick={() => handleToggleLeadArchive(lead.id, !!lead.archived)}
                          className="btn btn-secondary" 
                          style={{ padding: '6px 10px' }}
                          title={language === 'ar' ? 'أرشفة' : 'Archive'}
                        >
                          <Archive size={14} style={{ color: 'var(--text-muted)' }} />
                        </button>
                        <button 
                          onClick={() => handleDeleteLead(lead.id)}
                          className="btn btn-secondary" 
                          style={{ padding: '6px 10px' }}
                          title={language === 'ar' ? 'حذف' : 'Delete'}
                        >
                          <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : dashboardSubTab === 'projects' ? (
        // PROJECTS REFERENCE TAB
        <div>
          {/* Internal subtab navigation toggle */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
            <button 
              onClick={() => setProjectsTabMode('projects')} 
              className={`btn ${projectsTabMode === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              📂 {language === 'ar' ? 'المشاريع العقارية' : 'Real Estate Projects'}
            </button>
            <button 
              onClick={() => setProjectsTabMode('developers')} 
              className={`btn ${projectsTabMode === 'developers' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              🏢 {language === 'ar' ? 'سجل المطورين العقاريين' : 'Developers Registry'}
            </button>
          </div>

          {projectsTabMode === 'projects' ? (
            // ================= PROJECTS VIEW =================
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                {/* Search project bar */}
                <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
                  <Search size={16} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder={language === 'ar' ? 'ابحث عن مشروع بالاسم أو الموقع...' : 'Search projects...'}
                    value={projSearchQuery}
                    onChange={e => setProjSearchQuery(e.target.value)}
                    style={{ paddingRight: '38px', fontSize: '0.85rem' }}
                  />
                </div>
                
                <button 
                  onClick={() => {
                    setEditingProject(null);
                    setProjTitle('');
                    setProjLocation('');
                    setProjDevelopers([]);
                    setShowProjectEditor(true);
                  }} 
                  className="btn btn-primary"
                >
                  <Plus size={18} /> {language === 'ar' ? 'إضافة مشروع مرجعي' : 'Add Reference Project'}
                </button>
              </div>

              {/* Modal / Inline Editor for Project */}
              {showProjectEditor && (
                <div className="glass-panel" style={{ padding: '25px', marginBottom: '30px', border: '2px solid var(--accent)' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
                    {editingProject ? (language === 'ar' ? 'تعديل المشروع المرجعي' : 'Edit Reference Project') : (language === 'ar' ? 'إضافة مشروع مرجعي جديد' : 'Add New Reference Project')}
                  </h3>
                  
                  <form onSubmit={handleProjectSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'اسم المشروع *' : 'Project Name *'}</label>
                      <input type="text" className="form-control" value={projTitle} onChange={e => setProjTitle(e.target.value)} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'الموقع العام للمشروع' : 'Location'}</label>
                      <input type="text" className="form-control" value={projLocation} onChange={e => setProjLocation(e.target.value)} />
                    </div>

                    {/* Added Developers List inside the editor */}
                    <div style={{ gridColumn: 'span 2', marginTop: '15px' }}>
                      <strong style={{ display: 'block', marginBottom: '10px', fontSize: '0.95rem', color: 'white' }}>
                        {language === 'ar' ? 'المطورون العقاريون داخل المشروع وطرق سدادهم:' : 'Developers for this project:'}
                      </strong>
                      {projDevelopers.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{language === 'ar' ? 'لا يوجد مطورين مضافين حالياً. يرجى إضافة مطور عقاري واحد على الأقل بالأسفل.' : 'No developers added yet.'}</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                          {projDevelopers.map(dev => (
                            <div key={dev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
                              <div>
                                <strong style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>🏢 {dev.name}</strong>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '10px' }}>
                                  ({dev.startPrice ? `${Number(dev.startPrice).toLocaleString('ar-EG')} ج` : ''} - {dev.installmentYears ? `${dev.installmentYears} سنوات` : ''})
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button type="button" onClick={() => handleEditTempDeveloper(dev)} className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '0.7rem' }}>{language === 'ar' ? 'تعديل' : 'Edit'}</button>
                                <button type="button" onClick={() => handleRemoveTempDeveloper(dev.id)} className="btn" style={{ padding: '3px 8px', fontSize: '0.7rem', backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none' }}>{language === 'ar' ? 'إزالة' : 'Remove'}</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Developer mini form */}
                      {!showDevForm ? (
                        <button type="button" onClick={() => { setTempDevId(null); setTempDevName(''); setTempDevStartPrice(''); setTempDevInstallment(''); setTempDevDelivery(''); setTempDevBrochure(''); setTempDevNotes(''); setShowDevForm(true); }} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                          + {language === 'ar' ? 'إضافة مطور وتفاصيله للمشروع' : 'Add Developer Detail'}
                        </button>
                      ) : (
                        <div style={{ padding: '15px', border: '1px dashed var(--accent)', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(255,255,255,0.02)', marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'اسم المطور العقاري *' : 'Developer Name *'}</label>
                            <input type="text" className="form-control" value={tempDevName} onChange={e => setTempDevName(e.target.value)} placeholder="مثال: طلعت مصطفى، أوراسكوم..." required />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'يبدأ من سعر (جنيه)' : 'Starting Price (EGP)'}</label>
                            <input type="text" className="form-control" value={tempDevStartPrice} onChange={e => setTempDevStartPrice(e.target.value)} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'سنوات التقسيط' : 'Installment Years'}</label>
                            <input type="text" className="form-control" value={tempDevInstallment} onChange={e => setTempDevInstallment(e.target.value)} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'تاريخ الاستلام' : 'Delivery Date'}</label>
                            <input type="text" className="form-control" value={tempDevDelivery} onChange={e => setTempDevDelivery(e.target.value)} />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'رابط البروشور' : 'Brochure URL'}</label>
                            <input type="url" className="form-control" value={tempDevBrochure} onChange={e => setTempDevBrochure(e.target.value)} placeholder="https://..." />
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'تفاصيل السداد والملاحظات' : 'Payment Plans & Notes'}</label>
                            <textarea className="form-control" rows={2} value={tempDevNotes} onChange={e => setTempDevNotes(e.target.value)} />
                          </div>
                          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button type="button" onClick={() => setShowDevForm(false)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                            <button type="button" onClick={handleAddTempDeveloper} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>
                              {tempDevId ? (language === 'ar' ? 'حفظ تعديل المطور' : 'Save Dev') : (language === 'ar' ? 'تأكيد إضافة المطور' : 'Confirm Add Dev')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button type="button" onClick={() => { setShowProjectEditor(false); setEditingProject(null); }} className="btn btn-secondary">{language === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                      <button type="submit" className="btn btn-primary">{editingProject ? (language === 'ar' ? 'تحديث المشروع' : 'Update Project') : (language === 'ar' ? 'إضافة المشروع' : 'Add Project')}</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Projects Grid Card Layout */}
              {projects.length === 0 ? (
                <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Layers size={48} style={{ marginBottom: '15px', color: 'var(--primary)' }} />
                  <p>{language === 'ar' ? 'لا توجد مشاريع مرجعية مسجلة حالياً. اضغط على إضافة مشروع جديد بالأعلى.' : 'No reference projects found.'}</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                  {projects.filter(p => {
                    const query = projSearchQuery.toLowerCase();
                    return p.title.toLowerCase().includes(query) || p.location.toLowerCase().includes(query);
                  }).map(proj => (
                    <div key={proj.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid var(--accent)', backgroundColor: 'white' }}>
                      <div>
                        <h4 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--primary)', fontWeight: 800 }}>{proj.title}</h4>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                          📍 <strong>{language === 'ar' ? 'الموقع العام:' : 'General Location:'}</strong> {proj.location || '—'}
                        </div>

                        <div style={{ marginTop: '15px' }}>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--primary)', display: 'block', marginBottom: '10px', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '5px', fontWeight: 'bold' }}>
                            {language === 'ar' ? 'المطورون العقاريون (اضغط للاطلاع على تاريخ المطور):' : 'Developers (Click to view profile & history):'}
                          </strong>
                          {(!proj.developers || proj.developers.length === 0) ? (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'لم يتم إضافة مطورين بعد' : 'No developers added.'}</span>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {proj.developers.map((dev: any) => (
                                <div key={dev.id} style={{ padding: '10px', backgroundColor: 'rgba(30,65,100,0.03)', borderRadius: 'var(--radius-sm)', borderRight: '4px solid var(--accent)', color: 'var(--primary)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <strong 
                                      onClick={() => handleViewDeveloperProfile(dev.name)} 
                                      style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                                      title={language === 'ar' ? 'عرض تاريخ المطور وتفاصيله' : 'View developer profile & history'}
                                    >
                                      🏢 {dev.name}
                                    </strong>
                                    {dev.brochureUrl && (
                                      <a href={dev.brochureUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'underline', fontWeight: 'bold' }}>
                                        {language === 'ar' ? 'فتح البروشور' : 'Brochure'}
                                      </a>
                                    )}
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.8rem', color: '#555' }}>
                                    <div>💰 {dev.startPrice ? `${Number(dev.startPrice).toLocaleString('ar-EG')} ج` : '—'}</div>
                                    <div>⏳ {dev.installmentYears ? `${dev.installmentYears} سنوات` : '—'}</div>
                                    <div style={{ gridColumn: 'span 2' }}>📅 {language === 'ar' ? 'الاستلام:' : 'Delivery:'} {dev.deliveryDate || '—'}</div>
                                  </div>
                                  {dev.notes && (
                                    <div style={{ marginTop: '5px', fontSize: '0.75rem', color: '#444', borderTop: '1px dashed rgba(0,0,0,0.08)', paddingTop: '4px', lineHeight: 1.4 }}>
                                      💡 {dev.notes}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                        <button onClick={() => handleEditProject(proj)} className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: '0.75rem', color: 'var(--primary)', borderColor: '#ccc' }}>
                          {language === 'ar' ? 'تعديل' : 'Edit'}
                        </button>
                        <button onClick={() => handleDeleteProject(proj.id)} className="btn" style={{ padding: '5px 12px', fontSize: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'none' }}>
                          {language === 'ar' ? 'حذف' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // ================= DEVELOPERS REGISTRY VIEW =================
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                {/* Search profile bar */}
                <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
                  <Search size={16} style={{ position: 'absolute', right: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder={language === 'ar' ? 'ابحث عن مطور بالاسم أو سنة التأسيس...' : 'Search developers...'}
                    value={devProfSearchQuery}
                    onChange={e => setDevProfSearchQuery(e.target.value)}
                    style={{ paddingRight: '38px', fontSize: '0.85rem' }}
                  />
                </div>
                
                <button 
                  onClick={() => {
                    setEditingDevProfile(null);
                    setDevNameField('');
                    setDevAboutField('');
                    setDevFoundedField('');
                    setDevNotesField('');
                    setShowDevProfileEditor(true);
                  }} 
                  className="btn btn-primary"
                >
                  <Plus size={18} /> {language === 'ar' ? 'إضافة مطور للسجل' : 'Add Developer Profile'}
                </button>
              </div>

              {/* Modal / Inline Editor for Developer Profile */}
              {showDevProfileEditor && (
                <div className="glass-panel" style={{ padding: '25px', marginBottom: '30px', border: '2px solid var(--accent)' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
                    {editingDevProfile ? (language === 'ar' ? 'تعديل ملف المطور' : 'Edit Developer Profile') : (language === 'ar' ? 'إضافة مطور عقاري جديد للسجل' : 'Add New Developer Profile')}
                  </h3>
                  
                  <form onSubmit={handleDevProfileSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'اسم المطور العقاري *' : 'Developer Name *'}</label>
                      <input type="text" className="form-control" value={devNameField} onChange={e => setDevNameField(e.target.value)} required />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'سنة التأسيس' : 'Founded Year'}</label>
                      <input type="text" className="form-control" value={devFoundedField} onChange={e => setDevFoundedField(e.target.value)} placeholder="مثال: 1995" />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'نبذة تاريخية ومعلومات عامة (About)' : 'History & About'}</label>
                      <textarea className="form-control" rows={3} value={devAboutField} onChange={e => setDevAboutField(e.target.value)} placeholder={language === 'ar' ? 'تاريخ الشركة، سابقة أعمالها، وتوجهها...' : 'Company history, past projects...'} style={{ resize: 'vertical' }} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'المشاريع التي يعمل بها المطور / سابقة الأعمال' : 'Projects developed / track record'}</label>
                      <input type="text" className="form-control" value={devProjectsListField} onChange={e => setDevProjectsListField(e.target.value)} placeholder={language === 'ar' ? 'مثال: مدينتي، الرحاب، سيليا، بادية بالم هيلز...' : 'e.g. Madinaty, Al Rehab, Badya...'} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}</label>
                      <textarea className="form-control" rows={2} value={devNotesField} onChange={e => setDevNotesField(e.target.value)} style={{ resize: 'vertical' }} />
                    </div>
                    
                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button type="button" onClick={() => { setShowDevProfileEditor(false); setEditingDevProfile(null); }} className="btn btn-secondary">{language === 'ar' ? 'إلغاء' : 'Cancel'}</button>
                      <button type="submit" className="btn btn-primary">{editingDevProfile ? (language === 'ar' ? 'تحديث الملف' : 'Update Profile') : (language === 'ar' ? 'حفظ الملف' : 'Save Profile')}</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Developer Profiles Grid */}
              {devProfiles.length === 0 ? (
                <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Users size={48} style={{ marginBottom: '15px', color: 'var(--primary)' }} />
                  <p>{language === 'ar' ? 'لا يوجد مطورين مسجلين في السجل العقاري حالياً.' : 'No developer profiles found.'}</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {devProfiles.filter(p => {
                    const query = devProfSearchQuery.toLowerCase();
                    return p.name.toLowerCase().includes(query) || p.foundedYear.toLowerCase().includes(query);
                  }).map(prof => {
                    // Filter projects where this developer is involved
                    const associated = projects.filter(proj => proj.developers && proj.developers.some((d: any) => d.name.toLowerCase().includes(prof.name.toLowerCase()) || prof.name.toLowerCase().includes(d.name.toLowerCase())));
                    
                    return (
                      <div key={prof.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid var(--accent)', backgroundColor: 'white', color: 'var(--primary)' }}>
                        <div>
                          <h4 style={{ fontSize: '1.2rem', marginBottom: '4px', color: 'var(--primary)', fontWeight: 'bold' }}>🏢 {prof.name}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
                            📅 {language === 'ar' ? `تأسست عام: ${prof.foundedYear || 'غير محدد'}` : `Founded: ${prof.foundedYear || 'N/A'}`}
                          </span>

                          <div style={{ fontSize: '0.8rem', color: '#444', lineHeight: '1.4', marginBottom: '15px' }}>
                            <strong>{language === 'ar' ? 'نبذة وتاريخ المطور:' : 'About/History:'}</strong>
                            <p style={{ marginTop: '4px', backgroundColor: 'rgba(30,65,100,0.02)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>{prof.about || '—'}</p>
                          </div>

                          {prof.projectsList && (
                            <div style={{ fontSize: '0.8rem', color: '#444', lineHeight: '1.4', marginBottom: '15px' }}>
                              <strong>{language === 'ar' ? 'المشاريع التي يعمل بها المطور:' : 'Projects developed:'}</strong>
                              <p style={{ marginTop: '4px', backgroundColor: 'rgba(245, 158, 11, 0.05)', padding: '8px', borderRadius: 'var(--radius-sm)', borderRight: '3px solid #f59e0b' }}>{prof.projectsList}</p>
                            </div>
                          )}

                          {prof.notes && (
                            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '15px' }}>
                              <strong>{language === 'ar' ? 'ملاحظات الوساطة:' : 'Brokerage Notes:'}</strong> {prof.notes}
                            </div>
                          )}

                          {/* Associated projects badges */}
                          <div style={{ marginTop: '12px' }}>
                            <strong style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'block', marginBottom: '6px' }}>
                              📂 {language === 'ar' ? 'مشاريع يشارك فيها المطور على الموقع:' : 'Involved in projects:'}
                            </strong>
                            {associated.length === 0 ? (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{language === 'ar' ? 'لم يتم إدراج هذا المطور في أي مشاريع بالموقع بعد' : 'Not linked to any projects.'}</span>
                            ) : (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {associated.map(ap => (
                                  <span 
                                    key={ap.id} 
                                    onClick={() => {
                                      setProjectsTabMode('projects');
                                      setProjSearchQuery(ap.title);
                                    }}
                                    style={{ fontSize: '0.7rem', padding: '3px 8px', backgroundColor: 'rgba(30,65,100,0.08)', borderRadius: '12px', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                                    title={language === 'ar' ? 'اضغط لعرض تفاصيل المشروع' : 'Click to view project details'}
                                  >
                                    {ap.title}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                          <button onClick={() => handleEditDevProfile(prof)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.7rem', color: 'var(--primary)' }}>
                            {language === 'ar' ? 'تعديل' : 'Edit'}
                          </button>
                          <button onClick={() => handleDeleteDevProfile(prof.id)} className="btn" style={{ padding: '4px 10px', fontSize: '0.7rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'none' }}>
                            {language === 'ar' ? 'حذف' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* DEVELOPER PROFILE DETAILS MODAL PANEL */}
          {showDevInfoModal && activeDevInfo && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
              <div className="glass-panel" style={{ backgroundColor: 'white', maxWidth: '550px', width: '100%', padding: '25px', color: 'var(--primary)', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px', marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', fontWeight: 'bold' }}>🏢 {activeDevInfo.name}</h3>
                  <button onClick={() => setShowDevInfoModal(false)} style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--primary)' }}>✕</button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📅 {language === 'ar' ? 'سنة التأسيس:' : 'Founded Year:'}</span>
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--primary)' }}>{activeDevInfo.foundedYear || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📚 {language === 'ar' ? 'تاريخ المطور وسيرته المهنية (About):' : 'Developer History (About):'}</span>
                    <p style={{ marginTop: '5px', fontSize: '0.85rem', color: '#444', lineHeight: 1.5, backgroundColor: 'rgba(30,65,100,0.03)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                      {activeDevInfo.about}
                    </p>
                  </div>
                  
                  {activeDevInfo.projectsList && (
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📂 {language === 'ar' ? 'المشاريع التي يعمل بها المطور:' : 'Projects developed:'}</span>
                      <p style={{ marginTop: '5px', fontSize: '0.85rem', color: '#444', lineHeight: 1.5, backgroundColor: 'rgba(245, 158, 11, 0.05)', padding: '10px', borderRadius: 'var(--radius-sm)', borderRight: '3px solid #f59e0b' }}>
                        {activeDevInfo.projectsList}
                      </p>
                    </div>
                  )}

                  {activeDevInfo.notes && (
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📝 {language === 'ar' ? 'ملاحظات عقارية مهمة:' : 'Brokerage Notes:'}</span>
                      <p style={{ marginTop: '4px', fontSize: '0.8rem', color: '#555', fontStyle: 'italic' }}>
                        {activeDevInfo.notes}
                      </p>
                    </div>
                  )}

                  {/* Associated Projects in the modal */}
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>📂 {language === 'ar' ? 'المشاريع التي يشارك فيها المطور بالموقع:' : 'Associated projects:'}</span>
                    {projects.filter(proj => proj.developers && proj.developers.some((d: any) => d.name.toLowerCase().includes(activeDevInfo.name.toLowerCase()) || activeDevInfo.name.toLowerCase().includes(d.name.toLowerCase()))).length === 0 ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{language === 'ar' ? 'لا يشارك هذا المطور في أي مشاريع مدرجة حالياً.' : 'No associated projects.'}</span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {projects.filter(proj => proj.developers && proj.developers.some((d: any) => d.name.toLowerCase().includes(activeDevInfo.name.toLowerCase()) || activeDevInfo.name.toLowerCase().includes(d.name.toLowerCase()))).map(proj => (
                          <span 
                            key={proj.id} 
                            onClick={() => {
                              setShowDevInfoModal(false);
                              setProjectsTabMode('projects');
                              setProjSearchQuery(proj.title);
                            }}
                            style={{ fontSize: '0.75rem', padding: '4px 10px', backgroundColor: 'rgba(30,65,100,0.08)', borderRadius: '12px', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            {proj.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                  <button onClick={() => setShowDevInfoModal(false)} className="btn btn-primary" style={{ padding: '6px 20px', fontSize: '0.85rem' }}>
                    {language === 'ar' ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : dashboardSubTab === 'listings' ? (
        // LISTINGS TAB
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button onClick={handleOpenCreate} className="btn btn-primary">
              <Plus size={18} /> {t('addProperty')}
            </button>
          </div>

          {listings.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Home size={48} style={{ marginBottom: '15px', color: 'var(--primary)' }} />
              <p>لا توجد عقارات منشورة حالياً باسمك.</p>
              <button onClick={handleOpenCreate} className="btn btn-secondary" style={{ marginTop: '15px' }}>
                أنشئ أول منشور عقاري الآن
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {listings.map(listing => (
                <motion.div 
                  key={listing.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-panel"
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px',
                    padding: '20px',
                    alignItems: 'center'
                  }}
                >
                  <img 
                    src={listing.images[0]} 
                    alt={listing.title} 
                    style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} 
                  />
                  
                  <div style={{ flex: 2, minWidth: '200px' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{listing.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{listing.location} • {listing.price.toLocaleString('ar-EG')} {t('currency')}</p>
                    <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        backgroundColor: listing.status === 'available' ? 'rgba(16, 185, 129, 0.15)' : listing.status === 'reserved' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: listing.status === 'available' ? 'var(--success)' : listing.status === 'reserved' ? 'var(--warning)' : 'var(--danger)'
                      }}>
                        {listing.status === 'available' ? t('available') : listing.status === 'reserved' ? t('reserved') : t('sold')}
                      </span>
                      
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Bed size={12} /> {listing.bedrooms || 0} {t('rooms')}
                        <span>•</span>
                        <Bath size={12} /> {listing.bathrooms || 0} {t('baths')}
                        <span>•</span>
                        <Maximize2 size={12} /> {listing.area || 0} م²
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <select 
                      className="form-control"
                      style={{ width: '120px', padding: '6px 10px', fontSize: '0.85rem' }}
                      value={listing.status}
                      onChange={(e) => handleUpdateStatus(listing.id, e.target.value as any)}
                    >
                      <option value="available">{t('available')}</option>
                      <option value="reserved">{t('reserved')}</option>
                      <option value="sold">{t('sold')}</option>
                    </select>

                    <button onClick={() => handleOpenEdit(listing)} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
                      <Edit size={16} /> {language === 'ar' ? 'تعديل' : 'Edit'}
                    </button>

                    <button onClick={() => handleDeleteListing(listing.id)} className="btn btn-danger" style={{ padding: '8px 12px' }}>
                      <Trash2 size={16} /> {language === 'ar' ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : dashboardSubTab === 'crm' ? (
        // CRM CLIENTS DATABASE TAB
        <div>
          <div className="glass-panel" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }} className="gradient-text">
              <Users style={{ color: 'var(--accent)' }} /> {language === 'ar' ? 'قائمة المشترين' : 'Client Leads Registry'}
            </h3>

            {crmClients.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                لا توجد بيانات عملاء مسجلين حالياً.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', minWidth: '500px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <th style={{ padding: '12px' }}>{t('nameLabel')}</th>
                      <th style={{ padding: '12px' }}>{t('phoneLabel')}</th>
                      <th style={{ padding: '12px' }}>{t('emailLabel')}</th>
                      <th style={{ padding: '12px' }}>{language === 'ar' ? 'تاريخ التسجيل' : 'Registered On'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crmClients.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)', transition: '0.2s', fontSize: '0.95rem' }} className="crm-row">
                        <td style={{ padding: '15px 12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={16} style={{ color: 'var(--accent)' }} /> {c.name}
                        </td>
                        <td style={{ padding: '15px 12px', direction: 'ltr', textAlign: 'right' }}>
                          <Phone size={14} style={{ color: 'var(--text-muted)', marginLeft: '6px', verticalAlign: 'middle' }} />
                          {c.phone}
                        </td>
                        <td style={{ padding: '15px 12px' }}>
                          <Mail size={14} style={{ color: 'var(--text-muted)', marginLeft: '6px', verticalAlign: 'middle' }} />
                          {c.email}
                        </td>
                        <td style={{ padding: '15px 12px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {new Date(c.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        // SETTINGS & ADMIN PORTAL
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '30px',
          alignItems: 'start'
        }}>
          
          {/* Default Profile Update Form */}
          <div className="glass-panel" style={{ padding: '30px', width: '100%', height: '100%' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }} className="gradient-text">
              <Settings size={18} style={{ color: 'var(--accent)' }} /> {language === 'ar' ? 'إعدادات الملف التعريفي للوسيط' : 'Broker Profile Settings'}
            </h3>

            {settingsSuccess && (
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--success)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                {language === 'ar' ? 'تم تحديث بيانات الاتصال بنجاح وتطبيقها في الموقع!' : 'Profile settings saved and synced successfully!'}
              </div>
            )}

            <form onSubmit={handleSaveSettings}>
              <div className="form-group">
                <label className="form-label">{language === 'ar' ? 'الاسم التجاري للوسيط' : 'Broker Public Name'}</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', right: '12px', top: '15px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="form-control" 
                    value={brokerName}
                    onChange={e => setBrokerName(e.target.value)}
                    style={{ paddingRight: '40px' }}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{language === 'ar' ? 'رقم الهاتف للتواصل' : 'Broker Contact Phone'}</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', right: '12px', top: '15px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="form-control" 
                    value={brokerPhone}
                    onChange={e => setBrokerPhone(e.target.value)}
                    style={{ paddingRight: '40px' }}
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '15px' }}>
                {language === 'ar' ? 'حفظ التغييرات ومزامنة الموقع' : 'Save Profiles & Sync'}
              </button>
            </form>
          </div>

          {/* UTM LINK GENERATOR WIDGET */}
          <div className="glass-panel" style={{ padding: '30px', width: '100%', height: '100%' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }} className="gradient-text">
              <Link size={18} style={{ color: 'var(--accent)' }} /> 
              {language === 'ar' ? 'مُولّد روابط التتبع الذكية' : 'UTM Link Generator'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '20px' }}>
              {language === 'ar' ? 'ولد روابط تسويق مخصصة لتتبع حملاتك التسويقية بدقة في الـ CRM.' : 'Generate tracked campaign marketing links.'}
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {[
                { key: 'facebook', label: '🟦 فيسبوك' },
                { key: 'tiktok', label: '🖤 تيك توك' },
                { key: 'instagram', label: '🟪 إنستجرام' },
                { key: 'linkedin', label: '💙 لينكد إن' }
              ].map(p => (
                <button 
                  key={p.key}
                  onClick={() => setSelectedRefPlatform(p.key)}
                  className={`btn ${selectedRefPlatform === p.key ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                className="form-control" 
                value={generatedLink}
                readOnly
                style={{ direction: 'ltr', fontSize: '0.85rem' }}
              />
              <button 
                onClick={handleCopyLink} 
                className="btn"
                style={{
                  backgroundColor: copySuccess ? 'var(--success)' : 'var(--primary)',
                  color: 'white',
                  padding: '8px 15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  border: 'none',
                  minWidth: '110px',
                  justifyContent: 'center'
                }}
              >
                {copySuccess ? <Check size={14} /> : <Copy size={14} />}
                {copySuccess ? (language === 'ar' ? 'تم النسخ! 📋' : 'Copied!') : (language === 'ar' ? 'نسخ الرابط' : 'Copy')}
              </button>
            </div>
          </div>

          {/* Admin Control Form - Adding New Brokers */}
          {isSuperAdmin && (
            <div className="glass-panel" style={{ padding: '30px', width: '100%', border: '2px solid var(--accent)' }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }} className="gradient-text">
                <ShieldAlert size={20} style={{ color: 'var(--accent)' }} /> 
                {language === 'ar' ? 'إنشاء حساب وسيط جديد (لوحة الآدمن)' : 'Create New Broker Account'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '20px' }}>
                {language === 'ar' ? 'تسجيل وسيط عقاري جديد وتخصيص مساحة معزولة له تماماً.' : 'Register a new isolated broker workspace.'}
              </p>

              {adminSuccess && (
                <div style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--success)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  {language === 'ar' ? 'تم إنشاء حساب الوسيط الجديد بنجاح في المنصة!' : 'Broker account created and registered successfully!'}
                </div>
              )}

              {adminError && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: 'var(--danger)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  {adminError}
                </div>
              )}

              <form onSubmit={handleCreateBroker} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">{language === 'ar' ? 'اسم الوسيط بالكامل' : 'Broker Full Name'}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="مثال: يوسف محمد"
                    value={newBrokerName}
                    onChange={e => setNewBrokerName(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{language === 'ar' ? 'البريد الإلكتروني للوسيط' : 'Broker Email'}</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="broker@example.com"
                    value={newBrokerEmail}
                    onChange={e => setNewBrokerEmail(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{language === 'ar' ? 'كلمة المرور الافتراضية' : 'Default Password'}</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="••••••••"
                    value={newBrokerPass}
                    onChange={e => setNewBrokerPass(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{language === 'ar' ? 'رقم الهاتف للتواصل والواتساب' : 'Phone / WhatsApp'}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="01xxxxxxxxx"
                    value={newBrokerPhone}
                    onChange={e => setNewBrokerPhone(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{language === 'ar' ? 'اسم وكالة التسويق / البراند' : 'Agency / Brand Name'}</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={newBrokerAgency}
                    onChange={e => setNewBrokerAgency(e.target.value)}
                    required 
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  {language === 'ar' ? 'تأكيد وإنشاء الحساب' : 'Create Broker Account'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Editor Modal Popup */}
      <AnimatePresence>
        {showEditor && (
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
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel"
              style={{ width: '100%', maxWidth: '600px', padding: '30px', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <h3 style={{ fontSize: '1.4rem', marginBottom: '20px' }} className="gradient-text">
                {editingListing ? 'تعديل بيانات العقار' : 'إضافة عرض عقاري جديد'}
              </h3>

              <form onSubmit={handleSaveListing}>
                <div className="form-group">
                  <label className="form-label">عنوان العرض</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="مثال: فيلا صف أول على البحر" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">الوصف التفصيلي</label>
                  <textarea 
                    className="form-control" 
                    rows={3} 
                    placeholder="تفاصيل المساحة، الاتجاهات، التشطيب، والمميزات الإضافية..." 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    required 
                  />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">السعر (جنيه مصري)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="4500000" 
                      value={price} 
                      onChange={e => setPrice(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">عدد العقارات المتاحة</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="1" 
                      value={unitCount} 
                      onChange={e => setUnitCount(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
                    <label className="form-label">عدد الغرف</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="3" 
                      value={bedrooms} 
                      onChange={e => setBedrooms(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
                    <label className="form-label">عدد الحمامات</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="2" 
                      value={bathrooms} 
                      onChange={e => setBathrooms(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
                    <label className="form-label">المساحة (م²)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="120" 
                      value={area} 
                      onChange={e => setArea(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
                    <label className="form-label">حالة التشطيب</label>
                    <select 
                      className="form-control" 
                      value={finishing} 
                      onChange={e => setFinishing(e.target.value)}
                    >
                      <option value="كامل التشطيب">كامل التشطيب</option>
                      <option value="نصف تشطيب">نصف تشطيب</option>
                      <option value="بدون تشطيب">بدون تشطيب (ع الطوب)</option>
                      <option value="مفروش بالكامل">مفروش بالكامل</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">المحافظة / المدينة الرئيسية</label>
                    <select 
                      className="form-control" 
                      value={selectedGov} 
                      onChange={e => setSelectedGov(e.target.value)}
                    >
                      {GOVERNORATES.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">المنطقة / الحي الفرعي</label>
                    <select 
                      className="form-control" 
                      value={selectedArea} 
                      onChange={e => setSelectedArea(e.target.value)}
                    >
                      {availableAreas.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">رابط صورة العقار</label>
                  <div style={{ position: 'relative' }}>
                    <Image size={18} style={{ position: 'absolute', right: '12px', top: '15px', color: 'var(--text-muted)' }} />
                    <input 
                      type="url" 
                      className="form-control" 
                      placeholder="https://images.unsplash.com/..." 
                      value={imgUrl} 
                      onChange={e => setImgUrl(e.target.value)}
                      style={{ paddingRight: '40px' }} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">الوسوم والكلمات المفتاحية (مفصولة بفاصلة)</label>
                  <div style={{ position: 'relative' }}>
                    <Tag size={18} style={{ position: 'absolute', right: '12px', top: '15px', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="شقة, بيع, تشطيب فاخر" 
                      value={tagsInput} 
                      onChange={e => setTagsInput(e.target.value)}
                      style={{ paddingRight: '40px' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary">حفظ وتأكيد</button>
                  <button type="button" onClick={() => setShowEditor(false)} className="btn btn-secondary">إلغاء</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LEAD DETAILED MODAL PORTAL */}
      <AnimatePresence>
        {selectedLead && (
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
            zIndex: 10000,
            padding: '20px'
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel"
              style={{ width: '100%', maxWidth: '650px', padding: '30px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
            >
              <button 
                onClick={() => setSelectedLead(null)}
                style={{ position: 'absolute', top: '15px', left: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>

              <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }} className="gradient-text">
                {language === 'ar' ? 'التقرير التحليلي الشامل لسلوك العميل' : 'Comprehensive Lead Behavioral Analytics'}
              </h3>

              {/* Profile details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '20px',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'اسم العميل:' : 'Name:'}</div>
                  <strong style={{ fontSize: '1.1rem' }}>👤 {selectedLead.client_name}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'رقم الهاتف والواتساب:' : 'Phone / WhatsApp:'}</div>
                  <strong style={{ fontSize: '1.1rem', direction: 'ltr', display: 'inline-block' }}>📞 {selectedLead.phone}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'البريد الإلكتروني:' : 'Email Address:'}</div>
                  <strong>✉️ {selectedLead.client_name.includes('زائر') ? 'visitor@awtad.com' : 'client@awtad.com'}</strong>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{language === 'ar' ? 'قناة التتبع والتسويق:' : 'Traffic Source:'}</div>
                  <span style={{
                    fontSize: '0.75rem',
                    background: 'rgba(234, 88, 12, 0.15)',
                    color: '#ea580c',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '4px'
                  }}>
                    <Globe size={12} /> {selectedLead.lead_source || 'Direct Web'}
                  </span>
                </div>
              </div>

              {/* Session Timeline logs */}
              <div style={{
                background: 'var(--bg-primary)',
                padding: '15px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                marginBottom: '20px'
              }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} style={{ color: 'var(--accent)' }} /> {language === 'ar' ? 'سجل تفاصيل جلسة التصفح' : 'Session & Activity Times'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>{language === 'ar' ? 'وقت الدخول' : 'Entry Time'}</div>
                    <strong>{selectedLead.login_time || '03:34:00'}</strong>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>{language === 'ar' ? 'آخر نشاط' : 'Last Active'}</div>
                    <strong>{selectedLead.last_active || '03:46:12'}</strong>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>{language === 'ar' ? 'مدة البقاء' : 'Total Duration'}</div>
                    <strong style={{ color: 'var(--primary)' }}>{selectedLead.time_on_site || '0:05 دقيقة'}</strong>
                  </div>
                </div>
              </div>

              {/* CHATBOT HISTORY BUTTON & CONTAINER */}
              <div style={{ marginBottom: '20px' }}>
                <button 
                  onClick={() => setShowChatTranscript(!showChatTranscript)}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)'
                  }}
                >
                  <MessageSquare size={16} />
                  {showChatTranscript 
                    ? (language === 'ar' ? 'إخفاء محادثة المساعد الذكي' : 'Hide Chatbot Transcript')
                    : (language === 'ar' ? 'عرض محادثة المساعد الذكي' : 'View Chatbot Transcript')
                  }
                </button>

                <AnimatePresence>
                  {showChatTranscript && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{
                        background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '15px',
                        marginTop: '10px',
                        border: '1px solid var(--border-color)',
                        maxHeight: '220px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      {(!selectedLead.chat_history || selectedLead.chat_history.length === 0) ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                          {language === 'ar' ? 'لا يوجد تفاعل محادثة مسجل مع البوت لهذا العميل.' : 'No chat history logged for this client.'}
                        </div>
                      ) : (
                        selectedLead.chat_history.map((msg, idx) => {
                          const isUser = msg.startsWith('العميل') || msg.startsWith('user');
                          return (
                            <div key={idx} style={{
                              fontSize: '0.85rem',
                              lineHeight: 1.4,
                              alignSelf: isUser ? 'flex-end' : 'flex-start',
                              backgroundColor: isUser ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              maxWidth: '85%',
                              border: isUser ? 'none' : '1px solid var(--border-color)'
                            }}>
                              {msg}
                            </div>
                          );
                        })
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Chronological Viewed history */}
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '12px' }}>
                  {language === 'ar' ? 'تاريخ العقارات المتصفحة تفصيلياً:' : 'Viewed Property Activity History:'}
                </h4>
                
                {(!selectedLead.viewed_history || selectedLead.viewed_history.length === 0) ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '15px' }}>
                    {language === 'ar' ? 'لم يتم تسجيل تصفح لعقارات معينة بعد.' : 'No property logs recorded yet.'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedLead.viewed_history.map((hist, idx) => (
                      <div key={idx} style={{
                        background: 'var(--bg-secondary)',
                        padding: '12px 15px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>{hist.title}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            💰 {hist.price.toLocaleString('ar-EG')} {t('currency')}
                          </div>
                        </div>
                        <div style={{ textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <div>👀 {hist.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '25px' }}>
                <button onClick={() => setSelectedLead(null)} className="btn btn-secondary">
                  {language === 'ar' ? 'إغلاق التقرير' : 'Close Report'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
