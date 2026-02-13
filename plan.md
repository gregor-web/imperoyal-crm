# Mobile-Optimierung Plan für Imperoyal

## Fortschritt: 15/15 Aufgaben erledigt ✅

---

## Phase 1: Layout & Navigation

- [x] **1.1** Sidebar mobile-fähig machen (`components/layout/sidebar.tsx`)
  - Slide-over Menu auf Mobile (< md)
  - Overlay mit Close-on-click-outside
  - Smooth Animation

- [x] **1.2** Header mit Hamburger-Button (`components/layout/header.tsx`)
  - Menu-Icon links auf Mobile
  - Click öffnet Sidebar

- [x] **1.3** Dashboard Layout responsive (`app/(dashboard)/layout.tsx`)
  - Client-Wrapper für Mobile-State
  - `ml-64` → `md:ml-64` (Mobile: kein Margin)
  - Padding responsive: `p-4 sm:p-6 md:p-8`

---

## Phase 2: Dashboard Page

- [x] **2.1** Stats Cards optimieren (`components/dashboard/dashboard-stats.tsx`)
  - Value Text kleiner auf Mobile
  - Icon-Größe responsive

- [x] **2.2** Quick Actions responsive (`app/(dashboard)/dashboard/page.tsx`)
  - Buttons stack vertikal auf Mobile
  - Touch-Targets vergrößern

- [x] **2.3** Recent Activity Cards
  - Kleinere Padding auf Mobile

---

## Phase 3: Tabellen & Listen

- [x] **3.1** Table Component (`components/ui/table.tsx`)
  - Min-width für horizontalen Scroll
  - Kleinere Padding auf Mobile

- [x] **3.2** Objekte-Liste (`app/(dashboard)/objekte/page.tsx`)
  - Header responsive (Stack auf Mobile)
  - Tabellen-Spalten optimieren

- [x] **3.3** Mandanten-Liste (`app/(dashboard)/mandanten/page.tsx`)
  - Gleiche Optimierungen wie Objekte

- [x] **3.4** Auswertungen-Liste (`app/(dashboard)/auswertungen/page.tsx`)
  - Gleiche Optimierungen

- [x] **3.5** Anfragen-Liste (`app/(dashboard)/anfragen/page.tsx`)
  - Gleiche Optimierungen

---

## Phase 4: Detail-Seiten

- [x] **4.1** Objekt-Detail (`app/(dashboard)/objekte/[id]/page.tsx`)
  - Grid 1 Spalte auf Mobile
  - Buttons stack vertikal

- [x] **4.2** Auswertung-Detail (`app/(dashboard)/auswertungen/[id]/page.tsx`)
  - Charts responsive
  - Sections collapsible

---

## Phase 5: CSS & Globals

- [x] **5.1** Mobile utilities in globals.css
  - Safe-area für notched phones
  - Overlay-Styles

- [x] **5.2** Finale Tests & Feinschliff
  - Alle Seiten auf Mobile testen
  - Touch-Targets prüfen (min 44px)

---

## Dateien die geändert werden

| Datei | Status |
|-------|--------|
| `components/layout/sidebar.tsx` | ✅ |
| `components/layout/header.tsx` | ✅ |
| `components/layout/dashboard-shell.tsx` | ✅ (neu) |
| `app/(dashboard)/layout.tsx` | ✅ |
| `components/dashboard/dashboard-stats.tsx` | ✅ |
| `app/(dashboard)/dashboard/page.tsx` | ✅ |
| `components/ui/table.tsx` | ✅ |
| `app/(dashboard)/objekte/page.tsx` | ✅ |
| `app/(dashboard)/mandanten/page.tsx` | ✅ |
| `app/(dashboard)/auswertungen/page.tsx` | ✅ |
| `app/(dashboard)/anfragen/page.tsx` | ✅ |
| `app/(dashboard)/objekte/[id]/page.tsx` | ✅ |
| `app/(dashboard)/auswertungen/[id]/page.tsx` | ✅ |
| `app/globals.css` | ✅ |

**Legende:** ⏳ = Ausstehend | ✅ = Erledigt
