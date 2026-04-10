-- ============================================================
-- MIGRATION 004 — Grille tarifaire, pg_cron, fonctions métier
-- Exécuter APRÈS l'activation de l'extension pg_cron dans Supabase
-- (Dashboard → Database → Extensions → pg_cron → Enable)
-- ============================================================

-- ============================================================
-- A. GRILLE TARIFAIRE (table de référence)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pricing_rules (
  id           UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan         public.billing_plan  NOT NULL,
  event_type   public.billing_event NOT NULL,
  amount_fcfa  INTEGER NOT NULL DEFAULT 0 CHECK (amount_fcfa >= 0),
  quota        INTEGER,        -- NULL = illimité, N = N fois par période
  quota_period TEXT,           -- 'month' | 'year' | NULL
  active       BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (plan, event_type)
);

-- Grille initiale
INSERT INTO public.pricing_rules (plan, event_type, amount_fcfa, quota, quota_period) VALUES
  -- Plan FREE
  ('free', 'publication_created', 3000,  3, 'month'),   -- 3 gratuites/mois puis 3000
  ('free', 'listing_featured',    12000, NULL, NULL),
  ('free', 'listing_verified',    3000,  NULL, NULL),
  ('free', 'listing_renewed',     1500,  NULL, NULL),

  -- Plan PRO (35 000 FCFA/mois)
  ('pro',  'publication_created', 0,     NULL, NULL),   -- illimitées incluses
  ('pro',  'listing_featured',    8000,  3, 'month'),   -- 3 incluses/mois
  ('pro',  'listing_verified',    0,     NULL, NULL),   -- inclus
  ('pro',  'listing_renewed',     0,     NULL, NULL),   -- inclus

  -- Plan AGENCY (75 000 FCFA/mois)
  ('agency', 'publication_created', 0,  NULL, NULL),
  ('agency', 'listing_featured',    0,  NULL, NULL),   -- illimitées incluses
  ('agency', 'listing_verified',    0,  NULL, NULL),
  ('agency', 'listing_renewed',     0,  NULL, NULL);

-- RLS : lecture publique (les Edge Functions en ont besoin)
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Pricing rules are readable by all"
  ON public.pricing_rules FOR SELECT USING (true);

