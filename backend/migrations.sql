CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    picture TEXT,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    theme VARCHAR(255),
    full_theme_url TEXT,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    team_size VARCHAR(50) NOT NULL,
    types TEXT[] NOT NULL,
    rubric_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);

CREATE TABLE IF NOT EXISTS teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    team_number VARCHAR(50) NOT NULL,
    conference VARCHAR(255) NOT NULL,
    captain_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    check_in_date TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_teams_event_id ON teams(event_id);
CREATE INDEX IF NOT EXISTS idx_teams_captain_id ON teams(captain_id);

-- Join table for team members
CREATE TABLE IF NOT EXISTS team_members (
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- Whitelist table for allowed emails
CREATE TABLE IF NOT EXISTS whitelist (
    email VARCHAR(255) PRIMARY KEY,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whitelist_email ON whitelist(email);