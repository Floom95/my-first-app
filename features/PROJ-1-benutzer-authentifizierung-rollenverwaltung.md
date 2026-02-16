# PROJ-1: Benutzer-Authentifizierung & Rollenverwaltung

## Status: In Review
**Created:** 2026-02-15
**Last Updated:** 2026-02-16

## Dependencies
- None (Foundation für alle anderen Features)

## User Stories
- Als **Social Media Manager** möchte ich mich mit E-Mail und Passwort registrieren und einloggen können, damit ich die App nutzen kann
- Als **Influencer** möchte ich eine Einladung per E-Mail erhalten und mich damit registrieren können, damit ich Zugriff auf meine Kooperationen bekomme
- Als **Social Media Manager** möchte ich Influencern bestimmte Rollen zuweisen können (Admin vs. Read-Only), damit ich Zugriffe kontrollieren kann
- Als **Nutzer** möchte ich mich sicher ausloggen können, damit meine Daten geschützt sind
- Als **System** möchte ich Multi-Tenancy unterstützen, damit mehrere Agenturen die App parallel nutzen können

## Acceptance Criteria
- [ ] Nutzer können sich mit E-Mail + Passwort registrieren
- [ ] Nutzer können sich einloggen und werden bei erfolgreicher Anmeldung zur Startseite weitergeleitet
- [ ] Nutzer können sich ausloggen und werden zur Login-Seite weitergeleitet
- [ ] Passwort-Reset-Funktion per E-Mail ist verfügbar
- [ ] Drei Rollen werden unterstützt: **Agency Admin** (voller Zugriff), **Influencer** (Lesezugriff), **Brand/Company** (eingeschränkter Zugriff)
- [ ] Jeder Nutzer gehört zu einer Organisation (Multi-Tenancy)
- [ ] Nutzer können nur Daten ihrer eigenen Organisation sehen (Row Level Security)
- [ ] E-Mail-Verifizierung beim ersten Login ist erforderlich
- [ ] Session bleibt für 7 Tage aktiv (oder bis Logout)

## Edge Cases
- **Was passiert, wenn jemand versucht, sich mit einer bereits registrierten E-Mail zu registrieren?**
  → Fehlermeldung: "Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an oder setzen Sie Ihr Passwort zurück."

- **Was passiert, wenn ein Influencer versucht, auf Admin-Funktionen zuzugreifen?**
  → Zugriff verweigert mit Meldung: "Sie haben keine Berechtigung für diese Aktion."

- **Wie funktioniert die erste Registrierung (Bootstrapping einer neuen Agentur)?**
  → Der erste registrierte Nutzer wird automatisch als Agency Admin angelegt und eine neue Organisation wird erstellt.

- **Was passiert, wenn ein Nutzer sein Passwort vergisst?**
  → "Passwort vergessen"-Link sendet Reset-E-Mail mit zeitlich begrenztem Token (24h gültig).

- **Können Nutzer ihre E-Mail-Adresse ändern?**
  → Im MVP: Nein. Kann in P1 hinzugefügt werden.

- **Was passiert bei fehlgeschlagenen Login-Versuchen?**
  → Nach 5 fehlgeschlagenen Versuchen innerhalb von 15 Minuten wird das Konto für 30 Minuten gesperrt.

## Technical Requirements
- **Technologie:** Supabase Auth (OAuth-ready, Row Level Security)
- **Passwort-Anforderungen:** Mindestens 8 Zeichen, 1 Großbuchstabe, 1 Zahl
- **Session-Dauer:** 7 Tage (JWT Token)
- **Security:**
  - HTTPS-only
  - CSRF-Protection
  - Row Level Security für Daten-Isolation zwischen Organisationen
- **Browser Support:** Chrome, Firefox, Safari (letzte 2 Versionen)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Designed:** 2026-02-15

### Seitenstruktur