-- ============================================================
-- B. FONCTION : calculer le montant d'un événement
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_billing_amount(
  p_user_id    UUID,
  p_event_type public.billing_event
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan        public.billing_plan;
  v_amount      INTEGER;
  v_quota       INTEGER;
  v_quota_period TEXT;
  v_used        INTEGER;
BEGIN
  -- Récupérer le plan actuel de l'utilisateur
  SELECT plan INTO v_plan FROM public.profiles WHERE user_id = p_user_id;
  v_plan := COALESCE(v_plan, 'free');

  -- Récupérer la règle
  SELECT amount_fcfa, quota, quota_period
  INTO v_amount, v_quota, v_quota_period
  FROM public.pricing_rules
  WHERE plan = v_plan AND event_type = p_event_type AND active = true;

  IF NOT FOUND THEN
    RETURN 3000; -- valeur fallback si règle manquante
  END IF;

  -- Vérifier le quota si applicable (ex: 3 publications gratuites/mois)
  IF v_quota IS NOT NULL AND v_plan = 'free' THEN
    SELECT COUNT(*) INTO v_used
    FROM public.invoices
    WHERE user_id = p_user_id
      AND event_type = p_event_type
      AND status IN ('paid', 'free')
      AND created_at >= date_trunc(v_quota_period, now());

    IF v_used >= v_quota THEN
      -- Quota épuisé : appliquer le tarif plein
      SELECT amount_fcfa INTO v_amount
      FROM public.pricing_rules
      WHERE plan = 'free' AND event_type = p_event_type;
      RETURN COALESCE(v_amount, 3000);
    ELSE
      RETURN 0; -- dans le quota, gratuit
    END IF;
  END IF;

  RETURN v_amount;
END;
$$;

-- ============================================================
-- C. FONCTION : downgrade des annonces en excès
-- Appelée quand un user passe de Pro/Agency à Free
-- ============================================================
CREATE OR REPLACE FUNCTION public.downgrade_excess_listings(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  free_limit CONSTANT INTEGER := 3;
BEGIN
  -- Suspendre les annonces au-delà de la limite Free (garder les 3 plus récentes)
  UPDATE public.properties
  SET publication_status = 'suspended',
      is_featured        = false,
      updated_at         = now()
  WHERE owner_id = p_user_id
    AND publication_status = 'active'
    AND id NOT IN (
      SELECT id FROM public.properties
      WHERE owner_id = p_user_id
        AND publication_status = 'active'
      ORDER BY created_at DESC
      LIMIT free_limit
    );
END;
$$;

-- ============================================================
-- D. CRON JOBS (nécessite pg_cron activé)
-- ============================================================

-- Job 1 : Expirer les factures non payées après 24h
SELECT cron.schedule(
  'expire-pending-invoices',
  '*/30 * * * *',  -- toutes les 30 minutes
  $$
    UPDATE public.invoices
    SET status = 'expired'
    WHERE status = 'pending'
      AND expires_at < NOW();

    -- Remettre en draft les annonces dont la facture a expiré
    UPDATE public.properties p
    SET publication_status = 'draft',
        updated_at         = now()
    FROM public.invoices i
    WHERE i.property_id = p.id
      AND i.status = 'expired'
      AND p.publication_status = 'pending_payment';
  $$
);

-- Job 2 : Expirer les annonces dont la période est terminée
SELECT cron.schedule(
  'expire-old-listings',
  '0 3 * * *',  -- chaque nuit à 3h
  $$
    UPDATE public.properties
    SET publication_status = 'expired',
        updated_at         = now()
    WHERE publication_status = 'active'
      AND expires_at IS NOT NULL
      AND expires_at < NOW();
  $$
);

-- Job 3 : Notifications de renouvellement J-3
SELECT cron.schedule(
  'renewal-reminders',
  '0 8 * * *',  -- chaque matin à 8h
  $$
    INSERT INTO public.messages (sender_id, receiver_id, message)
    SELECT
      p.owner_id,           -- sender = le proprio lui-même (système)
      p.owner_id,           -- receiver = le proprio
      'Votre annonce "' || p.title || '" expire dans 3 jours. Renouvelez-la pour rester visible.'
    FROM public.properties p
    WHERE p.publication_status = 'active'
      AND p.expires_at BETWEEN NOW() AND NOW() + INTERVAL '3 days'
      AND NOT EXISTS (
        SELECT 1 FROM public.messages m
        WHERE m.receiver_id = p.owner_id
          AND m.message LIKE '%expire dans 3 jours%'
          AND m.created_at > NOW() - INTERVAL '7 days'
      );
  $$
);

-- Job 4 : Downgrade abonnements past_due depuis plus de 3 jours
SELECT cron.schedule(
  'downgrade-past-due-subscriptions',
  '0 4 * * *',  -- chaque nuit à 4h
  $$
    -- Marquer comme expired les abonnements past_due > 3 jours
    UPDATE public.subscriptions
    SET status    = 'expired',
        plan      = 'free',
        updated_at = now()
    WHERE status = 'past_due'
      AND current_period_end < NOW() - INTERVAL '3 days';
  $$
);

-- ============================================================
-- E. VUE pour AdminDashboard : revenus agrégés
-- ============================================================
CREATE OR REPLACE VIEW public.admin_revenue_view AS
SELECT
  date_trunc('day',   paid_at) AS day,
  date_trunc('week',  paid_at) AS week,
  date_trunc('month', paid_at) AS month,
  event_type::TEXT,
  plan_at_billing::TEXT        AS plan,
  payment_method,
  COUNT(*)                     AS count,
  SUM(amount)                  AS total_fcfa
FROM public.invoices
WHERE status = 'paid'
GROUP BY 1, 2, 3, 4, 5, 6;
