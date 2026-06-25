# Migrazione a Supabase — Guida

Questa guida ti porta dal "demo mode" (localStorage) a un backend reale con
**Auth + Postgres + Storage**. I passi 1–4 li fai tu (richiedono il tuo account);
il passo 5 (cablaggio del data layer nell'app) lo faccio io dopo.

---

## 1. Crea il progetto Supabase
1. Vai su https://supabase.com → **New project**.
2. Scegli nome (es. `oltreage`), una password DB (salvala) e la region (Europe, es. `eu-central`).
3. Attendi il provisioning (~2 min).

## 2. Esegui lo schema
1. Nel progetto → **SQL Editor** → **New query**.
2. Incolla **tutto** il contenuto di [`supabase/schema.sql`](supabase/schema.sql).
3. **Run**. Crea tabelle, RLS, trigger, i 12 appartamenti e i bucket storage.

## 3. Configura l'autenticazione
1. **Authentication → Providers → Email**: lascia attivo Email.
2. **Authentication → Sign In / Up**: per la demo **disattiva "Confirm email"**
   (così il primo admin entra subito senza conferma via mail).

## 4. Copia le chiavi nell'app
1. **Project Settings → API**.
2. Crea il file `.env.local` (copia da `.env.local.example`) e incolla:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`  ⚠️ **segreto**, resta solo lato server.
3. **Non incollare le chiavi in chat.** Mettile solo in `.env.local` (è git-ignored).
   Quando hai finito, scrivimi “fatto”.

## 5. Cablaggio (lo faccio io)
Quando le chiavi sono in `.env.local`:
- Riscrivo `lib/app-context.tsx` per leggere/scrivere su Supabase invece di localStorage
  (stessa interfaccia `useApp`, le UI non cambiano).
- Login/registrazione via **Supabase Auth**; primo utente = admin (trigger già pronto).
- Creazione utenti da parte dell'admin via route server `/api/users` (usa la service_role).
- Upload **foto profilo** → bucket `avatars`; **documenti** → bucket `documents`.
- Verifico tutto nel browser e poi prepariamo il deploy su Vercel (stesse env).

---

### Note di sicurezza (demo → produzione)
- Le password sono gestite da Supabase Auth (hash sicuri): niente più password in chiaro.
- I documenti sanitari (art. 9 GDPR) vanno nel bucket **privato** `documents` con URL firmati a scadenza.
- Per produzione: riattiva la conferma email, rivedi le policy RLS, aggiungi un DPO.