```
App-Struktur
├── Öffentliche Seiten (ohne Login)
│   ├── /login - Login-Seite
│   ├── /register - Registrierung für neue Agenturen
│   └── /reset-password - Passwort zurücksetzen
├── Geschützte Seiten (nach Login)
│   ├── /dashboard - Hauptseite (rollenspezifisch)
│   └── /settings - Profil & Einstellungen
└── Layout-Komponenten
    ├── AuthLayout (zentriertes Formular mit Logo)
    └── AppLayout (Navigation + Content)
```

### Komponenten

```
Auth-Komponenten
├── LoginForm (E-Mail, Passwort, Links)
├── RegisterForm (E-Mail, Passwort, Name, Organisation)
├── ResetPasswordForm (E-Mail, Reset-Link senden)
├── InviteUserForm (E-Mail, Rolle, Name - für Admins)
└── RoleGuard (Schutz-Komponente für Seitenzugriff)
```

### Datenmodell

**Organizations:** ID, Name, Erstellungsdatum

**User Profiles** (zusätzlich zu Supabase Auth):
- Verknüpfung zum Auth User
- Organization ID
- Rolle (Agency Admin / Influencer / Brand)
- Vollständiger Name
- Timestamps

### Authentifizierungs-Flows

1. **Erstregistrierung:** Register → Organisation wird erstellt → Nutzer = Agency Admin → E-Mail-Verifizierung → Login
2. **Login:** E-Mail + Passwort → JWT Token (7 Tage) → Rolle laden → Dashboard
3. **Einladung:** Admin lädt ein → E-Mail mit Link → Influencer registriert sich → Automatisch der Organisation zugeordnet
4. **Passwort vergessen:** E-Mail eingeben → Reset-Link (24h gültig) → Neues Passwort setzen
5. **Logout:** Token löschen → Weiterleitung zu /login

### Sicherheit

- **Multi-Tenancy:** Row Level Security filtert automatisch nach organization_id
- **Rollen:** Jede Seite + API prüft Berechtigung; Influencer = Read-Only
- **Passwort:** Min. 8 Zeichen, 1 Großbuchstabe, 1 Zahl; bcrypt-verschlüsselt
- **Brute-Force:** 5 fehlgeschlagene Versuche → 30 Min Sperre
- **Session:** JWT httpOnly Cookie, 7 Tage gültig

### Tech-Entscheidungen

| Entscheidung | Warum |
|---|---|
| Supabase Auth | Fertige sichere Auth mit E-Mail-Verifizierung, Passwort-Reset, Rate-Limiting; OAuth später einfach ergänzbar |
| Row Level Security (RLS) | Datenisolation auf DB-Ebene - sicherer als nur Frontend-Filter |
| Eigene user_profiles Tabelle | Supabase Auth speichert keine Rollen/Org - flexible Verwaltung nötig |
| JWT statt Session-Cookies | Stateless, skaliert besser für SaaS |
| E-Mail-Verifizierung pflicht | Verhindert Fake-Accounts |

### Abhängigkeiten

- **@supabase/supabase-js** - Supabase Client
- **@supabase/auth-helpers-nextjs** - Next.js Auth Integration
- **react-hook-form** - Formular-Handling
- **zod** - Schema-Validierung
- **@hookform/resolvers** - Verbindung react-hook-form ↔ zod

## QA Test Results

**Tested:** 2026-02-16
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI) - Code Review + Datenbank-Analyse
**Supabase-Projekt:** xynxsohyoewfnuppidvv (VS Studio KI)

### Acceptance Criteria Status

#### AC-1: Nutzer koennen sich mit E-Mail + Passwort registrieren
- [x] RegisterForm vorhanden unter `/register` mit Feldern: Name, Organisation, E-Mail, Passwort, Passwort bestaetigen
- [x] Zod-Validierung: E-Mail-Format, Passwort min. 8 Zeichen, 1 Grossbuchstabe, 1 Zahl
- [x] Passwort-Bestaetigung wird geprueft (refine)
- [x] Supabase `signUp` wird korrekt aufgerufen mit `emailRedirectTo`
- [x] Erfolgsmeldung zeigt Hinweis auf Bestaetigungs-E-Mail
- [x] DB-Trigger `handle_new_user` erstellt automatisch Organisation + Profil
- **Ergebnis: BESTANDEN**

