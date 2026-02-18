-- Mandanten sehen Auswertungen nur wenn status = 'versendet' (nach E-Mail-Versand)
DROP POLICY IF EXISTS "Mandant can view own auswertungen" ON auswertungen;

CREATE POLICY "Mandant can view own sent auswertungen" ON auswertungen
  FOR SELECT
  USING (
    (is_admin()) 
    OR 
    (mandant_id = user_mandant_id() AND status = 'versendet')
  );
