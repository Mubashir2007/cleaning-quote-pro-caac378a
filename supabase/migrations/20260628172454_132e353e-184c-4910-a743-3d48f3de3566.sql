
-- Enums
CREATE TYPE public.cleaning_type AS ENUM ('regular','deep','end_of_tenancy','office','airbnb');
CREATE TYPE public.frequency AS ENUM ('one_time','weekly','fortnightly','monthly');
CREATE TYPE public.quote_status AS ENUM ('pending','accepted','rejected','completed');

-- Shared updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES (company profile)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT 'My Cleaning Company',
  company_logo_url TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  business_address TEXT,
  vat_number TEXT,
  currency TEXT NOT NULL DEFAULT 'GBP',
  default_notes TEXT,
  terms_and_conditions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER touch_profiles BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- PRICING SETTINGS
CREATE TABLE public.pricing_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  regular_base NUMERIC(10,2) NOT NULL DEFAULT 80,
  deep_base NUMERIC(10,2) NOT NULL DEFAULT 150,
  end_of_tenancy_base NUMERIC(10,2) NOT NULL DEFAULT 200,
  office_base NUMERIC(10,2) NOT NULL DEFAULT 120,
  airbnb_base NUMERIC(10,2) NOT NULL DEFAULT 90,
  extra_bedroom NUMERIC(10,2) NOT NULL DEFAULT 20,
  extra_bathroom NUMERIC(10,2) NOT NULL DEFAULT 15,
  extra_living_room NUMERIC(10,2) NOT NULL DEFAULT 10,
  oven_cleaning NUMERIC(10,2) NOT NULL DEFAULT 30,
  fridge_cleaning NUMERIC(10,2) NOT NULL DEFAULT 20,
  carpet_cleaning NUMERIC(10,2) NOT NULL DEFAULT 40,
  window_cleaning NUMERIC(10,2) NOT NULL DEFAULT 25,
  balcony NUMERIC(10,2) NOT NULL DEFAULT 15,
  inside_cabinets NUMERIC(10,2) NOT NULL DEFAULT 35,
  garage NUMERIC(10,2) NOT NULL DEFAULT 45,
  discount_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  tax_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pricing_settings TO authenticated;
GRANT ALL ON public.pricing_settings TO service_role;
ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pricing" ON public.pricing_settings FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER touch_pricing BEFORE UPDATE ON public.pricing_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- CUSTOMERS
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  postcode TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own customers" ON public.customers FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX customers_user_idx ON public.customers(user_id);
CREATE TRIGGER touch_customers BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- QUOTES
CREATE SEQUENCE public.quote_number_seq START 1000;

CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  quote_number TEXT NOT NULL DEFAULT ('Q-' || nextval('public.quote_number_seq')),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  cleaning_type public.cleaning_type NOT NULL,
  bedrooms INT NOT NULL DEFAULT 1,
  bathrooms INT NOT NULL DEFAULT 1,
  living_rooms INT NOT NULL DEFAULT 1,
  square_footage INT,
  frequency public.frequency NOT NULL DEFAULT 'one_time',
  extras JSONB NOT NULL DEFAULT '[]'::jsonb,
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  extras_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  bedroom_extra_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  bathroom_extra_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  living_room_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status public.quote_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotes TO authenticated;
GRANT ALL ON public.quotes TO service_role;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own quotes" ON public.quotes FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX quotes_user_idx ON public.quotes(user_id);
CREATE INDEX quotes_status_idx ON public.quotes(user_id, status);
CREATE TRIGGER touch_quotes BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- AUTO-CREATE profile + pricing_settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, company_name, currency)
  VALUES (NEW.id, NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'company_name','My Cleaning Company'),
          'GBP')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.pricing_settings (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