#### AC-2: Nutzer koennen sich einloggen und werden zur Startseite weitergeleitet
- [x] LoginForm vorhanden unter `/login` mit E-Mail + Passwort
- [x] Supabase `signInWithPassword` wird korrekt verwendet
- [x] Nach erfolgreichem Login: `window.location.href = "/dashboard"` (korrekt lt. Frontend-Regeln)
- [x] Session-Prüfung mit `data.session` vor Weiterleitung
- [x] Deutsche Fehlermeldungen bei ungültigen Anmeldedaten und unbestätigter E-Mail
- **Ergebnis: BESTANDEN**

#### AC-3: Nutzer koennen sich ausloggen und werden zur Login-Seite weitergeleitet
- [x] Logout-Button in Desktop-Sidebar und Mobile-Header (DropdownMenu + Sheet)
- [x] `signOut` im `useAuth` Hook: `supabase.auth.signOut()` + `window.location.href = "/login"`
- [x] Fehlerbehandlung bei signOut-Fehlern vorhanden
- **Ergebnis: BESTANDEN**

#### AC-4: Passwort-Reset-Funktion per E-Mail ist verfuegbar
- [x] ResetPasswordForm unter `/reset-password` vorhanden
- [x] "Passwort vergessen?" Link auf Login-Seite vorhanden
- [x] `resetPasswordForEmail` mit `redirectTo` zu `/auth/callback?next=/settings`
- [x] Erfolgs-Nachricht: "Der Link ist 24 Stunden gültig"
- [x] Passwort aendern auf Settings-Seite mit `updatePasswordSchema` Validierung
- [ ] BUG: Callback-Route leitet nach `/settings` weiter, aber dort gibt es kein "Neues Passwort setzen"-Formular mit einem klaren Kontext, dass der Benutzer gerade sein Passwort zuruecksetzt. Der Benutzer sieht die allgemeine Settings-Seite mit "Passwort aendern" Karte.
- **Ergebnis: BESTANDEN (mit Anmerkung)**

#### AC-5: Drei Rollen werden unterstuetzt
- [x] Enum `user_role` in DB: `agency_admin`, `influencer`, `brand`
- [x] TypeScript-Typen: `UserRole = "agency_admin" | "influencer" | "brand"`
- [x] `ROLE_LABELS` mit deutschen Bezeichnungen definiert
- [x] RoleGuard-Komponente schützt Admin-Inhalte
- [x] Dashboard zeigt rollenspezifische Inhalte (AdminDashboard vs. InfluencerDashboard)
- [x] Navigation filtert Admin-only Items (Briefing-Templates)
- [ ] BUG: `brand`-Rolle hat keinen spezifischen Dashboard-Inhalt. Weder AdminDashboard noch InfluencerDashboard wird fuer Brand-User angezeigt - sie sehen nur den leeren Header.
- **Ergebnis: TEILWEISE BESTANDEN**

#### AC-6: Jeder Nutzer gehoert zu einer Organisation (Multi-Tenancy)
- [x] `organizations` Tabelle mit RLS aktiviert
- [x] `user_profiles` hat `organization_id` als Pflichtfeld (FK zu organizations)
- [x] Signup-Trigger erstellt automatisch Organisation bei Erstregistrierung
- [x] Eingeladene Nutzer werden der bestehenden Organisation zugeordnet (`invited_organization_id`)
- **Ergebnis: BESTANDEN**

#### AC-7: Nutzer koennen nur Daten ihrer eigenen Organisation sehen (Row Level Security)
- [x] RLS auf ALLEN Tabellen aktiviert (organizations, user_profiles, companies, contacts, collaborations, briefings, briefing_templates)
- [x] `get_user_organization_id()` Funktion wird konsistent in allen Policies verwendet
- [x] SELECT-Policies filtern nach `organization_id = get_user_organization_id()`
- [x] INSERT/UPDATE/DELETE nur fuer agency_admin (ausser user_profiles eigenes Profil)
- [x] Influencer sehen nur ihnen zugewiesene Kooperationen
- **Ergebnis: BESTANDEN**

