-- LearnCrib MVP Database Schema (PostgreSQL)
-- Version: 1.1 (Updated to match Unified Auth & Django Implementation)
-- Generated: 2026-04-10
-- Based on: backend_flow.md (v1.0) and Django Models

-- ENUMS for Status Management
CREATE TYPE account_role AS ENUM ('STUDENT', 'TUTOR', 'ADMIN');
CREATE TYPE verification_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE session_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED');
CREATE TYPE payout_status AS ENUM ('SCHEDULED', 'PROCESSED', 'FAILED', 'HELD', 'PAID');
CREATE TYPE dispute_status AS ENUM ('OPEN', 'RESOLVED', 'CLOSED');

-- 1. UNIFIED USERS (Auth Layer)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    role account_role DEFAULT 'STUDENT',
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_superuser BOOLEAN DEFAULT FALSE,
    date_joined TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- 2. PARENT PROFILES
CREATE TABLE parent_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STUDENTS (Managed by Parents)
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES parent_profiles(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    grade_level VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TUTOR PROFILES
CREATE TABLE tutor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    subjects JSONB DEFAULT '[]', -- List of subjects
    hourly_rate DECIMAL(12, 2) NOT NULL,
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    is_approved BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    verification_status verification_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SESSIONS (Bookings)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES parent_profiles(id),
    student_id UUID NOT NULL REFERENCES students(id),
    tutor_id UUID NOT NULL REFERENCES tutor_profiles(id),
    subject VARCHAR(200) NOT NULL,
    status session_status DEFAULT 'PENDING',
    scheduled_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PAYMENT RECORDS (Parent -> Platform)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID UNIQUE NOT NULL REFERENCES sessions(id),
    parent_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(12, 2) NOT NULL,
    provider VARCHAR(50) DEFAULT 'paystack',
    provider_reference VARCHAR(100) UNIQUE NOT NULL,
    status payment_status DEFAULT 'PENDING',
    initiated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 7. PAYOUT RECORDS (Platform -> Tutor)
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES tutor_profiles(id),
    session_id UUID UNIQUE NOT NULL REFERENCES sessions(id),
    amount DECIMAL(12, 2) NOT NULL,
    status payout_status DEFAULT 'SCHEDULED',
    scheduled_date DATE,
    processed_at TIMESTAMPTZ
);

-- 8. DISPUTE RECORDS
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID UNIQUE NOT NULL REFERENCES sessions(id),
    raised_by_type VARCHAR(50) NOT NULL, -- 'PARENT' or 'TUTOR'
    reason TEXT NOT NULL,
    status dispute_status DEFAULT 'OPEN',
    resolution_details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 9. SESSION LOGS (Audit Trail)
CREATE TABLE session_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id),
    action VARCHAR(100) NOT NULL,
    actor_type VARCHAR(50) NOT NULL, -- 'ADMIN', 'TUTOR', 'PARENT'
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
