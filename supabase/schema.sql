create extension if not exists pgcrypto;
create extension if not exists pg_cron;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.finance_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  currency text not null default 'USD',
  theme text not null default 'light' check (theme in ('light', 'dark')),
  monthly_budget_limit numeric(12, 2) not null default 2500,
  monthly_budget_warning_threshold numeric(4, 3) not null default 0.85 check (
    monthly_budget_warning_threshold >= 0
    and monthly_budget_warning_threshold <= 1
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12, 2) not null check (amount >= 0),
  category_id text not null,
  description text not null default '',
  date date not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.finance_transactions
  add column if not exists source text not null default 'manual',
  add column if not exists recurring_rule_id uuid,
  add column if not exists scheduled_for timestamptz;

create table if not exists public.finance_recurring_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12, 2) not null check (amount >= 0),
  category_id text not null,
  description text not null,
  frequency text not null check (frequency in ('once', 'daily', 'weekly', 'monthly')),
  interval_value integer not null default 1 check (interval_value >= 1),
  start_date date not null,
  run_time time not null,
  end_date date,
  timezone text not null default 'UTC',
  is_fixed boolean not null default false,
  is_active boolean not null default true,
  next_run_at timestamptz,
  last_run_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'finance_transactions_recurring_rule_id_fkey'
  ) then
    alter table public.finance_transactions
      add constraint finance_transactions_recurring_rule_id_fkey
      foreign key (recurring_rule_id) references public.finance_recurring_rules (id) on delete set null;
  end if;
end;
$$;

create index if not exists finance_transactions_user_date_idx
on public.finance_transactions (user_id, date desc, created_at desc);

create index if not exists finance_transactions_recurring_idx
on public.finance_transactions (user_id, source, scheduled_for desc);

create unique index if not exists finance_transactions_rule_schedule_key
on public.finance_transactions (recurring_rule_id, scheduled_for)
where recurring_rule_id is not null and scheduled_for is not null;

create index if not exists finance_recurring_rules_user_next_run_idx
on public.finance_recurring_rules (user_id, is_active, next_run_at);

create or replace function public.advance_recurring_rule_run(
  current_due_at timestamptz,
  frequency_value text,
  interval_value integer,
  timezone_value text,
  end_date_value date
)
returns timestamptz
language plpgsql
as $$
declare
  safe_timezone text := coalesce(nullif(timezone_value, ''), 'UTC');
  safe_interval integer := greatest(coalesce(interval_value, 1), 1);
  local_due timestamp;
  next_local timestamp;
begin
  if current_due_at is null then
    return null;
  end if;

  local_due := current_due_at at time zone safe_timezone;

  case frequency_value
    when 'once' then
      return null;
    when 'daily' then
      next_local := local_due + make_interval(days => safe_interval);
    when 'weekly' then
      next_local := local_due + make_interval(days => safe_interval * 7);
    when 'monthly' then
      next_local := local_due + make_interval(months => safe_interval);
    else
      raise exception 'Unsupported recurring frequency: %', frequency_value;
  end case;

  if end_date_value is not null and next_local::date > end_date_value then
    return null;
  end if;

  return next_local at time zone safe_timezone;
end;
$$;

create or replace function public.refresh_recurring_rule_next_run()
returns trigger
language plpgsql
as $$
declare
  safe_timezone text := coalesce(nullif(new.timezone, ''), 'UTC');
  candidate timestamptz;
  attempts integer := 0;
begin
  new.interval_value := greatest(coalesce(new.interval_value, 1), 1);

  if not new.is_active then
    new.next_run_at := null;
    return new;
  end if;

  candidate := (new.start_date::timestamp + new.run_time) at time zone safe_timezone;

  if new.end_date is not null and new.start_date > new.end_date then
    new.next_run_at := null;
    new.is_active := false;
    return new;
  end if;

  if new.last_run_at is not null then
    candidate := public.advance_recurring_rule_run(
      new.last_run_at,
      new.frequency,
      new.interval_value,
      safe_timezone,
      new.end_date
    );
  end if;

  while candidate is not null and candidate < timezone('utc', now()) and attempts < 500 loop
    candidate := public.advance_recurring_rule_run(
      candidate,
      new.frequency,
      new.interval_value,
      safe_timezone,
      new.end_date
    );
    attempts := attempts + 1;
  end loop;

  if candidate is null then
    new.is_active := false;
  end if;

  new.next_run_at := candidate;
  return new;
end;
$$;

