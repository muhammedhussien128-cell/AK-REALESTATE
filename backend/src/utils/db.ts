import fs from 'fs';
import path from 'path';

const BUCKET_ID = process.env.KV_BUCKET_ID || 'ak_realestate_dev_db';
const KV_URL = `https://kvdb.io/${BUCKET_ID}`;

const leadsFilePath = path.join(__dirname, '../../leads.json');
const listingsFilePath = path.join(__dirname, '../../listings.json');
const clientsFilePath = path.join(__dirname, '../../clients.json');
const projectsFilePath = path.join(__dirname, '../../projects.json');
const devProfilesFilePath = path.join(__dirname, '../../dev_profiles.json');

export let memoryLeads: any[] = [];
export let memoryListings: any[] = [];
export let memoryClients: any[] = [];
export let memoryProjects: any[] = [];
export let memoryDevProfiles: any[] = [];
export let memoryInitialized = false;

export const initMemory = async () => {
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
    if (fs.existsSync(devProfilesFilePath)) {
      memoryDevProfiles = JSON.parse(fs.readFileSync(devProfilesFilePath, 'utf-8'));
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
      if (Array.isArray(kvLeads)) memoryLeads = kvLeads;
    }
  } catch (e) {}
  try {
    const clientsRes = await fetch(`${KV_URL}/clients`);
    if (clientsRes.ok) {
      const kvClients = await clientsRes.json();
      if (Array.isArray(kvClients)) memoryClients = kvClients;
    }
  } catch (e) {}
  try {
    const listingsRes = await fetch(`${KV_URL}/listings`);
    if (listingsRes.ok) {
      const kvListings = await listingsRes.json();
      if (Array.isArray(kvListings)) memoryListings = kvListings;
    }
  } catch (e) {}
  try {
    const projectsRes = await fetch(`${KV_URL}/projects`);
    if (projectsRes.ok) {
      const kvProjects = await projectsRes.json();
      if (Array.isArray(kvProjects)) memoryProjects = kvProjects;
    }
  } catch (e) {}
  try {
    const devProfilesRes = await fetch(`${KV_URL}/dev_profiles`);
    if (devProfilesRes.ok) {
      const kvDevProfiles = await devProfilesRes.json();
      if (Array.isArray(kvDevProfiles)) memoryDevProfiles = kvDevProfiles;
    }
  } catch (e) {}

  memoryInitialized = true;
};

// Leads helpers
export const loadLeads = async (): Promise<any[]> => {
  await initMemory();
  return memoryLeads;
};

export const saveLeadsList = async (leads: any[]) => {
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

// Listings helpers
export const loadListings = async (): Promise<any[]> => {
  await initMemory();
  return memoryListings;
};

export const saveListingsList = async (listings: any[]) => {
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

// Clients helpers
export const loadClients = async (): Promise<any[]> => {
  await initMemory();
  return memoryClients;
};

export const saveClientsList = async (clients: any[]) => {
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

// Projects helpers
export const loadProjects = async (): Promise<any[]> => {
  await initMemory();
  return memoryProjects;
};

export const saveProjectsList = async (projects: any[]) => {
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

// Dev profiles helpers
export const loadDevProfiles = async (): Promise<any[]> => {
  await initMemory();
  return memoryDevProfiles;
};

export const saveDevProfilesList = async (profiles: any[]) => {
  await initMemory();
  memoryDevProfiles = profiles;
  try {
    await fetch(`${KV_URL}/dev_profiles`, {
      method: 'POST',
      body: JSON.stringify(profiles),
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {}
  try {
    fs.writeFileSync(devProfilesFilePath, JSON.stringify(profiles, null, 2), 'utf-8');
  } catch (e) {}
};
