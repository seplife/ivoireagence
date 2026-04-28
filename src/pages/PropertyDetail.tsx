import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Maximize, BedDouble, CheckCircle, Phone, MessageCircle, Calendar, Eye, Building2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatPrice } from "@/data/mockProperties";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [contactMessage, setContactMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from("properties")
      .select(`
        id, title, description, property_type, status,
        price, surface, rooms, address, city, commune,
        owner_id, owner_name, owner_phone, is_verified, views_count,
        created_at,
        property_images ( image_url )
      `)
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const normalized = {
            ...data,
            status: data.status === "a_louer" ? "À Louer" : "À Vendre",
            images: (data as any).property_images?.map((img: any) => img.image_url) ?? [],
            verified: data.is_verified,
            views: data.views_count,
          };
          setProperty(normalized);
          // Increment views count (best-effort)
          supabase.from("properties").update({ views_count: (data.views_count || 0) + 1 }).eq("id", id).then(() => {});
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

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
  const phone = property.owner_phone || "";
  const images: string[] = property.images.length > 0 ? property.images : ["/placeholder.svg"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-6">
        <Link to="/annonces" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Retour aux annonces
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-[16/10] overflow-hidden rounded-2xl"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <img src={images[activeImage]} alt={property.title} className="h-full w-full object-cover" />
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

            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
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

            <div className="mt-6 rounded-2xl bg-card p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl text-foreground">{property.title}</h1>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {[property.address, property.commune, property.city].filter(Boolean).join(", ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-data text-2xl font-bold text-foreground">
                    {formatPrice(property.price)} <span className="text-sm font-normal text-muted-foreground">FCFA{isRent ? "/mois" : ""}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: Building2, label: "Type", value: property.property_type },
                  { icon: Maximize, label: "Superficie", value: property.surface ? `${property.surface}m²` : "—" },
                  { icon: BedDouble, label: "Pièces", value: property.rooms > 0 ? `${property.rooms}` : "—" },
                  { icon: Eye, label: "Vues", value: `${property.views || 0}` },
                ].map((spec) => (
                  <div key={spec.label} className="rounded-xl bg-secondary p-3 text-center">
                    <spec.icon className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="mt-1 font-data text-base font-semibold text-foreground">{spec.value}</p>
                    <p className="text-xs text-muted-foreground">{spec.label}</p>
                  </div>
                ))}
              </div>

              {property.description && (
                <div className="mt-6">
                  <h2 className="font-display text-lg text-foreground">Description</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{property.description}</p>
                </div>
              )}

              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Publié le {new Date(property.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl bg-card p-6" style={{ boxShadow: "var(--shadow-md)" }}>
              <h3 className="font-display text-lg text-foreground">Contacter le propriétaire</h3>

              <div className="mt-4 rounded-xl bg-secondary p-4">
                <p className="font-semibold text-foreground">{property.owner_name || "Propriétaire"}</p>
                {phone && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {phone}
                  </p>
                )}
              </div>

              {phone && (
                <div className="mt-4 space-y-3">
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.96]"
                  >
                    <Phone className="h-4 w-4" /> Appeler
                  </a>
                  <a
                    href={`https://wa.me/${phone.replace(/[\s+]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.96]"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                </div>
              )}

              <div className="mt-6 border-t border-border pt-6">
                <h4 className="text-sm font-medium text-foreground">Envoyer un message</h4>
                {user ? (
                  user.id === property.owner_id ? (
                    <p className="mt-3 text-sm text-muted-foreground">Ceci est votre annonce.</p>
                  ) : (
                    <form
                      className="mt-3 space-y-3"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!contactMessage.trim() || sendingMsg) return;
                        setSendingMsg(true);
                        const { error } = await supabase.from("messages").insert({
                          sender_id: user.id,
                          receiver_id: property.owner_id,
                          message: contactMessage.trim(),
                          property_id: property.id,
                        });
                        if (error) {
                          toast.error("Erreur lors de l'envoi du message");
                        } else {
                          toast.success("Message envoyé !");
                          setContactMessage("");
                          navigate(`/messages?contact=${property.owner_id}`);
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
                  )
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
