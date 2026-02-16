# CLAUDE.md – Imperoyal Immobilien

## Projekt

Immobilien-Optimierungsprotokoll-System für Vermögensverwalter und Family Offices.
Migration einer monolithischen HTML-Datei (`reference/original.html`) zu einer Next.js + Supabase + Vercel SaaS-App.

## Tech Stack

- **Next.js 15** – App Router, TypeScript, Server Components
- **Supabase** – PostgreSQL, Auth (Email/Password), Row Level Security
- **Tailwind CSS 4** – Styling (Glass-Design-Ästhetik beibehalten)
- **Recharts** – Balken-, Kuchen-, Liniendiagramme
- **React Hook Form + Zod** – Formulare und Validierung
- **@react-pdf/renderer** – Server-side PDF-Generierung
- **lucide-react** – Icons
- **Vercel** – Hosting + Deployment

## Befehle

```bash
npm run dev          # Next.js Dev Server (localhost:3000)
npm run build        # Production Build
npm run lint         # ESLint
npx supabase start   # Lokale Supabase (Docker)
npx supabase db push # Schema auf Remote deployen
```

## Env-Variablen (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # NUR Server-side! Nie im Client importieren
ANTHROPIC_API_KEY=                # NUR Server-side! Nie im Client importieren
MAKE_WEBHOOK_URL=                 # NUR Server-side!
NEXT_PUBLIC_APP_URL=
STRIPE_SECRET_KEY=                # NUR Server-side! Nie im Client importieren
STRIPE_WEBHOOK_SECRET=            # NUR Server-side! Stripe CLI: stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**KRITISCH:** `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `MAKE_WEBHOOK_URL`, `STRIPE_SECRET_KEY` und `STRIPE_WEBHOOK_SECRET` dürfen NIE in Client-Komponenten oder `"use client"` Dateien importiert werden. Nur in `app/api/` Route Handlers und Server Components.

## Projektstruktur

```
imperoyal/
├── CLAUDE.md
├── reference/
│   └── original.html              # Quell-HTML (nur Referenz, nicht deployen)
├── supabase/
│   └── migrations/
│       └── 001_initial.sql        # DB-Schema + RLS
├── app/
│   ├── layout.tsx                  # Root: Fonts, Metadata, Supabase Provider
│   ├── page.tsx                    # Redirect → /login oder /dashboard
│   ├── globals.css                 # Tailwind + Glass-Design Custom Styles
│   ├── (auth)/
│   │   ├── layout.tsx              # Zentriertes Layout ohne Sidebar
│   │   ├── login/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Sidebar + Main Area
│   │   ├── dashboard/page.tsx
│   │   ├── mandanten/
│   │   │   ├── page.tsx            # Liste (Admin only)
│   │   │   ├── neu/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Detail
│   │   │       └── edit/page.tsx
│   │   ├── objekte/
│   │   │   ├── page.tsx            # Liste (gefiltert via RLS)
│   │   │   ├── neu/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Detail
│   │   │       └── edit/page.tsx
│   │   ├── auswertungen/
│   │   │   ├── page.tsx            # Liste
│   │   │   └── [id]/page.tsx       # Detail mit PDF-View
│   │   ├── ankaufsprofile/
│   │   │   ├── page.tsx
│   │   │   └── neu/page.tsx
│   │   └── anfragen/page.tsx       # Admin only
│   └── api/
│       ├── auswertung/route.ts     # POST: Berechnung + Claude + Erläuterungen
│       ├── pdf/route.ts            # POST: PDF generieren
│       ├── email/
│       │   ├── welcome/route.ts
│       │   └── auswertung/route.ts
│       └── matching/route.ts
├── components/
│   ├── ui/                         # Wiederverwendbare UI-Bausteine
│   ├── layout/                     # Sidebar, Header (Logo oben rechts)
│   ├── forms/                      # Mandant, Objekt, Einheiten, Ankaufsprofil
│   ├── charts/                     # Recharts-Wrapper
│   └── pdf/                        # PDF-Template
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # createBrowserClient()
│   │   ├── server.ts               # createServerClient()
│   │   └── admin.ts                # createClient() mit SERVICE_ROLE_KEY
│   ├── berechnungen.ts             # Miet-/Rendite-/Cashflow-Berechnungen
│   ├── erlaeuterungen.ts           # Erklärungstexte für Laien pro Sektion
│   ├── matching.ts                 # Käufer-Matching
│   ├── formatters.ts               # formatCurrency, formatPercent, formatDate
│   ├── validators.ts               # Zod Schemas
│   └── types.ts                    # TypeScript Interfaces
└── middleware.ts                    # Auth-Guard für (dashboard) Routen
```

