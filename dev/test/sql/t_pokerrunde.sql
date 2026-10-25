-- Proben fuer supabase/pokerrunde.sql: Profile per Trigger, Hall, Namen, Rechte, Freunde, Einladungen, Spielstand.
reset role;
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'a@t', '{"name":"Anna","code":"AAAAA2","color":"#123456"}'),
  ('00000000-0000-0000-0000-00000000000b', 'b@t', '{"name":" Ben "}'),
  ('00000000-0000-0000-0000-00000000000c', 'c@t', '{"name":"Cleo","code":"AAAAA2"}')
on conflict do nothing;
do $$ begin
  assert (select count(*) from public.profiles) = 3, 'drei Profile per Trigger';
  assert (select code from public.profiles where name = 'Anna') = 'AAAAA2', 'Spielercode aus der Registrierung';
  assert (select code from public.profiles where name = 'Cleo') <> 'AAAAA2', 'doppelter Spielercode wird ersetzt';
  assert (select color from public.profiles where name = 'Anna') = '#123456', 'Farbe';
  assert (select name from public.profiles where id = '00000000-0000-0000-0000-00000000000b') = 'Ben', 'Name ohne Leerzeichen';
end $$;
do $$ begin
  begin
    insert into auth.users (id, email, raw_user_meta_data) values (gen_random_uuid(), 'd@t', '{"name":"anna"}');
    raise exception 'doppelter Name ging durch';
  exception when unique_violation then null;
  end;
end $$;

-- ohne Anmeldung: nur name_free
select public.test_as(null);
set role anon;
do $$ begin assert public.name_free('Neu') and not public.name_free(' ANNA ') and not public.name_free('x'), 'name_free'; end $$;
do $$ begin
  begin perform 1 from public.profiles; raise exception 'anon liest profiles'; exception when insufficient_privilege then null; end;
end $$;
reset role;

-- Anna
select public.test_as('00000000-0000-0000-0000-00000000000a');
set role authenticated;
do $$ begin assert (select count(*) from public.profiles) = 3, 'Hall sieht alle Spieler'; end $$;
do $$ begin assert public.befriend('00000000-0000-0000-0000-00000000000b') = 'pending', 'Anfrage'; end $$;
do $$ begin update public.profiles set bank = 500, stars = 2 where id = auth.uid(); assert found, 'eigenes Profil aenderbar'; end $$;
do $$ begin
  begin update public.profiles set name = 'Xaver' where id = auth.uid(); raise exception 'Name aenderbar'; exception when insufficient_privilege then null; end;
end $$;
do $$ begin update public.profiles set bank = 1 where name = 'Ben'; assert not found, 'fremdes Profil aenderbar'; end $$;
do $$ begin
  begin
    insert into public.invites (from_id, to_id, g, code) values (auth.uid(), '00000000-0000-0000-0000-00000000000b', 'poker', 'ABCDE');
    raise exception 'Einladung ohne Freundschaft';
  exception when insufficient_privilege then null;
  end;
end $$;
insert into public.saves (id, data) values (auth.uid(), '{"pr-profile":"{}"}') on conflict (id) do update set data = excluded.data;
reset role;

-- Ben nimmt an und laedt ein
select public.test_as('00000000-0000-0000-0000-00000000000b');
set role authenticated;
do $$ begin
  assert (select count(*) from public.friendships) = 1, 'Ben sieht die Anfrage';
  assert public.accept_friend('00000000-0000-0000-0000-00000000000a'), 'annehmen';
  assert (select status from public.friendships) = 'accepted', 'befreundet';
  assert (select count(*) from public.saves) = 0, 'fremder Spielstand sichtbar';
end $$;
insert into public.invites (from_id, to_id, g, code) values (auth.uid(), '00000000-0000-0000-0000-00000000000a', 'bj', 'ABCDE');
reset role;

-- Cleo sieht fremde Freundschaften und Einladungen nicht
select public.test_as('00000000-0000-0000-0000-00000000000c');
set role authenticated;
do $$ begin
  assert (select count(*) from public.friendships) = 0 and (select count(*) from public.invites) = 0, 'Cleo sieht Fremdes';
  assert public.befriend('00000000-0000-0000-0000-00000000000a') = 'pending', 'Cleo fragt Anna';
end $$;
reset role;

-- Anna: Gegenanfrage macht sofort befreundet, Freundschaft beenden
select public.test_as('00000000-0000-0000-0000-00000000000a');
set role authenticated;
do $$ begin
  assert (select count(*) from public.invites) = 1, 'Anna sieht Bens Einladung';
  assert public.befriend('00000000-0000-0000-0000-00000000000c') = 'accepted', 'Gegenanfrage';
  assert public.unfriend('00000000-0000-0000-0000-00000000000b'), 'beenden';
  assert (select count(*) from public.friendships) = 1, 'nur noch Cleo';
end $$;
reset role;
select public.test_as(null);
