-- ============================================================
-- ROLLBACK — Annuler tout le système de facturation
-- À exécuter dans l'ordre INVERSE des migrations
-- ATTENTION : supprime toutes les données de facturation
-- ============================================================

-- Rollback 005
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TYPE  IF EXISTS public.notification_type CASCADE;
DROP FUNCTION IF EXISTS public.create_notification CASCADE;

-- Rollback 004
SELECT cron.unschedule('expire-pending-invoices');
SELECT cron.unschedule('expire-old-listings');
SELECT cron.unschedule('renewal-reminders');
SELECT cron.unschedule('downgrade-past-due-subscriptions');
DROP VIEW  IF EXISTS public.admin_revenue_view CASCADE;
DROP TABLE IF EXISTS public.pricing_rules CASCADE;
DROP FUNCTION IF EXISTS public.get_billing_amount CASCADE;
DROP FUNCTION IF EXISTS public.downgrade_excess_listings CASCADE;

-- Rollback 003
DROP VIEW  IF EXISTS public.user_invoices_view CASCADE;
DROP VIEW  IF EXISTS public.billing_stats_monthly CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP SEQUENCE IF EXISTS public.invoice_seq CASCADE;
DROP FUNCTION IF EXISTS public.generate_invoice_number CASCADE;
DROP TYPE  IF EXISTS public.invoice_status CASCADE;
DROP TYPE  IF EXISTS public.billing_event CASCADE;

-- Rollback 002
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP FUNCTION IF EXISTS public.sync_profile_plan CASCADE;
DROP TYPE  IF EXISTS public.subscription_status CASCADE;
DROP TYPE  IF EXISTS public.billing_cycle CASCADE;
DROP TYPE  IF EXISTS public.billing_plan CASCADE;
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS plan,
  DROP COLUMN IF EXISTS plan_expires_at;

-- Rétablir le trigger handle_new_user original (sans création de subscription)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', '')
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Rollback 001
DROP POLICY  IF EXISTS "Active properties are viewable by everyone" ON public.properties;
CREATE POLICY "Properties are viewable by everyone"
  ON public.properties FOR SELECT USING (true);

ALTER TABLE public.properties
  DROP COLUMN IF EXISTS publication_status,
  DROP COLUMN IF EXISTS is_featured,
  DROP COLUMN IF EXISTS expires_at,
  DROP COLUMN IF EXISTS plan_at_publish;

DROP TYPE IF EXISTS public.publication_status CASCADE;