## Datenbank-Schema

Datei: `supabase/migrations/001_initial.sql`

### Tabellen

**profiles** – Erweitert `auth.users`. Felder: `id` (UUID, FK auth.users), `role` ('admin'|'mandant'), `name`, `email`, `mandant_id` (UUID FK mandanten).

**mandanten** – Felder: `id` (UUID), `name`, `ansprechpartner`, `position`, `email`, `telefon`, `strasse`, `plz`, `ort`, `land` (default 'Deutschland'), `kontaktart`, `created_at`, `updated_at`.

**objekte** – Felder: `id` (UUID), `mandant_id` (UUID FK), `strasse`, `plz`, `ort`, `gebaeudetyp`, `baujahr` (INT), `denkmalschutz` (BOOL), `kernsanierung_jahr` (INT), `wohneinheiten` (INT), `gewerbeeinheiten` (INT), `geschosse` (INT), `aufzug`, `wohnflaeche` (NUMERIC), `gewerbeflaeche` (NUMERIC), `grundstueck` (NUMERIC), `heizungsart`, `weg_aufgeteilt` (BOOL), `weg_geplant` (BOOL), `milieuschutz` (BOOL), `umwandlungsverbot` (BOOL), `kaufpreis` (NUMERIC NOT NULL), `kaufdatum` (DATE), `grundstueck_wert`, `gebaeude_wert`, `darlehensstand`, `zinssatz` (default 3.8), `tilgung` (default 2), `eigenkapital_prozent` (default 30), `leerstandsquote`, `betriebskosten_nicht_umlage`, `instandhaltung`, `verwaltung`, `ruecklagen`, `capex_vergangen` (TEXT), `capex_geplant` (TEXT), `capex_geplant_betrag`, `mietpreisbindung` (BOOL), `sozialbindung` (BOOL), `modernisierungsstopp` (BOOL), `gewerbe_sonderklauseln` (BOOL), `haltedauer`, `primaeres_ziel`, `investitionsbereitschaft`, `risikoprofil`, `created_at`, `updated_at`.

**einheiten** – Felder: `id` (UUID), `objekt_id` (UUID FK CASCADE), `position` (INT), `nutzung` ('Wohnen'|'Gewerbe'|'Stellplatz'), `flaeche` (NUMERIC), `kaltmiete` (NUMERIC), `vergleichsmiete` (NUMERIC default 12), `mietvertragsart` ('Standard'|'Index'|'Staffel'), `letzte_mieterhoehung` (DATE).

**auswertungen** – Felder: `id` (UUID), `objekt_id` (UUID FK CASCADE), `mandant_id` (UUID FK), `berechnungen` (JSONB), `empfehlung`, `empfehlung_prioritaet`, `empfehlung_begruendung`, `empfehlung_fazit`, `empfehlung_handlungsschritte` (JSONB), `empfehlung_chancen` (JSONB), `empfehlung_risiken` (JSONB), `erlaeuterungen` (JSONB), `pdf_url`, `status` ('erstellt'|'versendet'), `created_at`.

**ankaufsprofile** – Felder: `id` (UUID), `mandant_id` (UUID FK CASCADE), `name`, `min_volumen`, `max_volumen`, `assetklassen` (TEXT[]), `regionen`, `rendite_min`, `sonstiges`, `created_at`, `updated_at`.

**anfragen** – Felder: `id` (UUID), `objekt_id` (UUID FK CASCADE), `mandant_id` (UUID FK), `status` ('offen'|'bezahlt'|'in_bearbeitung'|'fertig'|'versendet'), `payment_status` ('pending'|'paid'|'failed'|'refunded'|'waived'), `stripe_session_id` (TEXT), `amount_cents` (INTEGER), `paid_at` (TIMESTAMPTZ), `created_at`.

**payments** – Felder: `id` (UUID), `anfrage_id` (UUID FK CASCADE), `mandant_id` (UUID FK), `stripe_session_id` (TEXT UNIQUE), `stripe_payment_intent_id` (TEXT), `amount_cents` (INTEGER), `currency` (TEXT), `status` (TEXT), `tier_name` (TEXT), `created_at`.

### Stripe Integration

- Volume-based pricing: Einstieg (1-10: 350€), Portfolio (11-49: 250€), Großbestand (50+: 180€) – netto/exkl. MwSt.
- Payment via Stripe Checkout Sessions (Card + SEPA)
- Env vars: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- `mandanten.stripe_customer_id` stores the Stripe customer ID

