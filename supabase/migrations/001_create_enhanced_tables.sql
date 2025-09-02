-- Enhanced database schema for commercial FieldFlow

-- Enable RLS on all tables by default
ALTER DATABASE postgres SET row_security = on;

-- Create companies table (enhanced)
CREATE TABLE IF NOT EXISTS companies_ff2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  
  -- Stripe integration fields
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'canceled', 'incomplete')),
  plan_id TEXT DEFAULT 'admin_plan',
  
  -- Usage tracking
  seats_used INTEGER DEFAULT 1,
  seats_total INTEGER DEFAULT 1,
  storage_used_bytes BIGINT DEFAULT 0,
  storage_limit_bytes BIGINT DEFAULT 26843545600, -- 25GB in bytes
  
  -- Billing
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  next_billing_date TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Settings
  settings JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on companies
ALTER TABLE companies_ff2024 ENABLE ROW LEVEL SECURITY;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions_ff2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies_ff2024(id) ON DELETE CASCADE,
  
  -- Stripe fields
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid')),
  
  -- Billing details
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on subscriptions
ALTER TABLE subscriptions_ff2024 ENABLE ROW LEVEL SECURITY;

-- Create enhanced profiles table
CREATE TABLE IF NOT EXISTS profiles_ff2024 (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies_ff2024(id) ON DELETE CASCADE,
  
  -- Profile information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  
  -- Role and permissions
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  permissions JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contact info
  phone_number TEXT,
  
  UNIQUE(company_id, email)
);

-- Enable RLS on profiles
ALTER TABLE profiles_ff2024 ENABLE ROW LEVEL SECURITY;

-- Create clients table (new CRM functionality)
CREATE TABLE IF NOT EXISTS clients_ff2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies_ff2024(id) ON DELETE CASCADE,
  
  -- Client information
  name TEXT NOT NULL,
  email TEXT,
  phone_number TEXT,
  address TEXT,
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles_ff2024(id),
  
  -- Indexing for search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(phone_number, ''))
  ) STORED
);

-- Enable RLS on clients
ALTER TABLE clients_ff2024 ENABLE ROW LEVEL SECURITY;

-- Create index for client search
CREATE INDEX IF NOT EXISTS idx_clients_search ON clients_ff2024 USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients_ff2024 (company_id);

-- Update projects table to reference clients
ALTER TABLE projects_ff2024 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients_ff2024(id) ON DELETE SET NULL;

-- Create index for projects-clients relationship
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects_ff2024 (client_id);

