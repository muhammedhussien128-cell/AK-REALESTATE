-- PostgreSQL Multi-Tenant SaaS schema script for Semsar 2.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenant/Companies registry
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(50) DEFAULT '#1e4164',
    secondary_color VARCHAR(50) DEFAULT '#7dcbc1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users (scoped to tenant)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('broker', 'client')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Listings (scoped to tenant)
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    broker_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    unit_count INTEGER DEFAULT 1,
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    area INTEGER DEFAULT 0,
    finishing VARCHAR(100) DEFAULT 'كامل التشطيب',
    status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'reserved', 'sold')) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Images (scoped to listings)
CREATE TABLE listing_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leads & Tour Bookings (scoped to tenant)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    listing_title VARCHAR(255) NOT NULL,
    client_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    preferred_date VARCHAR(50) NOT NULL,
    preferred_time VARCHAR(50) NOT NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('New', 'Contacted', 'Viewing', 'Negotiation', 'Sold', 'Lost')) DEFAULT 'New',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
