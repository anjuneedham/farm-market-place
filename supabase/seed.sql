-- AgriLoop — Supabase seed data.
-- Applied once to the live project via mcp__Supabase__execute_sql; kept here for
-- reproducibility (e.g. supabase db reset locally) and disaster recovery, not
-- meant to be re-run against a database that already has these rows — the
-- UNIQUE constraints on slug/code/email will reject the duplicates rather than
-- silently doubling them.

-- ── Reference geography (Country/Region/Community) ─────────────────────────
-- Generated from the app's own src/lib/location/{countries,jamaica}.ts so the
-- ids match exactly what the in-memory marketplace already uses.


insert into public."Country" (code, name, currency, locale, "dialCode", "flagEmoji", "regionLabel", "communityLabel", "isLive", "sortOrder") values
  ('JM', 'Jamaica', 'JMD', 'en-JM', '+1876', '🇯🇲', 'Parish', 'Community', true, 0),
  ('TT', 'Trinidad & Tobago', 'TTD', 'en-TT', '+1868', '🇹🇹', 'Region', 'District', false, 1),
  ('BB', 'Barbados', 'BBD', 'en-BB', '+1246', '🇧🇧', 'Parish', 'District', false, 2),
  ('GY', 'Guyana', 'GYD', 'en-GY', '+592', '🇬🇾', 'Region', 'Village', false, 3),
  ('GD', 'Grenada', 'XCD', 'en-GD', '+1473', '🇬🇩', 'Parish', 'Town', false, 4),
  ('DM', 'Dominica', 'XCD', 'en-DM', '+1767', '🇩🇲', 'Parish', 'Village', false, 5),
  ('LC', 'Saint Lucia', 'XCD', 'en-LC', '+1758', '🇱🇨', 'District', 'Community', false, 6),
  ('VC', 'St. Vincent & the Grenadines', 'XCD', 'en-VC', '+1784', '🇻🇨', 'Parish', 'Community', false, 7),
  ('AG', 'Antigua & Barbuda', 'XCD', 'en-AG', '+1268', '🇦🇬', 'Parish', 'Community', false, 8),
  ('KN', 'St. Kitts & Nevis', 'XCD', 'en-KN', '+1869', '🇰🇳', 'Parish', 'Community', false, 9),
  ('BS', 'Bahamas', 'BSD', 'en-BS', '+1242', '🇧🇸', 'Island', 'Settlement', false, 10),
  ('HT', 'Haiti', 'HTG', 'fr-HT', '+509', '🇭🇹', 'Department', 'Commune', false, 11),
  ('DO', 'Dominican Republic', 'DOP', 'es-DO', '+1809', '🇩🇴', 'Province', 'Municipality', false, 12);

insert into public."Region" (id, "countryCode", name, slug, latitude, longitude, "sortOrder", "isActive") values
  ('region_jm_kingston', 'JM', 'Kingston', 'kingston', 17.9771, -76.7674, 0, true),
  ('region_jm_st-andrew', 'JM', 'St. Andrew', 'st-andrew', 18.0431, -76.7899, 1, true),
  ('region_jm_st-thomas', 'JM', 'St. Thomas', 'st-thomas', 17.9, -76.35, 2, true),
  ('region_jm_portland', 'JM', 'Portland', 'portland', 18.1745, -76.4498, 3, true),
  ('region_jm_st-mary', 'JM', 'St. Mary', 'st-mary', 18.3, -76.9, 4, true),
  ('region_jm_st-ann', 'JM', 'St. Ann', 'st-ann', 18.4333, -77.2, 5, true),
  ('region_jm_trelawny', 'JM', 'Trelawny', 'trelawny', 18.35, -77.65, 6, true),
  ('region_jm_st-james', 'JM', 'St. James', 'st-james', 18.4667, -77.9167, 7, true),
  ('region_jm_hanover', 'JM', 'Hanover', 'hanover', 18.4, -78.1333, 8, true),
  ('region_jm_westmoreland', 'JM', 'Westmoreland', 'westmoreland', 18.2167, -78.1333, 9, true),
  ('region_jm_st-elizabeth', 'JM', 'St. Elizabeth', 'st-elizabeth', 18.05, -77.75, 10, true),
  ('region_jm_manchester', 'JM', 'Manchester', 'manchester', 18.0417, -77.5069, 11, true),
  ('region_jm_clarendon', 'JM', 'Clarendon', 'clarendon', 17.9667, -77.2333, 12, true),
  ('region_jm_st-catherine', 'JM', 'St. Catherine', 'st-catherine', 18, -77, 13, true);

