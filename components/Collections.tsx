"use client";

import ProductCard from "./ProductCard";
import { products } from "@/lib/products";

export default function Collections() {
  return (
    <section className="bg-[#050505] py-24">

      <div className="mx-auto max-w-7xl px-6">

        <h2 className="mb-12 text-center text-5xl font-bold text-white">
          Premium Collection
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}

        </div>

      </div>

    </section>
  );
}