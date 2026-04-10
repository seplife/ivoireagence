-- ============================================================
-- MIGRATION 001 — Étendre properties pour le système de facturation
-- Compatible avec le schéma existant (property_status enum gardé)
-- ============================================================

-- 1. Statut de publication (séparé du statut À Louer / À Vendre)
--    On ajoute une colonne publication_status distincte de l'enum property_status
CREATE TYPE public.publication_status AS ENUM (
  'draft',            -- annonce créée, pas encore soumise au paiement
  'pending_payment',  -- annonce soumise, facture en attente de paiement
  'active',           -- paiement confirmé, annonce visible publiquement
  'expired',          -- période de publication terminée
  'suspended'         -- désactivée suite à downgrade de plan
);

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS publication_status public.publication_status
    NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS is_featured       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS expires_at        TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS plan_at_publish   TEXT NOT NULL DEFAULT 'free';

-- 2. Index pour les requêtes fréquentes (listing public = active uniquement)
CREATE INDEX IF NOT EXISTS idx_properties_publication_status
  ON public.properties (publication_status);

CREATE INDEX IF NOT EXISTS idx_properties_owner_status
  ON public.properties (owner_id, publication_status);

CREATE INDEX IF NOT EXISTS idx_properties_featured
  ON public.properties (is_featured, publication_status)
  WHERE is_featured = true;

-- 3. Mettre toutes les annonces existantes en "active"
--    pour ne pas casser les données en place
UPDATE public.properties
SET publication_status = 'active'
WHERE publication_status = 'draft';

-- 4. RLS : les annonces actives sont visibles de tous,
--         le propriétaire voit aussi ses brouillons et en_attente
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON public.properties;

CREATE POLICY "Active properties are viewable by everyone"
  ON public.properties FOR SELECT
  USING (
    publication_status = 'active'
    OR owner_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'moderator')
  );
