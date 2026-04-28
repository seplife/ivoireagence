import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { supabase } from "@/integrations/supabase/client";
import { CITIES, COMMUNES, PROPERTY_TYPES } from "@/data/mockProperties";

type SortKey = "date" | "price-asc" | "price-desc";

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const [city,    setCity]    = useState(searchParams.get("city")    || "");
  const [commune, setCommune] = useState(searchParams.get("commune") || "");
  const [type,    setType]    = useState(searchParams.get("type")    || "");
  const [status,  setStatus]  = useState(searchParams.get("status")  || "");
  const [sortBy,  setSortBy]  = useState<SortKey>("date");

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("properties")
      .select(`
        id, title, description, property_type, status,
        price, surface, rooms, address, city, commune,
        owner_name, owner_phone, is_verified, views_count,
        created_at,
        property_images ( image_url )
      `);

    if (city)    query = query.eq("city", city);
    if (commune) query = query.eq("commune", commune);
    if (type)    query = query.eq("property_type", type as any);
    if (status)  query = query.eq("status", status as any);

    if (sortBy === "price-asc")  query = query.order("price", { ascending: true });
    else if (sortBy === "price-desc") query = query.order("price", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) console.error("Listings fetch error:", error);

    // Normaliser la structure des images
    const normalized = (data || []).map((p) => ({
      ...p,
      images: p.property_images?.map((img: any) => img.image_url) ?? [],
      verified: p.is_verified,
      views: p.views_count,
    }));

    setProperties(normalized);
    setLoading(false);
  }, [city, commune, type, status, sortBy]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const clearFilters = () => {
    setCity(""); setCommune(""); setType(""); setStatus("");
    setSearchParams({});
  };

  const hasFilters = city || commune || type || status;

  const selectClass =
    "h-11 w-full rounded-xl bg-secondary px-3 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-accent/20";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-foreground md:text-3xl">Annonces</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading ? "Chargement…" : `${properties.length} bien${properties.length > 1 ? "s" : ""} trouvé${properties.length > 1 ? "s" : ""}`}
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
          {/* Sidebar filtres */}
          <aside className={`shrink-0 ${showFilters ? "fixed inset-0 z-50 bg-background p-4 md:relative md:inset-auto md:z-auto md:bg-transparent md:p-0" : "hidden md:block"} md:w-56`}>
            <div className="flex items-center justify-between md:hidden">
              <h3 className="font-display text-lg">Filtres</h3>
              <button onClick={() => setShowFilters(false)}><X className="h-5 w-5" /></button>
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
                  <option value="a_vendre">À Vendre</option>
                  <option value="a_louer">À Louer</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Trier par</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className={selectClass}>
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

          {/* Grille */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
              </div>
            ) : properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-card py-20 text-center" style={{ boxShadow: "var(--shadow-sm)" }}>
                <p className="text-lg font-medium text-foreground">Aucun bien trouvé</p>
                <p className="mt-1 text-sm text-muted-foreground">Essayez de modifier vos critères de recherche.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((p) => (
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
