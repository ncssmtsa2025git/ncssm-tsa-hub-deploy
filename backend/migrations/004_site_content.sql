-- Site content that officers edit in the admin panel (key dates, officers, resources, gallery,
-- announcement bar) plus the list of admins who can sign in to the admin panel with Google.
-- Seeds each table with what the website shows today, only if the table is empty, so it is safe to re-run.
--
-- Run AFTER tasks/rotate_secrets.py has set SUPABASE_SERVICE_ROLE_KEY: RLS is on for these tables with
-- no policies, so only the backend's service_role key can read or write them.

BEGIN;

CREATE TABLE IF NOT EXISTS key_dates (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date       date NOT NULL,
  end_date   date CHECK (end_date IS NULL OR end_date >= date),
  event      text NOT NULL,
  type       text NOT NULL DEFAULT 'Competition',
  location   text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS officers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  role       text NOT NULL,
  email      text NOT NULL,
  photo      text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resources (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text NOT NULL DEFAULT '',
  href        text NOT NULL,
  category    text NOT NULL DEFAULT 'TSA' CHECK (category IN ('NCSSM', 'TSA', 'Chapter')),
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery_photos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  src        text NOT NULL,
  title      text,
  album      text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Exactly one row (id = 1)
CREATE TABLE IF NOT EXISTS announcement (
  id         integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  message    text NOT NULL DEFAULT '',
  link       text,
  active     boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admins (
  email    text PRIMARY KEY,
  added_at timestamptz NOT NULL DEFAULT now()
);

-- Seeds (only into empty tables)
INSERT INTO key_dates (date, end_date, event, type, location)
SELECT * FROM (VALUES
  ('2027-02-12'::date, NULL::date,         'Eastern Regionals',         'Competition', 'ECU, Greenville'),
  ('2027-02-19'::date, NULL::date,         'Western Regionals',         'Competition', 'App State, Boone'),
  ('2027-02-26'::date, NULL::date,         'State registration closes', 'Deadline',    NULL),
  ('2027-04-15'::date, '2027-04-17'::date, 'NC TSA State Conference',   'Competition', 'Greensboro'),
  ('2027-06-23'::date, '2027-06-27'::date, 'National TSA Conference',   'Competition', 'Orlando, FL')
) AS v
WHERE NOT EXISTS (SELECT 1 FROM key_dates);

INSERT INTO officers (name, role, email, photo, sort_order)
SELECT * FROM (VALUES
  ('David Ta',       'Co-President',     'ta27d@ncssm.edu',      '/officers/david.jpg',     0),
  ('Nathaniel Joy',  'Co-President',     'joy27n@ncssm.edu',     '/officers/nathaniel.jpg', 1),
  ('Moksha Agrawal', 'Vice President',   'agrawal27m@ncssm.edu', '/officers/moksha.jpg',    2),
  ('Isabella Bai',   'Secretary',        'bai27i@ncssm.edu',     '/officers/isabella.jpg',  3),
  ('Megan Nguyen',   'Competitive Lead', 'nguyen27m@ncssm.edu',  '/officers/megan.jpg',     4),
  ('Ayush Kamath',   'Reporter',         'kamath27a@ncssm.edu',  '/officers/ayush.jpg',     5),
  ('Aarush Jain',    'Tech Lead',        'jain27a@ncssm.edu',    '/officers/aarush.jpg',    6)
) AS v
WHERE NOT EXISTS (SELECT 1 FROM officers);

INSERT INTO resources (title, description, href, category, sort_order)
SELECT * FROM (VALUES
  ('Events List', 'Full categorized list of events', 'https://tsaweb.org/competitions', 'TSA', 0),
  ('Events Manager', 'See & sign up for events.', 'https://docs.google.com/spreadsheets/d/1TbLTrIRu7-l_Uhu94ux0SDNcvHvIvzpCRTqWR_-HfA8/edit?usp=sharing', 'NCSSM', 1),
  ('NCTSA Website', 'Resources for NCTSA', 'https://www.nctsa.org', 'TSA', 2),
  ('Themes & Problems', '2026–27 topics for specific events', 'https://tsaweb.org/competitions/themes-and-problems', 'TSA', 3),
  ('NCTSA App', 'Competition-day app, developed by our own chapter (Android)', 'https://play.google.com/store/apps/details?id=com.northcarolinatsa.android', 'TSA', 4),
  ('TSA Student Member Site', 'Submit projects here', 'https://tsamembership.registermychapter.com/members', 'TSA', 5),
  ('TSACE', 'Student-run database of past projects from across the nation', 'https://www.tsace.org/projects', 'TSA', 6),
  ('High School Competitive Events Directory', 'Quick links to multiple resources', 'https://www.nctsa.org/high-school-events', 'TSA', 7),
  ('Competition Updates', 'View yearly event-specific changes', 'https://tsaweb.org/competitions/competition-updates', 'TSA', 8),
  ('Competitive Events Guide', '2027 & 2028 rules and rubrics, shared by NCTSA', 'https://drive.google.com/file/d/1SwPAK48hAUQKy1NkzkMRvvktUQ4qYXoI/view', 'TSA', 9),
  ('NCTSA State Conference', 'April 15–17, 2027 in Greensboro', 'https://www.nctsa.org/state-conference', 'TSA', 10),
  ('Nationals Dates & Deadlines', 'June 23–27, 2027 in Orlando', 'https://tsaweb.org/conferences/2027-national-tsa-conference/dates-and-deadlines_2027', 'TSA', 11)
) AS v
WHERE NOT EXISTS (SELECT 1 FROM resources);

INSERT INTO gallery_photos (src, title, album, sort_order)
SELECT * FROM (VALUES
  ('/pics/states_2026/IMG_4651.jpg', 'NCSSM Sweeps!',     'States 2026', 0),
  ('/pics/states_2026/IMG_4558.jpg', 'Trophy Time',       'States 2026', 1),
  ('/pics/states_2026/IMG_4562.jpg', 'Award Winners',     'States 2026', 2),
  ('/pics/states_2026/IMG_4585.jpg', 'On Stage',          'States 2026', 3),
  ('/pics/states_2026/IMG_4572.jpg', 'Placing at States', 'States 2026', 4),
  ('/pics/states_2026/IMG_4612.jpg', 'Team Win',          'States 2026', 5),
  ('/pics/states_2026/IMG_4602.jpg', 'Hardware Secured',  'States 2026', 6),
  ('/pics/states_2026/IMG_4620.jpg', 'Thumbs Up!',        'States 2026', 7),
  ('/pics/states_2026/IMG_4631.jpg', 'Celebrating',       'States 2026', 8),
  ('/pics/states_2026/IMG_7426.jpg', 'Awards Ceremony',   'States 2026', 9),
  ('/pics/states_2026/IMG_7441.jpg', 'Escalator Crew',    'States 2026', 10),
  ('/pics/states_2026/IMG_7941.jpg', 'Elevator Selfie',   'States 2026', 11)
) AS v
WHERE NOT EXISTS (SELECT 1 FROM gallery_photos);

INSERT INTO announcement (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Everyone who can sign in to the admin panel (edit the list in Admin > Admins)
INSERT INTO admins (email)
SELECT * FROM (VALUES
  ('ta27d@ncssm.edu'), ('joy27n@ncssm.edu'), ('agrawal27m@ncssm.edu'), ('bai27i@ncssm.edu'),
  ('nguyen27m@ncssm.edu'), ('kamath27a@ncssm.edu'), ('jain27a@ncssm.edu')
) AS v
WHERE NOT EXISTS (SELECT 1 FROM admins);

-- Only the backend (service_role key) may touch these tables
ALTER TABLE key_dates      ENABLE ROW LEVEL SECURITY;
ALTER TABLE officers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources      ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement   ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins         ENABLE ROW LEVEL SECURITY;

-- Public bucket for officer photos and gallery uploads (the backend uploads with the service_role key)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('site-media', 'site-media', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

COMMIT;
