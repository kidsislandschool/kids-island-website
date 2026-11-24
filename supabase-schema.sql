-- ============================================================
-- Kids Island Senior Secondary School - Supabase Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS (Master Admin)
-- ============================================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'master_admin',
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE TABLE sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_user ON sessions(user_id);

-- ============================================================
-- STAFF (Teachers)
-- ============================================================
CREATE TABLE staff (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    designation TEXT,
    qualification TEXT,
    bio TEXT,
    photo TEXT,
    password_hash TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
    approved_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE staff_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    ip TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_staff_sessions_token ON staff_sessions(token_hash);
CREATE INDEX idx_staff_sessions_user ON staff_sessions(user_id);
CREATE INDEX idx_staff_status ON staff(status);
CREATE INDEX idx_staff_email ON staff(email);

-- ============================================================
-- CONTENT BLOCKS (CMS)
-- ============================================================
CREATE TABLE content (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('published','draft','needs_review')),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT,
    entity_id TEXT,
    detail JSONB,
    ip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- ============================================================
-- NOTICES & ANNOUNCEMENTS
-- ============================================================
CREATE TABLE notices (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    summary TEXT,
    body TEXT,
    event_date DATE,
    pinned BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL CHECK (status IN ('published','draft','needs_review')) DEFAULT 'published',
    published_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT REFERENCES staff(id) ON DELETE SET NULL
);
CREATE INDEX idx_notices_status ON notices(status);
CREATE INDEX idx_notices_created_by ON notices(created_by);

-- ============================================================
-- FACULTY (Public directory)
-- ============================================================
CREATE TABLE faculty (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    designation TEXT,
    subjects TEXT,
    qualification TEXT,
    bio TEXT,
    photo TEXT,
    order_index INT DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL CHECK (status IN ('published','draft','needs_review')) DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STUDY MATERIALS
-- ============================================================
CREATE TABLE materials (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    class_level TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    tags TEXT,
    published_at DATE,
    status TEXT NOT NULL CHECK (status IN ('published','draft','needs_review')) DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT REFERENCES staff(id) ON DELETE SET NULL
);
CREATE INDEX idx_materials_created_by ON materials(created_by);

-- ============================================================
-- TESTIMONIALS
-- ============================================================
CREATE TABLE testimonials (
    id BIGSERIAL PRIMARY KEY,
    quote TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_role TEXT,
    order_index INT DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('published','draft','needs_review')) DEFAULT 'needs_review',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FAQs
-- ============================================================
CREATE TABLE faqs (
    id BIGSERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    order_index INT DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('published','draft','needs_review')) DEFAULT 'needs_review',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GALLERY
-- ============================================================
CREATE TABLE gallery_albums (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    cover_photo TEXT,
    order_index INT DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('published','draft','needs_review')) DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gallery_photos (
    id BIGSERIAL PRIMARY KEY,
    album_id BIGINT NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    alt TEXT NOT NULL,
    order_index INT DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL CHECK (status IN ('published','draft','needs_review')) DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_photos_album ON gallery_photos(album_id);

-- ============================================================
-- UPLOADS
-- ============================================================
CREATE TABLE uploads (
    id BIGSERIAL PRIMARY KEY,
    original_name TEXT NOT NULL,
    stored_name TEXT NOT NULL,
    url TEXT NOT NULL,
    mime TEXT NOT NULL,
    size BIGINT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('image','document')),
    alt TEXT,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INQUIRIES (Admission/Contact forms)
-- ============================================================
CREATE TABLE inquiries (
    id BIGSERIAL PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('admission','contact')),
    name TEXT NOT NULL,
    parent_name TEXT,
    email TEXT,
    phone TEXT,
    class_apply TEXT,
    message TEXT,
    status TEXT NOT NULL CHECK (status IN ('new','read','replied','closed')) DEFAULT 'new',
    ip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_type ON inquiries(type);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PUBLIC READ ACCESS (for published content)
-- ============================================================

-- Published content visible to all
CREATE POLICY "Published content is publicly readable" ON content
    FOR SELECT USING (status = 'published');

CREATE POLICY "Published notices are publicly readable" ON notices
    FOR SELECT USING (status = 'published');

CREATE POLICY "Published faculty are publicly readable" ON faculty
    FOR SELECT USING (status = 'published');

CREATE POLICY "Published materials are publicly readable" ON materials
    FOR SELECT USING (status = 'published');

CREATE POLICY "Published testimonials are publicly readable" ON testimonials
    FOR SELECT USING (status = 'published');

CREATE POLICY "Published FAQs are publicly readable" ON faqs
    FOR SELECT USING (status = 'published');

CREATE POLICY "Published gallery albums are publicly readable" ON gallery_albums
    FOR SELECT USING (status = 'published');

CREATE POLICY "Published gallery photos are publicly readable" ON gallery_photos
    FOR SELECT USING (status = 'published');

-- ============================================================
-- STAFF ACCESS POLICIES
-- ============================================================

-- Staff can read their own profile
CREATE POLICY "Staff can read own profile" ON staff
    FOR SELECT USING (auth.uid() = id);

-- Staff can update their own profile
CREATE POLICY "Staff can update own profile" ON staff
    FOR UPDATE USING (auth.uid() = id);

-- Staff can read their own materials
CREATE POLICY "Staff can read own materials" ON materials
    FOR SELECT USING (auth.uid() = created_by);

-- Staff can insert their own materials
CREATE POLICY "Staff can insert own materials" ON materials
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Staff can update their own materials
CREATE POLICY "Staff can update own materials" ON materials
    FOR UPDATE USING (auth.uid() = created_by);

-- Staff can read their own notices
CREATE POLICY "Staff can read own notices" ON notices
    FOR SELECT USING (auth.uid() = created_by);

-- Staff can insert their own notices
CREATE POLICY "Staff can insert own notices" ON notices
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Staff can update their own notices
CREATE POLICY "Staff can update own notices" ON notices
    FOR UPDATE USING (auth.uid() = created_by);

-- ============================================================
-- ADMIN ACCESS (using service role - bypasses RLS)
-- ============================================================
-- Admin operations use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS
-- No additional policies needed for admin operations

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON notices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON faculty
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_albums_updated_at BEFORE UPDATE ON gallery_albums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_photos_updated_at BEFORE UPDATE ON gallery_photos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_uploads_updated_at BEFORE UPDATE ON uploads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON faculty
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED INITIAL MASTER ADMIN (run after creating auth user)
-- ============================================================
-- Note: Create auth user first via Supabase Auth UI or:
-- INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
-- VALUES ('admin@kids-island.local', crypt('your-password', gen_salt('bf')), NOW(), 'authenticated');
--
-- Then link to users table:
-- INSERT INTO users (id, email, name, role, password_hash)
-- VALUES (auth_user_id, 'admin@kids-island.local', 'Master Admin', 'master_admin', 'scrypt$...');
-- ============================================================

-- ============================================================
-- STORAGE BUCKET (run in Supabase Storage UI or via CLI)
-- ============================================================
-- Create bucket named 'uploads' with:
-- - Public: true
-- - File size limit: 12MB
-- - Allowed MIME types: image/jpeg, image/png, image/webp, image/avif, application/pdf
-- ============================================================

-- ============================================================
-- VERCEL ENV VARS TO SET
-- ============================================================
-- NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
-- NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
-- SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
-- NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
-- NODE_ENV=production
-- ============================================================