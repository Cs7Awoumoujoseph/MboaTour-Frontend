export interface Review {
  authorName: string;
  rating: number;
  date: string;
  comment: string;
}

export interface RatingBreakdownItem {
  stars: number;
  count: number;
}

export interface Site {
  id: number;
  name: string;
  category: string;
  categoryId?: number;
  price: string;
  hours: string;
  image: string;
  region: string;
  regionId?: number;
  idealFor: string;
  bestPeriod: string;
  description: string;
  status: "Publié" | "Brouillon";
  images?: { id: number; url: string; principal?: boolean }[];
  rating: number;
  gallery?: string[];
  reviews: Review[];
  ratingBreakdown: RatingBreakdownItem[];
}
export type SiteFormData = Omit<
  Site,
  "id" | "gallery" | "reviews" | "ratingBreakdown" | "rating"
>;

export interface User {
  id: number;
  nom: string;
  email: string;
  type: "VISITEUR" | "GUIDE" | "ADMIN";
}

export interface UserMedia {
  id: number;
  siteId: number;
  url: string;
  type: "photo" | "video";
  authorName: string;
  authorId: number;
}
export interface StoredReview {
  id: number;
  siteId: number;
  authorName: string;
  authorId: number;
  rating: number;
  comment: string;
  date: string;
}

//simulation verification compte pour test front-end
export interface RegisteredUser {
  id: number;
  nom: string;
  email: string;
  motDePasse: string;
  type: "VISITEUR" | "GUIDE";
}

export interface FavoriteEntry {
  userId: number;
  siteId: number;
}

export interface Destination {
  id: number;
  name: string;
  category: string;
  region: string;
  description: string;
  imageId?: number;
  image?: string;
  rating: number;
  reviews: any[];
}

export interface Category {
  name: string;
  icon: string;
}
