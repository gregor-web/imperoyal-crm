-- Add pdf_config JSONB column to auswertungen for section ordering/visibility
ALTER TABLE auswertungen
ADD COLUMN IF NOT EXISTS pdf_config JSONB DEFAULT NULL;

COMMENT ON COLUMN auswertungen.pdf_config IS 'PDF section configuration: order and visibility per auswertung. Structure: { sections: [{ id, visible, order }] }';
