-- ============================================================================
-- MIGRATION: Training Modules and FAQs Tables
-- Date: 2026-02-04
-- Description: Creates training_modules table for doer onboarding and faqs table for support
-- ============================================================================

-- ============================================================================
-- PART 1: TRAINING MODULES TABLE
-- ============================================================================

-- Create training module type enum if not exists
DO $$ BEGIN
  CREATE TYPE training_module_type AS ENUM ('video', 'pdf', 'article', 'html');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create target role enum if not exists
DO $$ BEGIN
  CREATE TYPE target_role AS ENUM ('doer', 'supervisor');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create training_modules table
CREATE TABLE IF NOT EXISTS public.training_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    target_role target_role NOT NULL DEFAULT 'doer',
    content_type training_module_type NOT NULL DEFAULT 'video',
    content_url TEXT,
    content_html TEXT,
    thumbnail_url TEXT,
    duration_minutes INTEGER,
    sequence_order INTEGER NOT NULL DEFAULT 0,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_training_modules_target_role ON public.training_modules(target_role);
CREATE INDEX IF NOT EXISTS idx_training_modules_active_order ON public.training_modules(is_active, sequence_order);

-- Enable RLS
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active training modules
DROP POLICY IF EXISTS "training_modules_select_active" ON public.training_modules;
CREATE POLICY "training_modules_select_active"
ON public.training_modules
FOR SELECT
USING (is_active = true);

-- Policy: Service role can manage training modules
DROP POLICY IF EXISTS "training_modules_service_manage" ON public.training_modules;
CREATE POLICY "training_modules_service_manage"
ON public.training_modules
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.training_modules TO anon;
GRANT SELECT ON public.training_modules TO authenticated;
GRANT ALL ON public.training_modules TO service_role;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_training_modules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS training_modules_updated_at ON public.training_modules;
CREATE TRIGGER training_modules_updated_at
    BEFORE UPDATE ON public.training_modules
    FOR EACH ROW
    EXECUTE FUNCTION public.update_training_modules_updated_at();

-- Insert sample training modules for doers
INSERT INTO public.training_modules (title, description, target_role, content_type, content_url, duration_minutes, sequence_order, is_mandatory, is_active) VALUES
(
    'Welcome to AssignX',
    'Introduction to the AssignX platform and how to succeed as a doer.',
    'doer',
    'video',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    5,
    1,
    true,
    true
),
(
    'Understanding Quality Standards',
    'Learn about our quality requirements and what makes exceptional work.',
    'doer',
    'video',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    8,
    2,
    true,
    true
),
(
    'Project Workflow Guide',
    'Step-by-step guide on how to accept, work on, and submit projects.',
    'doer',
    'video',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    10,
    3,
    true,
    true
),
(
    'Communication Best Practices',
    'How to effectively communicate with supervisors and handle feedback.',
    'doer',
    'article',
    NULL,
    5,
    4,
    false,
    true
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 2: FAQs TABLE
-- ============================================================================

-- Create the faqs table
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    role_filter TEXT[] DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add a check constraint for valid categories
DO $$ BEGIN
  ALTER TABLE public.faqs
  ADD CONSTRAINT faqs_category_check
  CHECK (category IN ('general', 'payment', 'project', 'account', 'technical'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_faqs_category ON public.faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_active_order ON public.faqs(is_active, order_index);

-- Enable RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active FAQs
DROP POLICY IF EXISTS "faqs_select_active" ON public.faqs;
CREATE POLICY "faqs_select_active"
ON public.faqs
FOR SELECT
USING (is_active = true);

-- Policy: Service role can manage FAQs
DROP POLICY IF EXISTS "faqs_service_manage" ON public.faqs;
CREATE POLICY "faqs_service_manage"
ON public.faqs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.faqs TO anon;
GRANT SELECT ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_faqs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS faqs_updated_at ON public.faqs;
CREATE TRIGGER faqs_updated_at
    BEFORE UPDATE ON public.faqs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_faqs_updated_at();

-- Insert sample FAQs
INSERT INTO public.faqs (question, answer, category, order_index, is_active) VALUES
(
    'How does AssignX work?',
    'AssignX connects you with expert professionals who can help with your projects. Simply submit your requirements, receive a quote, and track progress in real-time.',
    'general',
    1,
    true
),
(
    'How long does it take to get a quote?',
    'You''ll typically receive a quote within 2-4 hours during business hours. For urgent requests, we prioritize faster responses.',
    'general',
    2,
    true
),
(
    'Is my information secure?',
    'Yes, all your data is encrypted and stored securely. We never share your personal information with third parties.',
    'general',
    3,
    true
),
(
    'What payment methods are accepted?',
    'We accept UPI, credit/debit cards, net banking, and wallet payments through Razorpay.',
    'payment',
    1,
    true
),
(
    'How do I get a refund?',
    'If you''re not satisfied with the work, you can request a refund within 7 days of delivery. Please contact support for assistance.',
    'payment',
    2,
    true
),
(
    'What happens if the payment fails?',
    'If your payment fails, please try again with a different payment method. If the issue persists, contact our support team and we''ll help resolve it.',
    'payment',
    3,
    true
),
(
    'Can I request revisions?',
    'Yes, you can request changes during the review period. Our experts will work with you until you''re satisfied.',
    'project',
    1,
    true
),
(
    'How do I track my project progress?',
    'You can track your project progress in real-time through the Projects section. Each project shows its current status, timeline, and deliverables.',
    'project',
    2,
    true
),
(
    'What file formats are supported?',
    'We support most common file formats including PDF, DOCX, DOC, TXT, PPTX, XLSX, and image formats (JPG, PNG). If you have a specific format requirement, please mention it in your project brief.',
    'project',
    3,
    true
),
(
    'How do I update my profile?',
    'Go to Profile > Edit Profile to update your personal information, profile picture, and contact details.',
    'account',
    1,
    true
),
(
    'How do I change my password?',
    'Go to Settings > Account and select "Change Password". You''ll receive a password reset link to your registered email.',
    'account',
    2,
    true
),
(
    'Can I delete my account?',
    'Yes, you can request account deletion by contacting support. Please note that this action is irreversible and all your data will be permanently deleted.',
    'account',
    3,
    true
),
(
    'The app is not loading properly. What should I do?',
    'Try these steps: 1) Check your internet connection, 2) Force close and restart the app, 3) Clear the app cache in your device settings, 4) Update to the latest version. If the issue persists, contact support.',
    'technical',
    1,
    true
),
(
    'I''m having trouble uploading files. What should I do?',
    'Ensure your file size is under 10MB and in a supported format. Check your internet connection and try again. If the problem continues, try uploading from the web version or contact support.',
    'technical',
    2,
    true
),
(
    'Why am I not receiving notifications?',
    'Check that notifications are enabled for AssignX in your device settings. Also verify that "Do Not Disturb" mode is turned off. If issues persist, try reinstalling the app.',
    'technical',
    3,
    true
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON TABLE public.training_modules IS 'Training content for doer and supervisor onboarding';
COMMENT ON TABLE public.faqs IS 'Frequently Asked Questions for the Help & Support section';

SELECT 'Migration completed: training_modules and faqs tables created!' as status;