insert into public."Community" (id, "regionId", name, slug, "isActive") values
  ('community_jm_kingston_downtown-kingston', 'region_jm_kingston', 'Downtown Kingston', 'downtown-kingston', true),
  ('community_jm_kingston_allman-town', 'region_jm_kingston', 'Allman Town', 'allman-town', true),
  ('community_jm_kingston_rae-town', 'region_jm_kingston', 'Rae Town', 'rae-town', true),
  ('community_jm_kingston_fletchers-land', 'region_jm_kingston', 'Fletchers Land', 'fletchers-land', true),
  ('community_jm_st-andrew_half-way-tree', 'region_jm_st-andrew', 'Half Way Tree', 'half-way-tree', true),
  ('community_jm_st-andrew_papine', 'region_jm_st-andrew', 'Papine', 'papine', true),
  ('community_jm_st-andrew_gordon-town', 'region_jm_st-andrew', 'Gordon Town', 'gordon-town', true),
  ('community_jm_st-andrew_mavis-bank', 'region_jm_st-andrew', 'Mavis Bank', 'mavis-bank', true),
  ('community_jm_st-andrew_red-hills', 'region_jm_st-andrew', 'Red Hills', 'red-hills', true),
  ('community_jm_st-andrew_constant-spring', 'region_jm_st-andrew', 'Constant Spring', 'constant-spring', true),
  ('community_jm_st-thomas_morant-bay', 'region_jm_st-thomas', 'Morant Bay', 'morant-bay', true),
  ('community_jm_st-thomas_yallahs', 'region_jm_st-thomas', 'Yallahs', 'yallahs', true),
  ('community_jm_st-thomas_golden-grove', 'region_jm_st-thomas', 'Golden Grove', 'golden-grove', true),
  ('community_jm_st-thomas_seaforth', 'region_jm_st-thomas', 'Seaforth', 'seaforth', true),
  ('community_jm_st-thomas_bath', 'region_jm_st-thomas', 'Bath', 'bath', true),
  ('community_jm_portland_port-antonio', 'region_jm_portland', 'Port Antonio', 'port-antonio', true),
  ('community_jm_portland_buff-bay', 'region_jm_portland', 'Buff Bay', 'buff-bay', true),
  ('community_jm_portland_hope-bay', 'region_jm_portland', 'Hope Bay', 'hope-bay', true),
  ('community_jm_portland_manchioneal', 'region_jm_portland', 'Manchioneal', 'manchioneal', true),
  ('community_jm_portland_fellowship', 'region_jm_portland', 'Fellowship', 'fellowship', true),
  ('community_jm_st-mary_port-maria', 'region_jm_st-mary', 'Port Maria', 'port-maria', true),
  ('community_jm_st-mary_highgate', 'region_jm_st-mary', 'Highgate', 'highgate', true),
  ('community_jm_st-mary_annotto-bay', 'region_jm_st-mary', 'Annotto Bay', 'annotto-bay', true),
  ('community_jm_st-mary_richmond', 'region_jm_st-mary', 'Richmond', 'richmond', true),
  ('community_jm_st-mary_gayle', 'region_jm_st-mary', 'Gayle', 'gayle', true),
  ('community_jm_st-ann_ocho-rios', 'region_jm_st-ann', 'Ocho Rios', 'ocho-rios', true),
  ('community_jm_st-ann_st-anns-bay', 'region_jm_st-ann', 'St. Ann''s Bay', 'st-anns-bay', true),
  ('community_jm_st-ann_browns-town', 'region_jm_st-ann', 'Brown’s Town', 'browns-town', true),
  ('community_jm_st-ann_claremont', 'region_jm_st-ann', 'Claremont', 'claremont', true),
  ('community_jm_st-ann_moneague', 'region_jm_st-ann', 'Moneague', 'moneague', true),
  ('community_jm_st-ann_alexandria', 'region_jm_st-ann', 'Alexandria', 'alexandria', true),
  ('community_jm_trelawny_falmouth', 'region_jm_trelawny', 'Falmouth', 'falmouth', true),
  ('community_jm_trelawny_clarks-town', 'region_jm_trelawny', 'Clarks Town', 'clarks-town', true),
  ('community_jm_trelawny_duncans', 'region_jm_trelawny', 'Duncans', 'duncans', true),
  ('community_jm_trelawny_albert-town', 'region_jm_trelawny', 'Albert Town', 'albert-town', true),
  ('community_jm_trelawny_wakefield', 'region_jm_trelawny', 'Wakefield', 'wakefield', true),
  ('community_jm_st-james_montego-bay', 'region_jm_st-james', 'Montego Bay', 'montego-bay', true),
  ('community_jm_st-james_cambridge', 'region_jm_st-james', 'Cambridge', 'cambridge', true),
  ('community_jm_st-james_adelphi', 'region_jm_st-james', 'Adelphi', 'adelphi', true),
  ('community_jm_st-james_anchovy', 'region_jm_st-james', 'Anchovy', 'anchovy', true),
  ('community_jm_st-james_somerton', 'region_jm_st-james', 'Somerton', 'somerton', true),
  ('community_jm_hanover_lucea', 'region_jm_hanover', 'Lucea', 'lucea', true),
  ('community_jm_hanover_green-island', 'region_jm_hanover', 'Green Island', 'green-island', true),
  ('community_jm_hanover_sandy-bay', 'region_jm_hanover', 'Sandy Bay', 'sandy-bay', true),
  ('community_jm_hanover_ramble', 'region_jm_hanover', 'Ramble', 'ramble', true),
  ('community_jm_hanover_cascade', 'region_jm_hanover', 'Cascade', 'cascade', true),
  ('community_jm_westmoreland_savanna-la-mar', 'region_jm_westmoreland', 'Savanna-la-Mar', 'savanna-la-mar', true),
  ('community_jm_westmoreland_negril', 'region_jm_westmoreland', 'Negril', 'negril', true),
  ('community_jm_westmoreland_grange-hill', 'region_jm_westmoreland', 'Grange Hill', 'grange-hill', true),
  ('community_jm_westmoreland_darliston', 'region_jm_westmoreland', 'Darliston', 'darliston', true),
  ('community_jm_westmoreland_little-london', 'region_jm_westmoreland', 'Little London', 'little-london', true),
  ('community_jm_st-elizabeth_black-river', 'region_jm_st-elizabeth', 'Black River', 'black-river', true),
  ('community_jm_st-elizabeth_santa-cruz', 'region_jm_st-elizabeth', 'Santa Cruz', 'santa-cruz', true),
  ('community_jm_st-elizabeth_junction', 'region_jm_st-elizabeth', 'Junction', 'junction', true),
  ('community_jm_st-elizabeth_malvern', 'region_jm_st-elizabeth', 'Malvern', 'malvern', true),
  ('community_jm_st-elizabeth_nain', 'region_jm_st-elizabeth', 'Nain', 'nain', true),
  ('community_jm_st-elizabeth_bull-savannah', 'region_jm_st-elizabeth', 'Bull Savannah', 'bull-savannah', true),
  ('community_jm_st-elizabeth_southfield', 'region_jm_st-elizabeth', 'Southfield', 'southfield', true),
  ('community_jm_manchester_mandeville', 'region_jm_manchester', 'Mandeville', 'mandeville', true),
  ('community_jm_manchester_christiana', 'region_jm_manchester', 'Christiana', 'christiana', true),
  ('community_jm_manchester_porus', 'region_jm_manchester', 'Porus', 'porus', true),
  ('community_jm_manchester_spaldings', 'region_jm_manchester', 'Spaldings', 'spaldings', true),
  ('community_jm_manchester_newport', 'region_jm_manchester', 'Newport', 'newport', true),
  ('community_jm_manchester_williamsfield', 'region_jm_manchester', 'Williamsfield', 'williamsfield', true),
  ('community_jm_clarendon_may-pen', 'region_jm_clarendon', 'May Pen', 'may-pen', true),
  ('community_jm_clarendon_chapelton', 'region_jm_clarendon', 'Chapelton', 'chapelton', true),
  ('community_jm_clarendon_frankfield', 'region_jm_clarendon', 'Frankfield', 'frankfield', true),
  ('community_jm_clarendon_lionel-town', 'region_jm_clarendon', 'Lionel Town', 'lionel-town', true),
  ('community_jm_clarendon_rock-river', 'region_jm_clarendon', 'Rock River', 'rock-river', true),
  ('community_jm_clarendon_mocho', 'region_jm_clarendon', 'Mocho', 'mocho', true),
  ('community_jm_st-catherine_spanish-town', 'region_jm_st-catherine', 'Spanish Town', 'spanish-town', true),
  ('community_jm_st-catherine_portmore', 'region_jm_st-catherine', 'Portmore', 'portmore', true),
  ('community_jm_st-catherine_old-harbour', 'region_jm_st-catherine', 'Old Harbour', 'old-harbour', true),
  ('community_jm_st-catherine_linstead', 'region_jm_st-catherine', 'Linstead', 'linstead', true),
  ('community_jm_st-catherine_bog-walk', 'region_jm_st-catherine', 'Bog Walk', 'bog-walk', true),
  ('community_jm_st-catherine_ewarton', 'region_jm_st-catherine', 'Ewarton', 'ewarton', true);


