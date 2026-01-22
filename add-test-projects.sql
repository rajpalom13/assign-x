-- Add test projects with "submitted" status for quote workflow testing
-- Run this in your Supabase SQL Editor

-- Get supervisor ID (replace with actual supervisor ID from your database)
-- You can find it by running: SELECT id FROM supervisors WHERE email = 'om@agiready.io';

-- Insert test projects with submitted status
INSERT INTO projects (
  project_number,
  title,
  description,
  project_type,
  subject_field,
  academic_level,
  deadline,
  word_count,
  page_count,
  status,
  user_id,
  supervisor_id,
  created_at,
  updated_at
)
VALUES
-- Project 1: Short deadline (urgent pricing)
(
  'PRJ-2024-TEST-001',
  'Climate Change Impact Analysis',
  'A comprehensive analysis of climate change effects on coastal ecosystems in South Asia. Requires extensive research on sea level rise, temperature changes, and biodiversity loss.',
  'research_paper',
  'Environmental Science',
  'undergraduate',
  NOW() + INTERVAL '24 hours',
  2500,
  10,
  'submitted',
  (SELECT id FROM profiles WHERE email LIKE '%user%' LIMIT 1),
  (SELECT id FROM supervisors WHERE email = 'om@agiready.io' LIMIT 1),
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '30 minutes'
),

-- Project 2: Medium deadline
(
  'PRJ-2024-TEST-002',
  'Machine Learning Applications in Healthcare',
  'Research paper exploring the use of deep learning algorithms for early disease detection, focusing on cancer diagnosis and medical imaging analysis.',
  'research_paper',
  'Computer Science',
  'postgraduate',
  NOW() + INTERVAL '48 hours',
  3500,
  14,
  'submitted',
  (SELECT id FROM profiles WHERE email LIKE '%user%' LIMIT 1),
  (SELECT id FROM supervisors WHERE email = 'om@agiready.io' LIMIT 1),
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '1 hour'
),

-- Project 3: Normal deadline
(
  'PRJ-2024-TEST-003',
  'Digital Marketing Strategies for E-commerce',
  'Case study analysis of successful digital marketing campaigns for online retailers, including SEO, social media, and content marketing strategies.',
  'case_study',
  'Business Management',
  'undergraduate',
  NOW() + INTERVAL '5 days',
  2000,
  8,
  'submitted',
  (SELECT id FROM profiles WHERE email LIKE '%user%' LIMIT 1),
  (SELECT id FROM supervisors WHERE email = 'om@agiready.io' LIMIT 1),
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours'
),

-- Project 4: Essay
(
  'PRJ-2024-TEST-004',
  'Impact of Social Media on Mental Health',
  'Critical essay examining the psychological effects of social media usage among teenagers, including anxiety, depression, and self-esteem issues.',
  'essay',
  'Psychology',
  'undergraduate',
  NOW() + INTERVAL '3 days',
  1500,
  6,
  'submitted',
  (SELECT id FROM profiles WHERE email LIKE '%user%' LIMIT 1),
  (SELECT id FROM supervisors WHERE email = 'om@agiready.io' LIMIT 1),
  NOW() - INTERVAL '15 minutes',
  NOW() - INTERVAL '15 minutes'
),

-- Project 5: Large project
(
  'PRJ-2024-TEST-005',
  'Blockchain Technology in Supply Chain Management',
  'Detailed research on implementing blockchain solutions for supply chain transparency, traceability, and efficiency. Includes technical architecture and implementation case studies.',
  'research_paper',
  'Information Technology',
  'postgraduate',
  NOW() + INTERVAL '7 days',
  5000,
  20,
  'submitted',
  (SELECT id FROM profiles WHERE email LIKE '%user%' LIMIT 1),
  (SELECT id FROM supervisors WHERE email = 'om@agiready.io' LIMIT 1),
  NOW() - INTERVAL '45 minutes',
  NOW() - INTERVAL '45 minutes'
),

-- Project 6: Urgent small project
(
  'PRJ-2024-TEST-006',
  'Renewable Energy Policy Analysis',
  'Brief analysis of government policies promoting renewable energy adoption in India, focusing on solar and wind power initiatives.',
  'report',
  'Economics',
  'undergraduate',
  NOW() + INTERVAL '18 hours',
  1000,
  4,
  'submitted',
  (SELECT id FROM profiles WHERE email LIKE '%user%' LIMIT 1),
  (SELECT id FROM supervisors WHERE email = 'om@agiready.io' LIMIT 1),
  NOW() - INTERVAL '10 minutes',
  NOW() - INTERVAL '10 minutes'
),

-- Project 7: Normal deadline
(
  'PRJ-2024-TEST-007',
  'Financial Analysis of Tech Startups',
  'Comprehensive financial analysis and valuation of emerging technology startups, including revenue models, funding rounds, and growth metrics.',
  'case_study',
  'Finance',
  'postgraduate',
  NOW() + INTERVAL '4 days',
  3000,
  12,
  'submitted',
  (SELECT id FROM profiles WHERE email LIKE '%user%' LIMIT 1),
  (SELECT id FROM supervisors WHERE email = 'om@agiready.io' LIMIT 1),
  NOW() - INTERVAL '20 minutes',
  NOW() - INTERVAL '20 minutes'
);

-- Verify the inserted projects
SELECT
  project_number,
  title,
  status,
  word_count,
  deadline,
  created_at
FROM projects
WHERE project_number LIKE 'PRJ-2024-TEST-%'
ORDER BY created_at DESC;
