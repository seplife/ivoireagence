import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, PlusCircle, User, Menu, X, MessageCircle, Receipt, Star, LogOut } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { to: "/",        label: "Accueil",  icon: Home },
  { to: "/annonces", label: "Annonces", icon: Search },
  { to: "/publier",  label: "Publier",  icon: PlusCircle },
  { to: "/messages", label: "Messages", icon: MessageCircle },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, loading } = useAuth();
  const isPro = false;

  const displayName = profile?.first_name || user?.email?.split("@")[0] || "";

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md" style={{ boxShadow: "var(--shadow-sm)" }}>
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl text-foreground">
            Ivoire<span className="text-accent">Immobilier</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop right */}
        <div className="hidden items-center gap-2 md:flex">
          {!loading && user ? (
            <>
              {/* Bouton Pro si pas encore abonné */}
              {!isPro && (
                <Link
                  to="/abonnement"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-light px-3 py-2 text-xs font-semibold text-primary transition-all hover:brightness-95"
                >
                  <Star className="h-3.5 w-3.5" />
                  Passer Pro
                </Link>
              )}

              {/* Menu utilisateur avec dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-light">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span>{displayName}</span>
                  {profile?.user_type === "agent" && (
                    <span className="rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                      Agent
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                <div className="invisible absolute right-0 top-full mt-1 w-48 rounded-2xl bg-card py-1 opacity-0 shadow-lg transition-all duration-100 group-hover:visible group-hover:opacity-100" style={{ boxShadow: "var(--shadow-md)" }}>
                  <Link to="/profil" className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Mon profil
                  </Link>
                  <Link to="/mes-factures" className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    Mes factures
                  </Link>
                  {!isPro && (
                    <Link to="/abonnement" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-accent hover:bg-secondary">
                      <Star className="h-4 w-4" />
                      Passer à Pro
                    </Link>
                  )}
                  <div className="mx-3 my-1 border-t border-border" />
                  <Link to="/deconnexion" className="flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-secondary">
                    Déconnexion
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <Link
              to="/connexion"
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <User className="h-4 w-4" />
              Connexion
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-foreground md:hidden"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <nav className="container flex flex-col gap-1 py-3">
              {navLinks.map((link) => {
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}

              {!loading && user ? (
                <>
                  <Link to="/profil" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary">
                    <User className="h-5 w-5" />
                    Mon profil
                  </Link>
                  <Link to="/mes-factures" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary">
                    <Receipt className="h-5 w-5" />
                    Mes factures
                  </Link>
                  {!isPro && (
                    <Link to="/abonnement" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl bg-emerald-light px-4 py-3 text-sm font-semibold text-primary">
                      <Star className="h-5 w-5" />
                      Passer à Pro
                    </Link>
                  )}
                </>
              ) : (
                <Link to="/connexion" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-secondary">
                  <User className="h-5 w-5" />
                  Connexion
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
