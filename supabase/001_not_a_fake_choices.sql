-- =====================================================================================
-- Not a Fake Ad: Choices — Supabase kurulumu (Kelime Köyü, Not a Fake Ad ve Tower ile AYNI projede)
--
-- Supabase Dashboard → SQL Editor'da BİR KEZ çalıştırın. Tekrar çalıştırmak güvenlidir
-- (idempotent): tablo/politika varsa yeniden oluşturulmaz, veri silinmez.
--
-- Bu dosya:
--   choices_saves               Choices oyun kaydı (tek satır / oyuncu, JSON)
--   choices_delete_my_account() oyuncunun Choices verisini siler (App Store 5.1.1(v), Play)
--   nfa_delete_my_account() ve tower_delete_my_account() fonksiyonlarını GÜNCELLER: artık
--   oyuncunun Choices kaydına da bakarlar. (Tablo yoksa o kontrol atlanır, hata vermez.)
--
-- Hesaplar dört oyunda ortaktır (auth.users). Bir oyundan "Hesabı sil" → o oyunun kaydı silinir;
-- oyuncunun başka oyunda verisi YOKSA kullanıcı da silinir, VARSA kullanıcı kalır.
--
-- Güvenlik: RLS açık, oyuncu yalnızca kendi satırını okur/yazar, anon'a yetki yok.
-- =====================================================================================

-- ------------------------------------------------------------------ yardımcı: updated_at
create or replace function public.choices_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ------------------------------------------------------------------ choices_saves
create table if not exists public.choices_saves (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  save_data   jsonb not null,
  level       integer generated always as (
                case when jsonb_typeof(save_data -> 'level') = 'number'
                     then (save_data ->> 'level')::numeric::integer end
              ) stored,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  constraint choices_saves_data_chk check (jsonb_typeof(save_data) = 'object'),
  -- Kötüye kullanım sınırı: tek kayıt en fazla ~256 KB (oyunun kaydı 10 KB civarı)
  constraint choices_saves_size_chk check (pg_column_size(save_data) < 262144)
);

-- updated_at her yazımda SUNUCU saatiyle yazılır
drop trigger if exists choices_saves_touch on public.choices_saves;
create trigger choices_saves_touch before insert or update on public.choices_saves
  for each row execute function public.choices_touch_updated_at();

alter table public.choices_saves enable row level security;

drop policy if exists choices_saves_select_own on public.choices_saves;
create policy choices_saves_select_own on public.choices_saves
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists choices_saves_insert_own on public.choices_saves;
create policy choices_saves_insert_own on public.choices_saves
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists choices_saves_update_own on public.choices_saves;
create policy choices_saves_update_own on public.choices_saves
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.choices_saves from anon, public;
grant select, insert, update on public.choices_saves to authenticated;

-- ------------------------------------------------------------------ hesap silme (üç oyun)
create or replace function public.choices_delete_my_account()
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  elsewhere boolean := false;
begin
  if me is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  delete from public.choices_saves where user_id = me;

  -- Diğer Not a Fake Ad oyunlarında kaydı var mı?
  if to_regclass('public.nfa_saves') is not null then
    execute 'select exists (select 1 from public.nfa_saves where user_id = $1)' into elsewhere using me;
  end if;
  if not elsewhere and to_regclass('public.tower_saves') is not null then
    execute 'select exists (select 1 from public.tower_saves where user_id = $1)' into elsewhere using me;
  end if;
  -- Kelime Köyü tabloları bu projede var mı, varsa oyuncunun orada verisi var mı?
  if not elsewhere and to_regclass('public.player_saves') is not null then
    execute 'select exists (select 1 from public.player_saves where user_id = $1)' into elsewhere using me;
  end if;
  if not elsewhere and to_regclass('public.profiles') is not null then
    execute 'select exists (select 1 from public.profiles where id = $1)' into elsewhere using me;
  end if;
  if not elsewhere and to_regclass('public.player_stats') is not null then
    execute 'select exists (select 1 from public.player_stats where user_id = $1)' into elsewhere using me;
  end if;
  -- Yönetici hesabı yanlışlıkla silinmesin
  if not elsewhere and to_regclass('public.admins') is not null then
    execute 'select exists (select 1 from public.admins where user_id = $1)' into elsewhere using me;
  end if;

  if not elsewhere then
    delete from auth.users where id = me;
  end if;
  return jsonb_build_object('user_deleted', not elsewhere);