-- AUTO-GENERATED by scratchpad/gen-demo-seed.ts from src/lib/db/seed/people.ts — do not hand-edit.
-- Seeds the 27 AgriLoop demo people as real Supabase Auth users + public.User/FarmProfile/BusinessProfile/BuyerProfile rows.
-- Shared demo password: agriloop-demo-2026

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change
) values
  ('00000000-0000-0000-0000-000000000000', '02bfbcfa-96d4-54d9-86ae-fe8214f0a7bb', 'authenticated', 'authenticated', 'admin@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"AgriLoop Operations"}'::jsonb, '2026-03-01T18:31:54.201Z', '2026-03-01T18:31:54.201Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '3e2d7e14-875b-5bc2-a4d6-d3ea2231258a', 'authenticated', 'authenticated', 'green-valley-farm@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Deveon Grant","role":"FARMER"}'::jsonb, '2026-04-20T18:31:54.201Z', '2026-04-20T18:31:54.201Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '72cac102-707b-58f7-b8c9-eb63d1d96d8b', 'authenticated', 'authenticated', 'santa-cruz-provision-grounds@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Marsha Bewley","role":"FARMER"}'::jsonb, '2026-04-27T18:31:54.202Z', '2026-04-27T18:31:54.202Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '12feee4d-7202-551e-9601-f51282f64eed', 'authenticated', 'authenticated', 'clarendon-plains-poultry@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Everton Sinclair","role":"FARMER"}'::jsonb, '2026-05-04T18:31:54.202Z', '2026-05-04T18:31:54.202Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'b9fb9b83-ad52-5ba9-99fd-e25396f1f6fd', 'authenticated', 'authenticated', 'spaldings-greenhouse-co-op@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Anika Reid","role":"FARMER"}'::jsonb, '2026-05-11T18:31:54.202Z', '2026-05-11T18:31:54.202Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '4dae8683-4924-5959-8c0d-22638e2fcf98', 'authenticated', 'authenticated', 'trelawny-yam-grounds@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Colin Whyte","role":"FARMER"}'::jsonb, '2026-05-18T18:31:54.202Z', '2026-05-18T18:31:54.202Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '3722d6cc-9d8e-51e2-9654-8d7d4f03e754', 'authenticated', 'authenticated', 'portland-rain-farm@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Shanice Palmer","role":"FARMER"}'::jsonb, '2026-05-25T18:31:54.202Z', '2026-05-25T18:31:54.202Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'd6c725ed-54a7-55ef-8283-51e7596f94df', 'authenticated', 'authenticated', 'yallahs-goat-farm@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Milton Gayle","role":"FARMER"}'::jsonb, '2026-06-01T18:31:54.202Z', '2026-06-01T18:31:54.202Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'c692fc24-4d6f-5ff9-a1f4-df8b20591a71', 'authenticated', 'authenticated', 'black-river-fish-ponds@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Raheem Douglas","role":"FARMER"}'::jsonb, '2026-06-08T18:31:54.202Z', '2026-06-08T18:31:54.202Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '2021fcf3-3fc8-50e6-9310-572aae78008d', 'authenticated', 'authenticated', 'anchovy-apiary@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Patrice Morgan","role":"FARMER"}'::jsonb, '2026-06-15T18:31:54.202Z', '2026-06-15T18:31:54.202Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '46e0c165-9509-5f13-8bf4-050ee88a7b13', 'authenticated', 'authenticated', 'highgate-spice-gardens@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Carlene Barrett","role":"FARMER"}'::jsonb, '2026-06-22T18:31:54.202Z', '2026-06-22T18:31:54.202Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '045a7e85-2cdd-53cb-a1c5-17e24c650fdc', 'authenticated', 'authenticated', 'bog-walk-ground-and-citrus@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Delroy Ennis","role":"FARMER"}'::jsonb, '2026-06-29T18:31:54.202Z', '2026-06-29T18:31:54.202Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '77f4d022-8df4-547b-8fc7-9840c19e6f22', 'authenticated', 'authenticated', 'mavis-bank-hill-farm@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nadine Clarke","role":"FARMER"}'::jsonb, '2026-07-06T18:31:54.202Z', '2026-07-06T18:31:54.202Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '24e760b3-c092-55c6-b800-9e767694d293', 'authenticated', 'authenticated', 'bluefields-ridge-growers@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Fitzroy Wint","role":"FARMER"}'::jsonb, '2026-07-13T18:31:54.202Z', '2026-07-13T18:31:54.202Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '713d2062-c7fd-5065-b8d2-59b2c706975e', 'authenticated', 'authenticated', 'moneague-highland-cattle@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Simone Blake","role":"FARMER"}'::jsonb, '2026-07-20T18:31:54.202Z', '2026-07-20T18:31:54.202Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '33727936-4271-5cf3-a7ad-07159082d74b', 'authenticated', 'authenticated', 'islandwide-agri-supplies@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ryan Chung","role":"BUSINESS"}'::jsonb, '2026-05-20T18:31:54.202Z', '2026-05-20T18:31:54.202Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '64f57a30-af30-5436-ad2a-82542fbebbab', 'authenticated', 'authenticated', 'clarendon-tractor-services@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Hopeton Barnes","role":"BUSINESS"}'::jsonb, '2026-05-29T18:31:54.202Z', '2026-05-29T18:31:54.202Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '054c4167-bc7b-5230-be73-3424cd2f6c0d', 'authenticated', 'authenticated', 'aquaflow-irrigation-jamaica@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Tashana Hall","role":"BUSINESS"}'::jsonb, '2026-06-07T18:31:54.202Z', '2026-06-07T18:31:54.202Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'c98f7b0e-9bca-53b1-b299-d4bedb6bb1de', 'authenticated', 'authenticated', 'cornwall-veterinary-group@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Kemar Levy","role":"BUSINESS"}'::jsonb, '2026-06-16T18:31:54.202Z', '2026-06-16T18:31:54.202Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '042a62bd-ea62-56c7-9ebd-2d81c6fc8411', 'authenticated', 'authenticated', 'highway-produce-haulage@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Andre Foster","role":"BUSINESS"}'::jsonb, '2026-06-25T18:31:54.202Z', '2026-06-25T18:31:54.202Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '68c41a76-09fe-59b2-9728-bd5c7bf912f8', 'authenticated', 'authenticated', 'harbour-street-kitchen@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Chef Andre Malcolm"}'::jsonb, '2026-06-09T18:31:54.202Z', '2026-06-09T18:31:54.202Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '01df3320-ad6a-5a7d-a88f-420266be3e92', 'authenticated', 'authenticated', 'rose-hall-bay-hotel@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kerri-Ann Foster"}'::jsonb, '2026-06-15T18:31:54.203Z', '2026-06-15T18:31:54.203Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'ada33c90-d595-5acd-8a7c-826acde01ec2', 'authenticated', 'authenticated', 'sunrise-fresh-market@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Trevor Salmon"}'::jsonb, '2026-06-21T18:31:54.203Z', '2026-06-21T18:31:54.203Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '7bfd1fee-0b09-5a3b-9276-9452a20e0ee2', 'authenticated', 'authenticated', 'island-catering-collective@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Michelle Grant-Bailey"}'::jsonb, '2026-06-27T18:31:54.203Z', '2026-06-27T18:31:54.203Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '54ea332b-6c20-5ef1-b110-3a6fceeadf8b', 'authenticated', 'authenticated', 'may-pen-wholesale-produce@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Owen Ricketts"}'::jsonb, '2026-07-03T18:31:54.203Z', '2026-07-03T18:31:54.203Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', 'aa210133-c896-5b30-ad19-449e422f6e14', 'authenticated', 'authenticated', 'portmore-community-kitchen@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sister Joan Wilks"}'::jsonb, '2026-07-09T18:31:54.203Z', '2026-07-09T18:31:54.203Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '72c40954-a3bf-5c9d-8d8e-4c9d856aa982', 'authenticated', 'authenticated', 'kingston-spice-works@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Damion Hyatt"}'::jsonb, '2026-07-15T18:31:54.203Z', '2026-07-15T18:31:54.203Z', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '774d5eaf-d747-536e-9694-411b04e6ff4e', 'authenticated', 'authenticated', 'lorna-bennett@agriloop.demo', extensions.crypt('agriloop-demo-2026', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Lorna Bennett"}'::jsonb, '2026-07-21T18:31:54.203Z', '2026-07-21T18:31:54.203Z', '', '', '', '');

