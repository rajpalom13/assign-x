-- Migration: Add listing_reports and saved_listings tables for Campus Connect
-- Date: 2026-01-25
-- Description: Adds tables for reporting inappropriate listings and saving favorites

-- =============================================================================
-- LISTING REPORTS TABLE
-- =============================================================================

-- Create listing_reports table for tracking user reports
CREATE TABLE IF NOT EXISTS public.listing_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.campus_posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('scam', 'inappropriate', 'inaccurate', 'spam', 'other')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure a user can only report a listing once
  CONSTRAINT unique_report_per_user UNIQUE (listing_id, reporter_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_listing_reports_listing_id ON public.listing_reports(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_reports_reporter_id ON public.listing_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_listing_reports_status ON public.listing_reports(status);
CREATE INDEX IF NOT EXISTS idx_listing_reports_created_at ON public.listing_reports(created_at DESC);

-- Enable RLS on listing_reports
ALTER TABLE public.listing_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create reports
CREATE POLICY "Users can create reports" ON public.listing_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Policy: Users can view their own reports
CREATE POLICY "Users can view own reports" ON public.listing_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- Policy: Admins can view all reports (requires admin role check)
-- Note: This assumes you have an is_admin function or similar
-- CREATE POLICY "Admins can view all reports" ON public.listing_reports
--   FOR SELECT
--   TO authenticated
--   USING (is_admin(auth.uid()));

-- =============================================================================
-- SAVED LISTINGS TABLE
-- =============================================================================

-- Create saved_listings table for user favorites
CREATE TABLE IF NOT EXISTS public.saved_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.campus_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure a user can only save a listing once
  CONSTRAINT unique_saved_listing UNIQUE (user_id, listing_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_saved_listings_user_id ON public.saved_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_listings_listing_id ON public.saved_listings(listing_id);
CREATE INDEX IF NOT EXISTS idx_saved_listings_created_at ON public.saved_listings(created_at DESC);

-- Enable RLS on saved_listings
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can save listings
CREATE POLICY "Users can save listings" ON public.saved_listings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own saved listings
CREATE POLICY "Users can view own saved listings" ON public.saved_listings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can remove their own saved listings
CREATE POLICY "Users can unsave listings" ON public.saved_listings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Trigger function to update updated_at on listing_reports
CREATE OR REPLACE FUNCTION public.update_listing_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for listing_reports updated_at
DROP TRIGGER IF EXISTS trigger_update_listing_reports_updated_at ON public.listing_reports;
CREATE TRIGGER trigger_update_listing_reports_updated_at
  BEFORE UPDATE ON public.listing_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_listing_reports_updated_at();

-- =============================================================================
-- OPTIONAL: Counter triggers for saves_count on campus_posts
-- =============================================================================

-- Trigger function to increment saves_count
CREATE OR REPLACE FUNCTION public.increment_saves_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.campus_posts
  SET saves_count = COALESCE(saves_count, 0) + 1
  WHERE id = NEW.listing_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to decrement saves_count
CREATE OR REPLACE FUNCTION public.decrement_saves_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.campus_posts
  SET saves_count = GREATEST(COALESCE(saves_count, 0) - 1, 0)
  WHERE id = OLD.listing_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for saves_count
DROP TRIGGER IF EXISTS trigger_increment_saves_count ON public.saved_listings;
CREATE TRIGGER trigger_increment_saves_count
  AFTER INSERT ON public.saved_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_saves_count();

DROP TRIGGER IF EXISTS trigger_decrement_saves_count ON public.saved_listings;
CREATE TRIGGER trigger_decrement_saves_count
  AFTER DELETE ON public.saved_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_saves_count();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE public.listing_reports IS 'Stores user reports for campus connect listings';
COMMENT ON COLUMN public.listing_reports.reason IS 'Report reason: scam, inappropriate, inaccurate, spam, or other';
COMMENT ON COLUMN public.listing_reports.status IS 'Report status: pending, reviewed, resolved, or dismissed';

COMMENT ON TABLE public.saved_listings IS 'Stores user saved/bookmarked listings';
COMMENT ON COLUMN public.saved_listings.user_id IS 'User who saved the listing';
COMMENT ON COLUMN public.saved_listings.listing_id IS 'The campus post that was saved';
