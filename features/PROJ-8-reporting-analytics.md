# PROJ-8: Reporting & Analytics

## Status: Planned
**Created:** 2026-02-15
**Last Updated:** 2026-02-15

## Dependencies
- **Requires:** PROJ-1 (Benutzer-Authentifizierung)
- **Requires:** PROJ-3 (Kooperationen verwalten)

## User Stories
- Als **Social Media Manager** möchte ich ein Dashboard mit Statistiken sehen (Anzahl Kooperationen pro Status, pro Monat, pro Influencer), damit ich die Performance meiner Agentur tracken kann
- Als **Social Media Manager** möchte ich Reports als CSV exportieren können, damit ich Daten weiterverarbeiten kann
- Als **Agency Admin** möchte ich einen Überblick über Umsätze sehen (wenn Vergütung erfasst wurde), damit ich die Rentabilität analysieren kann

## Acceptance Criteria
- [ ] Analytics-Dashboard zeigt:
  - Anzahl Kooperationen nach Status (Pie Chart)
  - Kooperationen pro Monat (Line Chart)
  - Top 5 Unternehmen (Bar Chart)
  - Top 5 Influencer (Bar Chart)
- [ ] Zeitraum-Filter (letzte 30/90/365 Tage, custom)
- [ ] CSV-Export für alle Listen
- [ ] Performance: Statistiken laden in < 1 Sekunde

## Edge Cases
- **Was passiert bei leeren Daten?**
  → Empty State: "Noch keine Daten vorhanden."
- **Werden gelöschte Kooperationen in Statistiken berücksichtigt?**
  → Nein, nur aktive Kooperationen.

## Technical Requirements
- **Charting Library:** Recharts oder Chart.js
- **CSV-Export:** Papa Parse oder native JavaScript
- **Caching:** Cache-Strategie für Performance

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