-- RLS Policies for Companies
CREATE POLICY "Companies are viewable by their members" ON companies_ff2024
  FOR SELECT USING (
    id IN (
      SELECT company_id FROM profiles_ff2024 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Companies are updatable by admins" ON companies_ff2024
  FOR UPDATE USING (
    id IN (
      SELECT company_id FROM profiles_ff2024 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Subscriptions  
CREATE POLICY "Subscriptions are viewable by company admins" ON subscriptions_ff2024
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles_ff2024 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Profiles
CREATE POLICY "Profiles are viewable by company members" ON profiles_ff2024
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles_ff2024 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON profiles_ff2024
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can update company profiles" ON profiles_ff2024
  FOR UPDATE USING (
    company_id IN (
      SELECT company_id FROM profiles_ff2024 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Clients
CREATE POLICY "Clients are viewable by company members" ON clients_ff2024
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM profiles_ff2024 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Clients are manageable by company members" ON clients_ff2024
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM profiles_ff2024 
      WHERE id = auth.uid()
    )
  );

-- Update existing table RLS policies to use company_id pattern

-- Projects RLS
DROP POLICY IF EXISTS "Users can view own projects" ON projects_ff2024;
CREATE POLICY "Projects are viewable by company members" ON projects_ff2024
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM profiles_ff2024 
      WHERE company_id = (
        SELECT company_id FROM profiles_ff2024 WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Projects are manageable by company members" ON projects_ff2024
  FOR ALL USING (
    user_id IN (
      SELECT id FROM profiles_ff2024 
      WHERE company_id = (
        SELECT company_id FROM profiles_ff2024 WHERE id = auth.uid()
      )
    )
  );

-- Tasks RLS
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks_ff2024;
CREATE POLICY "Tasks are viewable by company members" ON tasks_ff2024
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects_ff2024 p
      JOIN profiles_ff2024 pr ON p.user_id = pr.id
      WHERE pr.company_id = (
        SELECT company_id FROM profiles_ff2024 WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Tasks are manageable by company members" ON tasks_ff2024
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects_ff2024 p
      JOIN profiles_ff2024 pr ON p.user_id = pr.id
      WHERE pr.company_id = (
        SELECT company_id FROM profiles_ff2024 WHERE id = auth.uid()
      )
    )
  );

-- Daily Logs RLS
DROP POLICY IF EXISTS "Users can view own daily logs" ON daily_logs_ff2024;
CREATE POLICY "Daily logs are viewable by company members" ON daily_logs_ff2024
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects_ff2024 p
      JOIN profiles_ff2024 pr ON p.user_id = pr.id
      WHERE pr.company_id = (
        SELECT company_id FROM profiles_ff2024 WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Daily logs are manageable by company members" ON daily_logs_ff2024
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects_ff2024 p
      JOIN profiles_ff2024 pr ON p.user_id = pr.id
      WHERE pr.company_id = (
        SELECT company_id FROM profiles_ff2024 WHERE id = auth.uid()
      )
    )
  );

-- Time Entries RLS  
DROP POLICY IF EXISTS "Users can view own time entries" ON time_entries_ff2024;
CREATE POLICY "Time entries are viewable by company members" ON time_entries_ff2024
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM profiles_ff2024 
      WHERE company_id = (
        SELECT company_id FROM profiles_ff2024 WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Time entries are manageable by company members" ON time_entries_ff2024
  FOR ALL USING (
    user_id IN (
      SELECT id FROM profiles_ff2024 
      WHERE company_id = (
        SELECT company_id FROM profiles_ff2024 WHERE id = auth.uid()
      )
    )
  );

-- Documents RLS
DROP POLICY IF EXISTS "Users can view own documents" ON documents_ff2024;
CREATE POLICY "Documents are viewable by company members" ON documents_ff2024
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects_ff2024 p
      JOIN profiles_ff2024 pr ON p.user_id = pr.id
      WHERE pr.company_id = (
        SELECT company_id FROM profiles_ff2024 WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Documents are manageable by company members" ON documents_ff2024
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects_ff2024 p
      JOIN profiles_ff2024 pr ON p.user_id = pr.id
      WHERE pr.company_id = (
        SELECT company_id FROM profiles_ff2024 WHERE id = auth.uid()
      )
    )
  );

-- Functions for automation

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies_ff2024 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions_ff2024 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles_ff2024 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients_ff2024 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create a company and admin profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  new_company_id UUID;
BEGIN
  -- Create a new company for the user
  INSERT INTO companies_ff2024 (name)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'company', NEW.email || '''s Company'))
  RETURNING id INTO new_company_id;
  
  -- Create the admin profile
  INSERT INTO profiles_ff2024 (
    id, 
    company_id, 
    name, 
    email, 
    role
  )
  VALUES (
    NEW.id,
    new_company_id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    'admin'
  );
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_signup();

-- Function to update company storage usage
CREATE OR REPLACE FUNCTION update_company_storage_usage(company_uuid UUID)
RETURNS void AS $$
DECLARE
  total_storage BIGINT;
BEGIN
  -- Calculate total storage used by company
  SELECT COALESCE(SUM(size_bytes), 0) INTO total_storage
  FROM documents_ff2024 d
  JOIN projects_ff2024 p ON d.project_id = p.id
  JOIN profiles_ff2024 pr ON p.user_id = pr.id
  WHERE pr.company_id = company_uuid;
  
  -- Update company storage usage
  UPDATE companies_ff2024 
  SET storage_used_bytes = total_storage,
      updated_at = NOW()
  WHERE id = company_uuid;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create sample data for demo company
DO $$
DECLARE
  demo_company_id UUID;
  demo_user_id UUID := '550e8400-e29b-41d4-a716-446655440000'::UUID; -- Fixed UUID for demo
  demo_client_id UUID;
BEGIN
  -- Create demo company if it doesn't exist
  INSERT INTO companies_ff2024 (
    id,
    name,
    subscription_status,
    plan_id,
    seats_used,
    seats_total,
    storage_used_bytes,
    storage_limit_bytes
  )
  VALUES (
    '123e4567-e89b-12d3-a456-426614174000'::UUID,
    'Demo Construction Co.',
    'active',
    'admin_plan',
    3,
    5,
    13421772800, -- 12.5 GB in bytes
    37580963840  -- 35 GB in bytes (25 base + 2 users * 5GB)
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    subscription_status = EXCLUDED.subscription_status;
    
  demo_company_id := '123e4567-e89b-12d3-a456-426614174000'::UUID;

  -- Create demo clients
  INSERT INTO clients_ff2024 (
    id,
    company_id,
    name,
    email,
    phone_number,
    address,
    notes
  )
  VALUES 
    (
      gen_random_uuid(),
      demo_company_id,
      'Johnson Family',
      'sarah.johnson@email.com',
      '(555) 123-4567',
      '123 Oak Street, Springfield, IL 62701',
      'Preferred client - always pays on time. Interested in future landscaping projects.'
    ),
    (
      gen_random_uuid(),
      demo_company_id,
      'Springfield Business Park',
      'maintenance@springfieldpark.com',
      '(555) 987-6543',
      '456 Business Drive, Springfield, IL 62702',
      'Commercial client - requires all work to be completed after business hours.'
    ),
    (
      gen_random_uuid(),
      demo_company_id,
      'Smith Residence',
      'mike.smith@email.com',
      '(555) 555-0123',
      '789 Maple Ave, Springfield, IL 62703',
      'New client - referred by Johnson Family. Very detail-oriented.'
    )
  ON CONFLICT DO NOTHING;

END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_stripe_customer_id ON companies_ff2024 (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_company_id ON subscriptions_ff2024 (company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions_ff2024 (stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles_ff2024 (company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles_ff2024 (email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles_ff2024 (role);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Refresh RLS policies
SELECT pg_reload_conf();