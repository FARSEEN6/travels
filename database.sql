-- Run this in your Supabase SQL Editor to set up your entire database!

-- 1. Create Destinations Table
CREATE TABLE IF NOT EXISTS public.destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  country TEXT,
  airport_name TEXT,
  price TEXT,
  category TEXT DEFAULT 'INTERNATIONAL',
  image_url TEXT,
  icon TEXT DEFAULT 'location_city',
  gradient TEXT DEFAULT 'from-[#1a1a2e] to-[#16213e]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Flights Table
CREATE TABLE IF NOT EXISTS public.flights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  airline TEXT NOT NULL,
  flight_no TEXT NOT NULL,
  origin_code TEXT NOT NULL REFERENCES public.destinations(code),
  dest_code TEXT NOT NULL REFERENCES public.destinations(code),
  dep_time TEXT NOT NULL,
  arr_time TEXT NOT NULL,
  duration TEXT,
  duration_min INTEGER,
  stops INTEGER DEFAULT 0,
  stop_details TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  chips JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Airline Partners Table
CREATE TABLE IF NOT EXISTS public.airline_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  commission TEXT,
  alliance TEXT,
  route_focus TEXT,
  is_premium BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (Security Rules)
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airline_partners ENABLE ROW LEVEL SECURITY;

-- 5. Give your website permission to READ the data
CREATE POLICY "Allow public read access on destinations" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Allow public read access on flights" ON public.flights FOR SELECT USING (true);
CREATE POLICY "Allow public read access on airline_partners" ON public.airline_partners FOR SELECT USING (true);

-- 6. Give your website Admin Dashboard permission to INSERT data
CREATE POLICY "Allow public insert access on destinations" ON public.destinations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access on flights" ON public.flights FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access on airline_partners" ON public.airline_partners FOR INSERT WITH CHECK (true);

-- 7. Give your website Admin Dashboard permission to DELETE data
CREATE POLICY "Allow public delete access on destinations" ON public.destinations FOR DELETE USING (true);
CREATE POLICY "Allow public delete access on flights" ON public.flights FOR DELETE USING (true);
CREATE POLICY "Allow public delete access on airline_partners" ON public.airline_partners FOR DELETE USING (true);

-- 8. Give your website Admin Dashboard permission to UPDATE data
CREATE POLICY "Allow public update access on destinations" ON public.destinations FOR UPDATE USING (true);
CREATE POLICY "Allow public update access on flights" ON public.flights FOR UPDATE USING (true);
CREATE POLICY "Allow public update access on airline_partners" ON public.airline_partners FOR UPDATE USING (true);

-- 9. Create Tickets Table
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination_id UUID NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  date TEXT,
  airline TEXT,
  airline_logo_url TEXT,
  from_city TEXT,
  from_code TEXT,
  departure_time TEXT,
  to_city TEXT,
  to_code TEXT,
  arrival_time TEXT,
  available_seats INTEGER,
  price TEXT,
  luggage TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and Policies for Tickets
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on tickets" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on tickets" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete access on tickets" ON public.tickets FOR DELETE USING (true);
CREATE POLICY "Allow public update access on tickets" ON public.tickets FOR UPDATE USING (true);

-- 10. Create Registered Users Table (for multi-step registration gate)
CREATE TABLE IF NOT EXISTS public.registered_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL UNIQUE,
  id_type TEXT NOT NULL CHECK (id_type IN ('PAN', 'AADHAAR')),
  id_number TEXT NOT NULL,
  id_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  auth_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and Policies for Registered Users
ALTER TABLE public.registered_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on registered_users" ON public.registered_users FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on registered_users" ON public.registered_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on registered_users" ON public.registered_users FOR UPDATE USING (true);
