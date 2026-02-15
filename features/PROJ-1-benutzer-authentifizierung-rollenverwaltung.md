# PROJ-1: Benutzer-Authentifizierung & Rollenverwaltung

## Status: Planned
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
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
