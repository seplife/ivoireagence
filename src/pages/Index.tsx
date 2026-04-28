import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, Shield, Zap, Loader2, MessageCircle, ShieldCheck, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import { supabase } from "@/integrations/supabase/client";

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
  const [featured, setFeatured] = useState<any[]>([]);
  const [stats, setStats] = useState({ listings: "…", users: "…", communes: "…" });

  useEffect(() => {
    // Annonces récentes
    supabase
      .from("properties")
      .select(`
        id, title, property_type, status,
        price, surface, rooms, address, city, commune,
        owner_name, owner_phone, is_verified, views_count,
        created_at,
        property_images ( image_url )
      `)
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data }) => {
        const normalized = (data || []).map((p: any) => ({
          ...p,
          status: p.status === "a_louer" ? "À Louer" : "À Vendre",
          images: p.property_images?.map((img: any) => img.image_url) ?? [],
          verified: p.is_verified,
          views: p.views_count,
        }));
        setFeatured(normalized);
      });

    // Compteurs hero
    Promise.all([
      supabase.from("properties").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("properties").select("commune").not("commune", "is", null),
    ]).then(([{ count: listingCount }, { count: userCount }, { data: communeData }]) => {
      const uniqueCommunes = new Set((communeData || []).map((p: any) => p.commune)).size;
      setStats({
        listings: listingCount ? `${listingCount.toLocaleString("fr-FR")}+` : "—",
        users:    userCount    ? `${userCount.toLocaleString("fr-FR")}+`    : "—",
        communes: uniqueCommunes ? `${uniqueCommunes}+` : "—",
      });
    });
  }, []);

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
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs font-medium text-primary-foreground/90 backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              Biens vérifiés • Zéro arnaque
            </div>

            <h1 className="font-display text-3xl leading-tight text-primary-foreground md:text-5xl">
              Trouvez votre prochain <span className="text-accent">chez-vous</span>{" "}
              en Côte d'Ivoire
            </h1>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/75 md:text-lg">
              Annonces vérifiées, accompagnement complet, mise en relation directe avec des propriétaires de confiance.
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

          {/* Doubles CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mx-auto mt-6 flex max-w-xl flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              to="/annonces"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.96] sm:w-auto"
            >
              Voir les annonces <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://wa.me/2250779535795?text=Bonjour%2C%20je%20viens%20de%20IvoireImmobilier%20et%20j%27aimerais%20parler%20%C3%A0%20un%20expert."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-foreground/10 px-5 py-3 text-sm font-semibold text-primary-foreground backdrop-blur transition-all duration-150 hover:bg-primary-foreground/20 sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              Parler à un expert
            </a>
          </motion.div>

          {/* Réassurance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-primary-foreground/70"
          >
            <span className="inline-flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 text-accent" /> Annonces vérifiées
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-accent" /> Accompagnement complet
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-accent" /> Réponse WhatsApp rapide
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mx-auto mt-10 flex max-w-lg justify-center gap-8 text-center md:gap-12"
          >
            {[
              { value: stats.listings, label: "Annonces" },
              { value: stats.users,   label: "Utilisateurs" },
              { value: stats.communes, label: "Communes" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-data text-2xl font-bold text-primary-foreground">{stat.value}</p>
                <p className="text-xs text-primary-foreground/50">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Annonces récentes */}
      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl text-foreground md:text-3xl">Annonces récentes</h2>
            <p className="mt-1 text-sm text-muted-foreground">Découvrez les derniers biens disponibles</p>
          </div>
          <Link to="/annonces" className="hidden items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-saffron-light md:flex">
            Voir tout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        ) : (
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
        )}

        <Link to="/annonces" className="mt-6 flex items-center justify-center gap-1 rounded-xl px-4 py-3 text-sm font-medium text-accent transition-colors hover:bg-saffron-light md:hidden">
          Voir toutes les annonces <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Fonctionnalités */}
      <section className="bg-secondary py-16">
        <div className="container">
          <h2 className="font-display text-center text-2xl text-foreground md:text-3xl">Pourquoi IvoireImmobilier ?</h2>
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
            Publiez votre annonce et touchez des milliers de clients potentiels.
          </p>
          <Link to="/publier" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.96]">
            Publier une annonce <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
