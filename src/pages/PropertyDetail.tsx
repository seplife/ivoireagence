import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Maximize, BedDouble, CheckCircle, Phone, MessageCircle, Calendar, Eye, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockProperties, formatPrice } from "@/data/mockProperties";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function PropertyDetail() {
  const { id } = useParams();
  const property = mockProperties.find((p) => p.id === id);
  const [activeImage, setActiveImage] = useState(0);
  const [contactMessage, setContactMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex flex-col items-center justify-center py-32 text-center">
          <p className="text-lg font-medium text-foreground">Annonce introuvable</p>
          <Link to="/annonces" className="mt-4 text-sm text-accent hover:underline">
            Retour aux annonces
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isRent = property.status === "À Louer";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-6">
        <Link to="/annonces" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour aux annonces
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: images + details */}
          <div className="lg:col-span-2">
            {/* Main image */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-[16/10] overflow-hidden rounded-2xl"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <img
                src={property.images[activeImage]}
                alt={property.title}
                className="h-full w-full object-cover"
              />
              <div
                className={`absolute left-4 top-4 rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur ${
                  isRent ? "bg-primary/90 text-primary-foreground" : "bg-accent/90 text-accent-foreground"
                }`}
              >
                {property.status}
              </div>
              {property.verified && (
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-xl bg-card/90 px-2.5 py-1.5 text-xs font-medium text-primary backdrop-blur">
                  <CheckCircle className="h-3.5 w-3.5" /> Vérifié
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {property.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {property.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl transition-all ${
                      i === activeImage ? "ring-2 ring-accent" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Details */}
            <div className="mt-6 rounded-2xl bg-card p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl text-foreground">{property.title}</h1>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {property.address}, {property.commune}, {property.city}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-data text-2xl font-bold text-foreground">
                    {formatPrice(property.price)} <span className="text-sm font-normal text-muted-foreground">FCFA{isRent ? "/mois" : ""}</span>
                  </p>
                </div>
              </div>

              {/* Specs */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: Building2, label: "Type", value: property.property_type },
                  { icon: Maximize, label: "Superficie", value: `${property.surface}m²` },
                  { icon: BedDouble, label: "Pièces", value: property.rooms > 0 ? `${property.rooms}` : "—" },
                  { icon: Eye, label: "Vues", value: `${property.views}` },
                ].map((spec) => (
                  <div key={spec.label} className="rounded-xl bg-secondary p-3 text-center">
                    <spec.icon className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="mt-1 font-data text-base font-semibold text-foreground">{spec.value}</p>
                    <p className="text-xs text-muted-foreground">{spec.label}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="font-display text-lg text-foreground">Description</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{property.description}</p>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Publié le {new Date(property.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
          </div>

          {/* Right: Contact sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl bg-card p-6" style={{ boxShadow: "var(--shadow-md)" }}>
              <h3 className="font-display text-lg text-foreground">Contacter le propriétaire</h3>

              <div className="mt-4 rounded-xl bg-secondary p-4">
                <p className="font-semibold text-foreground">{property.owner_name}</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" /> {property.owner_phone}
                </p>
              </div>

              <div className="mt-4 space-y-3">
                <a
                  href={`tel:${property.owner_phone.replace(/\s/g, "")}`}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.96]"
                >
                  <Phone className="h-4 w-4" /> Appeler
                </a>
                <a
                  href={`https://wa.me/${property.owner_phone.replace(/[\s+]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.96]"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </div>

              {/* Contact form – sends via database */}
              <div className="mt-6 border-t border-border pt-6">
                <h4 className="text-sm font-medium text-foreground">Envoyer un message</h4>
                {user ? (
                  <form
                    className="mt-3 space-y-3"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!contactMessage.trim() || sendingMsg) return;
                      // For mock data we don't have a real owner_id, so we skip
                      // In production, property would have owner_id from DB
                      setSendingMsg(true);
                      // Try to find owner by phone in profiles
                      const { data: ownerProfile } = await supabase
                        .from("profiles")
                        .select("user_id")
                        .eq("phone", property.owner_phone)
                        .maybeSingle();

                      if (!ownerProfile) {
                        toast.error("Impossible de trouver le propriétaire. Utilisez le téléphone ou WhatsApp.");
                        setSendingMsg(false);
                        return;
                      }

                      const { error } = await supabase.from("messages").insert({
                        sender_id: user.id,
                        receiver_id: ownerProfile.user_id,
                        message: contactMessage.trim(),
                        property_id: null, // mock data uses string IDs
                      });

                      if (error) {
                        toast.error("Erreur lors de l'envoi du message");
                      } else {
                        toast.success("Message envoyé !");
                        setContactMessage("");
                        navigate(`/messages?contact=${ownerProfile.user_id}`);
                      }
                      setSendingMsg(false);
                    }}
                  >
                    <textarea
                      placeholder="Votre message..."
                      rows={3}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full rounded-xl bg-secondary px-3 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-accent/20"
                    />
                    <button
                      type="submit"
                      disabled={sendingMsg || !contactMessage.trim()}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.96] disabled:opacity-50"
                    >
                      {sendingMsg ? "Envoi..." : "Envoyer"}
                    </button>
                  </form>
                ) : (
                  <div className="mt-3 text-center">
                    <p className="text-sm text-muted-foreground">Connectez-vous pour envoyer un message</p>
                    <Link
                      to="/connexion"
                      className="mt-2 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
                    >
                      Se connecter
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
