# PROJ-2: Unternehmen & Ansprechpartner verwalten

## Status: In Progress
**Created:** 2026-02-15
**Last Updated:** 2026-02-15

## Dependencies
- **Requires:** PROJ-1 (Benutzer-Authentifizierung) - für Zugriffskontrolle

## User Stories
- Als **Social Media Manager** möchte ich Unternehmen/Marken anlegen können (Name, Branche, Website, Notizen), damit ich alle Partner zentral verwalten kann
- Als **Social Media Manager** möchte ich Ansprechpartner zu Unternehmen hinzufügen können (Name, Position, E-Mail, Telefon), damit ich weiß, wen ich kontaktieren muss
- Als **Social Media Manager** möchte ich Unternehmen bearbeiten und löschen können, damit ich die Daten aktuell halten kann
- Als **Social Media Manager** möchte ich eine Liste aller Unternehmen sehen können mit Filterfunktion, damit ich schnell das richtige Unternehmen finde
- Als **Influencer** möchte ich Unternehmensdetails sehen können (Read-Only), damit ich weiß, mit wem ich kooperiere

## Acceptance Criteria
- [ ] Social Media Manager kann neue Unternehmen anlegen mit: Name (Pflichtfeld), Branche, Website, Notizen
- [ ] Social Media Manager kann Ansprechpartner zu Unternehmen hinzufügen mit: Name (Pflichtfeld), Position, E-Mail (Pflichtfeld), Telefon
- [ ] Ein Unternehmen kann mehrere Ansprechpartner haben (1:n Beziehung)
- [ ] Unternehmensliste zeigt alle Unternehmen der Organisation mit Suchfunktion (nach Name/Branche)
- [ ] Detailansicht zeigt Unternehmensdaten + alle zugehörigen Ansprechpartner
- [ ] Social Media Manager kann Unternehmen bearbeiten und löschen (mit Bestätigungsdialog)
- [ ] Influencer können Unternehmen nur lesen, nicht bearbeiten/löschen
- [ ] Alle Daten sind organisationsspezifisch (Multi-Tenancy über Row Level Security)

## Edge Cases
- **Was passiert, wenn ein Unternehmen gelöscht wird, das noch aktive Kooperationen hat?**
  → Warnung anzeigen: "Dieses Unternehmen hat noch X aktive Kooperationen. Möchten Sie fortfahren?" → Kooperationen bleiben bestehen, aber Unternehmensname wird als "Gelöschtes Unternehmen" angezeigt.

- **Können zwei Unternehmen denselben Namen haben?**
  → Ja, aber mit Warnung: "Ein Unternehmen mit diesem Namen existiert bereits. Trotzdem anlegen?"

- **Was passiert, wenn ein Ansprechpartner gelöscht wird?**
  → Einfaches Löschen ohne Rückfrage (da keine kritischen Abhängigkeiten).

- **Können Ansprechpartner mehreren Unternehmen zugeordnet sein?**
  → Nein. Jeder Ansprechpartner gehört zu genau einem Unternehmen.

- **Was passiert bei ungültigen E-Mail-Adressen?**
  → Validierung im Frontend und Backend, Fehlermeldung: "Bitte geben Sie eine gültige E-Mail-Adresse ein."

- **Wie viele Unternehmen können maximal angelegt werden?**
  → Keine Limit im MVP (später eventuell Plan-basierte Limits für SaaS-Modell).

## Technical Requirements
- **Datenbank-Schema:**
  - Tabelle `companies`: id, organization_id, name, industry, website, notes, created_at, updated_at
  - Tabelle `contacts`: id, company_id, name, position, email, phone, created_at, updated_at
- **Validierung:**
  - E-Mail: RFC 5322-konform
  - Website: Optional, aber wenn angegeben → gültige URL
- **Performance:** Liste von 1000+ Unternehmen muss in < 500ms laden (mit Pagination)
- **Security:** Row Level Security auf organization_id
- **UI:** Responsive Design (Desktop + Mobile)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
**Designed:** 2026-02-15

### Seitenstruktur

```
/companies - Unternehmensverwaltung
├── Übersichtsseite (Suchleiste, Grid mit Unternehmenskarten)
└── /companies/[id] - Detailansicht
    ├── Unternehmens-Header (Name, Branche, Website, Notizen)
    ├── Bearbeiten/Löschen-Buttons (nur Manager)
    └── Ansprechpartner-Sektion (Tabelle + Hinzufügen)
```

### Komponenten

```
├── CompanyList (Suche, Filter, Grid mit CompanyCards)
├── CompanyForm (Dialog: Name, Branche, Website, Notizen)
├── CompanyDetail (Header + Ansprechpartner-Sektion)
├── ContactForm (Dialog: Name, Position, E-Mail, Telefon)
├── ContactsTable (Tabelle mit Aktionen)
└── DeleteConfirmDialog (Warnung bei aktiven Kooperationen)
```

### Datenmodell

**Companies:** ID, Organization-ID, Name, Branche, Website, Notizen, Timestamps
**Contacts:** ID, Company-ID, Name, Position, E-Mail, Telefon, Timestamps

- 1 Unternehmen → n Ansprechpartner
- Cascade Delete: Ansprechpartner werden bei Unternehmenslöschung mitgelöscht

### Sicherheit

- RLS auf organization_id (Multi-Tenancy)
- Agency Admin: Vollzugriff (CRUD)
- Influencer: Nur Lesezugriff
- Validierung: E-Mail RFC 5322, Website gültige URL

### Performance

- Pagination (initial 50 Einträge)
- Suche mit Debounce
- Optimistic Updates

### Tech-Entscheidungen

| Entscheidung | Warum |
|---|---|
| Eigene /companies Route | Unternehmen = eigenständige Entität |
| Ansprechpartner in Detailansicht | 1:n Beziehung logisch gruppiert |
| Modal/Dialog für Formulare | Schnelles CRUD ohne Seitenwechsel |
| Duplikat-Warnung (nicht blockierend) | Flexibilität für echte Duplikate |

### Abhängigkeiten

Keine neuen - shadcn/ui, react-hook-form, zod, Supabase bereits vorhanden

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
