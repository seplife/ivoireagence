import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Smartphone, MessageCircle, Sparkles, Building2, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const WHATSAPP = "2250779535795";

type Period = "monthly" | "yearly";

type Plan = {
  id: string;
  name: string;
  audience: "annonceur" | "client";
  icon: typeof User;
  tagline: string;
  monthly: number;
  yearly: number; // total annuel (mensuel * 10 = -2 mois)
  features: string[];
  highlighted?: boolean;
  ctaLabel: string;
};

const advertiserPlans: Plan[] = [
  {
    id: "gratuit",
    name: "Gratuit",
    audience: "annonceur",
    icon: User,
    tagline: "Pour tester la plateforme",
    monthly: 0,
    yearly: 0,
    ctaLabel: "Commencer gratuitement",
    features: [
      "1 annonce active",
      "Jusqu'à 5 photos par annonce",
      "Messagerie intégrée",
      "Visibilité standard",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    audience: "annonceur",
    icon: Sparkles,
    tagline: "Pour propriétaires sérieux",
    monthly: 9900,
    yearly: 99000,
    highlighted: true,
    ctaLabel: "Passer au Pro",
    features: [
      "Jusqu'à 10 annonces actives",
      "20 photos par annonce",
      "Badge « Vérifié » sur vos annonces",
      "Mise en avant 1×/semaine",
      "Statistiques de vues & contacts",
      "Support WhatsApp prioritaire",
    ],
  },
  {
    id: "agence",
    name: "Agence",
    audience: "annonceur",
    icon: Building2,
    tagline: "Pour agences & multi-biens",
    monthly: 29900,
    yearly: 299000,
    ctaLabel: "Devenir Agence",
    features: [
      "Annonces illimitées",
      "Photos illimitées + vidéo",
      "Page agence personnalisée",
      "Vérification documents (ACD, titre)",
      "Mise en avant illimitée",
      "Multi-comptes agents",
      "Account manager dédié",
    ],
  },
];

const clientPlans: Plan[] = [
  {
    id: "client-gratuit",
    name: "Visiteur",
    audience: "client",
    icon: User,
    tagline: "Recherche libre",
    monthly: 0,
    yearly: 0,
    ctaLabel: "Explorer les annonces",
    features: [
      "Recherche illimitée",
      "Contact direct par WhatsApp",
      "Favoris (jusqu'à 10)",
    ],
  },
  {
    id: "client-premium",
    name: "Premium",
    audience: "client",
    icon: Sparkles,
    tagline: "Pour les chercheurs actifs",
    monthly: 2900,
    yearly: 29000,
    highlighted: true,
    ctaLabel: "Activer Premium",
    features: [
      "Favoris illimités + alertes email",
      "Accès anticipé aux nouvelles annonces (24h)",
      "Vérification documents par nos experts",
      "Accompagnement WhatsApp dédié",
    ],
  },
];

const formatFcfa = (n: number) =>
  n === 0 ? "Gratuit" : `${n.toLocaleString("fr-FR")} FCFA`;

const buildWaHref = (plan: Plan, period: Period) => {
  const price =
    plan.monthly === 0
      ? "gratuit"
      : period === "monthly"
        ? `${formatFcfa(plan.monthly)}/mois`
        : `${formatFcfa(plan.yearly)}/an`;
  const msg = `Bonjour IvoireImmobilier 👋
Je souhaite souscrire au forfait *${plan.name}* (${price}).
Je préfère payer par Mobile Money (Orange / MTN / Wave).
Pouvez-vous m'envoyer la procédure ?`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
};

function PlanCard({ plan, period }: { plan: Plan; period: Period }) {
  const Icon = plan.icon;
  const price =
    period === "monthly" ? plan.monthly : Math.round(plan.yearly / 12);
  const isFree = plan.monthly === 0;

  return (
    <Card
      className={cn(
        "relative flex flex-col p-6 transition-all",
        plan.highlighted &&
          "border-primary shadow-lg ring-2 ring-primary/20 md:scale-[1.02]",
      )}
    >
      {plan.highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
          Le plus choisi
        </Badge>
      )}

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-xl text-foreground">{plan.name}</h3>
          <p className="text-xs text-muted-foreground">{plan.tagline}</p>
        </div>
      </div>

      <div className="mb-6">
        {isFree ? (
          <div className="text-3xl font-bold text-foreground">Gratuit</div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">
              {price.toLocaleString("fr-FR")}
            </span>
            <span className="text-sm text-muted-foreground">FCFA / mois</span>
          </div>
        )}
        {!isFree && period === "yearly" && (
          <p className="mt-1 text-xs text-emerald-600">
            Facturé {formatFcfa(plan.yearly)}/an — 2 mois offerts
          </p>
        )}
        {!isFree && period === "monthly" && (
          <p className="mt-1 text-xs text-muted-foreground">
            Sans engagement
          </p>
        )}
      </div>

      <ul className="mb-6 flex-1 space-y-3">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-foreground/80">{f}</span>
          </li>
        ))}
      </ul>

      {isFree ? (
        <Button asChild variant="outline" className="w-full">
          <Link to={plan.audience === "annonceur" ? "/publier" : "/annonces"}>
            {plan.ctaLabel}
          </Link>
        </Button>
      ) : (
        <Button
          asChild
          className={cn(
            "w-full",
            plan.highlighted && "bg-primary hover:bg-primary/90",
          )}
        >
          <a
            href={buildWaHref(plan, period)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" />
            {plan.ctaLabel}
          </a>
        </Button>
      )}
    </Card>
  );
}

