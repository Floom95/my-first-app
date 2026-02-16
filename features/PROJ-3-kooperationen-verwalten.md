# PROJ-3: Kooperationen verwalten

## Status: In Progress
**Created:** 2026-02-15
**Last Updated:** 2026-02-15

## Dependencies
- **Requires:** PROJ-1 (Benutzer-Authentifizierung) - für Zugriffskontrolle und Zuweisung an Influencer
- **Requires:** PROJ-2 (Unternehmen & Ansprechpartner) - um Kooperationen mit Unternehmen zu verknüpfen

## User Stories
- Als **Social Media Manager** möchte ich neue Kooperationen anlegen können (Titel, Unternehmen, zugewiesener Influencer, Status, Deadline), damit ich alle Deals zentral tracke
- Als **Social Media Manager** möchte ich den Status von Kooperationen ändern können (z.B. "Angefragt" → "Bestätigt" → "In Arbeit" → "Abgeschlossen"), damit ich den Fortschritt überwachen kann
- Als **Social Media Manager** möchte ich eine Übersicht aller Kooperationen sehen mit Filterfunktionen (nach Status, Influencer, Unternehmen), damit ich schnell relevante Deals finde
- Als **Social Media Manager** möchte ich Kooperationen bearbeiten und löschen können, damit ich flexibel auf Änderungen reagieren kann
- Als **Influencer** möchte ich nur die mir zugewiesenen Kooperationen sehen können, damit ich mich auf meine Aufgaben konzentrieren kann

## Acceptance Criteria
- [ ] Social Media Manager kann neue Kooperationen anlegen mit:
  - Titel (Pflichtfeld)
  - Unternehmen (Dropdown aus PROJ-2, Pflichtfeld)
  - Zugewiesener Influencer (Dropdown aus registrierten Influencern, optional)
  - Status (Dropdown: "Angefragt", "Bestätigt", "In Arbeit", "Abgeschlossen", "Abgelehnt")
  - Deadline (Datum, optional)
  - Notizen (Freitext)
- [ ] Kooperationsliste zeigt alle Kooperationen mit: Titel, Unternehmen, Influencer, Status, Deadline
- [ ] Filter-Optionen: Nach Status, Influencer, Unternehmen, Datum
- [ ] Status-Change ist via Dropdown direkt in der Liste möglich (Quick-Action)
- [ ] Detailansicht zeigt alle Kooperationsdaten + zugehöriges Briefing (PROJ-4)
- [ ] Social Media Manager kann Kooperationen bearbeiten und löschen (mit Bestätigungsdialog)
- [ ] Influencer sehen nur ihre zugewiesenen Kooperationen (gefiltert via RLS)
- [ ] Influencer können Kooperationen nur lesen, nicht bearbeiten/löschen
- [ ] Abgelaufene Deadlines werden visuell hervorgehoben (z.B. rote Markierung)

## Edge Cases
- **Was passiert, wenn eine Kooperation gelöscht wird, die ein Briefing hat?**
  → Briefing wird ebenfalls gelöscht (Cascade Delete mit Warnung: "Kooperation und zugehöriges Briefing werden gelöscht").

- **Kann eine Kooperation ohne zugewiesenen Influencer existieren?**
  → Ja. Status dann z.B. "Angefragt" bis Influencer zugewiesen wird.

- **Was passiert, wenn ein Influencer gelöscht wird, der Kooperationen zugewiesen hat?**
  → Kooperationen bleiben bestehen, aber Influencer-Feld wird auf NULL gesetzt + Warnung im Admin-Bereich.

- **Können mehrere Influencer an einer Kooperation arbeiten?**
  → Nein im MVP. Nur 1:1 Beziehung Kooperation ↔ Influencer.

- **Was passiert, wenn die Deadline in der Vergangenheit liegt?**
  → Visuell rot markiert + Filter-Option "Überfällig".

- **Können Kooperationen denselben Titel haben?**
  → Ja, kein Unique-Constraint.

- **Was ist der initiale Status beim Anlegen?**
  → Default: "Angefragt" (kann bei Erstellung geändert werden).

## Technical Requirements
- **Datenbank-Schema:**
  - Tabelle `collaborations`: id, organization_id, title, company_id (FK), assigned_influencer_id (FK), status (enum), deadline (timestamp), notes, created_at, updated_at
  - Status-Enum: ["requested", "confirmed", "in_progress", "completed", "declined"]
- **Performance:** Liste von 500+ Kooperationen muss in < 500ms laden (mit Pagination)
- **Security:**
  - Row Level Security: Influencer sehen nur `assigned_influencer_id = auth.uid()`
  - Social Media Manager sehen alle Kooperationen ihrer Organisation
- **Validierung:**
  - Deadline kann nicht in der Vergangenheit liegen (mit Warnung, aber erlaubt)
- **UI:**
  - Responsive Tabelle mit Sortierung (Deadline, Status, Erstellungsdatum)
  - Status-Badge mit Farben (Grün = Abgeschlossen, Blau = In Arbeit, Grau = Angefragt, Rot = Abgelehnt)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Designed:** 2026-02-15

### Seitenstruktur

```
/collaborations - Kooperationsverwaltung
├── Übersichtsseite (FilterBar + Tabelle mit Quick-Status-Change)
└── /collaborations/[id] - Detailansicht
    ├── Info-Karte (Unternehmen, Influencer, Status, Deadline, Notizen)
    ├── Bearbeiten/Löschen-Buttons (nur Manager)
    └── Briefing-Sektion (Platzhalter für PROJ-4)
```

### Komponenten

```
├── CollaborationList (FilterBar + CollaborationsTable)
├── CollaborationForm (Dialog: Titel, Unternehmen, Influencer, Status, Deadline, Notizen)
├── CollaborationDetail (Header + InfoCard + Aktionen)
├── StatusBadge (farbcodiert: Grau/Blau/Orange/Grün/Rot)
└── DeleteCollaborationDialog (Warnung bei Briefing)
```

### Datenmodell

**Collaborations:** ID, Organization-ID, Titel, Company-ID (FK), Influencer-ID (FK, optional), Status (Enum), Deadline, Notizen, Timestamps

- Status-Enum: requested, confirmed, in_progress, completed, declined
- 1 Kooperation → 1 Unternehmen (Pflicht)
- 1 Kooperation → 0-1 Influencer (optional)
- 1 Kooperation → 0-1 Briefing (PROJ-4, Cascade Delete)

### Sicherheit

- RLS: Manager sehen alle Kooperationen ihrer Organisation
- RLS: Influencer sehen nur assigned_influencer_id = auth.uid()
- Agency Admin: Vollzugriff (CRUD + Status-Change)
- Influencer: Nur Lesezugriff

### UI/UX

| Status | Farbe |
|---|---|
| Angefragt | Grau |
| Bestätigt | Blau |
| In Arbeit | Orange |
| Abgeschlossen | Grün |
| Abgelehnt | Rot |

- Überfällige Deadlines: Rot markiert
- Quick-Status-Change direkt in Tabelle
- Filter: Status, Influencer, Unternehmen, Datum

### Abhängigkeiten

- **date-fns** - Datum-Formatierung & Berechnungen (neu)
- Bestehend: shadcn/ui, react-hook-form, zod, Supabase

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
