-- ============================================================================
-- MADRAS CITY PLOTS - FINAL SUPABASE SCHEMA (FIXED & TESTED)
-- ============================================================================
-- Complete PostgreSQL database schema for Supabase
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- 
-- This version has all fixes applied:
-- ✅ Safe enum creation (IF NOT EXISTS)
-- ✅ Correct RLS policies (no UUID/TEXT type errors)
-- ✅ All 12 tables ready
-- ============================================================================

-- ============================================================================
-- STEP 0: CREATE STORAGE BUCKET
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
CREATE POLICY "Authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

-- ============================================================================
-- STEP 1: CREATE ENUMS (Safe - skip if exists)
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE property_type AS ENUM ('RESIDENTIAL', 'COMMERCIAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE property_status AS ENUM ('READY_TO_MOVE', 'UNDER_CONSTRUCTION');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM ('NEW', 'CONTACTED', 'NEGOTIATION', 'CONVERTED', 'LOST');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE visit_status AS ENUM ('PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- STEP 3: TABLE - USER_PROFILE (New - for session persistence)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_profile (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL UNIQUE,
  name            TEXT,
  mobile          TEXT,
  last_login      TIMESTAMPTZ,
  last_logout     TIMESTAMPTZ,
  session_data    JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profile_email ON public.user_profile(email);

ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profile;
CREATE POLICY "Users can view own profile"
  ON public.user_profile FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profile;
CREATE POLICY "Users can update own profile"
  ON public.user_profile FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profile;
CREATE POLICY "Users can insert own profile"
  ON public.user_profile FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- STEP 4: TABLE - ADMIN
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email           TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_email ON public.admin(email);
CREATE INDEX IF NOT EXISTS idx_admin_active ON public.admin(active);

ALTER TABLE public.admin ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin;
CREATE POLICY "Admins can view admin users"
  ON public.admin FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin 
      WHERE LOWER(email) = LOWER(auth.jwt()->>'email')
      AND active = true
    )
  );