#### AC-8: E-Mail-Verifizierung beim ersten Login ist erforderlich
- [x] `signUp` mit `emailRedirectTo` konfiguriert
- [x] Erfolgsmeldung weist auf Bestaetigungs-E-Mail hin
- [x] Auth-Callback-Route (`/auth/callback`) tauscht Code gegen Session
- [x] LoginForm zeigt spezifische Meldung bei "Email not confirmed"
- [ ] HINWEIS: E-Mail-Verifizierung haengt von der Supabase-Konfiguration ab (Dashboard-Setting). Nicht im Code erzwingbar.
- **Ergebnis: BESTANDEN (abhaengig von Supabase-Einstellung)**

#### AC-9: Session bleibt fuer 7 Tage aktiv (oder bis Logout)
- [ ] BUG: Session-Dauer von 7 Tagen wird nirgends im Code konfiguriert. Supabase verwendet standardmaessig 3600 Sekunden (1 Stunde) fuer JWT-Tokens. Die 7-Tage-Konfiguration muss in den Supabase-Dashboard-Einstellungen oder ueber die Auth-Config gesetzt werden.
- [x] Middleware refresht die Session bei jedem Request korrekt
- [x] `supabase.auth.getUser()` wird in useAuth verwendet (nicht nur getSession)
- **Ergebnis: NICHT BESTANDEN** - Session-Dauer nicht auf 7 Tage konfiguriert

### Edge Cases Status

#### EC-1: Registrierung mit bereits registrierter E-Mail
- [x] Code prueft `authError.message.includes("already registered")`
- [x] Deutsche Fehlermeldung: "Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an oder setzen Sie Ihr Passwort zurück."
- **Ergebnis: BESTANDEN**

#### EC-2: Influencer versucht auf Admin-Funktionen zuzugreifen
- [x] RoleGuard-Komponente blockiert Zugriff und zeigt Fehlermeldung
- [x] RLS-Policies verhindern INSERT/UPDATE/DELETE fuer Nicht-Admins auf DB-Ebene
- [x] Navigation versteckt Admin-only Items
- [ ] BUG: Die Fehlermeldung im RoleGuard weicht leicht ab: "Sie haben keine Berechtigung für diese Aktion. Bitte wenden Sie sich an Ihren Administrator, wenn Sie glauben, dass dies ein Fehler ist." vs. spezifiziert: "Sie haben keine Berechtigung für diese Aktion."
- **Ergebnis: BESTANDEN (geringfuegige Abweichung)**

#### EC-3: Bootstrapping einer neuen Agentur (erster Nutzer)
- [x] DB-Trigger `handle_new_user` erstellt Organisation automatisch
- [x] Fallback-Name "Meine Agentur" wenn kein Organisationsname angegeben
- [x] Selbst-registrierte Nutzer werden immer als `agency_admin` gesetzt (unabhaengig von metadata)
- **Ergebnis: BESTANDEN**

#### EC-4: Passwort vergessen
- [x] "Passwort vergessen?"-Link auf Login-Seite vorhanden
- [x] ResetPasswordForm mit E-Mail-Eingabe
- [x] Erfolgs-Nachricht: "Der Link ist 24 Stunden gültig"
- [x] Datenschutz-konform: "Falls ein Konto mit dieser E-Mail-Adresse existiert" (verraet nicht ob Account existiert)
- **Ergebnis: BESTANDEN**

#### EC-5: E-Mail-Adresse aendern (MVP: Nein)
- [x] Kein "E-Mail aendern"-Feature auf der Settings-Seite implementiert
- [x] E-Mail wird nur als Anzeige dargestellt (nicht editierbar)
- **Ergebnis: BESTANDEN (korrekt nicht implementiert)**

