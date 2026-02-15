# Product Requirements Document

## Vision
Eine zentrale Plattform für Social Media Manager und Agenturen, um Influencer-Kooperationen effizient zu verwalten. Die App ermöglicht das Tracking von Kooperationen, Unternehmen, Ansprechpartnern und Briefings, während Influencer transparent über ihre anstehenden Aufgaben informiert werden.

## Target Users

### 1. Social Media Manager / Agenturen (Admin-Rolle)
- **Bedürfnisse:** Übersicht über alle laufenden und geplanten Kooperationen, schneller Zugriff auf Unternehmenskontakte, effiziente Briefing-Erstellung
- **Pain Points:** Manuelle Verwaltung in Excel/Spreadsheets, fehlende Transparenz für Influencer, zeitaufwändige Kommunikation bei Briefing-Änderungen

### 2. Influencer (Lese-Rolle)
- **Bedürfnisse:** Klare Übersicht über anstehende Kooperationen, Zugriff auf detaillierte Briefings, Transparenz über Deadlines und Anforderungen
- **Pain Points:** Unklare Briefings, verstreute Informationen in E-Mails/WhatsApp, mangelnde Planbarkeit

### 3. Unternehmen/Marken (Externe Partner)
- **Bedürfnisse:** Kooperationsanfragen stellen, Status ihrer Anfragen einsehen
- **Pain Points:** Intransparenter Prozess, lange Wartezeiten auf Rückmeldungen

## Core Features (Roadmap)

| Priority | Feature | Status |
|----------|---------|--------|
| P0 (MVP) | PROJ-1: Benutzer-Authentifizierung & Rollenverwaltung | Planned |
| P0 (MVP) | PROJ-2: Unternehmen & Ansprechpartner verwalten | Planned |
| P0 (MVP) | PROJ-3: Kooperationen verwalten | Planned |
| P0 (MVP) | PROJ-4: Briefing-System | Planned |
| P0 (MVP) | PROJ-5: Influencer-Dashboard (Lesezugriff) | Planned |
| P1 | PROJ-6: Datei-Upload für Briefings | Planned |
| P1 | PROJ-7: Benachrichtigungssystem | Planned |
| P2 | PROJ-8: Reporting & Analytics | Planned |

## Success Metrics
- **Aktivierung:** 80% der neu angelegten Influencer loggen sich innerhalb der ersten Woche ein
- **Engagement:** Social Media Manager erstellen durchschnittlich 5+ Kooperationen pro Woche
- **Effizienz:** Reduktion der Briefing-Erstellungszeit um 50% (vs. manuelle Prozesse)
- **Retention:** 70% monatliche aktive Nutzerrate nach 3 Monaten

## Constraints
- **Technologie:** Next.js, Supabase (Auth + Database), Tailwind CSS
- **Timeline:** MVP innerhalb von 6-8 Wochen
- **Team:** Solo-Entwicklung mit KI-Unterstützung
- **Hosting:** Vercel (Frontend) + Supabase (Backend)

## Non-Goals
- **Keine Payment-Integration im MVP** - Abrechnung erfolgt extern
- **Keine Content-Planung/Scheduling** - Fokus liegt auf Kooperations-Management, nicht auf Social Media Posting-Tools
- **Keine Chat/Messaging-Funktion** - Kommunikation erfolgt weiterhin über E-Mail/WhatsApp
- **Keine mobile App** - Zunächst nur Web-App (responsive Design)

---

Use `/architecture` to design the technical approach for each feature after this PRD is complete.
