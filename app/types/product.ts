export interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;

  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];

  stock: number;
}