import { Link } from "react-router-dom";
import { ArrowRight, Building2, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import { mockProperties } from "@/data/mockProperties";

const features = [
  {
    icon: Building2,
    title: "Annonces vérifiées",
    desc: "Chaque annonce est validée par notre équipe pour garantir la fiabilité.",
  },
  {
    icon: Zap,
    title: "Recherche instantanée",
    desc: "Trouvez le bien idéal en quelques secondes grâce à nos filtres avancés.",
  },
  {
    icon: Shield,
    title: "Transactions sécurisées",
    desc: "Mise en relation directe et sécurisée avec les propriétaires et agences.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
  }),
};

export default function Index() {
  const featured = mockProperties.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(162_47%_20%),_transparent_70%)] opacity-60" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="mx-auto max-w-2xl text-center"
          >
            <h1 className="font-display text-3xl leading-tight text-primary-foreground md:text-5xl">
              Trouvez votre prochain <span className="text-accent">chez-vous</span> en Côte d'Ivoire
            </h1>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/70 md:text-lg">
              Explorez des milliers d'annonces immobilières vérifiées à Abidjan et dans toute la Côte d'Ivoire.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="mx-auto mt-8 max-w-3xl"
          >
            <SearchBar variant="hero" />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mx-auto mt-10 flex max-w-lg justify-center gap-8 text-center md:gap-12"
          >
            {[
              { value: "2 500+", label: "Annonces" },
              { value: "15 000+", label: "Utilisateurs" },
              { value: "45+", label: "Communes" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-data text-2xl font-bold text-primary-foreground">{stat.value}</p>
                <p className="text-xs text-primary-foreground/50">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured properties */}
      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl text-foreground md:text-3xl">Annonces récentes</h2>
            <p className="mt-1 text-sm text-muted-foreground">Découvrez les derniers biens disponibles</p>
          </div>
          <Link
            to="/annonces"
            className="hidden items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-saffron-light md:flex"
          >
            Voir tout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((property, i) => (
            <motion.div
              key={property.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
            >
              <PropertyCard property={property} />
            </motion.div>
          ))}
        </div>

        <Link
          to="/annonces"
          className="mt-6 flex items-center justify-center gap-1 rounded-xl px-4 py-3 text-sm font-medium text-accent transition-colors hover:bg-saffron-light md:hidden"
        >
          Voir toutes les annonces <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Features */}
      <section className="bg-secondary py-16">
        <div className="container">
          <h2 className="font-display text-center text-2xl text-foreground md:text-3xl">Pourquoi IvoireAgence ?</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="rounded-2xl bg-card p-6"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-light">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-lg text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16 text-center">
        <div className="mx-auto max-w-xl rounded-2xl bg-primary p-8 md:p-12" style={{ boxShadow: "var(--shadow-lg)" }}>
          <h2 className="font-display text-2xl text-primary-foreground md:text-3xl">Vous avez un bien à proposer ?</h2>
          <p className="mt-3 text-sm leading-relaxed text-primary-foreground/70">
            Publiez votre annonce gratuitement et touchez des milliers de clients potentiels.
          </p>
          <Link
            to="/publier"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.96]"
          >
            Publier une annonce <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
