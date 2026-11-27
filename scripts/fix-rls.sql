-- RLS Policies for students table
-- Enable RLS
alter table public.students enable row level security;

-- Public read access for published students (for public directory pages)
drop policy if exists "Published students are publicly readable" on public.students;
create policy "Published students are publicly readable"
on public.students
for select
using (status = 'published');

-- Admin full access via service role (bypasses RLS automatically)
-- No additional policy needed - service role bypasses RLS

-- Staff cannot access students table (no policy for staff role)


-- RLS Policies for red_flags table
alter table public.red_flags enable row level security;

-- Admin full access via service role (bypasses RLS automatically)

-- Public: NO access to red_flags (sensitive disciplinary data)
-- Staff: NO access to red_flags
-- Only admins via service role can read/write

-- Ensure existing policies don't conflict
drop policy if exists "Red flags admin access" on public.red_flags;
-- No public policy = no access


-- RLS Policies for other tables that might be missing
-- gallery_albums
alter table public.gallery_albums enable row level security;
drop policy if exists "Published gallery albums are publicly readable" on public.gallery_albums;
create policy "Published gallery albums are publicly readable"
on public.gallery_albums
for select
using (status = 'published');

-- materials
alter table public.materials enable row level security;
drop policy if exists "Published materials are publicly readable" on public.materials;
create policy "Published materials are publicly readable"
on public.materials
for select
using (status = 'published');

-- notices
alter table public.notices enable row level security;
drop policy if exists "Published notices are publicly readable" on public.notices;
create policy "Published notices are publicly readable"
on public.notices
for select
using (status = 'published');

-- faqs
alter table public.faqs enable row level security;
drop policy if exists "Published faqs are publicly readable" on public.faqs;
create policy "Published faqs are publicly readable"
on public.faqs
for select
using (status = 'published');

-- inquiries (public can INSERT via contact form)
alter table public.inquiries enable row level security;
drop policy if exists "Public can create inquiries" on public.inquiries;
create policy "Public can create inquiries"
on public.inquiries
for insert
with check (true);

-- Admins via service role have full access to all tables (bypasses RLS)