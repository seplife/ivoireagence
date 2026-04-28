import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  BadgeCheck,
  FileText,
  AlertTriangle,
  FileCheck2,
  PhoneCall,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const WHATSAPP_NUMBER = "2250779535795";

const sections = [
  {
    id: "verification",
    icon: BadgeCheck,
    title: "Comment vérifions-nous les annonces ?",
    cta: "Demander la vérification d'une annonce",
    waMessage:
      "Bonjour, j'ai vu une annonce sur IvoireImmobilier et je voudrais savoir si elle a bien été vérifiée par votre équipe. Pouvez-vous m'aider ?",
    body: (
      <>
        <p>
          Chaque annonce publiée sur IvoireImmobilier passe par un processus de
          contrôle interne avant d'obtenir le badge{" "}
          <span className="inline-flex items-center gap-1 font-medium text-primary">
            <BadgeCheck className="h-4 w-4" /> Vérifié
          </span>
          . Notre équipe :
        </p>
        <ul className="ml-5 mt-3 list-disc space-y-1.5">
          <li>vérifie l'identité du propriétaire ou de l'agent (CNI / passeport) ;</li>
          <li>demande une preuve de propriété (ACD, titre foncier, attestation, contrat de bail) ;</li>
          <li>contrôle la cohérence du bien (photos, surface, adresse, prix) ;</li>
          <li>valide ou rejette l'annonce sous 48 heures.</li>
        </ul>
        <p className="mt-3">
          Seules les annonces validées affichent le badge{" "}
          <span className="font-medium text-primary">Vérifié</span> dans les résultats.
        </p>
      </>
    ),
  },
  {
    id: "paiement",
    icon: AlertTriangle,
    title: "Dois-je payer avant de visiter un bien ?",
    cta: "Vérifier avant de payer",
    waMessage:
      "Bonjour, on me demande de payer (frais de dossier / caution / réservation) avant la visite d'un bien sur IvoireImmobilier. Est-ce normal ? Pouvez-vous vérifier l'annonce ?",
    body: (
      <>
        <p>
          <span className="font-semibold text-foreground">Jamais.</span> Aucun paiement
          (frais de dossier, caution, "réservation", Mobile Money) ne doit être versé
          avant :
        </p>
        <ul className="ml-5 mt-3 list-disc space-y-1.5">
          <li>la visite physique du bien,</li>
          <li>la vérification des documents originaux,</li>
          <li>la signature d'un contrat écrit.</li>
        </ul>
        <p className="mt-3">
          En cas de doute, contactez-nous sur WhatsApp avant tout virement.
        </p>
      </>
    ),
  },
  {
    id: "fraude",
    icon: AlertTriangle,
    title: "Comment reconnaître une annonce frauduleuse ?",
    cta: "Faire vérifier une annonce suspecte",
    waMessage:
      "Bonjour, je suspecte qu'une annonce vue sur IvoireImmobilier soit frauduleuse (prix trop bas / propriétaire injoignable / photos douteuses). Pouvez-vous l'examiner ?",
    body: (
      <>
        <p>Soyez vigilant face à ces signaux :</p>
        <ul className="ml-5 mt-3 list-disc space-y-1.5">
          <li>prix anormalement bas par rapport au marché de la zone ;</li>
          <li>propriétaire injoignable, refus d'appel ou de visite ;</li>
          <li>photos génériques (issues d'internet) ou de très faible qualité ;</li>
          <li>demande de paiement immédiat à un compte personnel ;</li>
          <li>absence de badge <span className="font-medium text-primary">Vérifié</span>.</li>
        </ul>
        <p className="mt-3">
          Toute annonce sans badge "Vérifié" doit être abordée avec prudence et
          recoupée par téléphone.
        </p>
      </>
    ),
  },
  {
    id: "documents",
    icon: FileCheck2,
    title: "Quels documents demander avant de signer ?",
    cta: "Faire vérifier mes documents",
    waMessage:
      "Bonjour, je m'apprête à signer pour un bien (terrain / location) en Côte d'Ivoire et je voudrais que vos experts vérifient les documents (ACD, titre foncier, contrat de bail) avant la signature.",
    body: (
      <>
        <p className="font-semibold text-foreground">Pour un terrain :</p>
        <ul className="ml-5 mt-1.5 list-disc space-y-1.5">
          <li>ACD (Arrêté de Concession Définitive) ou attestation villageoise ;</li>
          <li>plan de bornage avec coordonnées GPS ;</li>
          <li>quittances d'impôts fonciers récentes.</li>
        </ul>
        <p className="mt-3 font-semibold text-foreground">Pour une location :</p>
        <ul className="ml-5 mt-1.5 list-disc space-y-1.5">
          <li>pièce d'identité du bailleur ;</li>
          <li>titre de propriété ou bail enregistré ;</li>
          <li>contrat de location écrit, signé et daté.</li>
        </ul>
        <p className="mt-3">
          Notre service d'accompagnement peut vérifier ces documents pour vous avant
          la signature.
        </p>
      </>
    ),
  },
  {
    id: "signalement",
    icon: PhoneCall,
    title: "Que faire si je suspecte une arnaque ?",
    cta: "Signaler une arnaque maintenant",
    waMessage:
      "Bonjour, je souhaite signaler une arnaque ou une tentative d'arnaque liée à une annonce IvoireImmobilier. Voici les éléments dont je dispose : ",
    body: (
      <>
        <ol className="ml-5 list-decimal space-y-1.5">
          <li>Cessez immédiatement tout paiement ou échange d'informations sensibles.</li>
          <li>
            Contactez-nous sur WhatsApp au{" "}
            <a
              href="https://wa.me/2250779535795"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              +225 07 79 53 57 95
            </a>
            .
          </li>
          <li>Conservez toutes les preuves (captures d'écran, reçus, échanges).</li>
        </ol>
        <p className="mt-3">
          Nous retirons les annonces signalées sous 24 h et accompagnons les
          victimes dans leurs démarches auprès des autorités compétentes.
        </p>
      </>
    ),
  },
];

const buildWaHref = (msg: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

export default function VerificationProcess() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary py-16 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(162_47%_20%),_transparent_70%)] opacity-60" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs font-medium text-primary-foreground/90 backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              Sécurité & confiance
            </div>
            <h1 className="font-display text-3xl leading-tight text-primary-foreground md:text-4xl">
              Comment les annonces sont vérifiées
            </h1>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/75">
              Notre processus de contrôle, ce qu'il faut demander avant de signer, et
              comment réagir face à une arnaque.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[260px_1fr]">
          {/* Sommaire */}
          <aside className="md:sticky md:top-24 md:self-start">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sommaire
            </p>
            <nav className="flex flex-col gap-1 rounded-2xl bg-card p-2" style={{ boxShadow: "var(--shadow-sm)" }}>
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <s.icon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="line-clamp-1">{s.title}</span>
                </a>
              ))}
            </nav>
          </aside>

          {/* Contenu */}
          <div className="space-y-10">
            {sections.map((s) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-24 rounded-2xl bg-card p-6 md:p-8"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-light">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-xl text-foreground md:text-2xl">
                    {s.title}
                  </h2>
                </div>
                <div className="text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </div>
              </section>
            ))}

            {/* CTA final */}
            <div className="rounded-2xl bg-primary p-6 text-center md:p-8" style={{ boxShadow: "var(--shadow-lg)" }}>
              <FileText className="mx-auto h-8 w-8 text-accent" />
              <h2 className="mt-3 font-display text-xl text-primary-foreground md:text-2xl">
                Besoin d'un accompagnement personnalisé ?
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-primary-foreground/75">
                Nos experts vérifient les documents et vous accompagnent jusqu'à la signature.
              </p>
              <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href="https://wa.me/2250779535795?text=Bonjour%2C%20je%20souhaite%20%EAtre%20accompagn%C3%A9%20pour%20v%C3%A9rifier%20une%20annonce."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-all duration-150 hover:brightness-110 active:scale-[0.96]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Contacter un expert
                </a>
                <Link
                  to="/annonces"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.96]"
                >
                  Voir les annonces vérifiées
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
