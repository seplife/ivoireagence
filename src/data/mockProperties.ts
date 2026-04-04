export type Property = {
  id: string;
  title: string;
  description: string;
  property_type: string;
  status: "À Vendre" | "À Louer";
  price: number;
  surface: number;
  rooms: number;
  address: string;
  city: string;
  commune: string;
  owner_name: string;
  owner_phone: string;
  images: string[];
  verified: boolean;
  created_at: string;
  views: number;
};

export const PROPERTY_TYPES = [
  "Maison",
  "Appartement",
  "Terrain",
  "Magasin",
  "Bureau",
  "Villa",
  "Immeuble",
  "Entrepôt",
  "Local commercial",
];

export const CITIES = [
  "Abidjan",
  "Bouaké",
  "Divo",
  "Yamoussoukro",
  "San-Pédro",
  "Daloa",
  "Lakota",
  "Guitry",
  "Hiré",
  "Gagnoa",
  "Korhogo",
];

export const COMMUNES = [
  "Cocody",
  "Plateau",
  "Marcory",
  "Yopougon",
  "Abobo",
  "Treichville",
  "Angré",
  "Riviera",
  "Bingerville",
  "Port-Bouët",
];

export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Villa moderne avec piscine",
    description:
      "Superbe villa de 5 pièces avec piscine, jardin paysager et garage double. Située dans un quartier résidentiel calme de Cocody Angré, cette villa offre un cadre de vie exceptionnel avec des finitions haut de gamme, une cuisine américaine équipée et des chambres spacieuses avec salle de bain privative.",
    property_type: "Villa",
    status: "À Vendre",
    price: 150000000,
    surface: 350,
    rooms: 5,
    address: "Angré 8ème Tranche",
    city: "Abidjan",
    commune: "Cocody",
    owner_name: "Kouassi Jean-Marc",
    owner_phone: "+225 07 79 53 57 95",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    ],
    verified: true,
    created_at: "2026-03-10",
    views: 234,
  },
  {
    id: "2",
    title: "Appartement 3 pièces standing",
    description:
      "Bel appartement de standing au 5ème étage avec vue panoramique sur le Plateau. Climatisation centralisée, parking souterrain et gardiennage 24h/24.",
    property_type: "Appartement",
    status: "À Louer",
    price: 450000,
    surface: 120,
    rooms: 3,
    address: "Avenue Franchet d'Esperey",
    city: "Abidjan",
    commune: "Plateau",
    owner_name: "Agence Prestige Immo",
    owner_phone: "+225 07 79 53 57 95",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    ],
    verified: true,
    created_at: "2026-03-12",
    views: 156,
  },
  {
    id: "3",
    title: "Terrain constructible 500m²",
    description:
      "Terrain viabilisé avec titre foncier dans une zone en plein développement à Bingerville. Accès direct à la route bitumée, eau et électricité disponibles.",
    property_type: "Terrain",
    status: "À Vendre",
    price: 25000000,
    surface: 500,
    rooms: 0,
    address: "Route de Bingerville",
    city: "Abidjan",
    commune: "Bingerville",
    owner_name: "Diallo Ibrahim",
    owner_phone: "+225 07 79 53 57 95",
    images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"],
    verified: false,
    created_at: "2026-03-08",
    views: 89,
  },
  {
    id: "4",
    title: "Magasin au bord de la route",
    description:
      "Local commercial de 80m² idéalement situé sur l'axe principal de Marcory. Grande vitrine, arrière-boutique et toilettes. Idéal pour commerce de détail.",
    property_type: "Magasin",
    status: "À Louer",
    price: 350000,
    surface: 80,
    rooms: 2,
    address: "Boulevard de Marseille",
    city: "Abidjan",
    commune: "Marcory",
    owner_name: "Traoré Aminata",
    owner_phone: "+225 07 79 53 57 95",
    images: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"],
    verified: true,
    created_at: "2026-03-14",
    views: 67,
  },
  {
    id: "5",
    title: "Bureau open space moderne",
    description:
      "Espace de bureau moderne de 200m² aménagé en open space avec 3 salles de réunion, kitchenette et espace détente. Fibre optique incluse.",
    property_type: "Bureau",
    status: "À Louer",
    price: 800000,
    surface: 200,
    rooms: 5,
    address: "Zone 4C",
    city: "Abidjan",
    commune: "Marcory",
    owner_name: "SCI Les Tours",
    owner_phone: "+225 07 79 53 57 95",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80",
    ],
    verified: true,
    created_at: "2026-03-05",
    views: 198,
  },
  {
    id: "6",
    title: "Maison 4 pièces avec cour",
    description:
      "Maison familiale de 4 pièces avec grande cour arborée à Yopougon Selmer. Eau et électricité, quartier calme et sécurisé.",
    property_type: "Maison",
    status: "À Vendre",
    price: 35000000,
    surface: 180,
    rooms: 4,
    address: "Yopougon Selmer",
    city: "Abidjan",
    commune: "Yopougon",
    owner_name: "Koné Moussa",
    owner_phone: "+225 07 79 53 57 95",
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
    ],
    verified: false,
    created_at: "2026-03-01",
    views: 312,
  },
  {
    id: "7",
    title: "Immeuble R+3 avec commerces",
    description:
      "Immeuble de rapport R+3 composé de 2 magasins au RDC et 6 appartements aux étages. Revenus locatifs stables. Titre foncier disponible.",
    property_type: "Immeuble",
    status: "À Vendre",
    price: 280000000,
    surface: 600,
    rooms: 12,
    address: "Riviera Palmeraie",
    city: "Abidjan",
    commune: "Cocody",
    owner_name: "Groupe Habitat Plus",
    owner_phone: "+225 07 79 53 57 95",
    images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"],
    verified: true,
    created_at: "2026-02-28",
    views: 445,
  },
  {
    id: "8",
    title: "Entrepôt 1000m² Zone industrielle",
    description:
      "Grand entrepôt de stockage avec quai de chargement, bureau administratif et système de sécurité. Accès poids lourds facilité.",
    property_type: "Entrepôt",
    status: "À Louer",
    price: 2500000,
    surface: 1000,
    rooms: 3,
    address: "Zone Industrielle de Yopougon",
    city: "Abidjan",
    commune: "Yopougon",
    owner_name: "SARL Logistics CI",
    owner_phone: "+225 07 79 53 57 95",
    images: ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80"],
    verified: true,
    created_at: "2026-03-13",
    views: 78,
  },
];

export function formatPrice(price: number): string {
  return price.toLocaleString("fr-FR");
}