update public."User" set role = 'ADMIN' where id = '02bfbcfa-96d4-54d9-86ae-fe8214f0a7bb';

update public."User" set phone = null, whatsapp = null, "lastSeenAt" = '2026-09-17T18:31:54.201Z' where id = '02bfbcfa-96d4-54d9-86ae-fe8214f0a7bb';
update public."User" set phone = '+1876-000-0000', whatsapp = '+1876-000-0000', "lastSeenAt" = '2026-09-14T18:31:54.201Z' where id = '3e2d7e14-875b-5bc2-a4d6-d3ea2231258a';
update public."User" set phone = '+1876-000-0000', whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.202Z' where id = '72cac102-707b-58f7-b8c9-eb63d1d96d8b';
update public."User" set phone = '+1876-000-0000', whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.202Z' where id = '12feee4d-7202-551e-9601-f51282f64eed';
update public."User" set phone = '+1876-000-0000', whatsapp = '+1876-000-0000', "lastSeenAt" = '2026-09-14T18:31:54.202Z' where id = 'b9fb9b83-ad52-5ba9-99fd-e25396f1f6fd';
update public."User" set phone = '+1876-000-0000', whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.202Z' where id = '4dae8683-4924-5959-8c0d-22638e2fcf98';
update public."User" set phone = '+1876-000-0000', whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.202Z' where id = '3722d6cc-9d8e-51e2-9654-8d7d4f03e754';
update public."User" set phone = '+1876-000-0000', whatsapp = '+1876-000-0000', "lastSeenAt" = '2026-09-14T18:31:54.202Z' where id = 'd6c725ed-54a7-55ef-8283-51e7596f94df';
update public."User" set phone = '+1876-000-0000', whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.202Z' where id = 'c692fc24-4d6f-5ff9-a1f4-df8b20591a71';
update public."User" set phone = '+1876-000-0000', whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.202Z' where id = '2021fcf3-3fc8-50e6-9310-572aae78008d';
update public."User" set phone = '+1876-000-0000', whatsapp = '+1876-000-0000', "lastSeenAt" = '2026-09-14T18:31:54.202Z' where id = '46e0c165-9509-5f13-8bf4-050ee88a7b13';
update public."User" set phone = '+1876-000-0000', whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.202Z' where id = '045a7e85-2cdd-53cb-a1c5-17e24c650fdc';
update public."User" set phone = '+1876-000-0000', whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.202Z' where id = '77f4d022-8df4-547b-8fc7-9840c19e6f22';
update public."User" set phone = '+1876-000-0000', whatsapp = '+1876-000-0000', "lastSeenAt" = '2026-09-14T18:31:54.202Z' where id = '24e760b3-c092-55c6-b800-9e767694d293';
update public."User" set phone = '+1876-000-0000', whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.202Z' where id = '713d2062-c7fd-5065-b8d2-59b2c706975e';
update public."User" set phone = '+1876-000-0000', whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.202Z' where id = '33727936-4271-5cf3-a7ad-07159082d74b';
update public."User" set phone = '+1876-000-0000', whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.202Z' where id = '64f57a30-af30-5436-ad2a-82542fbebbab';
update public."User" set phone = '+1876-000-0000', whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.202Z' where id = '054c4167-bc7b-5230-be73-3424cd2f6c0d';
update public."User" set phone = '+1876-000-0000', whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.202Z' where id = 'c98f7b0e-9bca-53b1-b299-d4bedb6bb1de';
update public."User" set phone = '+1876-000-0000', whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.202Z' where id = '042a62bd-ea62-56c7-9ebd-2d81c6fc8411';
update public."User" set phone = null, whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.202Z' where id = '68c41a76-09fe-59b2-9728-bd5c7bf912f8';
update public."User" set phone = null, whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.203Z' where id = '01df3320-ad6a-5a7d-a88f-420266be3e92';
update public."User" set phone = null, whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.203Z' where id = 'ada33c90-d595-5acd-8a7c-826acde01ec2';
update public."User" set phone = null, whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.203Z' where id = '7bfd1fee-0b09-5a3b-9276-9452a20e0ee2';
update public."User" set phone = null, whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.203Z' where id = '54ea332b-6c20-5ef1-b110-3a6fceeadf8b';
update public."User" set phone = null, whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.203Z' where id = 'aa210133-c896-5b30-ad19-449e422f6e14';
update public."User" set phone = null, whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.203Z' where id = '72c40954-a3bf-5c9d-8d8e-4c9d856aa982';
update public."User" set phone = null, whatsapp = null, "lastSeenAt" = '2026-09-14T18:31:54.203Z' where id = '774d5eaf-d747-536e-9694-411b04e6ff4e';

