import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Upload, X, ImagePlus, LogIn, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PROPERTY_TYPES, CITIES, COMMUNES } from "@/data/mockProperties";

const STATUS_OPTIONS = [
  { value: "a_louer", label: "À Louer" },
  { value: "a_vendre", label: "À Vendre" },
];

const TYPE_MAP: Record<string, string> = {
  Maison: "maison",
  Appartement: "appartement",
  Terrain: "terrain",
  Magasin: "magasin",
  Bureau: "bureau",
  Villa: "villa",
  Immeuble: "immeuble",
  Entrepôt: "entrepot",
  "Local commercial": "local_commercial",
};

export default function PublishListing() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    property_type: "maison",
    status: "a_louer" as "a_louer" | "a_vendre",
    price: "",
    surface: "",
    rooms: "",
    address: "",
    city: "Abidjan",
    commune: "",
    owner_name: "",
    owner_phone: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "waiting_invoice">("form");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 8) {
      toast.error("Maximum 8 photos autorisées");
      return;
    }
    const validFiles = files.filter((f) => {
      if (!f.type.startsWith("image/")) { toast.error(`${f.name} n'est pas une image`); return false; }
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} dépasse 5 Mo`); return false; }
      return true;
    });
    setImages((prev) => [...prev, ...validFiles]);
    validFiles.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!form.title.trim()) { toast.error("Le titre est requis"); return; }
    if (!form.price || Number(form.price) <= 0) { toast.error("Le prix est requis"); return; }
    if (images.length === 0) { toast.error("Ajoutez au moins une photo"); return; }

    setSubmitting(true);

    try {
      // 1. Créer la propriété
      const { data: property, error: propError } = await supabase
        .from("properties")
        .insert({
          title: form.title.trim(),
          description: form.description.trim() || null,
          property_type: form.property_type as any,
          status: form.status as any,
          price: Number(form.price),
          surface: form.surface ? Number(form.surface) : null,
          rooms: form.rooms ? Number(form.rooms) : null,
          address: form.address.trim() || null,
          city: form.city,
          commune: form.commune || null,
          owner_id: user.id,
          owner_name: form.owner_name.trim() || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || null,
          owner_phone: form.owner_phone.trim() || profile?.phone || null,
        })
        .select("id")
        .single();

      if (propError || !property) {
        throw new Error(propError?.message || "Erreur lors de la création de l'annonce");
      }

      // 2. Upload images
      const imageUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const ext = file.name.split(".").pop() || "jpg";
        const filePath = `${user.id}/${property.id}/${Date.now()}_${i}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(filePath, file, { contentType: file.type });
        if (uploadError) { console.error("Upload error:", uploadError); continue; }
        const { data: urlData } = supabase.storage.from("property-images").getPublicUrl(filePath);
        imageUrls.push(urlData.publicUrl);
      }

      if (imageUrls.length > 0) {
        await supabase.from("property_images").insert(
          imageUrls.map((url) => ({ property_id: property.id, image_url: url }))
        );
      }

      toast.success("Annonce publiée !");
      navigate(`/annonce/${property.id}`);
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue");
      setSubmitting(false);
      setStep("form");
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex flex-col items-center justify-center py-24 text-center">
          <div className="mx-auto max-w-md rounded-2xl bg-card p-8" style={{ boxShadow: "var(--shadow-md)" }}>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-light">
              <LogIn className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mt-4 font-display text-2xl text-foreground">Publier une annonce</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Connectez-vous pour publier votre bien immobilier et toucher des milliers de clients potentiels.
            </p>
            <Link to="/connexion" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.96]">
              Se connecter
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (step === "waiting_invoice") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex flex-col items-center justify-center py-32 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="font-display text-lg text-foreground">Préparation du paiement…</p>
          <p className="mt-2 text-sm text-muted-foreground">Votre annonce est enregistrée. Génération de la facture en cours.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const inputClass = "h-11 w-full rounded-xl bg-secondary px-3 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-accent/20 placeholder:text-muted-foreground";
  const selectClass = "h-11 w-full rounded-xl bg-secondary px-3 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-accent/20 appearance-none";
  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-start justify-between gap-4">
            <h1 className="font-display text-2xl text-foreground">Publier une annonce</h1>
            {true && (
              <Link to="/abonnement" className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-light px-3 py-2 text-xs font-medium text-primary hover:brightness-95 transition-all">
                <CreditCard className="h-3.5 w-3.5" />
                Passer à Pro — annonces illimitées
              </Link>
            )}
          </div>

          {/* Bandeau plan actuel */}
          {true && (
            <div className="mb-6 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
              Plan gratuit · Publication à partir de <span className="font-medium text-foreground">3 000 FCFA</span> par annonce.
              {" "}<Link to="/abonnement" className="text-accent hover:underline">Voir les plans</Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations générales */}
            <div className="rounded-2xl bg-card p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
              <h2 className="mb-4 font-display text-lg text-foreground">Informations générales</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Titre de l'annonce *</label>
                  <input name="title" value={form.title} onChange={handleChange} placeholder="Ex: Villa moderne avec piscine" className={inputClass} maxLength={120} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Type de bien *</label>
                    <select name="property_type" value={form.property_type} onChange={handleChange} className={selectClass}>
                      {PROPERTY_TYPES.map((t) => <option key={t} value={TYPE_MAP[t]}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Statut *</label>
                    <select name="status" value={form.status} onChange={handleChange} className={selectClass}>
                      {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className={labelClass}>Prix (FCFA) *</label>
                    <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="150000000" className={inputClass} min="0" />
                  </div>
                  <div>
                    <label className={labelClass}>Superficie (m²)</label>
                    <input name="surface" type="number" value={form.surface} onChange={handleChange} placeholder="350" className={inputClass} min="0" />
                  </div>
                  <div>
                    <label className={labelClass}>Nombre de pièces</label>
                    <input name="rooms" type="number" value={form.rooms} onChange={handleChange} placeholder="5" className={inputClass} min="0" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} placeholder="Décrivez votre bien en détail…" rows={4} className="w-full rounded-xl bg-secondary px-3 py-2.5 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-accent/20 placeholder:text-muted-foreground" maxLength={2000} />
                </div>
              </div>
            </div>

            {/* Localisation */}
            <div className="rounded-2xl bg-card p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
              <h2 className="mb-4 font-display text-lg text-foreground">Localisation</h2>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Ville *</label>
                    <select name="city" value={form.city} onChange={handleChange} className={selectClass}>
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Commune</label>
                    <select name="commune" value={form.commune} onChange={handleChange} className={selectClass}>
                      <option value="">— Sélectionner —</option>
                      {COMMUNES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Adresse</label>
                  <input name="address" value={form.address} onChange={handleChange} placeholder="Ex: Angré 8ème Tranche" className={inputClass} maxLength={200} />
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="rounded-2xl bg-card p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
              <h2 className="mb-4 font-display text-lg text-foreground">Photos *</h2>
              <p className="mb-3 text-xs text-muted-foreground">Ajoutez jusqu'à 8 photos (max 5 Mo chacune). La première photo sera la photo principale.</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {previews.map((src, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-secondary">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      <X className="h-3.5 w-3.5" />
                    </button>
                    {i === 0 && <span className="absolute bottom-1.5 left-1.5 rounded-md bg-primary/80 px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">Principale</span>}
                  </div>
                ))}
                {images.length < 8 && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border transition-colors hover:border-accent hover:bg-secondary">
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Ajouter</span>
                    <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="rounded-2xl bg-card p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
              <h2 className="mb-4 font-display text-lg text-foreground">Contact</h2>
              <p className="mb-3 text-xs text-muted-foreground">Ces informations seront affichées sur votre annonce.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Nom du contact</label>
                  <input name="owner_name" value={form.owner_name} onChange={handleChange} placeholder={[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Votre nom"} className={inputClass} maxLength={100} />
                </div>
                <div>
                  <label className={labelClass}>Téléphone</label>
                  <input name="owner_phone" value={form.owner_phone} onChange={handleChange} placeholder={profile?.phone || "+225 XX XX XX XX XX"} className={inputClass} maxLength={20} />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={submitting} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-bold text-accent-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.96] disabled:opacity-50">
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Publication en cours…</>
              ) : false ? (
                <><Upload className="h-4 w-4" /> Publier l'annonce</>
              ) : (
                <><CreditCard className="h-4 w-4" /> Continuer vers le paiement</>
              )}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
