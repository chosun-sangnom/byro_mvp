-- ─────────────────────────────────────────────────────────────────────────────
-- Byro initial schema
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── users ───────────────────────────────────────────────────────────────────
-- One row per registered user. Linked to Supabase Auth via id = auth.uid().
create table public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
  link_id         text not null unique,                -- @username (byro.io/@link_id)
  name            text not null default '',
  title           text not null default '',
  headline        text,
  school          text not null default '',
  bio             text not null default '',
  bio_mode        text check (bio_mode in ('ai', 'manual')),
  birth_date      text,                               -- YYYY-MM-DD
  birth_time      text,                               -- HH:MM
  birth_place     text,
  calendar_type   text check (calendar_type in ('solar', 'lunar')),
  show_age        boolean not null default true,
  avatar_url      text,
  profile_images  jsonb not null default '[]',        -- string[]
  header_meta     jsonb not null default '{}',        -- { residence, mood, availability }
  who_i_am        jsonb not null default '{}',        -- { mbti, bloodType, aiStyleSummary, ... }
  life            jsonb not null default '{}',        -- { daily, tastes, places }
  contact_channels jsonb not null default '[]',       -- ContactChannel[]
  tab_visibility  jsonb not null default '{"who":"public","life":"public","reputation":"public"}',
  -- SNS
  instagram_connected  boolean not null default false,
  linkedin_connected   boolean not null default false,
  youtube_connected    boolean not null default false,
  tiktok_connected     boolean not null default false,
  instagram       jsonb,                              -- { username, profileUrl, aiSummary, posts }
  linkedin        jsonb,                              -- { profileUrl, ... }
  youtube         jsonb,                              -- { channelName, channelUrl }
  tiktok          jsonb,                              -- { username, profileUrl }
  --
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── highlights ──────────────────────────────────────────────────────────────
create table public.highlights (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  category_id text not null,
  icon        text not null default 'star',
  title       text not null default '',
  subtitle    text not null default '',
  description text not null default '',
  year        text not null default '',
  sort_order  integer not null default 0,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── connections ─────────────────────────────────────────────────────────────
create table public.connections (
  id              uuid primary key default gen_random_uuid(),
  from_user_id    uuid not null references public.users(id) on delete cascade,
  to_user_id      uuid not null references public.users(id) on delete cascade,
  status          text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  message         text not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (from_user_id, to_user_id)
);

-- ─── experiences ─────────────────────────────────────────────────────────────
-- 경험 남기기. target_link_id는 text — 비회원 프로필에도 남길 수 있게.
create table public.experiences (
  id              uuid primary key default gen_random_uuid(),
  target_link_id  text not null,
  author_user_id  uuid references public.users(id) on delete set null,
  author_name     text,                               -- null이면 익명
  is_anonymous    boolean not null default false,
  keywords        text[] not null default '{}',
  message         text not null default '',
  created_at      timestamptz not null default now()
);

-- ─── bookmarks ───────────────────────────────────────────────────────────────
create table public.bookmarks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  saved_link_id   text not null,
  memo            text not null default '',
  created_at      timestamptz not null default now(),
  unique (user_id, saved_link_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────────────────────
create index on public.highlights (user_id);
create index on public.connections (from_user_id);
create index on public.connections (to_user_id);
create index on public.experiences (target_link_id);
create index on public.experiences (author_user_id);
create index on public.bookmarks (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- updated_at auto-update trigger
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.users
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.highlights
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.connections
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.users          enable row level security;
alter table public.highlights     enable row level security;
alter table public.connections    enable row level security;
alter table public.experiences    enable row level security;
alter table public.bookmarks      enable row level security;

-- users: 누구나 공개 프로필 조회 가능, 본인만 수정
create policy "public profiles are viewable"
  on public.users for select using (true);

create policy "users can update own profile"
  on public.users for update using (auth.uid() = id);

create policy "users can insert own profile"
  on public.users for insert with check (auth.uid() = id);

-- highlights: 누구나 조회, 본인만 수정
create policy "highlights are viewable"
  on public.highlights for select using (true);

create policy "users manage own highlights"
  on public.highlights for all using (auth.uid() = user_id);

-- connections: 당사자만 조회, 요청자만 생성/취소
create policy "connection parties can view"
  on public.connections for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "users can send requests"
  on public.connections for insert with check (auth.uid() = from_user_id);

create policy "users can update own connections"
  on public.connections for update
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "users can delete own requests"
  on public.connections for delete using (auth.uid() = from_user_id);

-- experiences: 누구나 조회, 로그인 유저 또는 비회원 생성
create policy "experiences are viewable"
  on public.experiences for select using (true);

create policy "anyone can submit experience"
  on public.experiences for insert with check (true);

-- bookmarks: 본인만
create policy "users manage own bookmarks"
  on public.bookmarks for all using (auth.uid() = user_id);
