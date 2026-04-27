-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enums
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('CUSTOMER', 'HOSPITAL', 'TPA', 'ADMIN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'claim_type') THEN
        CREATE TYPE claim_type AS ENUM ('CASHLESS', 'REIMBURSEMENT');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'claim_status') THEN
        CREATE TYPE claim_status AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'NEED_MORE_INFO', 'APPROVED', 'REJECTED', 'SETTLED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
        CREATE TYPE document_type AS ENUM ('BILL', 'LAB_REPORT', 'DISCHARGE_SUMMARY', 'PRESCRIPTION', 'ID_PROOF', 'OTHER');
    END IF;
END $$;

-- Hospitals Table
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  is_network BOOLEAN DEFAULT TRUE,
  contact_details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles Table (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role DEFAULT 'CUSTOMER',
  phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  hospital_id UUID REFERENCES public.hospitals(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policies Table
CREATE TABLE IF NOT EXISTS public.policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  coverage_amount DECIMAL NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Claims Table
CREATE TABLE IF NOT EXISTS public.claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  policy_id UUID REFERENCES public.policies(id) NOT NULL,
  hospital_id UUID REFERENCES public.hospitals(id),
  tpa_id UUID REFERENCES public.profiles(id),
  type claim_type NOT NULL,
  status claim_status DEFAULT 'DRAFT',
  diagnosis TEXT NOT NULL,
  admission_date DATE,
  discharge_date DATE,
  amount_claimed DECIMAL NOT NULL,
  amount_approved DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_status_change_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID REFERENCES public.claims(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  document_type document_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Claim Reviews Table
CREATE TABLE IF NOT EXISTS public.claim_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID REFERENCES public.claims(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id),
  role user_role NOT NULL,
  status_before claim_status,
  status_after claim_status,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID REFERENCES public.claims(id) UNIQUE,
  amount DECIMAL NOT NULL,
  payment_mode TEXT NOT NULL,
  transaction_ref TEXT NOT NULL,
  paid_to TEXT NOT NULL,
  status TEXT DEFAULT 'COMPLETED',
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email, (new.raw_user_meta_data->>'role')::user_role);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
