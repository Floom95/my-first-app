# PROJ-4: Briefing-System

## Status: Planned
**Created:** 2026-02-15
**Last Updated:** 2026-02-15

## Dependencies
- **Requires:** PROJ-1 (Benutzer-Authentifizierung) - für Zugriffskontrolle
- **Requires:** PROJ-3 (Kooperationen verwalten) - Briefings gehören zu Kooperationen

## User Stories
- Als **Social Media Manager** möchte ich detaillierte Briefings für Kooperationen erstellen können, damit Influencer alle wichtigen Informationen an einem Ort haben
- Als **Social Media Manager** möchte ich Briefings bearbeiten können, damit ich auf Änderungen reagieren kann
- Als **Influencer** möchte ich ein übersichtliches Briefing zu meiner Kooperation sehen, damit ich genau weiß, was von mir erwartet wird
- Als **Influencer** möchte ich Briefings als PDF exportieren können, damit ich sie offline ansehen kann
- Als **Social Media Manager** möchte ich Briefing-Templates erstellen können, damit ich wiederkehrende Briefings schneller erstellen kann

## Acceptance Criteria
- [ ] Jede Kooperation kann genau ein Briefing haben (1:1 Beziehung)
- [ ] Social Media Manager kann Briefings erstellen/bearbeiten mit folgenden Feldern:
  - **Kampagnenziel** (Freitext, Pflichtfeld)
  - **Zielgruppe** (Freitext)
  - **Deliverables** (z.B. "3 Instagram Posts, 2 Stories")
  - **Hashtags & Mentions** (Freitext)
  - **Do's & Don'ts** (Freitext)
  - **Content-Richtlinien** (Freitext)
  - **Posting-Zeitraum** (von-bis Datum)
  - **Vergütung** (Freitext, optional)
  - **Zusätzliche Notizen** (Freitext)
- [ ] Briefing wird in der Kooperations-Detailansicht angezeigt
- [ ] Influencer können Briefings nur lesen, nicht bearbeiten
- [ ] Briefing kann als PDF exportiert werden (Button: "Als PDF herunterladen")
- [ ] Es gibt einen "Briefing-Template"-Bereich, wo Manager Vorlagen speichern können
- [ ] Templates können beim Erstellen eines Briefings ausgewählt werden (Dropdown)
- [ ] Änderungen am Briefing werden mit Timestamp protokolliert (Last Updated)

## Edge Cases
- **Was passiert, wenn eine Kooperation noch kein Briefing hat?**
  → Platzhalter anzeigen: "Noch kein Briefing vorhanden. Jetzt erstellen?" (nur für Manager sichtbar).

- **Können Briefings gelöscht werden?**
  → Ja, aber nur von Social Media Managern mit Bestätigungsdialog.

- **Was passiert, wenn ein Template gelöscht wird?**
  → Bestehende Briefings, die aus dem Template erstellt wurden, bleiben unverändert.

- **Können Templates zwischen Organisationen geteilt werden?**
  → Nein, jede Organisation hat eigene Templates.

- **Was ist im PDF-Export enthalten?**
  → Alle Briefing-Felder + Kooperationstitel + Unternehmensname + Deadline + Logo der Organisation (falls vorhanden).

- **Wie viele Templates können maximal erstellt werden?**
  → Keine Limit im MVP.

- **Was passiert, wenn beim PDF-Export ein Fehler auftritt?**
  → Fehlermeldung: "PDF-Export fehlgeschlagen. Bitte versuchen Sie es erneut."

## Technical Requirements
- **Datenbank-Schema:**
  - Tabelle `briefings`: id, collaboration_id (FK, unique), campaign_goal, target_audience, deliverables, hashtags, dos_donts, content_guidelines, posting_period_start, posting_period_end, compensation, notes, created_at, updated_at
  - Tabelle `briefing_templates`: id, organization_id, name, template_data (JSON), created_at, updated_at
- **PDF-Export:** Nutze Library wie `react-pdf` oder `jsPDF`
- **Validierung:**
  - Posting-Zeitraum: posting_period_end muss nach posting_period_start liegen
- **Performance:** PDF-Generierung < 3 Sekunden
- **Security:**
  - Row Level Security auf organization_id
  - Influencer können nur Briefings ihrer zugewiesenen Kooperationen sehen
- **UI:**
  - Formular mit klarer Struktur (Sections: Ziele, Content, Timeline, Vergütung)
  - WYSIWYG-Editor für Freitext-Felder (optional, kann auch einfaches Textarea sein)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Designed:** 2026-02-16

### Seitenstruktur

```
Briefing-System (integriert in Kooperations-Detailansicht)
├── /cooperations/[id] - Briefing-Sektion
│   ├── Briefing anzeigen (Read-Only für Influencer)
│   ├── Briefing erstellen/bearbeiten (Dialog für Manager)
│   ├── PDF-Export-Button
│   └── Template-Auswahl beim Erstellen
│
└── /settings/templates - Briefing-Templates (nur Manager)
    ├── Template-Liste
    ├── Template erstellen/bearbeiten (Dialog)
    └── Template löschen
```

### Komponenten

```
├── BriefingDisplay (strukturierte Anzeige aller Briefing-Felder)
├── BriefingForm (Dialog: alle Felder in Sections + Template-Auswahl)
├── BriefingPdfExport (PDF-Generierung mit jsPDF)
├── TemplateList (Liste mit CRUD-Aktionen)
└── TemplateForm (Dialog: Name + alle Briefing-Felder als Vorlage)
```

### Datenmodell

**Briefings:** ID, Collaboration-ID (FK, unique 1:1), Kampagnenziel, Zielgruppe, Deliverables, Hashtags, Do's/Don'ts, Content-Richtlinien, Posting-Zeitraum (Start/End), Vergütung, Notizen, Timestamps

**Briefing Templates:** ID, Organization-ID, Name, Template-Daten (JSON mit allen Briefing-Feldern), Timestamps

### Sicherheit

- RLS: Briefings über Kooperations-RLS geschützt (Influencer sehen nur zugewiesene)
- Agency Admin: Erstellen, Bearbeiten, Löschen
- Influencer: Nur Lesen + PDF-Export
- Templates: Nur organisationsspezifisch

### Abhängigkeiten

- **jspdf** - PDF-Generierung im Browser (neu)
- Bestehend: shadcn/ui, react-hook-form, zod, date-fns, Supabase

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
