-- ============================================
-- STRIPE INTEGRATION
-- ============================================

-- Add Stripe customer ID to mandanten
ALTER TABLE mandanten ADD COLUMN stripe_customer_id TEXT UNIQUE;

-- Update anfragen status check to include 'bezahlt' state
ALTER TABLE anfragen DROP CONSTRAINT IF EXISTS anfragen_status_check;
ALTER TABLE anfragen ADD CONSTRAINT anfragen_status_check
  CHECK (status IN ('offen', 'bezahlt', 'in_bearbeitung', 'fertig', 'bearbeitet', 'versendet'));

-- Add payment tracking fields to anfragen
ALTER TABLE anfragen ADD COLUMN payment_status TEXT DEFAULT 'pending'
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'waived'));
ALTER TABLE anfragen ADD COLUMN stripe_session_id TEXT;
ALTER TABLE anfragen ADD COLUMN amount_cents INTEGER;
ALTER TABLE anfragen ADD COLUMN paid_at TIMESTAMPTZ;

-- ============================================
-- PAYMENTS TABLE (full payment history)
-- ============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anfrage_id UUID NOT NULL REFERENCES anfragen(id) ON DELETE CASCADE,
  mandant_id UUID NOT NULL REFERENCES mandanten(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  tier TEXT NOT NULL CHECK (tier IN ('einstieg', 'portfolio', 'grossbestand')),
  auswertung_nr INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RLS for payments
-- ============================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access payments" ON payments
  FOR ALL USING (is_admin());

CREATE POLICY "Mandant can view own payments" ON payments
  FOR SELECT USING (mandant_id = user_mandant_id());

-- Trigger for updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_payments_mandant_id ON payments(mandant_id);
CREATE INDEX idx_payments_stripe_session_id ON payments(stripe_session_id);
CREATE INDEX idx_anfragen_stripe_session_id ON anfragen(stripe_session_id);
