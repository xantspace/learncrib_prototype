-- LearnCrib MVP Database Schema (PostgreSQL)
-- Generated: 2026-04-10
-- Based on: Backend Logic Specification v1.0

-- ENUMS for Status Management
CREATE TYPE account_status AS ENUM ('active', 'suspended');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE session_status AS ENUM ('pending_approval', 'awaiting_payment', 'scheduled', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'successful', 'failed', 'refunded');
CREATE TYPE payout_status AS ENUM ('pending', 'held', 'released', 'paid', 'withheld');
CREATE TYPE actor_type AS ENUM ('parent', 'tutor', 'system');
CREATE TYPE dispute_status AS ENUM ('open', 'resolved');

-- 1. PARENTS
CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status account_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STUDENTS
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    grade_level VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TUTORS
CREATE TABLE tutors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    subjects TEXT[] NOT NULL,
    hourly_rate DECIMAL(12, 2) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(20) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    verification verification_status DEFAULT 'pending',
    status account_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SESSIONS
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES parents(id),
    student_id UUID REFERENCES students(id),
    tutor_id UUID REFERENCES tutors(id),
    subject VARCHAR(100) NOT NULL,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    total_cost DECIMAL(12, 2) NOT NULL,
    platform_fee DECIMAL(12, 2) NOT NULL,
    tutor_payout_amount DECIMAL(12, 2) NOT NULL,
    status session_status DEFAULT 'pending_approval',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT
);

-- 5. PAYMENT RECORDS (Parent -> Platform)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id),
    parent_id UUID REFERENCES parents(id),
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    provider VARCHAR(50),
    provider_reference TEXT UNIQUE,
    status payment_status DEFAULT 'pending',
    initiated_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    refund_amount DECIMAL(12, 2)
);

-- 6. PAYOUT RECORDS (Platform -> Tutor)
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id),
    tutor_id UUID REFERENCES tutors(id),
    amount DECIMAL(12, 2) NOT NULL,
    status payout_status DEFAULT 'pending',
    scheduled_date DATE,
    released_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    bank_reference TEXT
);

-- 7. DISPUTE RECORDS
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id),
    raised_by_type actor_type NOT NULL,
    raised_by_id UUID NOT NULL,
    reason VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status dispute_status DEFAULT 'open',
    resolution_details TEXT,
    parent_refund_amount DECIMAL(12, 2) DEFAULT 0,
    tutor_payment_amount DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 8. SESSION LOGS (Audit Trail)
CREATE TABLE session_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    actor_type actor_type NOT NULL,
    actor_id UUID,
    action VARCHAR(100) NOT NULL,
    status_before session_status,
    status_after session_status,
    event_details JSONB
);
