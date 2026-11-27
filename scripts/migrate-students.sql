-- ============================================================
-- Students: full school-record fields + ordering + indexes
-- ============================================================
alter table public.students add column if not exists alternate_phone text;
alter table public.students add column if not exists aadhaar_number text;
alter table public.students add column if not exists apaar_id text;
alter table public.students add column if not exists pen_number text;
alter table public.students add column if not exists remark text;
alter table public.students add column if not exists caste text;
alter table public.students add column if not exists stream text;
alter table public.students add column if not exists class_teacher text;
alter table public.students add column if not exists class_order integer default 99;
alter table public.students add column if not exists serial_no integer;
alter table public.students add column if not exists enrollment_status text default 'active';
alter table public.students add column if not exists created_by integer;
alter table public.students alter column status set default 'published';
update public.students set status = 'published' where status is null or status = 'active';
update public.students set enrollment_status = 'active' where enrollment_status is null;

-- Admission numbers are re-used across classes in the source data, so the
-- global unique constraint must go. A non-unique index keeps lookups fast.
alter table public.students drop constraint if exists students_admission_number_key;

create index if not exists idx_students_class on public.students (class_order, section, first_name);
create index if not exists idx_students_admission on public.students (admission_number);
create index if not exists idx_students_enrollment on public.students (enrollment_status);
create index if not exists idx_students_name on public.students (lower(first_name), lower(last_name));

-- ============================================================
-- Red flags: indexes + RLS
-- ============================================================
create index if not exists idx_red_flags_student on public.red_flags (student_id);
create index if not exists idx_red_flags_active on public.red_flags (resolved) where resolved = false;
create index if not exists idx_red_flags_assigned_at on public.red_flags (assigned_at desc);

alter table public.students enable row level security;
alter table public.red_flags enable row level security;

-- ============================================================
-- Notices: optional image
-- ============================================================
alter table public.notices add column if not exists image text;

-- ============================================================
-- Testimonials: image, category, rating, submitter metadata
-- ============================================================
alter table public.testimonials add column if not exists image text;
alter table public.testimonials add column if not exists kind text default 'parent';
alter table public.testimonials add column if not exists rating integer;
alter table public.testimonials add column if not exists submitter_email text;
alter table public.testimonials add column if not exists submitter_phone text;
alter table public.testimonials add column if not exists student_name text;
alter table public.testimonials add column if not exists student_class text;
alter table public.testimonials add column if not exists consent boolean default false;
alter table public.testimonials add column if not exists source text default 'admin';
create index if not exists idx_testimonials_status on public.testimonials (status, order_index);

-- ============================================================
-- Lock down raw SQL helpers (service role only)
-- ============================================================
revoke all on function public.exec_sql(text, jsonb) from public;
revoke all on function public.exec_sql(text, jsonb) from anon;
revoke all on function public.exec_sql(text, jsonb) from authenticated;
grant execute on function public.exec_sql(text, jsonb) to service_role;

revoke all on function public.run_query(text) from public;
revoke all on function public.run_query(text) from anon;
revoke all on function public.run_query(text) from authenticated;
grant execute on function public.run_query(text) to service_role;