create or replace function public.process_due_recurring_rules_internal(
  target_user_id uuid default null,
  process_until timestamptz default timezone('utc', now()),
  max_iterations integer default 240
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  scheduled_rule public.finance_recurring_rules%rowtype;
  current_due_at timestamptz;
  last_processed_run timestamptz;
  next_due_at timestamptz;
  loop_counter integer;
  inserted_rows integer;
  processed_count integer := 0;
  safe_timezone text;
begin
  for scheduled_rule in
    select *
    from public.finance_recurring_rules
    where is_active = true
      and next_run_at is not null
      and next_run_at <= process_until
      and (target_user_id is null or user_id = target_user_id)
    order by next_run_at asc
    limit 200
  loop
    safe_timezone := coalesce(nullif(scheduled_rule.timezone, ''), 'UTC');
    current_due_at := scheduled_rule.next_run_at;
    last_processed_run := scheduled_rule.last_run_at;
    loop_counter := 0;

    while current_due_at is not null and current_due_at <= process_until and loop_counter < max_iterations loop
      insert into public.finance_transactions (
        id,
        user_id,
        type,
        amount,
        category_id,
        description,
        date,
        source,
        recurring_rule_id,
        scheduled_for,
        created_at,
        updated_at
      )
      values (
        gen_random_uuid(),
        scheduled_rule.user_id,
        scheduled_rule.type,
        scheduled_rule.amount,
        scheduled_rule.category_id,
        scheduled_rule.description,
        (current_due_at at time zone safe_timezone)::date,
        'recurring',
        scheduled_rule.id,
        current_due_at,
        timezone('utc', now()),
        timezone('utc', now())
      )
      on conflict (recurring_rule_id, scheduled_for)
      where recurring_rule_id is not null and scheduled_for is not null
      do nothing;

      get diagnostics inserted_rows = row_count;
      processed_count := processed_count + inserted_rows;
      last_processed_run := current_due_at;

      next_due_at := public.advance_recurring_rule_run(
        current_due_at,
        scheduled_rule.frequency,
        scheduled_rule.interval_value,
        safe_timezone,
        scheduled_rule.end_date
      );

      current_due_at := next_due_at;
      loop_counter := loop_counter + 1;
    end loop;

    update public.finance_recurring_rules
    set
      last_run_at = last_processed_run,
      next_run_at = current_due_at,
      is_active = current_due_at is not null,
      updated_at = timezone('utc', now())
    where id = scheduled_rule.id;
  end loop;

  return processed_count;
end;
$$;

create or replace function public.process_due_recurring_rules()
returns integer
language sql
security definer
set search_path = public
as $$
  select public.process_due_recurring_rules_internal(null, timezone('utc', now()), 240);
$$;

create or replace function public.process_due_recurring_rules_for_current_user()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    return 0;
  end if;

  return public.process_due_recurring_rules_internal(current_user_id, timezone('utc', now()), 240);
end;
$$;

drop trigger if exists set_finance_settings_updated_at on public.finance_settings;
create trigger set_finance_settings_updated_at
before update on public.finance_settings
for each row
execute function public.set_updated_at();

drop trigger if exists set_finance_transactions_updated_at on public.finance_transactions;
create trigger set_finance_transactions_updated_at
before update on public.finance_transactions
for each row
execute function public.set_updated_at();

drop trigger if exists set_finance_recurring_rules_updated_at on public.finance_recurring_rules;
create trigger set_finance_recurring_rules_updated_at
before update on public.finance_recurring_rules
for each row
execute function public.set_updated_at();

drop trigger if exists refresh_finance_recurring_rule_next_run on public.finance_recurring_rules;
create trigger refresh_finance_recurring_rule_next_run
before insert or update of type, amount, category_id, description, frequency, interval_value, start_date, run_time, end_date, timezone, is_active, last_run_at
on public.finance_recurring_rules
for each row
execute function public.refresh_recurring_rule_next_run();

alter table public.finance_settings enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.finance_recurring_rules enable row level security;

drop policy if exists "Users can read their own finance settings" on public.finance_settings;
create policy "Users can read their own finance settings"
on public.finance_settings
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own finance settings" on public.finance_settings;
create policy "Users can insert their own finance settings"
on public.finance_settings
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own finance settings" on public.finance_settings;
create policy "Users can update their own finance settings"
on public.finance_settings
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own finance settings" on public.finance_settings;
create policy "Users can delete their own finance settings"
on public.finance_settings
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own finance transactions" on public.finance_transactions;
create policy "Users can read their own finance transactions"
on public.finance_transactions
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own finance transactions" on public.finance_transactions;
create policy "Users can insert their own finance transactions"
on public.finance_transactions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own finance transactions" on public.finance_transactions;
create policy "Users can update their own finance transactions"
on public.finance_transactions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own finance transactions" on public.finance_transactions;
create policy "Users can delete their own finance transactions"
on public.finance_transactions
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their own recurring rules" on public.finance_recurring_rules;
create policy "Users can read their own recurring rules"
on public.finance_recurring_rules
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own recurring rules" on public.finance_recurring_rules;
create policy "Users can insert their own recurring rules"
on public.finance_recurring_rules
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own recurring rules" on public.finance_recurring_rules;
create policy "Users can update their own recurring rules"
on public.finance_recurring_rules
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own recurring rules" on public.finance_recurring_rules;
create policy "Users can delete their own recurring rules"
on public.finance_recurring_rules
for delete
to authenticated
using ((select auth.uid()) = user_id);

grant execute on function public.process_due_recurring_rules_for_current_user() to authenticated;

do $$
declare
  existing_job_id bigint;
begin
  select jobid
  into existing_job_id
  from cron.job
  where jobname = 'finance-recurring-processor';

  if existing_job_id is not null then
    perform cron.unschedule(existing_job_id);
  end if;

  perform cron.schedule(
    'finance-recurring-processor',
    '* * * * *',
    $cron$select public.process_due_recurring_rules();$cron$
  );
end;
$$;
