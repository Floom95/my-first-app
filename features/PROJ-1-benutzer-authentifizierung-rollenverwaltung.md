# PROJ-1: Benutzer-Authentifizierung & Rollenverwaltung

## Status: In Progress
**Created:** 2026-02-15
**Last Updated:** 2026-02-15

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
_To be added by /qa_

## Deployment
_To be added by /deploy_
