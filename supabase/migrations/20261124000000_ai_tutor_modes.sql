create table public.ai_tutor_settings (
  id text primary key check (id = 'default'),
  mode text not null default 'rules' check (mode in ('rules', 'ai')),
  gemini_key_ciphertext text,
  gemini_key_iv text,
  gemini_key_tag text,
  openai_key_ciphertext text,
  openai_key_iv text,
  openai_key_tag text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  constraint ai_tutor_gemini_key_parts check (
    (gemini_key_ciphertext is null and gemini_key_iv is null and gemini_key_tag is null)
    or (gemini_key_ciphertext is not null and gemini_key_iv is not null and gemini_key_tag is not null)
  ),
  constraint ai_tutor_openai_key_parts check (
    (openai_key_ciphertext is null and openai_key_iv is null and openai_key_tag is null)
    or (openai_key_ciphertext is not null and openai_key_iv is not null and openai_key_tag is not null)
  )
);

alter table public.ai_tutor_settings enable row level security;
revoke all on public.ai_tutor_settings from anon, authenticated;
grant all on public.ai_tutor_settings to service_role;

create or replace function public.get_public_ai_tutor_settings()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
    'mode', coalesce(settings.mode, 'rules'),
    'hasGeminiKey', coalesce(settings.gemini_key_ciphertext is not null, false),
    'hasOpenAiKey', coalesce(settings.openai_key_ciphertext is not null, false)
  )
  from (select 1) as singleton
  left join public.ai_tutor_settings as settings on settings.id = 'default';
$$;
revoke all on function public.get_public_ai_tutor_settings() from public;
grant execute on function public.get_public_ai_tutor_settings() to anon, authenticated;

create table public.ai_tutor_rate_limits (
  client_key text primary key check (client_key ~ '^[0-9a-f]{64}$'),
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0)
);
alter table public.ai_tutor_rate_limits enable row level security;
revoke all on public.ai_tutor_rate_limits from anon, authenticated;
grant all on public.ai_tutor_rate_limits to service_role;

create or replace function public.consume_ai_tutor_rate_limit(requested_client_key text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_count integer;
begin
  if requested_client_key !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid rate-limit key.';
  end if;

  insert into public.ai_tutor_rate_limits as limits (client_key, window_started_at, request_count)
  values (requested_client_key, now(), 1)
  on conflict (client_key) do update
    set window_started_at = case
      when limits.window_started_at <= now() - interval '1 minute' then now()
      else limits.window_started_at
    end,
    request_count = case
      when limits.window_started_at <= now() - interval '1 minute' then 1
      else limits.request_count + 1
    end
  returning request_count into current_count;

  return current_count <= 10;
end;
$$;
revoke all on function public.consume_ai_tutor_rate_limit(text) from public, anon, authenticated;
grant execute on function public.consume_ai_tutor_rate_limit(text) to service_role;
