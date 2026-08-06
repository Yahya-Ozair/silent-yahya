"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  PackageCheck,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/app/context/CartContext";
import type { Product } from "@/lib/products";

type Props = {
  product: Product;
};

export default function ProductClient({ product }: Props) {
  const { addToCart } = useCart();

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#050505] pt-28 pb-24">
        <div className="mx-auto max-w-7xl px-6">

          <div className="grid gap-16 lg:grid-cols-2">

            {/* IMAGE */}

            <div className="rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-8">

              <Image
                src={product.image}
                alt={product.name}
                width={700}
                height={700}
                className="mx-auto transition duration-500 hover:scale-105"
                priority
              />

            </div>

            {/* DETAILS */}

            <div>

              <p className="uppercase tracking-[5px] text-[#D4AF37]">
                {product.category}
              </p>

              <h1 className="mt-4 text-6xl font-bold text-white">
                {product.name}
              </h1>

              <p className="mt-5 text-5xl font-bold text-[#D4AF37]">
                ₹{product.price}
              </p>

              <p className="mt-8 text-lg leading-8 text-gray-400">
                {product.description}
              </p>

              <div className="mt-10 grid grid-cols-3 gap-6">

                <div>
                  <h3 className="mb-3 text-[#D4AF37] font-bold">
                    Top
                  </h3>

                  {product.topNotes.map((note) => (
                    <p key={note} className="text-gray-300">
                      {note}
                    </p>
                  ))}
                </div>

                <div>
                  <h3 className="mb-3 text-[#D4AF37] font-bold">
                    Heart
                  </h3>

                  {product.heartNotes.map((note) => (
                    <p key={note} className="text-gray-300">
                      {note}
                    </p>
                  ))}
                </div>

                <div>
                  <h3 className="mb-3 text-[#D4AF37] font-bold">
                    Base
                  </h3>

                  {product.baseNotes.map((note) => (
                    <p key={note} className="text-gray-300">
                      {note}
                    </p>
                  ))}
                </div>

              </div>

              <div className="mt-10">

                <span className="rounded-full bg-green-600 px-5 py-2 text-white">
                  {product.stock} In Stock
                </span>

              </div>

              {/* BUTTONS */}

              <div className="mt-12 flex flex-col gap-4 sm:flex-row">

         <button
  onClick={() =>
    addToCart({
      id: product.id.toString(),
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
    })
  }
  className="flex flex-1 items-center justify-center gap-3 rounded-full bg-[#D4AF37] py-4 font-bold text-black transition hover:scale-105"
>
  <ShoppingBag size={22} />
  Add To Cart
</button>

                <Link
                  href="/checkout"
                  className="flex flex-1 items-center justify-center rounded-full border border-[#D4AF37] py-4 font-bold text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black"
                >
                  Buy Now
                </Link>

                <button className="flex h-16 w-16 items-center justify-center rounded-full border border-[#D4AF37] text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black">
                  <Heart size={24} />
                </button>

              </div>

              {/* FEATURES */}

              <div className="mt-16 space-y-5">

                <div className="flex items-center gap-4 rounded-2xl border border-[#D4AF37]/20 bg-[#111] p-5">
                  <Truck className="text-[#D4AF37]" />
                  <div>
                    <h3 className="font-bold text-white">
                      Free Shipping
                    </h3>
                    <p className="text-gray-400">
                      On prepaid orders.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-[#D4AF37]/20 bg-[#111] p-5">
                  <ShieldCheck className="text-[#D4AF37]" />
                  <div>
                    <h3 className="font-bold text-white">
                      Premium Quality
                    </h3>
                    <p className="text-gray-400">
                      100% Original Attars
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-[#D4AF37]/20 bg-[#111] p-5">
                  <PackageCheck className="text-[#D4AF37]" />
                  <div>
                    <h3 className="font-bold text-white">
                      Secure Packaging
                    </h3>
                    <p className="text-gray-400">
                      Luxury gift packing included
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}