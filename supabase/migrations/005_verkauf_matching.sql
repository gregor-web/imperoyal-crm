-- Verkaufsmarkierung für Objekte + Matching-Ergebnisse Tabelle

-- 1. Verkaufsmarkierung
ALTER TABLE objekte ADD COLUMN IF NOT EXISTS zum_verkauf BOOLEAN DEFAULT false;
ALTER TABLE objekte ADD COLUMN IF NOT EXISTS zum_verkauf_seit TIMESTAMPTZ;

-- 2. Matching-Ergebnisse (verhindert Doppel-Benachrichtigungen)
CREATE TABLE IF NOT EXISTS matching_ergebnisse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objekt_id UUID NOT NULL REFERENCES objekte(id) ON DELETE CASCADE,
  ankaufsprofil_id UUID NOT NULL REFERENCES ankaufsprofile(id) ON DELETE CASCADE,
  kaeufer_mandant_id UUID NOT NULL REFERENCES mandanten(id) ON DELETE CASCADE,
  verkaeufer_mandant_id UUID NOT NULL REFERENCES mandanten(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  matches JSONB DEFAULT '{}',
  status TEXT DEFAULT 'neu' CHECK (status IN ('neu', 'kontaktiert', 'abgelehnt', 'abgeschlossen')),
  benachrichtigt_am TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(objekt_id, ankaufsprofil_id)
);

-- 3. RLS
ALTER TABLE matching_ergebnisse ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access matching_ergebnisse" ON matching_ergebnisse;
CREATE POLICY "Admin full access matching_ergebnisse" ON matching_ergebnisse
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Mandant can view own matching results" ON matching_ergebnisse;
CREATE POLICY "Mandant can view own matching results" ON matching_ergebnisse
  FOR SELECT USING (
    kaeufer_mandant_id = user_mandant_id() OR verkaeufer_mandant_id = user_mandant_id()
  );

-- 4. Index für schnelles Matching
CREATE INDEX IF NOT EXISTS idx_objekte_zum_verkauf ON objekte(zum_verkauf) WHERE zum_verkauf = true;
CREATE INDEX IF NOT EXISTS idx_matching_ergebnisse_status ON matching_ergebnisse(status);