#### EC-6: Fehlgeschlagene Login-Versuche (Brute-Force Schutz)
- [ ] BUG: Kein Brute-Force-Schutz im Frontend-Code implementiert. Kein Zaehler fuer fehlgeschlagene Versuche. Supabase Auth hat internes Rate-Limiting, aber die spezifizierten "5 Versuche / 15 Minuten / 30 Min Sperre" sind nicht sichtbar konfiguriert.
- **Ergebnis: NICHT BESTANDEN** - Brute-Force-Schutz nicht wie spezifiziert implementiert

### Zusaetzliche Edge Cases (vom QA identifiziert)

#### EC-7: Leere Supabase-Konfiguration
- [x] Middleware ueberspringt Auth-Check wenn Supabase nicht konfiguriert (`if (!supabaseUrl || !supabaseAnonKey)`)
- [ ] BUG: Browser-Client (`supabase.ts`) faellt still auf leere Strings zurueck (`?? ""`), was zu schwer verstaendlichen Fehlern fuehrt statt einer klaren Fehlermeldung
- **Ergebnis: TEILWEISE BESTANDEN**

#### EC-8: Einladungs-API - Rollen-Validierung
- [x] Nur `agency_admin` kann einladen (Server-side Check)
- [x] Nur Rollen `influencer` und `brand` sind zulaessig
- [x] E-Mail, Name und Rolle sind Pflichtfelder
- [ ] BUG: Kein Zod-Schema fuer Request-Body-Validierung in `/api/invite`. Manuelles Parsing mit `await request.json()` ohne Fehlerbehandlung bei ungueltigem JSON.
- **Ergebnis: TEILWEISE BESTANDEN**

#### EC-9: Auth-Callback Fehlerbehandlung
- [x] Callback-Route prueft auf Code-Parameter
- [x] Bei Fehler: Weiterleitung zu `/login?error=auth_callback_error`
- [ ] BUG: Login-Seite zeigt keinen Error-Hinweis wenn `?error=auth_callback_error` in der URL steht. Der Query-Parameter wird nicht ausgewertet.
- **Ergebnis: NICHT BESTANDEN**

#### EC-10: InviteUserForm fehlt
- [ ] BUG: Im Tech Design ist eine `InviteUserForm`-Komponente spezifiziert, aber es existiert keine UI dafuer. Die `/api/invite` Route existiert, aber es gibt kein Frontend-Formular fuer Admins zum Einladen von Nutzern.
- **Ergebnis: NICHT BESTANDEN**

### Security Audit Ergebnisse

#### Authentifizierung
- [x] Middleware schuetzt alle geschuetzten Routen (`/dashboard`, `/settings`, `/companies`, etc.)
- [x] Oeffentliche Routen korrekt definiert: `/login`, `/register`, `/reset-password`, `/auth/callback`
- [x] Authentifizierte Nutzer werden von Auth-Seiten wegredirected
- [ ] BUG: Root-Route `/` ist weder in publicRoutes noch wird sie gesondert behandelt. Die Middleware-Bedingung `request.nextUrl.pathname !== "/"` laesst unauthentifizierte Nutzer auf `/` zu, aber die `page.tsx` leitet vermutlich nicht weiter.

#### Autorisierung (IDOR-Pruefung)
- [x] RLS auf allen Tabellen aktiviert - Datenisolation auf DB-Ebene
- [x] `get_user_organization_id()` und `get_user_role()` Hilfsfunktionen korrekt implementiert
- [x] Admin-only Operationen (INSERT/UPDATE/DELETE) korrekt eingeschraenkt
- [x] Influencer sehen nur zugewiesene Kooperationen
- [x] Invite-API prueft `agency_admin` Rolle server-seitig

