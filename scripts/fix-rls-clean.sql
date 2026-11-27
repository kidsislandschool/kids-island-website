-- RLS Policies for students table
alter table public.students enable row level security;

drop policy if exists "Published students are publicly readable" on public.students;
create policy "Published students are publicly readable"
on public.students
for select
using (status = 'published');


-- RLS Policies for red_flags table
alter table public.red_flags enable row level security;

-- No public policy = no access for anon/authenticated roles
-- Admins via service role bypass RLS automatically


-- RLS Policies for gallery_albums
alter table public.gallery_albums enable row level security;
drop policy if exists "Published gallery albums are publicly readable" on public.gallery_albums;
create policy "Published gallery albums are publicly readable"
on public.gallery_albums
for select
using (status = 'published');


-- RLS Policies for materials
alter table public.materials enable row level security;
drop policy if exists "Published materials are publicly readable" on public.materials;
create policy "Published materials are publicly readable"
on public.materials
for select
using (status = 'published');


-- RLS Policies for notices
alter table public.notices enable row level security;
drop policy if exists "Published notices are publicly readable" on public.notices;
create policy "Published notices are publicly readable"
on public.notices
for select
using (status = 'published');


-- RLS Policies for faqs
alter table public.faqs enable row level security;
drop policy if exists "Published faqs are publicly readable" on public.faqs;
create policy "Published faqs are publicly readable"
on public.faqs
for select
using (status = 'published');


-- RLS Policies for inquiries (public can INSERT via contact form)
alter table public.inquiries enable row level security;
drop policy if exists "Public can create inquiries" on public.inquiries;
create policy "Public can create inquiries"
on public.inquiries
for insert
with check (true);