### Row Level Security

Alle Tabellen haben RLS aktiviert. Zwei Helper-Funktionen:

```sql
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_mandant_id() RETURNS UUID AS $$
  SELECT mandant_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;
```

RLS-Regeln (Muster für alle Tabellen):
- Admin: SELECT/INSERT/UPDATE/DELETE auf alles
- Mandant: SELECT/INSERT/UPDATE nur eigene Daten (via `mandant_id = user_mandant_id()`)
- Einheiten: Zugriff via Objekt-Zugehörigkeit (JOIN auf objekte.mandant_id)
- Auswertungen: Nur Admin darf INSERT (Mandant kann nur lesen + Anfragen erstellen)

## Business-Logik: Migration aus original.html

### Datentyp-Mapping

Im Original sind Booleans als `'Ja'`/`'Nein'` Strings gespeichert. In der DB sind es echte `boolean`. Bei der Migration:
- Eingabe: UI zeigt weiter "Ja"/"Nein" Selects → mappt auf `true`/`false` vor dem Speichern
- Ausgabe: DB gibt `boolean` → UI zeigt "Ja"/"Nein"

### lib/formatters.ts

```typescript
export const formatCurrency = (val: number | null | undefined): string =>
  val == null ? '-' : new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

export const formatPercent = (val: number | null | undefined, digits = 2): string =>
  val != null ? `${val.toFixed(digits)}%` : '-';

export const formatDate = (d: string | Date | null | undefined): string =>
  d ? new Date(d).toLocaleDateString('de-DE') : '-';
```

### lib/berechnungen.ts

Migriere die Funktion `berechneAlles()` aus original.html Zeilen 413-536. Diese Funktion ist das Herzstück der App.

**Eingabe:** Ein Objekt mit allen Feldern + Array von Einheiten.
**Ausgabe:** Objekt mit allen berechneten Kennzahlen.

Kernberechnungen:

1. **Finanzierung:** eigenkapital = kaufpreis × (ek_prozent / 100), fremdkapital = kaufpreis - eigenkapital, kapitaldienst = fremdkapital × ((zinssatz + tilgung) / 100)

2. **Mietanalyse pro Einheit:**
   - miete_ist = Summe aller kaltmieten
   - miete_soll = Für Standard-Verträge: max(kaltmiete, flaeche × vergleichsmiete). Für Index/Staffel: kaltmiete bleibt
   - potenzial = miete_soll - miete_ist (pro Einheit und gesamt)

3. **§558 BGB – Nächste Mieterhöhung pro Einheit:**
   - Eingabe: letzte_mieterhoehung (Date), kaltmiete, vergleichsmiete, flaeche, istKappungsgebiet (bool)
   - Kappungsgrenze: 20% in 3 Jahren (15% in Kappungsgebieten, d.h. milieuschutz = true)
   - Sperrfrist: 15 Monate nach letzter Erhöhung
   - Logik:
     - Keine letzte Erhöhung bekannt → "Sofort", volle Kappung
     - ≥ 36 Monate seit letzter → "Sofort", volle Kappung
     - 15-36 Monate → "Teilweise", anteilig
     - < 15 Monate → Datum wann Sperrfrist endet, Betrag = 0
   - Rückgabe: `{ moeglich: string, betrag: number, grund: string }`

4. **§559 BGB – Modernisierungsumlage:**
   - 8% der CAPEX-Summe pro Jahr
   - ABER Kappungsgrenzen pro Einheit:
     - Kaltmiete < 7 €/m² → max 2 €/m² Erhöhung in 6 Jahren
     - Kaltmiete ≥ 7 €/m² → max 3 €/m² Erhöhung in 6 Jahren
   - Ergebnis = min(8% der CAPEX, Summe der Kappungen)

5. **Kosten:** kosten_gesamt = betriebskosten_nicht_umlage + instandhaltung + verwaltung + ruecklagen. kostenquote = kosten_gesamt / miete_ist_jahr × 100

6. **Cashflow:** cashflow_ist = miete_ist_jahr - kapitaldienst - kosten_gesamt. cashflow_opt = miete_soll_jahr - kapitaldienst - kosten_gesamt

7. **Rendite:** rendite = miete_ist_jahr / kaufpreis × 100. rendite_opt = miete_soll_jahr / kaufpreis × 100

8. **WEG-Potenzial:** wert_aufgeteilt = kaufpreis × 1.15. weg_gewinn = wert_aufgeteilt - kaufpreis (nur wenn nicht bereits aufgeteilt). weg_genehmigung = milieuschutz || umwandlungsverbot

