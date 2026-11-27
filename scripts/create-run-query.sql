create or replace function public.run_query(q text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  r jsonb;
begin
  execute 'select coalesce(jsonb_agg(to_jsonb(t)), ''[]''::jsonb) from (' || q || ') t' into r;
  return r;
end;
$$;

revoke all on function public.run_query(text) from public;
revoke all on function public.run_query(text) from anon;
revoke all on function public.run_query(text) from authenticated;
grant execute on function public.run_query(text) to service_role;
