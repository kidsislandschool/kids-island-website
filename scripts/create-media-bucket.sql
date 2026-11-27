-- Public media bucket for CMS uploads (images + PDFs).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  12582912,
  array['image/jpeg','image/png','image/webp','image/avif','application/pdf']
)
on conflict (id) do update
set public = true,
    file_size_limit = 12582912,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif','application/pdf'];
