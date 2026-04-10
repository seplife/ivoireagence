# Migrations — Système de facturation IvoireImmobilier

## Ordre d'exécution

Coller chaque fichier dans **Supabase Dashboard → SQL Editor → New query**, dans cet ordre :

1. `20240501000001_billing_extend_properties.sql`
2. `20240501000002_billing_subscriptions.sql`
3. `20240501000003_billing_invoices.sql`
4. `20240501000004_billing_cron_pricing.sql`  ← nécessite pg_cron activé
5. `20240501000005_billing_notifications.sql`

## Avant d'exécuter la migration 004

Activer pg_cron dans Supabase :
Dashboard → Database → Extensions → chercher "pg_cron" → Enable

## Ce que chaque migration fait

| Fichier | Tables / objets créés | Modifie l'existant |
|---|---|---|
| 001 | type `publication_status`, colonnes sur `properties` | RLS properties |
| 002 | `subscriptions`, type `billing_plan`, colonne `plan` sur `profiles` | trigger `handle_new_user` |
| 003 | `invoices`, séquence, vues agrégées | — |
| 004 | `pricing_rules`, 4 cron jobs, fonctions métier | — |
| 005 | `notifications` | — |

## Points de compatibilité avec le schéma existant

- L'enum `property_status` (a_louer / a_vendre) est **conservé intact** — il représente le type de transaction.
- La nouvelle colonne `publication_status` représente le statut de publication (visible ou non).
- Toutes les annonces existantes sont migrées vers `publication_status = 'active'` automatiquement.
- Le trigger `handle_new_user` est remplacé pour inclure la création de subscription FREE.
- La RLS de `properties` est remplacée par une politique qui filtre sur `publication_status`.

## Rollback

En cas de problème, exécuter `ROLLBACK_billing_system.sql` dans le SQL Editor.
