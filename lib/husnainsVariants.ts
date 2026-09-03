export type HusnainsVariant = {
  key: "black" | "gold" | "silver";
  name: string;
  shortName: string;
  price: number;
  sku: string;
  image: string;
  images: string[];
  swatch: string;
  description: string;
};

export const HUSNAINS_VARIANTS: HusnainsVariant[] = [
  {
    key: "black",
    name: "HUSNAINS — BLACK",
    shortName: "BLACK",
    price: 999,
    sku: "SY-HUSNAINS-BLK",
    image: "/images/husnains-black-01.jpg",
    images: [
      "/images/husnains-black-01.jpg",
      "/images/husnains-black-02.jpg",
      "/images/husnains-black-03.jpg",
      "/images/husnains-black-04.jpg",
    ],
    swatch: "#111111",
    description: "The original dark presentation.",
  },
  {
    key: "gold",
    name: "HUSNAINS — GOLD",
    shortName: "GOLD",
    price: 1099,
    sku: "SY-HUSNAINS-GLD",
    image: "/images/husnains-gold-01.jpg",
    images: [
      "/images/husnains-gold-01.jpg",
      "/images/husnains-gold-02.jpg",
      "/images/husnains-gold-03.jpg",
      "/images/husnains-gold-04.jpg",
    ],
    swatch: "#c99a3d",
    description: "A warmer, richer edition finish.",
  },
  {
    key: "silver",
    name: "HUSNAINS — SILVER",
    shortName: "SILVER",
    price: 1199,
    sku: "SY-HUSNAINS-SLV",
    image: "/images/husnains-silver-01.jpg",
    images: [
      "/images/husnains-silver-01.jpg",
      "/images/husnains-silver-02.jpg",
      "/images/husnains-silver-03.jpg",
      "/images/husnains-silver-04.jpg",
    ],
    swatch: "#bfc3c7",
    description: "A colder, architectural edition finish.",
  },
];

export function getHusnainsVariant(key: string) {
  return HUSNAINS_VARIANTS.find((variant) => variant.key === key) ?? null;
}
