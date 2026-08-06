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

export const products: Product[] = [
  {
    id: 1,
    slug: "shanaya",
    name: "Shanaya",
    category: "Luxury Collection",
    price: 1299,
    image: "/images/shanaya.png",
    description:
      "Luxury concentrated attar crafted with premium floral and woody notes.",
    topNotes: ["Rose", "Jasmine"],
    heartNotes: ["Oud", "Amber"],
    baseNotes: ["White Musk", "Sandalwood"],
    stock: 15,
  },
  {
    id: 2,
    slug: "noor",
    name: "Noor",
    category: "Arabian Collection",
    price: 999,
    image: "/images/shanaya.png",
    description:
      "Warm oriental fragrance inspired by Arabian nights.",
    topNotes: ["Saffron"],
    heartNotes: ["Oud"],
    baseNotes: ["Amber"],
    stock: 20,
  },
];