insert into public."FarmProfile" (
  "userId", name, slug, tagline, story, "countryCode", "regionId", "communityId", "yearsFarming", "farmSizeAcres", methods, specialties, "galleryUrls", "acceptsPickup", "acceptsDelivery", "deliveryNotes", "isVerified", "verifiedAt", "ratingAverage", "ratingCount", "followerCount", "isDemoData", "createdAt", "updatedAt"
) values
  ('3e2d7e14-875b-5bc2-a4d6-d3ea2231258a', 'Green Valley Farm', 'green-valley-farm', 'Hillside vegetables from Christiana, reaped to order.', 'Green Valley has worked the same six acres above Christiana for three generations. We reap to order twice a week so produce leaves the field the morning it travels, and we sell to hotels, restaurants and households across Manchester and Kingston.', 'JM', 'region_jm_manchester', 'community_jm_manchester_christiana', 18, 6, ARRAY['CONVENTIONAL'::public.farming_method,'GREENHOUSE'::public.farming_method], ARRAY['Tomato','Scotch Bonnet Pepper','Sweet Pepper','Cucumber']::text[], '{}', true, true, 'Delivery available for orders above the minimum.', true, '2026-04-30T18:31:54.202Z', 4.9, 127, 4, true, '2026-04-20T18:31:54.202Z', '2026-09-17T18:31:54.202Z'),
  ('72cac102-707b-58f7-b8c9-eb63d1d96d8b', 'Santa Cruz Provision Grounds', 'santa-cruz-provision-grounds', 'Ground provisions from the breadbasket parish.', 'We grow yellow yam, sweet potato and dasheen on the red earth around Santa Cruz. Most of our crop moves in bulk to market vendors and wholesalers, and we hold back a portion each week for direct buyers.', 'JM', 'region_jm_st-elizabeth', 'community_jm_st-elizabeth_santa-cruz', 22, 14, ARRAY['CONVENTIONAL'::public.farming_method], ARRAY['Yellow Yam','Sweet Potato','Dasheen','Pumpkin']::text[], '{}', true, false, null, true, '2026-05-07T18:31:54.202Z', 4.7, 64, 7, true, '2026-04-27T18:31:54.202Z', '2026-09-16T18:31:54.202Z'),
  ('12feee4d-7202-551e-9601-f51282f64eed', 'Clarendon Plains Poultry', 'clarendon-plains-poultry', 'Broilers and layers, batched weekly.', 'A family poultry operation running four houses outside May Pen. We batch broilers every week and supply fresh eggs daily to shops, caterers and households.', 'JM', 'region_jm_clarendon', 'community_jm_clarendon_may-pen', 11, 3, ARRAY['CONVENTIONAL'::public.farming_method], ARRAY['Live Chicken','Dressed Chicken','Eggs']::text[], '{}', true, true, 'Delivery available for orders above the minimum.', true, '2026-05-14T18:31:54.202Z', 4.8, 92, 10, true, '2026-05-04T18:31:54.202Z', '2026-09-15T18:31:54.202Z'),
  ('b9fb9b83-ad52-5ba9-99fd-e25396f1f6fd', 'Spaldings Greenhouse Co-op', 'spaldings-greenhouse-co-op', 'Protected cultivation, consistent supply, year round.', 'Eleven small farmers pooling four greenhouses in Spaldings. Protected cultivation lets us hold quality and quantity through the wet season, which is when restaurant buyers struggle most to source.', 'JM', 'region_jm_manchester', 'community_jm_manchester_spaldings', 7, 2, ARRAY['GREENHOUSE'::public.farming_method,'HYDROPONIC'::public.farming_method], ARRAY['Tomato','Lettuce','Sweet Pepper','Pak Choi']::text[], '{}', true, true, 'Delivery available for orders above the minimum.', true, '2026-05-21T18:31:54.202Z', 4.9, 41, 13, true, '2026-05-11T18:31:54.202Z', '2026-09-14T18:31:54.202Z'),
  ('4dae8683-4924-5959-8c0d-22638e2fcf98', 'Trelawny Yam Grounds', 'trelawny-yam-grounds', 'Yellow yam from the yam capital.', 'Albert Town is yam country and we have farmed it for 30 years. We dig to order for wholesalers and exporters and can supply consistently from October through to June.', 'JM', 'region_jm_trelawny', 'community_jm_trelawny_albert-town', 30, 20, ARRAY['CONVENTIONAL'::public.farming_method], ARRAY['Yellow Yam','Dasheen','Cassava']::text[], '{}', true, false, null, true, '2026-05-28T18:31:54.202Z', 4.6, 38, 16, true, '2026-05-18T18:31:54.202Z', '2026-09-13T18:31:54.202Z'),
  ('3722d6cc-9d8e-51e2-9654-8d7d4f03e754', 'Portland Rain Farm', 'portland-rain-farm', 'Banana, plantain and breadfruit from the wet side.', 'Portland rain does the watering for us. We farm banana, plantain and breadfruit on the slopes above Fellowship and supply buyers across the north east.', 'JM', 'region_jm_portland', 'community_jm_portland_fellowship', 9, 8, ARRAY['ORGANIC_PRACTICES'::public.farming_method], ARRAY['Banana','Plantain','Breadfruit','Ackee']::text[], '{}', true, false, null, false, null, 4.5, 19, 19, true, '2026-05-25T18:31:54.202Z', '2026-09-12T18:31:54.202Z'),
  ('d6c725ed-54a7-55ef-8283-51e7596f94df', 'Yallahs Goat Farm', 'yallahs-goat-farm', 'Pasture-raised goats and sheep.', 'We raise Boer-cross goats and sheep on open pasture in St. Thomas. Animals are sold live, and we work with a licensed butcher for buyers who need them dressed.', 'JM', 'region_jm_st-thomas', 'community_jm_st-thomas_yallahs', 15, 26, ARRAY['PASTURE_RAISED'::public.farming_method], ARRAY['Goat','Sheep']::text[], '{}', true, true, 'Delivery available for orders above the minimum.', true, '2026-06-11T18:31:54.202Z', 4.8, 33, 22, true, '2026-06-01T18:31:54.202Z', '2026-09-11T18:31:54.202Z'),
  ('c692fc24-4d6f-5ff9-a1f4-df8b20591a71', 'Black River Fish Ponds', 'black-river-fish-ponds', 'Pond-raised tilapia, harvested to order.', 'Six ponds on the Black River morass producing tilapia year round. We harvest to order so fish reach the buyer the same day they leave the water.', 'JM', 'region_jm_st-elizabeth', 'community_jm_st-elizabeth_black-river', 12, 5, ARRAY['CONVENTIONAL'::public.farming_method], ARRAY['Tilapia']::text[], '{}', true, true, 'Delivery available for orders above the minimum.', false, null, 4.4, 22, 25, true, '2026-06-08T18:31:54.202Z', '2026-09-10T18:31:54.202Z'),
  ('2021fcf3-3fc8-50e6-9310-572aae78008d', 'Anchovy Apiary', 'anchovy-apiary', 'Raw logwood and mixed-flora honey.', 'Forty hives in the hills behind Anchovy. We bottle raw, unheated honey and sell wax to small producers. Logwood honey is available in the first half of the year.', 'JM', 'region_jm_st-james', 'community_jm_st-james_anchovy', 6, 1, ARRAY['ORGANIC_PRACTICES'::public.farming_method], ARRAY['Honey']::text[], '{}', true, true, 'Delivery available for orders above the minimum.', true, '2026-06-25T18:31:54.202Z', 5, 27, 28, true, '2026-06-15T18:31:54.202Z', '2026-09-09T18:31:54.202Z'),
  ('46e0c165-9509-5f13-8bf4-050ee88a7b13', 'Highgate Spice Gardens', 'highgate-spice-gardens', 'Pimento, ginger and turmeric from St. Mary.', 'We grow and dry pimento, ginger and turmeric on family land near Highgate, supplying small processors and the export trade.', 'JM', 'region_jm_st-mary', 'community_jm_st-mary_highgate', 13, 11, ARRAY['ORGANIC_PRACTICES'::public.farming_method,'MIXED'::public.farming_method], ARRAY['Pimento','Ginger','Turmeric']::text[], '{}', true, false, null, false, null, 4.6, 15, 31, true, '2026-06-22T18:31:54.202Z', '2026-09-08T18:31:54.202Z'),
  ('045a7e85-2cdd-53cb-a1c5-17e24c650fdc', 'Bog Walk Ground & Citrus', 'bog-walk-ground-and-citrus', 'Citrus and ground provisions, twenty minutes from Spanish Town.', 'Mixed farming in the Bog Walk gorge: citrus, callaloo, cassava and escallion. Our location makes us a reliable supplier for buyers in Spanish Town and Portmore.', 'JM', 'region_jm_st-catherine', 'community_jm_st-catherine_bog-walk', 16, 9, ARRAY['CONVENTIONAL'::public.farming_method], ARRAY['Callaloo','Cassava','Escallion','Papaya']::text[], '{}', true, true, 'Delivery available for orders above the minimum.', false, null, 4.3, 12, 34, true, '2026-06-29T18:31:54.202Z', '2026-09-07T18:31:54.202Z'),
  ('77f4d022-8df4-547b-8fc7-9840c19e6f22', 'Mavis Bank Hill Farm', 'mavis-bank-hill-farm', 'Cool-climate greens above Kingston.', 'At 900 metres the nights are cool enough for lettuce, pak choi and herbs that struggle on the plains. We deliver into Kingston three mornings a week.', 'JM', 'region_jm_st-andrew', 'community_jm_st-andrew_mavis-bank', 5, 3, ARRAY['ORGANIC_PRACTICES'::public.farming_method,'GREENHOUSE'::public.farming_method], ARRAY['Lettuce','Pak Choi','Thyme','Mint']::text[], '{}', true, true, 'Delivery available for orders above the minimum.', true, '2026-07-16T18:31:54.202Z', 4.9, 48, 37, true, '2026-07-06T18:31:54.202Z', '2026-09-06T18:31:54.202Z'),
  ('24e760b3-c092-55c6-b800-9e767694d293', 'Bluefields Ridge Growers', 'bluefields-ridge-growers', 'Vegetables and legumes from the Westmoreland hills.', 'A grower group of nine farms around Darliston. Pooling our reaping lets us fill orders none of us could fill alone, which is how we supply hotels along the west coast.', 'JM', 'region_jm_westmoreland', 'community_jm_westmoreland_darliston', 20, 34, ARRAY['CONVENTIONAL'::public.farming_method,'MIXED'::public.farming_method], ARRAY['String Bean','Gungo Peas','Cabbage','Carrot']::text[], '{}', true, true, 'Delivery available for orders above the minimum.', true, '2026-07-23T18:31:54.202Z', 4.7, 56, 40, true, '2026-07-13T18:31:54.202Z', '2026-09-05T18:31:54.202Z'),
  ('713d2062-c7fd-5065-b8d2-59b2c706975e', 'Moneague Highland Cattle', 'moneague-highland-cattle', 'Pasture cattle on St. Ann limestone.', 'We run a small commercial herd on limestone pasture near Moneague, selling weaners and finished animals to butchers and farmers building their own herds.', 'JM', 'region_jm_st-ann', 'community_jm_st-ann_moneague', 24, 62, ARRAY['PASTURE_RAISED'::public.farming_method], ARRAY['Cattle']::text[], '{}', true, false, null, false, null, 4.5, 9, 43, true, '2026-07-20T18:31:54.202Z', '2026-09-04T18:31:54.202Z');

