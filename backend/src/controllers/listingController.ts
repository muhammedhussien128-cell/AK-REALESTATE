import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { TenantRequest } from '../middleware/tenant';
import { tempUserStore } from './authController';
import { loadListings, saveListingsList } from '../utils/db';

export interface Listing {
  id: string;
  tenant_id: string;
  broker_id: string;
  broker_name: string;
  broker_phone?: string; // Included dynamically
  title: string;
  description: string;
  price: number;
  location: string;
  unit_count: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  finishing: string;
  status: 'available' | 'reserved' | 'sold';
  images: string[];
  tags: string[];
  created_at: string;
}

// Helper to inject up-to-date broker details from tempUserStore
const injectBrokerDetails = (listing: Listing): Listing => {
  const broker = tempUserStore.find(u => u.id === listing.broker_id);
  if (broker) {
    return {
      ...listing,
      broker_name: broker.name,
      broker_phone: broker.phone
    };
  }
  return listing;
};

export const getAllListings = async (req: TenantRequest, res: Response) => {
  let listings = await loadListings();
  
  listings = listings.filter(l => l.tenant_id === req.tenantId);

  const { search, location, minPrice, maxPrice, status, type } = req.query;

  if (search) {
    const q = (search as string).toLowerCase();
    listings = listings.filter(l => 
      l.title.toLowerCase().includes(q) || 
      l.description.toLowerCase().includes(q)
    );
  }

  if (location && location !== 'الكل') {
    listings = listings.filter(l => l.location === location);
  }

  if (minPrice) {
    listings = listings.filter(l => l.price >= Number(minPrice));
  }

  if (maxPrice) {
    listings = listings.filter(l => l.price <= Number(maxPrice));
  }

  if (status) {
    listings = listings.filter(l => l.status === status);
  }

  if (type) {
    listings = listings.filter(l => l.tags.includes(type as string));
  }

  // Map listings to inject dynamic broker name and phone from tempUserStore
  const detailedListings = listings.map(injectBrokerDetails);

  return res.json(detailedListings);
};

export const getListingById = async (req: TenantRequest, res: Response) => {
  const listings = await loadListings();
  const listing = listings.find(l => l.tenant_id === req.tenantId && l.id === req.params.id);
  if (!listing) {
    return res.status(404).json({ message: 'العقار غير موجود.' });
  }
  return res.json(injectBrokerDetails(listing));
};

export const createListing = async (req: AuthenticatedRequest & TenantRequest, res: Response) => {
  const { title, description, price, location, unit_count, bedrooms, bathrooms, area, finishing, images, tags } = req.body;

  if (!title || !description || !price || !location) {
    return res.status(400).json({ message: 'يرجى ملء جميع الحقول المطلوبة لإنشاء عقار.' });
  }

  const listings = await loadListings();

  const newListing: Listing = {
    id: Math.random().toString(36).substr(2, 9),
    tenant_id: req.tenantId!,
    broker_id: req.user!.id,
    broker_name: req.user!.email.split('@')[0],
    title,
    description,
    price: Number(price),
    location,
    unit_count: Number(unit_count) || 1,
    bedrooms: Number(bedrooms) || 0,
    bathrooms: Number(bathrooms) || 0,
    area: Number(area) || 0,
    finishing: finishing || 'كامل التشطيب',
    status: 'available',
    images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'],
    tags: tags || [],
    created_at: new Date().toISOString()
  };

  listings.unshift(newListing);
  await saveListingsList(listings);

  return res.status(201).json(injectBrokerDetails(newListing));
};

export const updateListing = async (req: AuthenticatedRequest & TenantRequest, res: Response) => {
  const { id } = req.params;
  const listings = await loadListings();
  const index = listings.findIndex(l => l.tenant_id === req.tenantId && l.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'العقار غير موجود.' });
  }

  if (listings[index].tenant_id !== req.tenantId) {
    return res.status(403).json({ message: 'غير مصرح لك بتعديل هذا العقار.' });
  }

  listings[index] = {
    ...listings[index],
    ...req.body,
    id: listings[index].id,
    tenant_id: listings[index].tenant_id,
    broker_id: listings[index].broker_id
  };

  await saveListingsList(listings);
  return res.json(injectBrokerDetails(listings[index]));
};

export const deleteListing = async (req: AuthenticatedRequest & TenantRequest, res: Response) => {
  const { id } = req.params;
  const listings = await loadListings();
  const index = listings.findIndex(l => l.tenant_id === req.tenantId && l.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'العقار غير موجود.' });
  }

  if (listings[index].tenant_id !== req.tenantId) {
    return res.status(403).json({ message: 'غير مصرح لك بحذف هذا العقار.' });
  }

  listings.splice(index, 1);
  await saveListingsList(listings);

  return res.json({ message: 'تم حذف العقار بنجاح.' });
};
