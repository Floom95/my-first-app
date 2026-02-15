# PROJ-7: Benachrichtigungssystem

## Status: Planned
**Created:** 2026-02-15
**Last Updated:** 2026-02-15

## Dependencies
- **Requires:** PROJ-1 (Benutzer-Authentifizierung)
- **Requires:** PROJ-3 (Kooperationen verwalten)
- **Requires:** PROJ-4 (Briefing-System)

## User Stories
- Als **Influencer** möchte ich eine E-Mail erhalten, wenn mir eine neue Kooperation zugewiesen wird, damit ich sofort informiert bin
- Als **Influencer** möchte ich eine E-Mail erhalten, wenn ein Briefing aktualisiert wird, damit ich über Änderungen Bescheid weiß
- Als **Social Media Manager** möchte ich E-Mail-Benachrichtigungen bei überfälligen Deadlines erhalten, damit ich rechtzeitig nachfassen kann
- Als **Nutzer** möchte ich Benachrichtigungseinstellungen anpassen können, damit ich nicht mit E-Mails überflutet werde

## Acceptance Criteria
- [ ] E-Mail-Benachrichtigungen bei:
  - Neue Kooperation zugewiesen (an Influencer)
  - Briefing erstellt/aktualisiert (an Influencer)
  - Deadline in 3 Tagen (an Influencer + Manager)
  - Deadline überschritten (an Manager)
- [ ] Nutzer können Benachrichtigungen in den Einstellungen aktivieren/deaktivieren
- [ ] E-Mails enthalten relevante Informationen + Link zur Kooperation
- [ ] E-Mails sind responsiv gestaltet (Mobile + Desktop)

## Edge Cases
- **Was passiert, wenn ein Nutzer keine E-Mail-Adresse verifiziert hat?**
  → Keine E-Mails versenden, aber Hinweis im Dashboard anzeigen.
- **Können Nutzer komplett alle Benachrichtigungen deaktivieren?**
  → Ja, aber mit Warnung: "Sie erhalten dann keine Updates mehr."

## Technical Requirements
- **E-Mail-Service:** Supabase Auth E-Mails oder Resend/SendGrid
- **Templates:** HTML E-Mail-Templates
- **Frequency:** Max. 1 E-Mail pro Ereignis (keine Duplikate)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
