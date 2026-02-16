# PROJ-5: Influencer-Dashboard (Lesezugriff)

## Status: Planned
**Created:** 2026-02-15
**Last Updated:** 2026-02-15

## Dependencies
- **Requires:** PROJ-1 (Benutzer-Authentifizierung) - für Rollen-basierte Ansichten
- **Requires:** PROJ-3 (Kooperationen verwalten) - um zugewiesene Kooperationen anzuzeigen
- **Requires:** PROJ-4 (Briefing-System) - um Briefings anzuzeigen

## User Stories
- Als **Influencer** möchte ich nach dem Login ein Dashboard sehen, das mir alle meine zugewiesenen Kooperationen auf einen Blick zeigt, damit ich schnell einen Überblick habe
- Als **Influencer** möchte ich Kooperationen nach Status filtern können (z.B. nur "In Arbeit" anzeigen), damit ich mich auf aktuelle Aufgaben fokussieren kann
- Als **Influencer** möchte ich sehen, welche Kooperationen bald ablaufen, damit ich Deadlines nicht verpasse
- Als **Influencer** möchte ich auf eine Kooperation klicken können, um das vollständige Briefing zu sehen, damit ich alle Details kenne
- Als **Influencer** möchte ich keinerlei Bearbeitungsmöglichkeiten haben, damit ich nicht versehentlich Daten ändere

## Acceptance Criteria
- [ ] Nach dem Login sehen Influencer ein Dashboard mit folgenden Bereichen:
  - **Überfällige Kooperationen** (Deadline in der Vergangenheit)
  - **Anstehende Kooperationen** (Deadline innerhalb der nächsten 7 Tage)
  - **Alle meine Kooperationen** (Liste mit Status-Filter)
- [ ] Kooperationskarten zeigen: Titel, Unternehmen, Status, Deadline, Posting-Zeitraum
- [ ] Klick auf Kooperation öffnet Detailansicht mit vollständigem Briefing
- [ ] Filter-Optionen: "Alle", "Angefragt", "Bestätigt", "In Arbeit", "Abgeschlossen"
- [ ] Influencer sehen nur Kooperationen, die ihnen zugewiesen sind (`assigned_influencer_id = auth.uid()`)
- [ ] Keine Edit/Delete-Buttons für Influencer sichtbar
- [ ] PDF-Export-Button ist verfügbar (aus PROJ-4)
- [ ] Dashboard ist responsive (Desktop + Mobile)
- [ ] Empty State: "Du hast noch keine zugewiesenen Kooperationen" (wenn leer)

## Edge Cases
- **Was sieht ein Influencer, wenn ihm noch keine Kooperationen zugewiesen wurden?**
  → Empty State: "Noch keine Kooperationen zugewiesen. Dein Manager wird dich benachrichtigen, sobald es losgeht!"

- **Was passiert, wenn ein Influencer versucht, URLs manuell zu ändern, um andere Kooperationen zu sehen?**
  → 403 Forbidden Error: "Sie haben keine Berechtigung, diese Kooperation zu sehen."

- **Sieht ein Influencer auch abgeschlossene Kooperationen?**
  → Ja, im Filter "Abgeschlossen" (wichtig für Archiv/Historie).

- **Was passiert, wenn eine Kooperation kein Briefing hat?**
  → Hinweis anzeigen: "Briefing wird gerade erstellt. Bitte wende dich an deinen Manager."

- **Können Influencer Kooperationen als "Abgeschlossen" markieren?**
  → Nein, nur Read-Only. Status-Änderungen sind Manager-Aufgabe.

- **Wie werden überfällige Deadlines dargestellt?**
  → Rote Badge mit Icon (⚠️) + Text: "Deadline überschritten".

## Technical Requirements
- **Dashboard-Widgets:**
  - Überfällige: `SELECT * WHERE deadline < NOW() AND status != 'completed'`
  - Anstehend: `SELECT * WHERE deadline BETWEEN NOW() AND NOW() + INTERVAL '7 days'`
- **Performance:** Dashboard-Laden < 500ms
- **Security:**
  - Row Level Security: `assigned_influencer_id = auth.uid()`
  - Alle Schreib-APIs (Update/Delete) blockieren für Influencer-Rolle
- **UI:**
  - Card-basiertes Layout (3 Spalten auf Desktop, 1 Spalte auf Mobile)
  - Status-Badges mit Farben (wie in PROJ-3)
  - Deadline-Countdown (z.B. "In 3 Tagen")

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Designed:** 2026-02-16

### Seitenstruktur

```
Dashboard (rollenbasiert)
├── Agency Admin → Bestehende Admin-Übersicht (Stats + letzte Aktivitäten)
└── Influencer → Influencer-Dashboard
    ├── Überfällige Kooperationen (rote Warnung, Deadline abgelaufen)
    ├── Anstehende Kooperationen (Deadline in den nächsten 7 Tagen)
    └── Alle meine Kooperationen (Karten-Grid mit Status-Filter)
        └── Klick → /cooperations/[id] (Detailansicht mit Briefing, Read-Only)
```

### Komponenten

```
├── InfluencerDashboard (Wrapper: 3 Sektionen + Filter)
├── CollaborationCard (Karte: Titel, Unternehmen, Status, Deadline-Countdown)
└── Bestehend wiederverwendet:
    ├── StatusBadge (farbcodiert)
    ├── BriefingDisplay (Read-Only Anzeige)
    └── BriefingPdfExport (PDF-Download)
```

### Datenmodell

Kein neues Datenmodell nötig. Nutzt bestehende Tabellen:
- **collaborations** (gefiltert über RLS: assigned_influencer_id = auth.uid())
- **companies** (Join für Unternehmensname)
- **briefings** (Join für Posting-Zeitraum auf Karten)

### Sicherheit

- Bestehende RLS-Policies reichen aus (Influencer sehen nur zugewiesene Kooperationen)
- Keine neuen API-Endpunkte nötig
- Dashboard-Komponente ist rein Client-seitig (nutzt bestehende Supabase-Queries)
- Keine Edit/Delete-Buttons für Influencer (rollenbasiert ausgeblendet)

### UI/UX

| Sektion | Bedingung | Anzeige |
|---|---|---|
| Überfällig | deadline < heute AND status != completed/declined | Rote Badge + Warnung |
| Anstehend | deadline zwischen heute und +7 Tage | Gelbe/Orange Hervorhebung |
| Alle | Alle zugewiesenen Kooperationen | Status-Filter (Tabs) |

- Card-basiertes Layout (responsive: 3 Spalten Desktop, 1 Spalte Mobile)
- Deadline-Countdown mit date-fns (z.B. "In 3 Tagen", "Vor 2 Tagen")
- Empty State: Freundliche Nachricht wenn keine Kooperationen zugewiesen

### Abhängigkeiten

Keine neuen - nutzt bestehende: date-fns, shadcn/ui, Supabase, StatusBadge

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
