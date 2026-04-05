import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Mail, Lock, User, Phone, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
        phone,
      });
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Inscription réussie", description: "Vérifiez votre email pour confirmer votre compte." });
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
      } else {
        navigate("/");
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container flex items-center justify-center py-16">
        <div className="w-full max-w-sm rounded-2xl bg-card p-6" style={{ boxShadow: "var(--shadow-md)" }}>
          <Link to="/" className="mb-6 flex items-center justify-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Home className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl text-foreground">
              Ivoire<span className="text-accent">Immo</span>
            </span>
          </Link>

          <h1 className="text-center font-display text-xl text-foreground">
            {isSignUp ? "Créer un compte" : "Connexion"}
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            {isSignUp ? "Rejoignez la communauté" : "Accédez à votre espace"}
          </p>

          <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
            {isSignUp && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-11 w-full rounded-xl bg-secondary pl-10 pr-3 text-sm outline-none transition-all focus:ring-2 focus:ring-accent/20" />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-11 w-full rounded-xl bg-secondary pl-10 pr-3 text-sm outline-none transition-all focus:ring-2 focus:ring-accent/20" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input type="tel" placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11 w-full rounded-xl bg-secondary pl-10 pr-3 text-sm outline-none transition-all focus:ring-2 focus:ring-accent/20" />
                </div>
              </>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 w-full rounded-xl bg-secondary pl-10 pr-3 text-sm outline-none transition-all focus:ring-2 focus:ring-accent/20" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="password" placeholder="Mot de passe" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 w-full rounded-xl bg-secondary pl-10 pr-3 text-sm outline-none transition-all focus:ring-2 focus:ring-accent/20" />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.96] disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSignUp ? "Créer mon compte" : "Se connecter"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isSignUp ? "Déjà inscrit ?" : "Pas encore de compte ?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium text-accent hover:underline"
            >
              {isSignUp ? "Se connecter" : "S'inscrire"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
