"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/app/context/CartContext";

export default function CartPage() {
  const {
    cart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    totalPrice,
  } = useCart();

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white px-6">
        <h1 className="text-4xl font-bold text-[#D4AF37]">
          Your Cart is Empty
        </h1>

        <p className="mt-4 text-zinc-400">
          Add some amazing fragrances to your cart.
        </p>

        <Link
          href="/shop"
          className="mt-8 rounded-full bg-[#D4AF37] px-8 py-4 font-bold text-black"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-32 text-white">
      <div className="mx-auto max-w-7xl">

        <h1 className="mb-10 text-5xl font-bold text-[#D4AF37]">
          Shopping Cart
        </h1>

        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">

          {/* Products */}
          <div className="space-y-6">

            {cart.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-6 rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-6 md:flex-row md:items-center"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={120}
                  height={120}
                  className="rounded-xl object-contain"
                />

                <div className="flex-1">
                  <h2 className="text-2xl font-bold">
                    {item.name}
                  </h2>

                  <p className="mt-2 text-[#D4AF37] text-xl">
                    ₹{item.price}
                  </p>
                </div>

                <div className="flex items-center gap-3">

                  <button
                    onClick={() => decreaseQty(item.id)}
                    className="rounded-full border border-[#D4AF37] p-2"
                  >
                    <Minus size={18} />
                  </button>

                  <span className="w-10 text-center text-xl">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => increaseQty(item.id)}
                    className="rounded-full border border-[#D4AF37] p-2"
                  >
                    <Plus size={18} />
                  </button>

                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 transition hover:text-red-400"
                >
                  <Trash2 size={22} />
                </button>

              </div>
            ))}

          </div>

          {/* Summary */}
          <div className="rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-8 h-fit">

            <h2 className="text-3xl font-bold text-[#D4AF37]">
              Order Summary
            </h2>

            <div className="mt-8 flex justify-between text-xl">
              <span>Total</span>
              <span className="font-bold text-[#D4AF37]">
                ₹{totalPrice}
              </span>
            </div>

            <Link
  href="/checkout"
  className="mt-10 block w-full rounded-full bg-[#D4AF37] py-4 text-center font-bold text-black transition hover:scale-[1.02]"
>
  Proceed to Checkout
</Link>

            <Link
              href="/shop"
              className="mt-4 block text-center text-zinc-400 hover:text-white"
            >
              Continue Shopping
            </Link>

          </div>

        </div>

      </div>
    </main>
  );
}