-- Seed ~30 Senegalese participants for the "Senpharma" event on Neon
-- Paste into Neon SQL Editor and execute
-- Event ID provided: cmc6spxzn0001jj04kvloirw8

WITH ev AS (
  SELECT 'cmc6spxzn0001jj04kvloirw8'::text AS id
),
src AS (
  SELECT 
    i,
    (ARRAY['Abdallah','Mamadou','Ibrahima','Cheikh','Pape','Moussa','Alioune','Serigne','Moustapha','Amadou','Fatou','Aminata','Awa','Coumba','Mame','Sokhna','Astou','Khady','Adji','Bineta'])[(random()*19)::int+1] AS first_name,
    (ARRAY['Diop','Ndiaye','Ba','Sarr','Fall','Sy','Faye','Gueye','Diallo','Sow','Ka','Thiam','Diagne','Diouf'])[(random()*13)::int+1] AS last_name,
    (ARRAY['SenPharma Labs','Dakar Biotech','Pharma Senegal','Baobab Health','Atlantic Medical','SunuCare','Sahel Diagnostics'])[(random()*6)::int+1] AS company,
    (ARRAY['Pharmacien','Responsable Qualite','Chef de produit','Commercial Sante','Consultant Reglementaire','Chercheur Clinique','Data Analyst Sante','Responsable Partenariats','CEO','COO'])[(random()*9)::int+1] AS job_title
  FROM generate_series(1,30) AS s(i)
),
-- create stable email using hashed slug (no unaccent extension required)
email_src AS (
  SELECT 
    i,
    first_name,
    last_name,
    company,
    job_title,
    'p' || substr(md5(first_name || last_name || i::text),1,10) || '+senpharma' || i || '@evenzi.io' AS email
  FROM src
),
ins_users AS (
  INSERT INTO users (id, name, email, created_at, updated_at)
  SELECT 
    substr(md5(random()::text || clock_timestamp()::text),1,24) AS id,
    e.first_name || ' ' || e.last_name,
    lower(email),
    now(), now()
  FROM email_src e
  ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, updated_at = now()
  RETURNING email, id
),
reg_base AS (
  SELECT 
    u.id as user_id,
    u.email,
    e.first_name,
    e.last_name,
    e.company,
    e.job_title,
    '+221 77 ' || lpad((trunc(random()*9000000)+1000000)::int::text,7,'0') AS phone,
    (SELECT id FROM ev) AS event_id
  FROM email_src e
  JOIN ins_users u USING (email)
),
-- Insert registrations (id and qr_code generated from md5; no pgcrypto required)
ins_regs AS (
  INSERT INTO registrations (id, first_name, last_name, email, phone, type, event_id, qr_code, created_at, updated_at, company, job_title)
  SELECT 
    substr(md5(random()::text || clock_timestamp()::text || r.email),1,24) AS id,
    r.first_name,
    r.last_name,
    r.email,
    r.phone,
    'PARTICIPANT',
    r.event_id,
    substr(md5(clock_timestamp()::text || r.email),1,32) AS qr_code,
    now(), now(),
    r.company,
    r.job_title
  FROM reg_base r
  ON CONFLICT (qr_code) DO NOTHING
  RETURNING email, id, event_id
)
-- Upsert matchmaking profiles (composite unique user_id+event_id)
INSERT INTO user_match_profiles (id, user_id, event_id, headline, bio, interests, goals, job_title, company, availability, created_at, updated_at)
SELECT 
  substr(md5(random()::text || u.user_id || r.event_id),1,24) AS id,
  u.user_id,
  r.event_id,
  r.job_title || ' chez ' || r.company AS headline,
  'Professionnel sénégalais du secteur santé/pharma.' AS bio,
  ARRAY['Pharmacie','Biotechnologie','Reglementation']::text[] AS interests,
  ARRAY['Networking','Partenariat']::text[] AS goals,
  r.job_title,
  r.company,
  ARRAY['09:00 - 10:00','10:00 - 11:00','14:00 - 15:00']::text[] AS availability,
  now(), now()
FROM reg_base r
JOIN ins_users u USING (email)
ON CONFLICT (user_id, event_id) DO UPDATE
SET headline = EXCLUDED.headline,
    bio = EXCLUDED.bio,
    interests = EXCLUDED.interests,
    goals = EXCLUDED.goals,
    job_title = EXCLUDED.job_title,
    company = EXCLUDED.company,
    availability = EXCLUDED.availability,
    updated_at = now();