end;
$$;
revoke execute on function public.choices_delete_my_account() from public, anon;
grant execute on function public.choices_delete_my_account() to authenticated;

create or replace function public.nfa_delete_my_account()
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  elsewhere boolean := false;
begin
  if me is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  delete from public.nfa_saves where user_id = me;

  -- Diğer Not a Fake Ad oyunlarında kaydı var mı?
  if to_regclass('public.tower_saves') is not null then
    execute 'select exists (select 1 from public.tower_saves where user_id = $1)' into elsewhere using me;
  end if;
  if not elsewhere and to_regclass('public.choices_saves') is not null then
    execute 'select exists (select 1 from public.choices_saves where user_id = $1)' into elsewhere using me;
  end if;
  -- Kelime Köyü tabloları bu projede var mı, varsa oyuncunun orada verisi var mı?
  if not elsewhere and to_regclass('public.player_saves') is not null then
    execute 'select exists (select 1 from public.player_saves where user_id = $1)' into elsewhere using me;
  end if;
  if not elsewhere and to_regclass('public.profiles') is not null then
    execute 'select exists (select 1 from public.profiles where id = $1)' into elsewhere using me;
  end if;
  if not elsewhere and to_regclass('public.player_stats') is not null then
    execute 'select exists (select 1 from public.player_stats where user_id = $1)' into elsewhere using me;
  end if;
  -- Yönetici hesabı yanlışlıkla silinmesin
  if not elsewhere and to_regclass('public.admins') is not null then
    execute 'select exists (select 1 from public.admins where user_id = $1)' into elsewhere using me;
  end if;

  if not elsewhere then
    delete from auth.users where id = me;
  end if;
  return jsonb_build_object('user_deleted', not elsewhere);
end;
$$;
revoke execute on function public.nfa_delete_my_account() from public, anon;
grant execute on function public.nfa_delete_my_account() to authenticated;

create or replace function public.tower_delete_my_account()
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  elsewhere boolean := false;
begin
  if me is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  delete from public.tower_saves where user_id = me;

  -- Diğer Not a Fake Ad oyunlarında kaydı var mı?
  if to_regclass('public.nfa_saves') is not null then
    execute 'select exists (select 1 from public.nfa_saves where user_id = $1)' into elsewhere using me;
  end if;
  if not elsewhere and to_regclass('public.choices_saves') is not null then
    execute 'select exists (select 1 from public.choices_saves where user_id = $1)' into elsewhere using me;
  end if;
  -- Kelime Köyü tabloları bu projede var mı, varsa oyuncunun orada verisi var mı?
  if not elsewhere and to_regclass('public.player_saves') is not null then
    execute 'select exists (select 1 from public.player_saves where user_id = $1)' into elsewhere using me;
  end if;
  if not elsewhere and to_regclass('public.profiles') is not null then
    execute 'select exists (select 1 from public.profiles where id = $1)' into elsewhere using me;
  end if;
  if not elsewhere and to_regclass('public.player_stats') is not null then
    execute 'select exists (select 1 from public.player_stats where user_id = $1)' into elsewhere using me;
  end if;
  -- Yönetici hesabı yanlışlıkla silinmesin
  if not elsewhere and to_regclass('public.admins') is not null then
    execute 'select exists (select 1 from public.admins where user_id = $1)' into elsewhere using me;
  end if;

  if not elsewhere then
    delete from auth.users where id = me;
  end if;
  return jsonb_build_object('user_deleted', not elsewhere);
end;
$$;
revoke execute on function public.tower_delete_my_account() from public, anon;
grant execute on function public.tower_delete_my_account() to authenticated;

-- ------------------------------------------------------------------ kontrol
-- Çalıştırdıktan sonra şu sorgu "choices_saves | true" döndürmeli (RLS açık):
--   select relname, relrowsecurity from pg_class where relname = 'choices_saves';
