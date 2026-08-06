"use client";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

type Product = {
  _id: string;
  id?: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  image: string;
  price: number;
  originalPrice: number;
  stock: number;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
};

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

const [category, setCategory] = useState("All");

const [sort, setSort] = useState("Newest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch("/api/products/get");
      const data = await res.json();

      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  const filteredProducts = useMemo(() => {
  let data = [...products];

  // Search
  if (search) {
    data = data.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Category
  if (category !== "All") {
    data = data.filter(
      (p) => p.category === category
    );
  }

  // Sorting
  switch (sort) {
    case "PriceLow":
      data.sort((a, b) => a.price - b.price);
      break;

    case "PriceHigh":
      data.sort((a, b) => b.price - a.price);
      break;

    case "AZ":
      data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      break;

    default:
      break;
  }

  return data;
}, [products, search, category, sort]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#050505] pt-28 pb-20">
        <section className="mx-auto max-w-7xl px-6">

          <div className="text-center">

            <p className="uppercase tracking-[8px] text-[#D4AF37]">
              Silent Yahya
            </p>

            <h1 className="mt-4 text-5xl font-bold text-white md:text-7xl">
              Luxury Collection
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-gray-400">
              Discover handcrafted premium non-alcoholic attars created for timeless elegance.
            </p>

          </div>
          <div className="mb-10 grid gap-4 md:grid-cols-3">

  <input
    type="text"
    placeholder="Search fragrances..."
    value={search}
    onChange={(e) =>
      setSearch(e.target.value)
    }
    className="rounded-xl border border-[#D4AF37]/20 bg-[#111] p-4 text-white outline-none focus:border-[#D4AF37]"
  />

  <select
    value={category}
    onChange={(e) =>
      setCategory(e.target.value)
    }
    className="rounded-xl border border-[#D4AF37]/20 bg-[#111] p-4 text-white"
  >
    <option>All</option>

    <option>Attar</option>

    <option>Perfume</option>

    <option>Oud</option>

  </select>

  <select
    value={sort}
    onChange={(e) =>
      setSort(e.target.value)
    }
    className="rounded-xl border border-[#D4AF37]/20 bg-[#111] p-4 text-white"
  >
    <option value="Newest">
      Newest
    </option>

    <option value="PriceLow">
      Price Low → High
    </option>

    <option value="PriceHigh">
      Price High → Low
    </option>

    <option value="AZ">
      Name A-Z
    </option>

  </select>

</div>

          {loading ? (
            <div className="mt-20 text-center text-white">
              Loading products...
            </div>
          ) : filteredProducts.length === 0? (
            <div className="mt-20 text-center text-gray-400">
              No products found.
            </div>
          ) : (
            <div className="mt-20 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          )}

        </section>
      </main>

      <Footer />
    </>
  );
}