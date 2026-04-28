import { Search, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CITIES, PROPERTY_TYPES } from "@/data/mockProperties";

interface SearchBarProps {
  variant?: "hero" | "compact";
}

const WHATSAPP_NUMBER = "2250779535795";

export default function SearchBar({ variant = "hero" }: SearchBarProps) {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    navigate(`/annonces?${params.toString()}`);
  };

  // Construit un message WhatsApp pré-rempli avec les filtres choisis
  const buildWhatsappHref = () => {
    const statusLabel =
      status === "a_louer" ? "à louer" : status === "a_vendre" ? "à vendre" : "";
    const parts: string[] = [];
    parts.push("Bonjour, je cherche un bien sur IvoireImmobilier");
    if (type && statusLabel) parts.push(`: un(e) ${type} ${statusLabel}`);
    else if (type) parts.push(`: un(e) ${type}`);
    else if (statusLabel) parts.push(` ${statusLabel}`);
    if (city) parts.push(` à ${city}`);
    parts.push(". Pouvez-vous m'aider ?");
    const message = parts.join("");
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  const isHero = variant === "hero";

  return (
    <div
      className={`rounded-2xl bg-card p-2 ${isHero ? "md:p-3" : "p-2"}`}
      style={{ boxShadow: "var(--shadow-md)" }}
    >
      <div className={`flex flex-col gap-2 ${isHero ? "md:flex-row md:items-center" : "sm:flex-row sm:items-center"}`}>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-12 flex-1 rounded-xl bg-secondary px-4 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-accent/20"
        >
          <option value="">Toutes les villes</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="h-12 flex-1 rounded-xl bg-secondary px-4 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-accent/20"
        >
          <option value="">Tous les types</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-12 flex-1 rounded-xl bg-secondary px-4 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-accent/20"
        >
          <option value="">Achat & Location</option>
          <option value="a_vendre">À Vendre</option>
          <option value="a_louer">À Louer</option>
        </select>

        <button
          onClick={handleSearch}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-accent-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.96]"
        >
          <Search className="h-4 w-4" />
          Rechercher
        </button>
      </div>

      {/* CTA WhatsApp pré-rempli avec les filtres */}
      <a
        href={buildWhatsappHref()}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366]/10 px-4 text-sm font-medium text-[#128C4F] transition-colors hover:bg-[#25D366]/20"
      >
        <MessageCircle className="h-4 w-4" />
        Envoyer ma recherche par WhatsApp
      </a>
    </div>
  );
}
