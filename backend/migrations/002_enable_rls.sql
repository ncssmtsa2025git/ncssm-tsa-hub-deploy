-- Lock the database to the backend only.
-- ONLY run this AFTER SUPABASE_SERVICE_ROLE_KEY is set on the Vercel API project
-- and that deploy is live, otherwise the site loses database access.
-- With RLS on and no policies, the public anon key can read/write nothing;
-- the service_role key used by the backend bypasses RLS.
ALTER TABLE users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams        ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE whitelist    ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins     ENABLE ROW LEVEL SECURITY;
-- Site content tables from 004 (already locked if 004 ran first; harmless to repeat)
ALTER TABLE IF EXISTS key_dates      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS officers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS resources      ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS announcement   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admins         ENABLE ROW LEVEL SECURITY;
