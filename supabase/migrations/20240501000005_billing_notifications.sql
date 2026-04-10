-- ============================================================
-- MIGRATION 005 — Table notifications
-- Pour les alertes système (expiration, paiement, renouvellement)
-- ============================================================

CREATE TYPE public.notification_type AS ENUM (
  'payment_confirmed',
  'payment_failed',
  'payment_reminder',
  'listing_expiring',
  'listing_expired',
  'subscription_renewed',
  'subscription_cancelled',
  'subscription_past_due',
  'renewal_reminder'
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        public.notification_type NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  payload     JSONB DEFAULT '{}',
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications (user_id, is_read, created_at DESC)
  WHERE is_read = false;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark their notifications as read"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fonction helper appelée par les Edge Functions
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type    public.notification_type,
  p_title   TEXT,
  p_body    TEXT,
  p_payload JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, payload)
  VALUES (p_user_id, p_type, p_title, p_body, p_payload)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
