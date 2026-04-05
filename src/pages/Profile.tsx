import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Loader2, LogOut, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Profile() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<"client" | "agent">("client");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/connexion");
  }, [loading, user, navigate]);

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
      </div>
      <Footer />
    </div>
  );
}
