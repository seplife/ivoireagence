import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { mockProperties, CITIES, COMMUNES, PROPERTY_TYPES } from "@/data/mockProperties";

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const [city, setCity] = useState(searchParams.get("city") || "");
  const [commune, setCommune] = useState(searchParams.get("commune") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [sortBy, setSortBy] = useState("date");

  const filtered = useMemo(() => {
    let results = [...mockProperties];
    if (city) results = results.filter((p) => p.city === city);
    if (commune) results = results.filter((p) => p.commune === commune);
    if (type) results = results.filter((p) => p.property_type === type);
    if (status) results = results.filter((p) => p.status === status);

    if (sortBy === "price-asc") results.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") results.sort((a, b) => b.price - a.price);
    else results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return results;
  }, [city, commune, type, status, sortBy]);

  const clearFilters = () => {
    setCity("");
    setCommune("");
    setType("");
    setStatus("");
    setSearchParams({});
  };

  const hasFilters = city || commune || type || status;

  const selectClass =
    "h-11 w-full rounded-xl bg-secondary px-3 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-accent/20";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-foreground md:text-3xl">Annonces</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {filtered.length} bien{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex h-10 items-center gap-2 rounded-xl bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary md:hidden"
            style={{ boxShadow: "var(--shadow-sm)" }}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters - desktop */}
          <aside className={`shrink-0 ${showFilters ? "fixed inset-0 z-50 bg-background p-4 md:relative md:inset-auto md:z-auto md:bg-transparent md:p-0" : "hidden md:block"} md:w-56`}>
            <div className="flex items-center justify-between md:hidden">
              <h3 className="font-display text-lg">Filtres</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 md:mt-0">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ville</label>
                <select value={city} onChange={(e) => setCity(e.target.value)} className={selectClass}>
                  <option value="">Toutes</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Commune</label>
                <select value={commune} onChange={(e) => setCommune(e.target.value)} className={selectClass}>
                  <option value="">Toutes</option>
                  {COMMUNES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Type de bien</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
                  <option value="">Tous</option>
                  {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Statut</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
                  <option value="">Tous</option>
                  <option value="À Vendre">À Vendre</option>
                  <option value="À Louer">À Louer</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Trier par</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={selectClass}>
                  <option value="date">Plus récents</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                </select>
              </div>

              {hasFilters && (
                <button onClick={clearFilters} className="w-full rounded-xl bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20">
                  Effacer les filtres
                </button>
              )}

              <button onClick={() => setShowFilters(false)} className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground md:hidden">
                Appliquer
              </button>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-card py-20 text-center" style={{ boxShadow: "var(--shadow-sm)" }}>
                <p className="text-lg font-medium text-foreground">Aucun bien trouvé</p>
                <p className="mt-1 text-sm text-muted-foreground">Essayez de modifier vos critères de recherche.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
