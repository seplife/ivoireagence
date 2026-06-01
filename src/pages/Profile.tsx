import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Loader2, LogOut, Camera, Trash2, Pencil, Home, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { formatPrice } from "@/data/mockProperties";

export default function Profile() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<"client" | "agent">("client");
  const [saving, setSaving] = useState(false);
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/connexion");
  }, [loading, user, navigate]);

  const loadProperties = async () => {
    if (!user) return;
    setLoadingProps(true);
    const { data } = await supabase
      .from("properties")
      .select("id, title, price, status, city, commune, property_images(image_url)")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    setMyProperties(data || []);
    setLoadingProps(false);
  };

  useEffect(() => {
    if (user) loadProperties();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer définitivement cette annonce ? Elle ne sera plus visible.")) return;
    setDeletingId(id);
    // Remove images then property
    await supabase.from("property_images").delete().eq("property_id", id);
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Annonce supprimée" });
      setMyProperties((prev) => prev.filter((p) => p.id !== id));
    }
    setDeletingId(null);
  };

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? "");
      setLastName(profile.last_name ?? "");
      setPhone(profile.phone ?? "");
      setUserType(profile.user_type);
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ first_name: firstName, last_name: lastName, phone, user_type: userType })
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: "Profil mis à jour" });
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-12">
        <div className="mx-auto max-w-lg rounded-2xl bg-card p-6" style={{ boxShadow: "var(--shadow-md)" }}>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-light">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-primary" />
              )}
            </div>
            <div>
              <h1 className="font-display text-xl text-foreground">Mon profil</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSave}>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Prénom</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-11 w-full rounded-xl bg-secondary pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-accent/20" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Nom</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-11 w-full rounded-xl bg-secondary pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-accent/20" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11 w-full rounded-xl bg-secondary pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-accent/20" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Type de compte</label>
              <select value={userType} onChange={(e) => setUserType(e.target.value as "client" | "agent")} className="h-11 w-full rounded-xl bg-secondary px-3 text-sm outline-none focus:ring-2 focus:ring-accent/20">
                <option value="client">Client</option>
                <option value="agent">Agent / Propriétaire</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground transition-all hover:brightness-110 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer
            </button>
          </form>

          <button
            onClick={handleLogout}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>

        {/* Mes annonces */}
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl bg-card p-6" style={{ boxShadow: "var(--shadow-md)" }}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl text-foreground">Mes annonces</h2>
              <p className="text-sm text-muted-foreground">Modifiez ou supprimez vos biens vendus ou loués.</p>
            </div>
            <Link
              to="/publier"
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground hover:brightness-110"
            >
              <Plus className="h-3.5 w-3.5" /> Publier
            </Link>
          </div>

          <div className="mt-5">
            {loadingProps ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : myProperties.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-10 text-center">
                <Home className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Vous n'avez encore publié aucune annonce.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {myProperties.map((p) => {
                  const img = p.property_images?.[0]?.image_url || "/placeholder.svg";
                  const isRent = p.status === "a_louer";
                  return (
                    <li key={p.id} className="flex items-center gap-3 py-3">
                      <Link to={`/annonce/${p.id}`} className="shrink-0">
                        <img src={img} alt={p.title} className="h-14 w-14 rounded-xl object-cover" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link to={`/annonce/${p.id}`} className="block truncate text-sm font-medium text-foreground hover:underline">
                          {p.title}
                        </Link>
                        <p className="truncate text-xs text-muted-foreground">
                          {[p.commune, p.city].filter(Boolean).join(", ")} · {isRent ? "À Louer" : "À Vendre"} · {formatPrice(p.price)} FCFA{isRent ? "/mois" : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Link
                          to={`/annonce/${p.id}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          aria-label="Voir l'annonce"
                          title="Voir"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                          aria-label="Supprimer l'annonce"
                          title="Supprimer (bien vendu ou loué)"
                        >
                          {deletingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
