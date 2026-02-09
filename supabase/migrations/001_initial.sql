-- =====================================================
-- Imperoyal Immobilien - Database Schema
-- =====================================================

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'mandant' CHECK (role IN ('admin', 'mandant')),
  name TEXT,
  email TEXT,
  mandant_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- MANDANTEN
-- ============================================
CREATE TABLE mandanten (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ansprechpartner TEXT,
  position TEXT,
  email TEXT NOT NULL,
  telefon TEXT,
  strasse TEXT,
  plz TEXT,
  ort TEXT,
  land TEXT DEFAULT 'Deutschland',
  kontaktart TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key from profiles to mandanten
ALTER TABLE profiles
  ADD CONSTRAINT profiles_mandant_id_fkey
  FOREIGN KEY (mandant_id) REFERENCES mandanten(id) ON DELETE SET NULL;

-- ============================================
-- OBJEKTE
-- ============================================
CREATE TABLE objekte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandant_id UUID NOT NULL REFERENCES mandanten(id) ON DELETE CASCADE,
  strasse TEXT NOT NULL,
  plz TEXT NOT NULL,
  ort TEXT,
  gebaeudetyp TEXT,
  baujahr INT,
  denkmalschutz BOOLEAN DEFAULT false,
  kernsanierung_jahr INT,
  wohneinheiten INT,
  gewerbeeinheiten INT,
  geschosse INT,
  aufzug BOOLEAN DEFAULT false,
  wohnflaeche NUMERIC,
  gewerbeflaeche NUMERIC,
  grundstueck NUMERIC,
  heizungsart TEXT,
  weg_aufgeteilt BOOLEAN DEFAULT false,
  weg_geplant BOOLEAN DEFAULT false,
  milieuschutz BOOLEAN DEFAULT false,
  umwandlungsverbot BOOLEAN DEFAULT false,
  kaufpreis NUMERIC NOT NULL,
  kaufdatum DATE,
  grundstueck_wert NUMERIC,
  gebaeude_wert NUMERIC,
  darlehensstand NUMERIC,
  zinssatz NUMERIC DEFAULT 3.8,
  tilgung NUMERIC DEFAULT 2,
  eigenkapital_prozent NUMERIC DEFAULT 30,
  leerstandsquote NUMERIC,
  betriebskosten_nicht_umlage NUMERIC,
  instandhaltung NUMERIC,
  verwaltung NUMERIC,
  ruecklagen NUMERIC,
  capex_vergangen TEXT,
  capex_geplant TEXT,
  capex_geplant_betrag NUMERIC,
  mietpreisbindung BOOLEAN DEFAULT false,
  sozialbindung BOOLEAN DEFAULT false,
  modernisierungsstopp BOOLEAN DEFAULT false,
  gewerbe_sonderklauseln BOOLEAN DEFAULT false,
  haltedauer TEXT,
  primaeres_ziel TEXT,
  investitionsbereitschaft TEXT,
  risikoprofil TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- EINHEITEN
-- ============================================
CREATE TABLE einheiten (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objekt_id UUID NOT NULL REFERENCES objekte(id) ON DELETE CASCADE,
  position INT NOT NULL,
  nutzung TEXT NOT NULL CHECK (nutzung IN ('Wohnen', 'Gewerbe', 'Stellplatz')),
  flaeche NUMERIC,
  kaltmiete NUMERIC,
  vergleichsmiete NUMERIC DEFAULT 12,
  mietvertragsart TEXT DEFAULT 'Standard' CHECK (mietvertragsart IN ('Standard', 'Index', 'Staffel')),
  letzte_mieterhoehung DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- AUSWERTUNGEN
-- ============================================
CREATE TABLE auswertungen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objekt_id UUID NOT NULL REFERENCES objekte(id) ON DELETE CASCADE,
  mandant_id UUID NOT NULL REFERENCES mandanten(id) ON DELETE CASCADE,
  berechnungen JSONB,
  empfehlung TEXT,
  empfehlung_prioritaet TEXT,
  empfehlung_begruendung TEXT,
  empfehlung_fazit TEXT,
  empfehlung_handlungsschritte JSONB,
  empfehlung_chancen JSONB,
  empfehlung_risiken JSONB,
  erlaeuterungen JSONB,
  pdf_url TEXT,
  status TEXT DEFAULT 'erstellt' CHECK (status IN ('erstellt', 'versendet')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ANKAUFSPROFILE
-- ============================================
CREATE TABLE ankaufsprofile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandant_id UUID NOT NULL REFERENCES mandanten(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  min_volumen NUMERIC,
  max_volumen NUMERIC,
  assetklassen TEXT[],
  regionen TEXT,
  rendite_min NUMERIC,
  sonstiges TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ANFRAGEN
-- ============================================
CREATE TABLE anfragen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objekt_id UUID NOT NULL REFERENCES objekte(id) ON DELETE CASCADE,
  mandant_id UUID NOT NULL REFERENCES mandanten(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'offen' CHECK (status IN ('offen', 'bearbeitet')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RLS HELPER FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION user_mandant_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT mandant_id FROM profiles WHERE id = auth.uid();
$$;

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandanten ENABLE ROW LEVEL SECURITY;
ALTER TABLE objekte ENABLE ROW LEVEL SECURITY;
ALTER TABLE einheiten ENABLE ROW LEVEL SECURITY;
ALTER TABLE auswertungen ENABLE ROW LEVEL SECURITY;
ALTER TABLE ankaufsprofile ENABLE ROW LEVEL SECURITY;
ALTER TABLE anfragen ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: PROFILES
-- ============================================
CREATE POLICY "Admin full access profiles" ON profiles
  FOR ALL USING (is_admin());

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- ============================================
-- RLS POLICIES: MANDANTEN
-- ============================================
CREATE POLICY "Admin full access mandanten" ON mandanten
  FOR ALL USING (is_admin());

CREATE POLICY "Mandant can view own record" ON mandanten
  FOR SELECT USING (id = user_mandant_id());

-- ============================================
-- RLS POLICIES: OBJEKTE
-- ============================================
CREATE POLICY "Admin full access objekte" ON objekte
  FOR ALL USING (is_admin());

CREATE POLICY "Mandant can view own objekte" ON objekte
  FOR SELECT USING (mandant_id = user_mandant_id());

CREATE POLICY "Mandant can insert own objekte" ON objekte
  FOR INSERT WITH CHECK (mandant_id = user_mandant_id());

CREATE POLICY "Mandant can update own objekte" ON objekte
  FOR UPDATE USING (mandant_id = user_mandant_id());

-- ============================================
-- RLS POLICIES: EINHEITEN
-- ============================================
CREATE POLICY "Admin full access einheiten" ON einheiten
  FOR ALL USING (is_admin());

CREATE POLICY "Mandant can view own einheiten" ON einheiten
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM objekte
      WHERE objekte.id = einheiten.objekt_id
      AND objekte.mandant_id = user_mandant_id()
    )
  );

CREATE POLICY "Mandant can insert own einheiten" ON einheiten
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM objekte
      WHERE objekte.id = einheiten.objekt_id
      AND objekte.mandant_id = user_mandant_id()
    )
  );

CREATE POLICY "Mandant can update own einheiten" ON einheiten
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM objekte
      WHERE objekte.id = einheiten.objekt_id
      AND objekte.mandant_id = user_mandant_id()
    )
  );

