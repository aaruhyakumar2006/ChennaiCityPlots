-- ============================================================
-- Prabhadhivya Homes – Supabase Schema
-- Run this ONCE in your Supabase project: SQL Editor → New Query
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────
CREATE TYPE property_type   AS ENUM ('RESIDENTIAL', 'COMMERCIAL');
CREATE TYPE property_status AS ENUM ('READY_TO_MOVE', 'UNDER_CONSTRUCTION');
CREATE TYPE lead_status     AS ENUM ('NEW', 'CONTACTED', 'NEGOTIATION', 'CONVERTED', 'LOST');
CREATE TYPE visit_status    AS ENUM ('PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED');

-- ── Builders / Developers ─────────────────────────────────────
-- Created BEFORE properties so the FK reference works
CREATE TABLE builders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT NOT NULL,
  slug               TEXT UNIQUE NOT NULL,
  logo_url           TEXT,
  description        TEXT,
  established_year   INT,
  total_projects     INT DEFAULT 0,
  delivered_projects INT DEFAULT 0,
  website            TEXT,
  phone              TEXT,
  email              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_builders_slug ON builders(slug);

-- ── Properties ────────────────────────────────────────────────
CREATE TABLE properties (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  type            property_type   NOT NULL,
  status          property_status NOT NULL,

  -- Location
  location        TEXT NOT NULL,
  address         TEXT,
  latitude        FLOAT,
  longitude       FLOAT,

  -- Builder link
  builder_id      UUID REFERENCES builders(id) ON DELETE SET NULL,

  -- Pricing & size
  price           BIGINT NOT NULL,
  area_min        INT,
  area_max        INT,
  plot_size_sqft  INT,
  facing          TEXT,
  dimensions      TEXT,

  -- Project details
  approval_status TEXT,
  rera_number     TEXT,
  available_units INT,
  configuration   TEXT,
  possession_year INT,

  -- Content
  description     TEXT NOT NULL,
  amenities       TEXT[] NOT NULL DEFAULT '{}',

  -- Flags
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  views           INT     NOT NULL DEFAULT 0,

  -- SEO
  seo_title       TEXT,
  seo_description TEXT,
  seo_keywords    TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_properties_status      ON properties(status);
CREATE INDEX idx_properties_type        ON properties(type);
CREATE INDEX idx_properties_location    ON properties(location);
CREATE INDEX idx_properties_featured    ON properties(featured);
CREATE INDEX idx_properties_builder     ON properties(builder_id);
CREATE INDEX idx_properties_possession  ON properties(possession_year);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Property Images ───────────────────────────────────────────
-- image_type: 'photo' (default) or 'floor_plan'
CREATE TABLE property_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url         TEXT NOT NULL,
  sort_order  INT  NOT NULL DEFAULT 0,
  image_type  TEXT NOT NULL DEFAULT 'photo',
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE
);

CREATE INDEX idx_images_property ON property_images(property_id);

-- ── Documents ────────────────────────────────────────────────
CREATE TABLE documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  url         TEXT NOT NULL,
  type        TEXT,           -- brochure | legal | dtcp | rera | layout
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE
);

-- ── Nearby Places ─────────────────────────────────────────────
CREATE TABLE nearby_places (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT  NOT NULL,
  category    TEXT  NOT NULL,  -- School | Hospital | Metro | Shopping | Highway | Tech Park
  distance_km FLOAT NOT NULL,
  property_id UUID  NOT NULL REFERENCES properties(id) ON DELETE CASCADE
);

-- ── Property Videos ───────────────────────────────────────────
CREATE TABLE property_videos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE
);

-- ── Property Reviews ──────────────────────────────────────────
CREATE TABLE property_reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  rating      INT  NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_property ON property_reviews(property_id);

-- ── Property Daily Views ──────────────────────────────────────
-- One row per page view per day — used for "X people viewing today"
CREATE TABLE property_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  viewed_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX idx_property_views_date ON property_views(property_id, viewed_date);

-- ── Testimonials ──────────────────────────────────────────────
CREATE TABLE testimonials (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  role       TEXT NOT NULL,
  quote      TEXT NOT NULL,
  rating     INT  NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  avatar_url TEXT,
  published  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Leads ─────────────────────────────────────────────────────
CREATE TABLE leads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  mobile       TEXT NOT NULL,
  email        TEXT NOT NULL,
  message      TEXT,
  status       lead_status NOT NULL DEFAULT 'NEW',
  notes        TEXT,
  follow_up_at TIMESTAMPTZ,
  property_id  UUID REFERENCES properties(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_status     ON leads(status);
CREATE INDEX idx_leads_property   ON leads(property_id);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- ── Site Visits ───────────────────────────────────────────────
CREATE TABLE site_visits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  mobile      TEXT,
  date        DATE NOT NULL,
  time_slot   TEXT NOT NULL,
  status      visit_status NOT NULL DEFAULT 'PENDING',
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_site_visits_status   ON site_visits(status);
CREATE INDEX idx_site_visits_property ON site_visits(property_id);
CREATE INDEX idx_site_visits_date     ON site_visits(date);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE builders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties       ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images  ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE nearby_places    ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_videos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views   ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials     ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads            ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits      ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can read builders"       ON builders         FOR SELECT USING (TRUE);
CREATE POLICY "Public can read properties"     ON properties       FOR SELECT USING (TRUE);
CREATE POLICY "Public can read images"         ON property_images  FOR SELECT USING (TRUE);
CREATE POLICY "Public can read documents"      ON documents        FOR SELECT USING (TRUE);
CREATE POLICY "Public can read nearby"         ON nearby_places    FOR SELECT USING (TRUE);
CREATE POLICY "Public can read videos"         ON property_videos  FOR SELECT USING (TRUE);
CREATE POLICY "Public can read reviews"        ON property_reviews FOR SELECT USING (TRUE);
CREATE POLICY "Public can read views"          ON property_views   FOR SELECT USING (TRUE);
CREATE POLICY "Public can read testimonials"   ON testimonials     FOR SELECT USING (published = TRUE);

-- Public insert policies (forms — no auth required)
CREATE POLICY "Anyone can create leads"        ON leads            FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Anyone can create site visits"  ON site_visits      FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Anyone can post reviews"        ON property_reviews FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Anyone can insert views"        ON property_views   FOR INSERT WITH CHECK (TRUE);

-- Admin full-access policies (authenticated = Supabase auth session)
CREATE POLICY "Admins can manage builders"     ON builders         FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage properties"   ON properties       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage images"       ON property_images  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage documents"    ON documents        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage nearby"       ON nearby_places    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage videos"       ON property_videos  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage reviews"      ON property_reviews FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage testimonials" ON testimonials     FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can read leads"          ON leads            FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can update leads"        ON leads            FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete leads"        ON leads            FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can read visits"         ON site_visits      FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can update visits"       ON site_visits      FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete visits"       ON site_visits      FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- RPC Functions
-- ============================================================

-- Function to retrieve registered users for the admin panel
CREATE OR REPLACE FUNCTION get_users_list()
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  full_name TEXT,
  mobile TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() != 'authenticated' THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', ''),
    COALESCE(u.raw_user_meta_data->>'mobile', ''),
    u.created_at,
    u.last_sign_in_at
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_users_list() TO authenticated;

