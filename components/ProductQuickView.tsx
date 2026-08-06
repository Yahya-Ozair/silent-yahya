"use client";

import Image from "next/image";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/app/context/CartContext";

type Product = {
  _id?: string;
  id?: number;
  slug: string;
  name: string;
  category: string;
  image: string;
  price: number;
  stock: number;
};

type Props = {
  product: Product | null;
  open: boolean;
  onClose: () => void;
};

export default function ProductQuickView({
  product,
  open,
  onClose,
}: Props) {
  const { addToCart } = useCart();

  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (open) setQty(1);
  }, [open]);

  useEffect(() => {
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", esc);

    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  if (!product) return null;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm transition duration-300 ${
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
      />

      <div
        className={`fixed left-1/2 top-1/2 z-[100] w-[95%] max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-[#D4AF37]/20 bg-[#111] shadow-2xl transition-all duration-300 ${
          open
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 hover:bg-white/10"
        >
          <X />
        </button>

        <div className="grid md:grid-cols-2">

          <div className="flex items-center justify-center bg-black p-10">
            <Image
              src={product.image}
              alt={product.name}
              width={500}
              height={500}
              className="object-contain transition duration-500 hover:scale-110"
            />
          </div>

          <div className="p-10">

            <p className="uppercase tracking-[5px] text-[#D4AF37]">
              {product.category}
            </p>

            <h2 className="mt-3 text-5xl font-bold">
              {product.name}
            </h2>

            <p className="mt-6 text-4xl font-bold text-[#D4AF37]">
              ₹{product.price}
            </p>

            <p className="mt-6 text-zinc-400">
              Premium luxury alcohol-free attar with long-lasting fragrance crafted for everyday elegance.
            </p>

            <p className="mt-6 text-green-400">
              {product.stock} in stock
            </p>

            <div className="mt-8 flex items-center gap-5">

              <button
                onClick={() =>
                  setQty((q) => Math.max(1, q - 1))
                }
                className="rounded-full border border-[#D4AF37] p-3"
              >
                <Minus />
              </button>

              <span className="text-2xl font-bold">
                {qty}
              </span>

              <button
                onClick={() => setQty((q) => q + 1)}
                className="rounded-full border border-[#D4AF37] p-3"
              >
                <Plus />
              </button>

            </div>

            <div className="mt-10 flex gap-4">

              <button
                onClick={() => {
                  for (let i = 0; i < qty; i++) {
                    addToCart({
                      id:
                        product._id ||
                        product.id?.toString() ||
                        "",
                      slug: product.slug,
                      name: product.name,
                      image: product.image,
                      price: product.price,
                    });
                  }

                  onClose();
                }}
                className="flex flex-1 items-center justify-center gap-3 rounded-full bg-[#D4AF37] py-4 font-bold text-black transition hover:scale-105"
              >
                <ShoppingBag size={20} />
                Add To Cart
              </button>

            </div>

          </div>

        </div>
      </div>
    </>
  );
}