-- Analytics tables for page view tracking
-- Run this in Supabase SQL Editor

-- ============================================================
-- PAGE VIEWS (Analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS page_views (
    id BIGSERIAL PRIMARY KEY,
    path TEXT NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    ip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_ip ON page_views(ip);

-- Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Admin can read all page views
CREATE POLICY "Admins can read page views" ON page_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow anonymous inserts for tracking (using service role)
-- The service role bypasses RLS, so we don't need a policy for inserts

-- ============================================================
-- ANALYTICS VIEW (Optional: pre-aggregated daily stats)
-- ============================================================
CREATE OR REPLACE VIEW daily_page_views AS
SELECT
    DATE(created_at) as date,
    path,
    COUNT(*) as views,
    COUNT(DISTINCT ip) as unique_visitors
FROM page_views
GROUP BY DATE(created_at), path
ORDER BY date DESC, views DESC;

-- Grant access to the view
GRANT SELECT ON daily_page_views TO authenticated;