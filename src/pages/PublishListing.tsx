import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublishListing() {
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
          <Link
            to="/connexion"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.96]"
          >
            Se connecter
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
