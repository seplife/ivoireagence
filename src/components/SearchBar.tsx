import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CITIES, PROPERTY_TYPES } from "@/data/mockProperties";

interface SearchBarProps {
  variant?: "hero" | "compact";
}

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
          <option value="À Vendre">À Vendre</option>
          <option value="À Louer">À Louer</option>
        </select>

        <button
          onClick={handleSearch}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-accent-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.96]"
        >
          <Search className="h-4 w-4" />
          Rechercher
        </button>
      </div>
    </div>
  );
}