insert into public."BusinessProfile" (
  "userId", name, slug, type, tagline, description, "countryCode", "regionId", "communityId", "servicesOffered", "isVerified", "verifiedAt", "ratingAverage", "ratingCount", "isDemoData", "createdAt", "updatedAt"
) values
  ('33727936-4271-5cf3-a7ad-07159082d74b', 'Islandwide Agri Supplies', 'islandwide-agri-supplies', 'INPUT_SUPPLIER'::public.business_type, 'Seeds, fertiliser and feed, islandwide delivery.', 'We stock vegetable seed, fertiliser, poultry feed and crop protection, with delivery to every parish. Volume pricing for farmer groups.', 'JM', 'region_jm_st-catherine', 'community_jm_st-catherine_spanish-town', ARRAY['Seed supply','Fertiliser','Poultry feed','Islandwide delivery']::text[], true, '2026-05-25T18:31:54.202Z', 4.6, 74, true, '2026-05-20T18:31:54.202Z', '2026-09-17T18:31:54.202Z'),
  ('64f57a30-af30-5436-ad2a-82542fbebbab', 'Clarendon Tractor Services', 'clarendon-tractor-services', 'SERVICES'::public.business_type, 'Ploughing, harrowing and land preparation by the acre.', 'Four tractors covering Clarendon, St. Catherine and south Manchester. Booked by the acre, with a minimum of two acres per visit.', 'JM', 'region_jm_clarendon', 'community_jm_clarendon_may-pen', ARRAY['Ploughing','Harrowing','Ridging','Bush clearing']::text[], true, '2026-06-03T18:31:54.202Z', 4.7, 51, true, '2026-05-29T18:31:54.202Z', '2026-09-16T18:31:54.202Z'),
  ('054c4167-bc7b-5230-be73-3424cd2f6c0d', 'AquaFlow Irrigation Jamaica', 'aquaflow-irrigation-jamaica', 'TECHNOLOGY'::public.business_type, 'Drip irrigation design, supply and installation.', 'We design and install drip and micro-sprinkler systems for farms from a quarter acre upward, and service what we install.', 'JM', 'region_jm_manchester', 'community_jm_manchester_mandeville', ARRAY['System design','Drip supply','Installation','Servicing']::text[], true, '2026-06-12T18:31:54.202Z', 4.8, 29, true, '2026-06-07T18:31:54.202Z', '2026-09-15T18:31:54.202Z'),
  ('c98f7b0e-9bca-53b1-b299-d4bedb6bb1de', 'Cornwall Veterinary Group', 'cornwall-veterinary-group', 'SERVICES'::public.business_type, 'Large and small animal veterinary care in the west.', 'Farm visits across St. James, Hanover, Westmoreland and Trelawny. Herd health, vaccination programmes and emergency call-out.', 'JM', 'region_jm_st-james', 'community_jm_st-james_montego-bay', ARRAY['Farm visits','Herd health','Vaccination','Emergency call-out']::text[], true, '2026-06-21T18:31:54.202Z', 4.9, 36, true, '2026-06-16T18:31:54.202Z', '2026-09-14T18:31:54.202Z'),
  ('042a62bd-ea62-56c7-9ebd-2d81c6fc8411', 'Highway Produce Haulage', 'highway-produce-haulage', 'TRANSPORT'::public.business_type, 'Refrigerated and open-tray produce transport.', 'Moving produce from farm gate to market, hotel and port. Refrigerated and open-tray trucks, priced by trip and distance.', 'JM', 'region_jm_clarendon', 'community_jm_clarendon_may-pen', ARRAY['Refrigerated transport','Open-tray transport','Market runs','Port delivery']::text[], false, null, 4.2, 18, true, '2026-06-25T18:31:54.202Z', '2026-09-13T18:31:54.202Z');