#### Input-Validierung
- [x] Zod-Schemas fuer Login, Register, Reset-Password, Update-Password
- [x] Passwort-Anforderungen: min. 8 Zeichen, 1 Grossbuchstabe, 1 Zahl (client-seitig via Zod)
- [ ] BUG (Medium): Passwort-Anforderungen werden nur client-seitig validiert. Supabase Auth hat eigene Mindestlaenge (default: 6 Zeichen), die moeglicherweise nicht auf "8 Zeichen + Grossbuchstabe + Zahl" konfiguriert ist. Ein direkter API-Aufruf umgeht die Zod-Validierung.

#### Rate-Limiting
- [x] Supabase Auth hat internes Rate-Limiting
- [ ] BUG (Medium): Kein zusaetzliches Rate-Limiting auf der Invite-API-Route. Kann missbraucht werden um viele Einladungs-E-Mails zu senden.

#### Secrets & Datenexposition
- [x] `.env.local.example` enthaelt nur Platzhalter, keine echten Credentials
- [x] Service Role Key nur server-seitig verwendet (`supabase-admin.ts`)
- [x] `NEXT_PUBLIC_` Prefix nur fuer URL und Anon-Key (korrekt)
- [ ] BUG (Medium): Die `supabase-admin.ts` verwendet den Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`), was korrekt ist, aber die Invite-API validiert den Request-Body nicht mit Zod. Ungueltige Eingaben koennten zu unerwarteten Admin-API-Aufrufen fuehren.

#### Supabase Security Advisors
- [ ] BUG (Medium): **4 Funktionen mit mutablem search_path**: `update_updated_at_column`, `get_user_organization_id`, `get_user_role`, `handle_new_user`. Dies ist ein Sicherheitsrisiko, da ein Angreifer mit Zugriff auf die DB den search_path manipulieren koennte. Siehe: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
- [ ] BUG (Low): `user_profiles` INSERT-Policy "New users can insert own profile during signup" hat `user_id = auth.uid()` ohne `(select ...)` Wrapper - Performance-Problem bei Skalierung.

#### CSRF-Schutz
- [x] Supabase Auth verwendet JWT Tokens (keine Cookies fuer Auth) - CSRF ist kein Risiko bei Token-basierter Auth

### Bugs Found

#### BUG-1: InviteUserForm-Komponente fehlt komplett
- **Severity:** High
- **Steps to Reproduce:**
  1. Gehe zu `/settings` oder einer anderen Admin-Seite
  2. Suche nach einer Moeglichkeit, neue Nutzer einzuladen
  3. Erwartet: Ein Formular zum Einladen von Influencern/Brands
  4. Tatsaechlich: Kein UI-Element vorhanden. Die Backend-Route `/api/invite` existiert, ist aber ueber die UI nicht erreichbar.
- **Priority:** Fix before deployment

#### BUG-2: Brand-Rolle hat kein Dashboard
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Logge dich als Nutzer mit Rolle "brand" ein
  2. Gehe zu `/dashboard`
  3. Erwartet: Rollenspezifischer Inhalt fuer Brand-Nutzer
  4. Tatsaechlich: Leere Seite - nur Header "Dashboard" und Willkommens-Nachricht sichtbar, kein Inhalt darunter
- **Priority:** Fix before deployment

#### BUG-3: Session-Dauer nicht auf 7 Tage konfiguriert
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Pruefe die Supabase Auth-Konfiguration
  2. Erwartet: JWT Token Lifetime = 604800 Sekunden (7 Tage)
  3. Tatsaechlich: Supabase-Standardwert ist 3600 Sekunden (1 Stunde). Muss im Supabase Dashboard unter Authentication > Settings > JWT Expiry konfiguriert werden.
- **Priority:** Fix before deployment

#### BUG-4: Brute-Force-Schutz nicht wie spezifiziert
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Versuche mehrfach sich mit falschen Credentials einzuloggen
  2. Erwartet: Nach 5 fehlgeschlagenen Versuchen 30 Minuten Sperre + entsprechende Fehlermeldung
  3. Tatsaechlich: Supabase Auth hat generisches Rate-Limiting, aber die spezifizierten Schwellenwerte (5 Versuche / 15 Min / 30 Min Sperre) sind nicht konfiguriert und keine UI-Rueckmeldung
- **Priority:** Fix in next sprint

#### BUG-5: Auth-Callback-Fehler wird nicht auf Login-Seite angezeigt
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Besuche `/login?error=auth_callback_error`
  2. Erwartet: Fehlermeldung, dass die Authentifizierung fehlgeschlagen ist
  3. Tatsaechlich: Login-Seite wird normal angezeigt ohne Hinweis auf den Fehler
- **Priority:** Fix before deployment

#### BUG-6: Mutable search_path bei DB-Funktionen (Sicherheitswarnung)
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Pruefe Supabase Security Advisors
  2. Erwartet: Alle Funktionen haben einen festen search_path
  3. Tatsaechlich: 4 Funktionen (`update_updated_at_column`, `get_user_organization_id`, `get_user_role`, `handle_new_user`) haben keinen festen search_path gesetzt
- **Remediation:** https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
- **Priority:** Fix before deployment

#### BUG-7: Supabase Client-Fehler bei fehlender Konfiguration
- **Severity:** Low
- **Steps to Reproduce:**
  1. Entferne `.env.local` Datei
  2. Starte die App und versuche, dich zu registrieren
  3. Erwartet: Klare Fehlermeldung, dass die Konfiguration fehlt
  4. Tatsaechlich: Browser-Client verwendet leere Strings, was zu kryptischen Netzwerkfehlern fuehrt
- **Priority:** Nice to have

#### BUG-8: Invite-API ohne Zod-Validierung
- **Severity:** Low
- **Steps to Reproduce:**
  1. Sende einen POST-Request an `/api/invite` mit ungueltigem JSON-Body
  2. Erwartet: Strukturierte Fehlermeldung
  3. Tatsaechlich: Unbehandelte Exception bei JSON-Parsing. Keine Zod-Schema-Validierung des Request-Body.
- **Priority:** Fix in next sprint

#### BUG-9: Passwort-Validierung nur client-seitig
- **Severity:** Low
- **Steps to Reproduce:**
  1. Sende direkten API-Aufruf an Supabase Auth mit Passwort "abc123" (weniger als 8 Zeichen, kein Grossbuchstabe)
  2. Erwartet: Abgelehnt aufgrund Passwort-Anforderungen
  3. Tatsaechlich: Supabase akzeptiert moeglicherweise das Passwort, da die strengeren Anforderungen (8 Zeichen + Grossbuchstabe + Zahl) nur im Zod-Schema auf Client-Seite validiert werden
- **Priority:** Fix in next sprint

#### BUG-10: Root-Route "/" Verhalten unklar
- **Severity:** Low
- **Steps to Reproduce:**
  1. Besuche `/` als unauthentifizierter Nutzer
  2. Erwartet: Weiterleitung zu `/login`
  3. Tatsaechlich: Die Middleware laesst unauthentifizierte Nutzer auf `/` zu (`pathname !== "/"`). Das Verhalten haengt von der Root-page.tsx ab.
- **Priority:** Nice to have

### Summary
- **Acceptance Criteria:** 7/9 bestanden (AC-5: teilweise, AC-9: nicht bestanden)
- **Edge Cases (dokumentiert):** 5/6 bestanden (EC-6: nicht bestanden)
- **Edge Cases (zusaetzlich):** 2/4 bestanden
- **Bugs Found:** 10 total (0 Critical, 1 High, 5 Medium, 4 Low)
- **Security:** Grundlage solide (RLS auf allen Tabellen), aber 4 DB-Funktionen mit mutablem search_path muessen behoben werden
- **Production Ready:** **NEIN**
- **Empfehlung:** Bugs #1 (InviteUserForm), #3 (Session-Dauer), #5 (Callback-Fehler), #6 (search_path) vor Deployment beheben. Bug #2 (Brand-Dashboard) ebenfalls empfohlen.

## Deployment
_To be added by /deploy_
