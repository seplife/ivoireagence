-- ============================================================
-- MIGRATION 003 — Factures (invoices)
-- ============================================================

-- 1. Enum type d'événement facturable
CREATE TYPE public.billing_event AS ENUM (
  'publication_created',    -- nouvelle annonce
  'listing_featured',       -- mise en avant
  'listing_verified',       -- badge vérifié
  'listing_renewed',        -- renouvellement annonce
  'subscription_monthly',   -- abonnement mensuel
  'subscription_yearly'     -- abonnement annuel
);

-- 2. Enum statut facture
CREATE TYPE public.invoice_status AS ENUM (
  'pending',    -- créée, pas encore payée
  'paid',       -- paiement confirmé
  'failed',     -- échec de paiement
  'expired',    -- délai de paiement dépassé (24h)
  'refunded',   -- remboursée
  'free'        -- coût zéro (plan Pro/Agency, inclus)
);

-- 3. Table invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id                UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id       UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  subscription_id   UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,

  event_type        public.billing_event    NOT NULL,
  status            public.invoice_status   NOT NULL DEFAULT 'pending',

  amount            INTEGER NOT NULL DEFAULT 0 CHECK (amount >= 0),  -- en FCFA
  currency          TEXT NOT NULL DEFAULT 'XOF',

  -- Références paiement CinetPay
  cinetpay_transaction_id TEXT UNIQUE,
  payment_method          TEXT,         -- orange_money | mtn_momo | wave | card

  -- Plan au moment de la facturation (audit)
  plan_at_billing   public.billing_plan NOT NULL DEFAULT 'free',

  -- Dates
  created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at           TIMESTAMP WITH TIME ZONE,
  expires_at        TIMESTAMP WITH TIME ZONE
                      NOT NULL DEFAULT (now() + INTERVAL '24 hours'),

  -- Métadonnées JSON (numéro de facture lisible, etc.)
  metadata          JSONB DEFAULT '{}'
);

-- 4. Index
CREATE INDEX IF NOT EXISTS idx_invoices_user_created
  ON public.invoices (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_status_expires
  ON public.invoices (status, expires_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_invoices_property
  ON public.invoices (property_id)
  WHERE property_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_cinetpay
  ON public.invoices (cinetpay_transaction_id)
  WHERE cinetpay_transaction_id IS NOT NULL;

-- 5. Numéro de facture lisible auto-généré
--    Format : INV-YYYYMM-NNNNN (ex: INV-202504-00042)
CREATE SEQUENCE IF NOT EXISTS public.invoice_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.metadata = jsonb_set(
    COALESCE(NEW.metadata, '{}'),
    '{invoice_number}',
    to_jsonb('INV-' || to_char(now(), 'YYYYMM') || '-' ||
             lpad(nextval('invoice_seq')::text, 5, '0'))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();

-- 6. RLS invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoices"
  ON public.invoices FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator')
  );

-- INSERT/UPDATE réservés aux Edge Functions (service_role key)

-- 7. Vue agrégée pour le dashboard admin
CREATE OR REPLACE VIEW public.billing_stats_monthly AS
SELECT
  date_trunc('month', paid_at)       AS month,
  event_type,
  plan_at_billing,
  COUNT(*)                           AS invoice_count,
  SUM(amount)                        AS total_fcfa,
  AVG(amount)::INTEGER               AS avg_fcfa
FROM public.invoices
WHERE status = 'paid'
GROUP BY 1, 2, 3
ORDER BY 1 DESC;

-- 8. Vue pour la page "Mes factures" utilisateur (jointure property titre)
CREATE OR REPLACE VIEW public.user_invoices_view AS
SELECT
  i.*,
  p.title       AS property_title,
  p.commune     AS property_commune,
  p.city        AS property_city,
  i.metadata ->> 'invoice_number' AS invoice_number
FROM public.invoices i
LEFT JOIN public.properties p ON p.id = i.property_id;
