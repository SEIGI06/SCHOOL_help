-- Enable RLS
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- COURSES TABLE
create table if not exists public.courses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  matiere text not null,
  chapitre text,
  content_text text,
  file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.courses enable row level security;

create policy "Users can view their own courses"
  on public.courses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own courses"
  on public.courses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own courses"
  on public.courses for update
  using (auth.uid() = user_id);

create policy "Users can delete their own courses"
  on public.courses for delete
  using (auth.uid() = user_id);


-- QUIZZES TABLE
create table if not exists public.quizzes (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  data jsonb not null, -- Stores the list of questions
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.quizzes enable row level security;

-- Quizzes are accessed via the course's user implicitly, but direct RLS linking to auth.uid() is safer via join or duplicating user_id. 
-- For MVP simplicity, let's add user_id to quizzes too, or just join policy. 
-- Adding user_id to quizzes allows faster/simpler RLS.
alter table public.quizzes add column if not exists user_id uuid references auth.users(id) on delete cascade not null;

create policy "Users can view their own quizzes"
  on public.quizzes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own quizzes"
  on public.quizzes for insert
  with check (auth.uid() = user_id);

-- PERFORMANCES TABLE
create table if not exists public.performances (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  matiere text not null,
  note numeric not null,
  date date default CURRENT_DATE not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.performances enable row level security;

create policy "Users can view their own performances"
  on public.performances for select
  using (auth.uid() = user_id);

create policy "Users can insert their own performances"
  on public.performances for insert
  with check (auth.uid() = user_id);

-- STORAGE (If utilizing Supabase Storage for files)
insert into storage.buckets (id, name, public)
values ('course-files', 'course-files', false)
on conflict (id) do nothing;

create policy "Users can upload course files"
  on storage.objects for insert
  with check ( bucket_id = 'course-files' and auth.uid() = owner );

create policy "Users can view course files"
  on storage.objects for select
  using ( bucket_id = 'course-files' and auth.uid() = owner );
