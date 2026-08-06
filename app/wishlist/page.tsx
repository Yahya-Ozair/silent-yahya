"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

type WishlistItem = {
  _id: string;
  productId: {
    _id: string;
    slug: string;
    name: string;
    category: string;
    image: string;
    price: number;
    stock: number;
  };
};

export default function WishlistPage() {
  const { addToCart } = useCart();

  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  async function loadWishlist() {
    try {
      const res = await fetch("/api/wishlist/get");
      const data = await res.json();

      if (data.success) {
        setWishlist(data.wishlist);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  async function removeItem(productId: string) {
    const res = await fetch("/api/wishlist/remove", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setWishlist((prev) =>
        prev.filter((item) => item.productId._id !== productId)
      );

      toast.success("Removed from Wishlist");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
        Loading Wishlist...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-28">

      <div className="mx-auto max-w-7xl">

        <div className="mb-14">

          <h1 className="text-5xl font-bold text-[#D4AF37]">
            My Wishlist
          </h1>

          <p className="mt-3 text-zinc-400">
            Save your favourite luxury fragrances.
          </p>

        </div>

        {wishlist.length === 0 ? (

          <div className="rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-20 text-center">

            <Heart
              size={80}
              className="mx-auto text-[#D4AF37]"
            />

            <h2 className="mt-8 text-4xl font-bold text-white">
              Wishlist Empty
            </h2>

            <p className="mt-4 text-zinc-400">
              You haven't saved any fragrances yet.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-block rounded-full bg-[#D4AF37] px-8 py-4 font-bold text-black"
            >
              Explore Collection
            </Link>

          </div>

        ) : (

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

            {wishlist.map((item) => {

              const product = item.productId;

              return (

                <div
                  key={item._id}
                  className="overflow-hidden rounded-3xl border border-[#D4AF37]/20 bg-[#111] transition duration-300 hover:-translate-y-2 hover:border-[#D4AF37]"
                >

                  <div className="bg-black">

                    <Image
                      src={product.image}
                      alt={product.name}
                      width={500}
                      height={500}
                      className="h-72 w-full object-contain p-6 transition duration-500 hover:scale-110"
                    />

                  </div>

                  <div className="p-6">

                    <p className="uppercase tracking-[4px] text-[#D4AF37] text-xs">
                      {product.category}
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-white">
                      {product.name}
                    </h2>

                    <p className="mt-4 text-3xl font-bold text-[#D4AF37]">
                      ₹{product.price}
                    </p>

                    <div className="mt-8 flex gap-3">

                      <button
                        onClick={() => {
                          addToCart({
                            id: product._id,
                            slug: product.slug,
                            name: product.name,
                            image: product.image,
                            price: product.price,
                          });

                          toast.success("Added to Cart");
                        }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#D4AF37] py-3 font-bold text-black transition hover:scale-105"
                      >
                        <ShoppingBag size={18} />
                        Add
                      </button>

                      <button
                        onClick={() =>
                          removeItem(product._id)
                        }
                        className="rounded-full border border-red-500 p-3 text-red-500 transition hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={20} />
                      </button>

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </div>

    </main>
  );
}