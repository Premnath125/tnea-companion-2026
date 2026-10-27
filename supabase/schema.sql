-- ==============================================================================
-- TNEA Companion 2026 - Production Supabase Database Schema
-- Row Level Security (RLS) & User Data Isolation
-- ==============================================================================

-- 1. Profiles Table (Personal & Nativity Details)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text default '',
  dob date,
  gender text default '',
  community text default '',
  mobile text default '',
  state text default 'Tamil Nadu',
  district text default '',
  native_place text default '',
  address text default '',
  is_personal_complete boolean default false,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 2. Academic Details Table (Marks, Reservations, Cutoff & Eligibility)
create table if not exists public.academic_details (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  board text default '',
  passing_year text default '2026',
  school_name text default '',
  has_tnea_reg text default 'no',
  reg_number text default '',
  maths numeric,
  physics numeric,
  chemistry numeric,
  max_maths numeric default 100,
  max_physics numeric default 100,
  max_chemistry numeric default 100,
  studied_govt_school text default 'no',
  first_graduate text default 'no',
  special_reservations jsonb default '[]'::jsonb,
  cutoff numeric(5,2),
  average_percentage numeric(5,2),
  academic_submitted boolean default false,
  is_profile_complete boolean default false,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enable RLS for academic_details
alter table public.academic_details enable row level security;

-- Academic Details Policies
create policy "Users can view their own academic details"
  on public.academic_details for select
  using (auth.uid() = user_id);

create policy "Users can insert their own academic details"
  on public.academic_details for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own academic details"
  on public.academic_details for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. User Preferences (Saved Colleges, Choice List & Document Checklist)
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  saved_colleges jsonb default '[]'::jsonb,
  choice_list jsonb default '[]'::jsonb,
  checklist jsonb default '[]'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enable RLS for user_preferences
alter table public.user_preferences enable row level security;

-- User Preferences Policies
create policy "Users can view their own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Trigger to automatically provision profiles and preferences on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  );

  insert into public.academic_details (user_id)
  values (new.id);

  insert into public.user_preferences (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
