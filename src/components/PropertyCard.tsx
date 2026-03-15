import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Maximize, BedDouble, CheckCircle } from "lucide-react";
import type { Property } from "@/data/mockProperties";
import { formatPrice } from "@/data/mockProperties";

export default function PropertyCard({ property }: { property: Property }) {
  const isRent = property.status === "À Louer";

  return (
    <Link to={`/annonce/${property.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        className="group relative rounded-2xl bg-card p-2 transition-shadow duration-150"
        style={{ boxShadow: "var(--shadow-sm)" }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-lg)")}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-sm)")}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
          <img
            src={property.images[0]}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Status badge */}
          <div
            className={`absolute left-3 top-3 rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur ${
              isRent
                ? "bg-primary/90 text-primary-foreground"
                : "bg-accent/90 text-accent-foreground"
            }`}
          >
            {property.status}
          </div>

          {/* Verified badge */}
          {property.verified && (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-card/90 px-2 py-1 text-xs font-medium text-primary backdrop-blur">
              <CheckCircle className="h-3.5 w-3.5" />
              Vérifié
            </div>
          )}

          {/* Price overlay */}
          <div className="absolute bottom-3 right-3 rounded-lg bg-card/90 px-3 py-1.5 backdrop-blur">
            <span className="font-data text-base font-bold text-foreground">
              {formatPrice(property.price)}
            </span>
            <span className="ml-1 text-xs text-muted-foreground">
              FCFA{isRent ? "/mois" : ""}
            </span>
          </div>
        </div>

        <div className="p-3">
          <h3 className="text-base font-semibold leading-tight text-foreground line-clamp-1">
            {property.title}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {property.commune}, {property.city}
          </p>

          <div className="mt-3 flex gap-4 border-t border-secondary pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" />
              {property.surface}m²
            </span>
            {property.rooms > 0 && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" />
                {property.rooms} pces
              </span>
            )}
            <span className="ml-auto text-xs">
              {property.property_type}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