-- ============================================
-- RLS POLICIES: AUSWERTUNGEN
-- ============================================
CREATE POLICY "Admin full access auswertungen" ON auswertungen
  FOR ALL USING (is_admin());

CREATE POLICY "Mandant can view own auswertungen" ON auswertungen
  FOR SELECT USING (mandant_id = user_mandant_id());

-- ============================================
-- RLS POLICIES: ANKAUFSPROFILE
-- ============================================
CREATE POLICY "Admin full access ankaufsprofile" ON ankaufsprofile
  FOR ALL USING (is_admin());

CREATE POLICY "Mandant can view own ankaufsprofile" ON ankaufsprofile
  FOR SELECT USING (mandant_id = user_mandant_id());

CREATE POLICY "Mandant can insert own ankaufsprofile" ON ankaufsprofile
  FOR INSERT WITH CHECK (mandant_id = user_mandant_id());

CREATE POLICY "Mandant can update own ankaufsprofile" ON ankaufsprofile
  FOR UPDATE USING (mandant_id = user_mandant_id());

CREATE POLICY "Mandant can delete own ankaufsprofile" ON ankaufsprofile
  FOR DELETE USING (mandant_id = user_mandant_id());

-- ============================================
-- RLS POLICIES: ANFRAGEN
-- ============================================
CREATE POLICY "Admin full access anfragen" ON anfragen
  FOR ALL USING (is_admin());

CREATE POLICY "Mandant can view own anfragen" ON anfragen
  FOR SELECT USING (mandant_id = user_mandant_id());

CREATE POLICY "Mandant can insert own anfragen" ON anfragen
  FOR INSERT WITH CHECK (mandant_id = user_mandant_id());

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mandanten_updated_at
  BEFORE UPDATE ON mandanten
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_objekte_updated_at
  BEFORE UPDATE ON objekte
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_einheiten_updated_at
  BEFORE UPDATE ON einheiten
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ankaufsprofile_updated_at
  BEFORE UPDATE ON ankaufsprofile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
