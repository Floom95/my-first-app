# PROJ-6: Datei-Upload für Briefings

## Status: Planned
**Created:** 2026-02-15
**Last Updated:** 2026-02-15

## Dependencies
- **Requires:** PROJ-1 (Benutzer-Authentifizierung)
- **Requires:** PROJ-4 (Briefing-System)

## User Stories
- Als **Social Media Manager** möchte ich Dateien zu Briefings hochladen können (z.B. Bilder, PDFs, Verträge), damit alle relevanten Dokumente zentral verfügbar sind
- Als **Influencer** möchte ich hochgeladene Dateien herunterladen können, damit ich alle Materialien zur Verfügung habe
- Als **Social Media Manager** möchte ich hochgeladene Dateien wieder löschen können, damit ich veraltete Dokumente entfernen kann

## Acceptance Criteria
- [ ] Social Media Manager kann Dateien zu Briefings hochladen (max. 10 MB pro Datei)
- [ ] Erlaubte Dateitypen: PDF, DOCX, JPG, PNG, MP4, ZIP
- [ ] Mehrere Dateien pro Briefing möglich (max. 10 Dateien)
- [ ] Dateiliste wird unter dem Briefing angezeigt mit Download-Button
- [ ] Social Media Manager kann Dateien löschen (mit Bestätigung)
- [ ] Influencer können Dateien nur herunterladen, nicht hochladen/löschen
- [ ] Upload-Fortschrittsanzeige (Progress Bar)

## Edge Cases
- **Was passiert bei zu großen Dateien?**
  → Fehlermeldung: "Datei zu groß (max. 10 MB)."
- **Was passiert, wenn ein nicht erlaubter Dateityp hochgeladen wird?**
  → Fehlermeldung: "Dateityp nicht erlaubt."
- **Was passiert, wenn ein Briefing gelöscht wird?**
  → Alle zugehörigen Dateien werden ebenfalls gelöscht (Cascade Delete).

## Technical Requirements
- **Storage:** Supabase Storage
- **File Validation:** Client + Server
- **Security:** Row Level Security, signierte URLs

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
