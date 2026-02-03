-- Complete Supabase Database Schema for Home Appliance Maintenance App

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('customer', 'technician', 'admin');
CREATE TYPE technician_status AS ENUM ('pending', 'active', 'suspended', 'blocked');
CREATE TYPE issue_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE issue_status AS ENUM ('pending', 'assigned', 'accepted', 'ongoing', 'completed', 'cancelled', 'force_completed');
CREATE TYPE payment_status AS ENUM ('pending', 'held', 'released', 'refunded');
CREATE TYPE part_category AS ENUM ('HA', 'SHA', 'Tool', 'Maintenance', 'Accessory');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE order_payment_status AS ENUM ('pending', 'paid', 'failed');
CREATE TYPE complaint_type AS ENUM ('complaint', 'refund_request', 'system_issue');
CREATE TYPE complaint_severity AS ENUM ('low', 'medium', 'high');
CREATE TYPE complaint_status AS ENUM ('open', 'investigating', 'resolved', 'rejected');

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255),
  password_hash VARCHAR(255),
  address TEXT,
  role user_role DEFAULT 'customer',
  otp_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  profile_image TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on phone for faster lookups
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- Technicians Table (Extended Profile)
CREATE TABLE technicians (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  government_id_image TEXT NOT NULL,
  government_id_verified BOOLEAN DEFAULT FALSE,
  skills TEXT[] NOT NULL, -- up to 15 skills
  working_areas TEXT[], -- districts/areas
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(2,1) DEFAULT 5.0,
  total_ratings INT DEFAULT 0,
  status technician_status DEFAULT 'pending',
  joined_date TIMESTAMP DEFAULT NOW()
);

-- Create indexes for technician search
CREATE INDEX idx_technicians_status ON technicians(status);
CREATE INDEX idx_technicians_skills ON technicians USING GIN(skills);
CREATE INDEX idx_technicians_location ON technicians(latitude, longitude);

-- Issues/Jobs Table
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
  
  -- Issue Details
  appliance_type VARCHAR(100) NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  issue_description TEXT NOT NULL,
  priority issue_priority DEFAULT 'medium',
  images TEXT[], -- up to 20MB total
  
  -- Address
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Status Flow
  status issue_status DEFAULT 'pending',
  
  -- Timers
  created_at TIMESTAMP DEFAULT NOW(),
  assigned_at TIMESTAMP,
  accepted_at TIMESTAMP,
  acceptance_deadline TIMESTAMP, -- 1 hour from assignment
  completed_at TIMESTAMP,
  
  -- Scheduling
  scheduled_date DATE,
  scheduled_time TIME,
  
  -- Completion Evidence
  completion_summary TEXT,
  completion_photos TEXT[],
  completion_video TEXT,
  completion_audio TEXT,
  
  -- Payment
  estimated_cost DECIMAL(10,2),
  final_cost DECIMAL(10,2),
  payment_status payment_status DEFAULT 'pending',
  payment_hold_until TIMESTAMP, -- 7-15 days hold
  
  -- Rating
  rating INT CHECK (rating >= 1 AND rating <= 5),
  rating_comment TEXT,
  rated_at TIMESTAMP
);

-- Create indexes for issue queries
CREATE INDEX idx_issues_customer ON issues(customer_id);
CREATE INDEX idx_issues_technician ON issues(technician_id);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_created ON issues(created_at DESC);
CREATE INDEX idx_issues_location ON issues(latitude, longitude);

-- Spare Parts Table
CREATE TABLE spare_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category part_category NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 10,
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for parts category
CREATE INDEX idx_spare_parts_category ON spare_parts(category);
CREATE INDEX idx_spare_parts_stock ON spare_parts(stock);

-- Orders Table (Spare Parts E-commerce)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  items JSONB NOT NULL, -- [{part_id, quantity, price}]
  total_amount DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'pending',
  shipping_address TEXT,
  payment_method VARCHAR(50), -- 'manual', 'esewa' (future)
  payment_status order_payment_status DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for orders
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Complaints Table
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filed_by UUID REFERENCES users(id) ON DELETE CASCADE,
  against_user UUID REFERENCES users(id) ON DELETE SET NULL,
  issue_id UUID REFERENCES issues(id) ON DELETE SET NULL,
  type complaint_type NOT NULL,
  description TEXT NOT NULL,
  severity complaint_severity DEFAULT 'medium',
  status complaint_status DEFAULT 'open',
  resolution TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Create indexes for complaints
CREATE INDEX idx_complaints_filed_by ON complaints(filed_by);
CREATE INDEX idx_complaints_against ON complaints(against_user);
CREATE INDEX idx_complaints_issue ON complaints(issue_id);
CREATE INDEX idx_complaints_status ON complaints(status);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate technician rating
CREATE OR REPLACE FUNCTION update_technician_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.rating IS NOT NULL AND OLD.rating IS NULL THEN
        UPDATE technicians
        SET 
            total_ratings = total_ratings + 1,
            rating = (
                SELECT AVG(rating)::DECIMAL(2,1)
                FROM issues
                WHERE technician_id = NEW.technician_id AND rating IS NOT NULL
            )
        WHERE id = NEW.technician_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update technician rating when issue is rated
CREATE TRIGGER update_technician_rating_trigger AFTER UPDATE ON issues
    FOR EACH ROW
    WHEN (NEW.rating IS NOT NULL AND OLD.rating IS NULL)
    EXECUTE FUNCTION update_technician_rating();

-- Insert default admin user (password: admin123 - should be changed in production)
INSERT INTO users (name, phone, email, password_hash, role, otp_verified, email_verified)
VALUES (
    'Admin User',
    '9999999999',
    'admin@maintainance.app',
    '$2b$10$rBV2xMlc3q0U1YtKJNjJh.XJ5QHC7zPZVz6qMVMFVxKX0Y8K2L3Iq', -- bcrypt hash of 'admin123'
    'admin',
    true,
    true
);

-- Create view for active technicians with skills
CREATE VIEW active_technicians AS
SELECT 
    t.*,
    u.name,
    u.phone,
    u.email,
    u.address as tech_address
FROM technicians t
JOIN users u ON t.id = u.id
WHERE t.status = 'active' AND t.government_id_verified = true;

-- Create view for issue details with user info
CREATE VIEW issue_details AS
SELECT 
    i.*,
    c.name as customer_name,
    c.phone as customer_phone,
    c.email as customer_email,
    t.name as technician_name,
    t.phone as technician_phone,
    tech.rating as technician_rating
FROM issues i
JOIN users c ON i.customer_id = c.id
LEFT JOIN users t ON i.technician_id = t.id
LEFT JOIN technicians tech ON i.technician_id = tech.id;
