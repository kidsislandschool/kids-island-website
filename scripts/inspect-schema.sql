-- columns for key tables
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema='public'
  and table_name in ('students','red_flags','notices','testimonials','faculty','staff','users','materials','faqs','inquiries','gallery_albums','gallery_photos','uploads','audit_log','content','sessions','staff_sessions')
order by table_name, ordinal_position;

-- constraints
select c.conrelid::regclass::text as table_name, c.conname, pg_get_constraintdef(c.oid) as def
from pg_constraint c
where c.connamespace = 'public'::regnamespace
order by table_name, c.conname;

-- indexes
select tablename, indexname, indexdef
from pg_indexes
where schemaname='public'
order by tablename, indexname;

-- rls
select n.nspname as schema, c.relname as table_name, c.relrowsecurity as rls_enabled, c.relforcerowsecurity as force_rls
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relkind='r'
order by c.relname;

-- policies
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname='public'
order by tablename, policyname;