9. **AfA:** rnd = max(10, min(80, 80 - alter)). gebaeudewert = kaufpreis × 0.8. afa_jahr = gebaeudewert / rnd. steuerersparnis_42 = afa_jahr × 0.42

10. **Wertentwicklung:** 2,5% p.a. Steigerung. preis_Xj = kaufpreis × (1.025)^X für X ∈ {3, 5, 7, 10}

### lib/erlaeuterungen.ts

Statische Erklärungstexte für jeden der 12 Analyse-Punkte. Zielgruppe: Immobilien-Laien. Jede Erläuterung soll kurz (2-3 Sätze) und verständlich sein.

Sektionen: `finanzierungsprofil`, `ertragsprofil`, `mietanalyse`, `cashflow`, `kostenstruktur`, `wertentwicklung`, `capex_559`, `weg_potenzial`, `rnd_afa`, `roi`, `exit`, `handlungsempfehlung`.

Für `kostenstruktur` gibt es eine dynamische Bewertung:
- Quote < 25% → "gesund"
- 25-35% → "durchschnittlich"
- > 35% → "erhöht – Optimierungspotenzial"

### lib/matching.ts

Migriere `findePassendeKaeufer()` aus original.html Zeilen 538-556. Matching-Score basierend auf: Kaufpreis im Volumenbereich (+40), Assetklasse passt (+30), Region passt (+30).

### Claude API Route (app/api/auswertung/route.ts)

POST-Handler:
1. Objekt + Einheiten aus Supabase laden
2. `berechneAlles()` aufrufen
3. Claude API aufrufen (model: `claude-sonnet-4-20250514`, max_tokens: 1500)
4. Prompt: Immobilien-Analyst, Antwort als JSON mit: empfehlung ("HALTEN"|"OPTIMIEREN"|"RESTRUKTURIEREN"|"VERKAUFEN"), prioritaet, begruendung, handlungsschritte, chancen, risiken, fazit
5. Auswertung in DB speichern (berechnungen als JSONB, Empfehlung-Felder einzeln)
6. Rückgabe: Auswertungs-ID

### Make.com Webhook (app/api/email/)

POST an `MAKE_WEBHOOK_URL` mit `{ actionId, type, to_email, to_name, subject, html_content, ... }`.
- actionId 1 = Welcome-Mail
- actionId 2 = Auswertungs-Mail mit PDF

## UI-Design

### Glass-Design (beibehalten aus Original)

Kernstyles für globals.css:

```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8);
}
.glass-sidebar {
  background: linear-gradient(180deg, rgba(30, 58, 95, 0.95) 0%, rgba(30, 64, 175, 0.95) 100%);
  backdrop-filter: blur(20px);
}
.glass-input {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
}
```

Dashboard-Hintergrund: `linear-gradient(135deg, #e0e7ff 0%, #f0f9ff 50%, #e0f2fe 100%)`
Login-Hintergrund: `bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900`
Primärfarbe: `#1e3a5f` / `#1e40af` (Dunkelblau)

### Layout-Regeln

- **Logo:** Firmenlogo oben rechts im Header und im PDF. Datei: `public/logo.svg` (wird nachgeliefert, Platzhalter 🏛️ verwenden)
- **Firmenname:** "Imperoyal Immobilien" (NICHT "Imperial")
- **Sidebar:** Links, fest, Breite 256px, Glass-Design dunkel
- **Auswertungs-PDF Layout:** Jede Sektion volle Breite. Darunter 2 Diagramme nebeneinander. Darunter Erläuterungsbox.
- **Keine Emojis in der Produktion** – im Original dienen 🏛️📊💰 etc. als Icon-Platzhalter. Ersetze durch lucide-react Icons.

### Diagramme (Recharts)

Benötigte Charts:

1. `CashflowBarChart` – 2 Gruppen (IST/Optimiert), je 3 Balken (Miete grün, Kapitaldienst rot, Kosten gelb)
2. `WertentwicklungChart` – Linie mit Area-Fill, Punkte bei 0/3/5/7/10 Jahren
3. `KostenPieChart` – Torte: BK, Instandhaltung, Verwaltung, Rücklagen
4. `ErtragsPieChart` – Torte: Erlösanteile nach Nutzungsart (Wohnen/Gewerbe/Stellplatz)
5. `ErtragsBarChart` – Balken: IST-Miete vs. SOLL-Miete pro Nutzungsart
6. `WegCompareChart` – 2 Balken: "Wert heute" vs. "Wert aufgeteilt"
7. `RoiBarChart` – 3 Balken: ROI heute, ROI optimiert, ROI +WEG
8. `ExitBarChart` – 4 Balken: Wert heute, +3J, +7J, +10J