export default function PricingPage() {
  const [period, setPeriod] = useState<Period>("monthly");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container py-12 md:py-16 text-center">
          <Badge variant="secondary" className="mb-4">
            Tarifs transparents · sans frais cachés
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl text-foreground">
            Choisissez le forfait qui vous correspond
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm md:text-base text-muted-foreground">
            Paiement simple par <strong>Mobile Money</strong> — Orange Money,
            MTN Money ou Wave. Confirmation immédiate via WhatsApp.
          </p>

          {/* Toggle */}
          <div className="mx-auto mt-8 inline-flex items-center rounded-full border bg-card p-1 shadow-sm">
            <button
              onClick={() => setPeriod("monthly")}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                period === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Mensuel
            </button>
            <button
              onClick={() => setPeriod("yearly")}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                period === "yearly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Annuel
              <span className="ml-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                -2 mois
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Annonceurs */}
      <section className="container py-12 md:py-16">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl text-foreground">
            Pour propriétaires & agents
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Publiez vos biens et gagnez en visibilité auprès de milliers de
            visiteurs.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {advertiserPlans.map((p) => (
            <PlanCard key={p.id} plan={p} period={period} />
          ))}
        </div>
      </section>

      {/* Clients */}
      <section className="border-t bg-muted/30">
        <div className="container py-12 md:py-16">
          <div className="mb-8 text-center">
            <h2 className="font-display text-2xl text-foreground">
              Pour les chercheurs de bien
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Trouvez plus vite et soyez accompagné par nos experts.
            </p>
          </div>
          <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
            {clientPlans.map((p) => (
              <PlanCard key={p.id} plan={p} period={period} />
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Money block */}
      <section className="container py-12 md:py-16">
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 md:p-10">
          <div className="grid items-center gap-8 md:grid-cols-[auto,1fr,auto]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Smartphone className="h-8 w-8" />
            </div>
            <div>
              <h3 className="font-display text-xl text-foreground">
                Paiement par Mobile Money
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Nous acceptons <strong>Orange Money</strong>,{" "}
                <strong>MTN Mobile Money</strong> et <strong>Wave</strong>.
                Contactez-nous sur WhatsApp pour recevoir le numéro de paiement
                et activer votre forfait en quelques minutes.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline" className="border-orange-500/40 text-orange-600">
                  Orange Money
                </Badge>
                <Badge variant="outline" className="border-yellow-500/40 text-yellow-700">
                  MTN Money
                </Badge>
                <Badge variant="outline" className="border-sky-500/40 text-sky-600">
                  Wave
                </Badge>
              </div>
            </div>
            <Button asChild size="lg" className="bg-[#25D366] text-white hover:bg-[#1ebe5d]">
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                  "Bonjour, je souhaite souscrire à un forfait IvoireImmobilier par Mobile Money.",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" />
                Souscrire via WhatsApp
              </a>
            </Button>
          </div>
        </Card>
      </section>

      {/* FAQ courte */}
      <section className="container pb-16">
        <h2 className="mb-8 text-center font-display text-2xl text-foreground">
          Questions fréquentes
        </h2>
        <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
          {[
            {
              q: "Comment se passe le paiement Mobile Money ?",
              a: "Cliquez sur le forfait choisi, un message WhatsApp pré-rempli s'ouvre. Notre équipe vous envoie le numéro Orange/MTN/Wave et active votre compte dès réception.",
            },
            {
              q: "Puis-je changer de forfait à tout moment ?",
              a: "Oui, vous pouvez passer d'un plan à l'autre quand vous le souhaitez. Nous calculons un avoir au prorata.",
            },
            {
              q: "Y a-t-il un engagement ?",
              a: "Aucun engagement sur les forfaits mensuels. L'option annuelle vous fait économiser 2 mois.",
            },
            {
              q: "Comment fonctionne le badge « Vérifié » ?",
              a: (
                <>
                  Nous vérifions votre identité et vos documents.{" "}
                  <Link to="/verification" className="text-primary underline">
                    En savoir plus
                  </Link>
                  .
                </>
              ),
            },
          ].map((item, i) => (
            <Card key={i} className="p-5">
              <h3 className="mb-2 font-semibold text-foreground">{item.q}</h3>
              <p className="text-sm text-muted-foreground">{item.a}</p>
            </Card>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
