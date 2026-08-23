-- Public media bucket + service-role writes (idempotent)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  52428800,
  array['image/jpeg','image/png','image/webp','image/gif','image/avif','video/mp4','video/webm','video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read media" on storage.objects;
create policy "Public read media"
  on storage.objects for select
  using (bucket_id in ('media', 'avatars'));

drop policy if exists "Service role media all" on storage.objects;
create policy "Service role media all"
  on storage.objects for all
  to service_role
  using (bucket_id in ('media', 'avatars'))
  with check (bucket_id in ('media', 'avatars'));