Farbschema: Grün (#22c55e) für Positives, Rot (#ef4444) für Kosten/Negativ, Blau (#3b82f6) für Neutral, Gelb (#eab308) für Warnungen.

### Formular-Optionen (Select-Werte)

```typescript
export const OPTIONS = {
  kontaktart: ['Telefon', 'E-Mail', 'Videokonferenz'],
  assetklassen: ['MFH', 'Wohn- & Geschäftshaus', 'Büro', 'Retail', 'Logistik', 'Light Industrial', 'Betreiberimmobilien', 'Grundstücke', 'Development'],
  gebaeudetyp: ['MFH', 'Wohn- & Geschäftshaus', 'Büro', 'Retail', 'Logistik', 'Spezialimmobilie'],
  heizungsart: ['Gas', 'Öl', 'Wärmepumpe', 'Fernwärme', 'Elektro', 'Sonstige'],
  mietvertragsart: ['Standard', 'Index', 'Staffel'],
  nutzung: ['Wohnen', 'Gewerbe', 'Stellplatz'],
  haltedauer: ['0-3 Jahre', '3-7 Jahre', '7+ Jahre'],
  primaeresziel: ['Cashflow', 'Rendite', 'AfA/RND', 'Exit', 'Repositionierung', 'Portfolio-Umschichtung'],
  risikoprofil: ['Konservativ', 'Core', 'Core+', 'Value-Add', 'Opportunistisch'],
  laender: ['Deutschland', 'Österreich', 'Schweiz'],
};
```

## Rollen & Berechtigungen

**Admin:**
- Sieht alles (alle Mandanten, alle Objekte, alle Auswertungen)
- Kann Mandanten anlegen → erstellt Supabase Auth User + Profile
- Kann Objekte für jeden Mandanten anlegen
- Kann Auswertungen erstellen (Claude API + Berechnungen)
- Sieht und bearbeitet Anfragen

**Mandant:**
- Sieht nur eigene Objekte, Auswertungen, Ankaufsprofile (via RLS)
- Kann eigene Objekte anlegen und bearbeiten
- Kann Auswertungen NICHT selbst erstellen, sondern nur "anfragen" (wird in anfragen-Tabelle gespeichert)
- Kann eigene Ankaufsprofile erstellen

## Mandant anlegen (Ablauf)

1. Admin füllt Mandant-Formular aus
2. Passwort wird generiert (10 Zeichen, alphanumerisch)
3. Supabase Auth User wird via `supabase.auth.admin.createUser()` mit SERVICE_ROLE_KEY erstellt
4. Profile-Eintrag wird erstellt (role='mandant', mandant_id=neue mandant UUID)
5. Optional: Welcome-E-Mail via Make.com Webhook
6. Wenn kein E-Mail-Versand: Passwort wird einmalig im UI angezeigt

## Auswertung erstellen (Ablauf)

1. Admin klickt "Auswerten" bei einem Objekt
2. Frontend ruft `POST /api/auswertung` mit objekt_id
3. API Route:
   a. Lädt Objekt + Einheiten aus Supabase
   b. Führt `berechneAlles()` aus
   c. Ruft Claude API auf → Empfehlung als JSON
   d. Speichert Auswertung in DB
   e. Gibt auswertungs_id zurück
4. Frontend navigiert zu `/auswertungen/[id]`
5. Detail-Seite zeigt alle 12 Punkte + Diagramme + Erläuterungen

Für Mandanten: Statt Auswerten wird eine Anfrage erstellt. Admin sieht die Anfrage unter /anfragen und kann von dort auswerten.

## Konventionen

- TypeScript strict mode
- Alle Komponenten als funktionale Komponenten
- Server Components als Default, `"use client"` nur wo nötig (Formulare, interaktive Charts)
- Deutsche UI-Texte, englische Code-Bezeichner (Variablen, Funktionen)
- Fehlerbehandlung: try/catch in API Routes, Toast-Notifications im Client
- Alle Geldbeträge als NUMERIC in DB, als `number` in TypeScript
- Alle Datumsfelder als ISO-Strings oder Date-Objekte, formatiert mit `formatDate()`
- Dateien benennen: kebab-case (z.B. `mandant-form.tsx`, `cashflow-bar-chart.tsx`)
