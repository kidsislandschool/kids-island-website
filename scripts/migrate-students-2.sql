alter table public.students add column if not exists data_source text default 'manual';
create index if not exists idx_students_data_source on public.students (data_source);