insert into public."BuyerProfile" (
  "userId", "displayName", slug, type, organisation, description, "countryCode", "regionId", "isVerified", "verifiedAt", "ratingAverage", "ratingCount", "isDemoData", "createdAt", "updatedAt"
) values
  ('68c41a76-09fe-59b2-9728-bd5c7bf912f8', 'Harbour Street Kitchen', 'harbour-street-kitchen', 'RESTAURANT'::public.buyer_type, 'Harbour Street Kitchen', 'A 90-seat restaurant in downtown Kingston sourcing produce weekly. We pay on delivery and prefer consistent suppliers over the lowest price.', 'JM', 'region_jm_kingston', true, '2026-06-13T18:31:54.203Z', 4.8, 12, true, '2026-06-09T18:31:54.203Z', '2026-09-17T18:31:54.203Z'),
  ('01df3320-ad6a-5a7d-a88f-420266be3e92', 'Rose Hall Bay Hotel', 'rose-hall-bay-hotel', 'HOTEL'::public.buyer_type, 'Rose Hall Bay Hotel', 'A 210-room property on the north coast. We buy produce, eggs and fish on standing weekly orders and welcome new suppliers who can hold quality.', 'JM', 'region_jm_st-james', true, '2026-06-19T18:31:54.203Z', 4.8, 13, true, '2026-06-15T18:31:54.203Z', '2026-09-16T18:31:54.203Z'),
  ('ada33c90-d595-5acd-8a7c-826acde01ec2', 'Sunrise Fresh Market', 'sunrise-fresh-market', 'SUPERMARKET'::public.buyer_type, 'Sunrise Fresh Market', 'Two neighbourhood supermarkets in St. Andrew. We are actively looking for farmers who can supply consistently rather than once.', 'JM', 'region_jm_st-andrew', true, '2026-06-25T18:31:54.203Z', 4.8, 14, true, '2026-06-21T18:31:54.203Z', '2026-09-15T18:31:54.203Z'),
  ('7bfd1fee-0b09-5a3b-9276-9452a20e0ee2', 'Island Catering Collective', 'island-catering-collective', 'CATERER'::public.buyer_type, 'Island Catering Collective', 'Event catering across the corporate area. Our volumes spike around events, so we look for farmers who can handle short-notice bulk orders.', 'JM', 'region_jm_st-catherine', false, null, 0, 0, true, '2026-06-27T18:31:54.203Z', '2026-09-14T18:31:54.203Z'),
  ('54ea332b-6c20-5ef1-b110-3a6fceeadf8b', 'May Pen Wholesale Produce', 'may-pen-wholesale-produce', 'WHOLESALER'::public.buyer_type, 'May Pen Wholesale Produce', 'We buy in bulk from farms across Clarendon and St. Elizabeth and distribute to vendors and shops across the island.', 'JM', 'region_jm_clarendon', true, '2026-07-07T18:31:54.203Z', 4.8, 16, true, '2026-07-03T18:31:54.203Z', '2026-09-13T18:31:54.203Z'),
  ('aa210133-c896-5b30-ad19-449e422f6e14', 'Portmore Community Kitchen', 'portmore-community-kitchen', 'INSTITUTION'::public.buyer_type, 'Portmore Community Kitchen', 'We prepare 600 meals a day for schools and elderly programmes in Portmore and buy ground provisions and vegetables weekly.', 'JM', 'region_jm_st-catherine', false, null, 0, 0, true, '2026-07-09T18:31:54.203Z', '2026-09-12T18:31:54.203Z'),
  ('72c40954-a3bf-5c9d-8d8e-4c9d856aa982', 'Kingston Spice Works', 'kingston-spice-works', 'FOOD_MANUFACTURER'::public.buyer_type, 'Kingston Spice Works', 'We make pepper sauces and seasonings for local retail. Scotch bonnet, pimento and escallion are our standing inputs.', 'JM', 'region_jm_kingston', true, '2026-07-19T18:31:54.203Z', 4.8, 18, true, '2026-07-15T18:31:54.203Z', '2026-09-11T18:31:54.203Z'),
  ('774d5eaf-d747-536e-9694-411b04e6ff4e', 'Lorna Bennett', 'lorna-bennett', 'HOUSEHOLD'::public.buyer_type, null, 'Buying fresh for my household and my mother’s, mostly around Mandeville.', 'JM', 'region_jm_manchester', false, null, 0, 0, true, '2026-07-21T18:31:54.203Z', '2026-09-10T18:31:54.203Z');
