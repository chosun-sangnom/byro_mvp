-- ─────────────────────────────────────────────────────────────────────────────
-- Byro initial schema
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── users ───────────────────────────────────────────────────────────────────
-- 기본 공개 정보. id = auth.uid(). 항상 전체 공개.
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
  contact_channels jsonb not null default '[]',       -- ContactChannel[]
  tab_visibility  jsonb not null default '{"who":"public","life":"public","reputation":"public"}',
  --
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─── user_who_i_am ───────────────────────────────────────────────────────────
-- 나 탭 데이터. tab_visibility.who 설정에 따라 공개 범위 제한.
-- 케미 매칭에 활용되므로 개별 컬럼으로 분리.
create table public.user_who_i_am (
  user_id   uuid primary key references public.users(id) on delete cascade,
  mbti      text,
  updated_at timestamptz not null default now()
);

-- ─── user_life ───────────────────────────────────────────────────────────────
-- 라이프 탭 데이터. tab_visibility.life 설정에 따라 공개 범위 제한.
create table public.user_life (
  user_id   uuid primary key references public.users(id) on delete cascade,
  daily     jsonb not null default '{}',   -- { exercise[], pets[], diet }
  tastes    jsonb not null default '{}',   -- { movies[], music[], books[], cafes[], restaurants[], sports[] }
  places    jsonb not null default '{}',   -- { neighborhoods[], travelDestinations[] }
  updated_at timestamptz not null default now()
);

-- ─── user_sns ────────────────────────────────────────────────────────────────
-- SNS 연동 데이터. tab_visibility.who 설정에 따라 공개 범위 제한.
create table public.user_sns (
  user_id              uuid primary key references public.users(id) on delete cascade,
  instagram_connected  boolean not null default false,
  linkedin_connected   boolean not null default false,
  youtube_connected    boolean not null default false,
  tiktok_connected     boolean not null default false,
  instagram            jsonb,   -- { username, profileUrl, posts }
  linkedin             jsonb,   -- { profileUrl, ... }
  youtube              jsonb,   -- { channelName, channelUrl }
  tiktok               jsonb,   -- { username, profileUrl }
  updated_at           timestamptz not null default now()
);

-- ─── highlights ──────────────────────────────────────────────────────────────
-- 나 탭에 표시. tab_visibility.who 설정에 따라 공개 범위 제한.
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
-- 관계 탭. target_link_id는 text — 비회원 프로필에도 남길 수 있게.
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

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────────────────────
create index on public.highlights (user_id);
create index on public.connections (from_user_id);
create index on public.connections (to_user_id);
create index on public.experiences (target_link_id);
create index on public.experiences (author_user_id);

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

create trigger set_updated_at before update on public.user_who_i_am
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.user_life
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.user_sns
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.highlights
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.connections
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.users          enable row level security;
alter table public.user_who_i_am  enable row level security;
alter table public.user_life      enable row level security;
alter table public.user_sns       enable row level security;
alter table public.highlights     enable row level security;
alter table public.connections    enable row level security;
alter table public.experiences    enable row level security;

-- ─── 공통 visibility 체크 패턴 ─────────────────────────────────────────────
-- public → 누구나 / connected → 연결된 유저만 / private → 본인만

-- users: 기본 정보는 항상 전체 공개
create policy "public profiles are viewable"
  on public.users for select using (true);

create policy "users can update own profile"
  on public.users for update using (auth.uid() = id);

create policy "users can insert own profile"
  on public.users for insert with check (auth.uid() = id);

-- user_who_i_am: tab_visibility.who 기준
create policy "who_i_am viewable by allowed users"
  on public.user_who_i_am for select using (
    exists (
      select 1 from public.users u where u.id = user_id and (
        u.id = auth.uid()
        or (u.tab_visibility->>'who') = 'public'
        or (
          (u.tab_visibility->>'who') = 'connected'
          and exists (
            select 1 from public.connections c
            where c.status = 'accepted'
              and (
                (c.from_user_id = auth.uid() and c.to_user_id = u.id)
                or (c.to_user_id = auth.uid() and c.from_user_id = u.id)
              )
          )
        )
      )
    )
  );

create policy "users manage own who_i_am"
  on public.user_who_i_am for all using (auth.uid() = user_id);

-- user_life: tab_visibility.life 기준
create policy "life viewable by allowed users"
  on public.user_life for select using (
    exists (
      select 1 from public.users u where u.id = user_id and (
        u.id = auth.uid()
        or (u.tab_visibility->>'life') = 'public'
        or (
          (u.tab_visibility->>'life') = 'connected'
          and exists (
            select 1 from public.connections c
            where c.status = 'accepted'
              and (
                (c.from_user_id = auth.uid() and c.to_user_id = u.id)
                or (c.to_user_id = auth.uid() and c.from_user_id = u.id)
              )
          )
        )
      )
    )
  );

create policy "users manage own life"
  on public.user_life for all using (auth.uid() = user_id);

-- user_sns: tab_visibility.who 기준
create policy "sns viewable by allowed users"
  on public.user_sns for select using (
    exists (
      select 1 from public.users u where u.id = user_id and (
        u.id = auth.uid()
        or (u.tab_visibility->>'who') = 'public'
        or (
          (u.tab_visibility->>'who') = 'connected'
          and exists (
            select 1 from public.connections c
            where c.status = 'accepted'
              and (
                (c.from_user_id = auth.uid() and c.to_user_id = u.id)
                or (c.to_user_id = auth.uid() and c.from_user_id = u.id)
              )
          )
        )
      )
    )
  );

create policy "users manage own sns"
  on public.user_sns for all using (auth.uid() = user_id);

-- highlights: tab_visibility.who 기준
create policy "highlights viewable by allowed users"
  on public.highlights for select using (
    exists (
      select 1 from public.users u where u.id = user_id and (
        u.id = auth.uid()
        or (u.tab_visibility->>'who') = 'public'
        or (
          (u.tab_visibility->>'who') = 'connected'
          and exists (
            select 1 from public.connections c
            where c.status = 'accepted'
              and (
                (c.from_user_id = auth.uid() and c.to_user_id = u.id)
                or (c.to_user_id = auth.uid() and c.from_user_id = u.id)
              )
          )
        )
      )
    )
  );

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

-- experiences: tab_visibility.reputation 기준
-- 제출: 로그인 유저는 항상 가능, 비회원은 reputation=public인 프로필만
create policy "experiences viewable by allowed users"
  on public.experiences for select using (
    exists (
      select 1 from public.users u where u.link_id = target_link_id and (
        u.id = auth.uid()
        or (u.tab_visibility->>'reputation') = 'public'
        or (
          (u.tab_visibility->>'reputation') = 'connected'
          and exists (
            select 1 from public.connections c
            where c.status = 'accepted'
              and (
                (c.from_user_id = auth.uid() and c.to_user_id = u.id)
                or (c.to_user_id = auth.uid() and c.from_user_id = u.id)
              )
          )
        )
      )
    )
  );

create policy "anyone can submit experience"
  on public.experiences for insert with check (
    auth.uid() is not null
    or exists (
      select 1 from public.users u
      where u.link_id = target_link_id
        and (u.tab_visibility->>'reputation') = 'public'
    )
  );
