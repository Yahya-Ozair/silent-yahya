"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, ShoppingBag } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Product {
  _id?: string;
  id?: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  image: string;
  stock: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const { addToCart } = useCart();

  const [liked, setLiked] = useState(false);

  useEffect(() => {
    checkWishlist();
  }, []);

  async function checkWishlist() {
    try {
      const res = await fetch("/api/wishlist/get");

      if (!res.ok) return;

      const data = await res.json();

      if (data.success) {
        const exists = data.wishlist.some(
          (item: any) =>
            item.productId ===
            (product._id || product.id)
        );

        setLiked(exists);
      }
    } catch {}
  }

  async function toggleWishlist() {
    try {
      if (!liked) {
        const res = await fetch("/api/wishlist/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product._id || product.id,
          }),
        });

        if (res.ok) {
          setLiked(true);
          toast.success("Added to Wishlist");
        }
      } else {
        const res = await fetch("/api/wishlist/remove", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product._id || product.id,
          }),
        });

        if (res.ok) {
          setLiked(false);
          toast.success("Removed from Wishlist");
        }
      }
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-[#D4AF37]/20 bg-[#111111] transition-all duration-500 hover:-translate-y-2 hover:border-[#D4AF37] hover:shadow-[0_20px_60px_rgba(212,175,55,0.2)]">

      {/* Wishlist */}

      <button
        onClick={toggleWishlist}
        className={`absolute right-4 top-4 z-20 rounded-full p-2 backdrop-blur-md transition-all duration-300 ${
          liked
            ? "bg-[#D4AF37] text-black"
            : "bg-black/60 text-white hover:bg-[#D4AF37] hover:text-black"
        }`}
      >
        <Heart
          size={18}
          fill={liked ? "currentColor" : "none"}
        />
      </button>

      {/* Image */}

      <div className="relative overflow-hidden bg-black">

        <Image
          src={product.image}
          alt={product.name}
          width={500}
          height={500}
          className="h-64 w-full object-contain p-6 transition-transform duration-700 group-hover:scale-110 sm:h-72 lg:h-80"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

      </div>

      {/* Content */}

      <div className="p-6">

        <p className="text-xs uppercase tracking-[4px] text-[#D4AF37]">
          {product.category}
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          {product.name}
        </h2>

        <p className="mt-4 text-3xl font-bold text-[#D4AF37]">
          ₹{product.price}
        </p>

        <p className="mt-2 text-sm text-green-400">
          {product.stock} in stock
        </p>

        <div className="mt-6 flex items-center gap-3">

          <Link
            href={`/product/${product.slug}`}
            className="flex-1"
          >
            <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[#D4AF37] py-3 font-semibold text-black transition-all duration-300 hover:scale-105">
              <Eye size={18} />
              View Product
            </button>
          </Link>

          <button
            onClick={() => {
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

              toast.success("Added to Cart");
            }}
            className="rounded-full border border-[#D4AF37] p-3 text-[#D4AF37] transition-all duration-300 hover:bg-[#D4AF37] hover:text-black"
          >
            <ShoppingBag size={20} />
          </button>

        </div>

      </div>

    </div>
  );
}