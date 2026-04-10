-- ============================================================
-- MIGRATION 002 — Plans tarifaires et abonnements
-- ============================================================

-- 1. Enum des plans
CREATE TYPE public.billing_plan AS ENUM ('free', 'pro', 'agency');

-- 2. Enum du cycle de facturation
CREATE TYPE public.billing_cycle AS ENUM ('monthly', 'yearly');

-- 3. Enum du statut d'abonnement
CREATE TYPE public.subscription_status AS ENUM (
  'trialing',   -- 1er paiement pas encore confirmé
  'active',     -- abonnement en cours
  'past_due',   -- paiement de renouvellement échoué
  'cancelled',  -- résilié (reste actif jusqu'à current_period_end)
  'expired'     -- période terminée sans paiement
);

-- 4. Ajouter le plan sur profiles (accès rapide sans JOIN)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan public.billing_plan NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP WITH TIME ZONE;

-- 5. Table subscriptions (1 ligne par user maximum)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                        UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                   UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  plan                      public.billing_plan      NOT NULL DEFAULT 'free',
  billing_cycle             public.billing_cycle     NOT NULL DEFAULT 'monthly',
  status                    public.subscription_status NOT NULL DEFAULT 'active',

  -- Références CinetPay
  cinetpay_sub_id           TEXT UNIQUE,
  cinetpay_customer_id      TEXT,
  payment_method            TEXT,           -- last used: orange_money | mtn_momo | wave | card

  -- Période courante
  current_period_start      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end        TIMESTAMP WITH TIME ZONE NOT NULL
                              DEFAULT (now() + INTERVAL '1 month'),

  -- Résiliation
  cancel_at_period_end      BOOLEAN NOT NULL DEFAULT false,
  cancelled_at              TIMESTAMP WITH TIME ZONE,

  -- Période d'essai
  trial_end                 TIMESTAMP WITH TIME ZONE,

  -- Quotas plan Pro (reset mensuel)
  featured_used_this_month  INTEGER NOT NULL DEFAULT 0,
  featured_reset_at         TIMESTAMP WITH TIME ZONE
                              DEFAULT date_trunc('month', now()) + INTERVAL '1 month',

  created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Trigger updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Trigger : sync profiles.plan à chaque changement de subscription
CREATE OR REPLACE FUNCTION public.sync_profile_plan()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    plan            = NEW.plan,
    plan_expires_at = CASE
      WHEN NEW.status IN ('active', 'trialing') THEN NEW.current_period_end
      ELSE NULL
    END,
    updated_at = now()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_profile_plan
  AFTER INSERT OR UPDATE OF plan, status, current_period_end
  ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_plan();

-- 8. Créer une ligne FREE pour tous les users existants
INSERT INTO public.subscriptions (user_id, plan, status, current_period_end)
SELECT id, 'free', 'active', (now() + INTERVAL '100 years')
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 9. Modifier handle_new_user() pour créer la subscription au signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', '')
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');

  -- Abonnement FREE par défaut
  INSERT INTO public.subscriptions (user_id, plan, status, current_period_end)
  VALUES (NEW.id, 'free', 'active', now() + INTERVAL '100 years');

  RETURN NEW;
END;
$$;

-- 10. RLS subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Les Edge Functions utilisent le service_role key qui bypass RLS
-- INSERT/DELETE réservés aux Edge Functions (service_role)