-- ============================================================================
-- STEP 5: TABLE - PROPERTY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.property (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  property_id     TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  type            property_type NOT NULL DEFAULT 'RESIDENTIAL',
  status          property_status NOT NULL DEFAULT 'UNDER_CONSTRUCTION',
  
  location        TEXT NOT NULL,
  address         TEXT,
  latitude        FLOAT8,
  longitude       FLOAT8,
  
  price           INTEGER NOT NULL,
  area_min        INTEGER,
  area_max        INTEGER,
  plot_size_sqft  INTEGER,
  facing          TEXT,
  dimensions      TEXT,
  approval_status TEXT,
  rera_number     TEXT,
  available_units INTEGER,
  configuration   TEXT,
  
  description     TEXT,
  amenities       TEXT[],
  
  featured        BOOLEAN NOT NULL DEFAULT false,
  views           INTEGER NOT NULL DEFAULT 0,
  
  seo_title       TEXT,
  seo_description TEXT,
  seo_keywords    TEXT,
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_status ON public.property(status);
CREATE INDEX IF NOT EXISTS idx_property_type ON public.property(type);
CREATE INDEX IF NOT EXISTS idx_property_location ON public.property(location);
CREATE INDEX IF NOT EXISTS idx_property_slug ON public.property(slug);
CREATE INDEX IF NOT EXISTS idx_property_featured ON public.property(featured);
CREATE INDEX IF NOT EXISTS idx_property_property_id ON public.property(property_id);

ALTER TABLE public.property ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view all properties" ON public.property;
CREATE POLICY "Anyone can view all properties"
  ON public.property FOR SELECT
  USING (true);

-- ============================================================================
-- STEP 6: TABLE - PROPERTY_IMAGE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.property_image (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  url             TEXT NOT NULL,
  image_order     INTEGER NOT NULL DEFAULT 0,
  property_id     TEXT NOT NULL REFERENCES public.property(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_image_property_id ON public.property_image(property_id);

ALTER TABLE public.property_image ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view property images" ON public.property_image;
CREATE POLICY "Anyone can view property images"
  ON public.property_image FOR SELECT
  USING (true);

-- ============================================================================
-- STEP 7: TABLE - DOCUMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.document (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL,
  url             TEXT NOT NULL,
  type            TEXT,
  property_id     TEXT NOT NULL REFERENCES public.property(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_property_id ON public.document(property_id);

ALTER TABLE public.document ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view property documents" ON public.document;
CREATE POLICY "Anyone can view property documents"
  ON public.document FOR SELECT
  USING (true);

-- ============================================================================
-- STEP 8: TABLE - NEARBY_PLACE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.nearby_place (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  distance_km     FLOAT8 NOT NULL,
  property_id     TEXT NOT NULL REFERENCES public.property(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nearby_place_property_id ON public.nearby_place(property_id);

ALTER TABLE public.nearby_place ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view nearby places" ON public.nearby_place;
CREATE POLICY "Anyone can view nearby places"
  ON public.nearby_place FOR SELECT
  USING (true);

-- ============================================================================
-- STEP 9: TABLE - PROPERTY_VIDEO
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.property_video (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title           TEXT NOT NULL,
  youtube_url     TEXT NOT NULL,
  property_id     TEXT NOT NULL REFERENCES public.property(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_video_property_id ON public.property_video(property_id);

ALTER TABLE public.property_video ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view property videos" ON public.property_video;
CREATE POLICY "Anyone can view property videos"
  ON public.property_video FOR SELECT
  USING (true);

-- ============================================================================
-- STEP 10: TABLE - LEAD
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lead (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL,
  mobile          TEXT NOT NULL,
  email           TEXT NOT NULL,
  message         TEXT,
  status          lead_status NOT NULL DEFAULT 'NEW',
  notes           TEXT,
  follow_up_at    TIMESTAMPTZ,
  property_id     TEXT REFERENCES public.property(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_status ON public.lead(status);
CREATE INDEX IF NOT EXISTS idx_lead_email ON public.lead(email);
CREATE INDEX IF NOT EXISTS idx_lead_mobile ON public.lead(mobile);
CREATE INDEX IF NOT EXISTS idx_lead_property_id ON public.lead(property_id);
CREATE INDEX IF NOT EXISTS idx_lead_created_at ON public.lead(created_at DESC);

ALTER TABLE public.lead ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all leads" ON public.lead;
DROP POLICY IF EXISTS "Anyone can insert a lead" ON public.lead;
DROP POLICY IF EXISTS "Admins can update leads" ON public.lead;

CREATE POLICY "Admins can view all leads"
  ON public.lead FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin 
      WHERE LOWER(email) = LOWER(auth.jwt()->>'email')
      AND active = true
    )
  );

CREATE POLICY "Anyone can insert a lead"
  ON public.lead FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update leads"
  ON public.lead FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin 
      WHERE LOWER(email) = LOWER(auth.jwt()->>'email')
      AND active = true
    )
  );

-- ============================================================================
-- STEP 11: TABLE - SITE_VISIT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.site_visit (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL,
  mobile          TEXT,
  email           TEXT,
  date            TIMESTAMPTZ NOT NULL,
  time_slot       TEXT NOT NULL,
  status          visit_status NOT NULL DEFAULT 'PENDING',
  property_id     TEXT NOT NULL REFERENCES public.property(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_visit_status ON public.site_visit(status);
CREATE INDEX IF NOT EXISTS idx_site_visit_property_id ON public.site_visit(property_id);
CREATE INDEX IF NOT EXISTS idx_site_visit_date ON public.site_visit(date);
CREATE INDEX IF NOT EXISTS idx_site_visit_created_at ON public.site_visit(created_at DESC);

ALTER TABLE public.site_visit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all visits" ON public.site_visit;
DROP POLICY IF EXISTS "Anyone can book a visit" ON public.site_visit;
DROP POLICY IF EXISTS "Admins can update visit status" ON public.site_visit;

CREATE POLICY "Admins can view all visits"
  ON public.site_visit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin 
      WHERE LOWER(email) = LOWER(auth.jwt()->>'email')
      AND active = true
    )
  );

CREATE POLICY "Anyone can book a visit"
  ON public.site_visit FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update visit status"
  ON public.site_visit FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin 
      WHERE LOWER(email) = LOWER(auth.jwt()->>'email')
      AND active = true
    )
  );

-- ============================================================================
-- STEP 12: TABLE - USER_WISHLIST
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_wishlist (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id     TEXT NOT NULL REFERENCES public.property(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_user_wishlist_user_id ON public.user_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wishlist_property_id ON public.user_wishlist(property_id);

ALTER TABLE public.user_wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own wishlist" ON public.user_wishlist;
DROP POLICY IF EXISTS "Users can add to their wishlist" ON public.user_wishlist;
DROP POLICY IF EXISTS "Users can remove from their wishlist" ON public.user_wishlist;

CREATE POLICY "Users can view their own wishlist"
  ON public.user_wishlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their wishlist"
  ON public.user_wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their wishlist"
  ON public.user_wishlist FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 13: TABLE - TESTIMONIAL
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.testimonial (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL,
  role            TEXT,
  rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message         TEXT NOT NULL,
  image_url       TEXT,
  featured        BOOLEAN NOT NULL DEFAULT false,
  approved        BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonial_featured ON public.testimonial(featured);
CREATE INDEX IF NOT EXISTS idx_testimonial_approved ON public.testimonial(approved);
CREATE INDEX IF NOT EXISTS idx_testimonial_created_at ON public.testimonial(created_at DESC);

ALTER TABLE public.testimonial ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved testimonials" ON public.testimonial;
DROP POLICY IF EXISTS "Admins can view all testimonials" ON public.testimonial;

CREATE POLICY "Anyone can view approved testimonials"
  ON public.testimonial FOR SELECT
  USING (approved = true);

CREATE POLICY "Admins can view all testimonials"
  ON public.testimonial FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin 
      WHERE LOWER(email) = LOWER(auth.jwt()->>'email')
      AND active = true
    )
  );

-- ============================================================================
-- STEP 14: TABLE - BUILDER
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.builder (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name            TEXT NOT NULL UNIQUE,
  slug            TEXT NOT NULL UNIQUE,
  logo_url        TEXT,
  description     TEXT,
  website         TEXT,
  phone           TEXT,
  email           TEXT,
  founded_year    INTEGER,
  projects_count  INTEGER DEFAULT 0,
  featured        BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_builder_slug ON public.builder(slug);
CREATE INDEX IF NOT EXISTS idx_builder_featured ON public.builder(featured);

ALTER TABLE public.builder ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view all builders" ON public.builder;
CREATE POLICY "Anyone can view all builders"
  ON public.builder FOR SELECT
  USING (true);

-- ============================================================================
-- STEP 15: HELPER FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS public.is_admin(TEXT);
CREATE OR REPLACE FUNCTION public.is_admin(email_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin
    WHERE LOWER(email) = LOWER(email_param)
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_admin(TEXT) TO authenticated, anon;

-- ============================================================================
-- STEP 16: GRANTS & PERMISSIONS
-- ============================================================================

GRANT SELECT ON public.property TO authenticated, anon;
GRANT SELECT ON public.property_image TO authenticated, anon;
GRANT SELECT ON public.document TO authenticated, anon;
GRANT SELECT ON public.nearby_place TO authenticated, anon;
GRANT SELECT ON public.property_video TO authenticated, anon;
GRANT SELECT ON public.builder TO authenticated, anon;

GRANT INSERT ON public.lead TO authenticated, anon;
GRANT INSERT ON public.site_visit TO authenticated, anon;

-- ============================================================================
-- STEP 17: INITIAL DATA (Optional - Create your superadmin)
-- ============================================================================

-- UNCOMMENT AND MODIFY BEFORE RUNNING:
-- INSERT INTO public.admin (email, name, role, active)
-- VALUES ('your-email@madrascityplots.com', 'Your Name', 'superadmin', true)
-- ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES (Optional - Run to verify everything)
-- ============================================================================

-- Check tables created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Check admin table:
-- SELECT * FROM public.admin;

-- Check function:
-- SELECT EXISTS(SELECT 1 FROM information_schema.routines WHERE routine_name = 'is_admin');

-- ============================================================================
-- SUCCESS!
-- ============================================================================
-- Schema created successfully!
-- Next steps:
-- 1. Create superadmin user (uncomment INSERT above)
-- 2. Configure .env with Supabase credentials
-- 3. Test login at http://localhost:5173/login
-- 4. Deploy when ready!
-- ============================================================================
