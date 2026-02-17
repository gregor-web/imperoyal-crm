-- ============================================
-- ANALYSE COUNTER on mandanten
-- ============================================
-- Tracks how many completed (paid) analyses each mandant has.
-- Used for volume-based pricing tiers:
--   1-10:  350€ (Einstieg)
--   11-49: 250€ (Portfolio)
--   50+:   180€ (Großbestand)

ALTER TABLE mandanten ADD COLUMN IF NOT EXISTS completed_analysen INTEGER NOT NULL DEFAULT 0;

-- Backfill: set counter to actual count of paid auswertungen
UPDATE mandanten m
SET completed_analysen = (
  SELECT COUNT(*)
  FROM auswertungen a
  WHERE a.mandant_id = m.id
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_mandanten_completed_analysen ON mandanten(completed_analysen);

-- RPC function to atomically increment the counter
CREATE OR REPLACE FUNCTION increment_completed_analysen(p_mandant_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE mandanten
  SET completed_analysen = completed_analysen + 1,
      updated_at = now()
  WHERE id = p_mandant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
