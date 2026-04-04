import { Link } from "react-router-dom";
import { Home, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Link to="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/20">
                <Home className="h-4 w-4" />
              </div>
              <span className="font-display text-lg">
                Ivoire<span className="text-accent">Immo</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-primary-foreground/70">
              La plateforme de référence pour l'immobilier en Côte d'Ivoire. Trouvez, publiez et gérez vos biens en
              toute simplicité.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm uppercase tracking-wider text-primary-foreground/50">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-primary-foreground/70 transition-colors hover:text-primary-foreground">
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  to="/annonces"
                  className="text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                >
                  Annonces
                </Link>
              </li>
              <li>
                <Link
                  to="/publier"
                  className="text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                >
                  Publier
                </Link>
              </li>
              <li>
                <Link
                  to="/connexion"
                  className="text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                >
                  Connexion
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm uppercase tracking-wider text-primary-foreground/50">Contact</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                Abidjan, Cocody Riviera
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                +225 07 79 53 57 95
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                contact@ivoireimmo.ci
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/40">
          © 2026 IvoireImmobilier. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
