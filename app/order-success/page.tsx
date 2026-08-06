"use client";

import Link from "next/link";
import { CheckCircle2, ShoppingBag } from "lucide-react";

export default function OrderSuccess() {
  const orderId =
    "SY-" +
    Math.random().toString(36).substring(2, 7).toUpperCase() +
    "-" +
    Date.now().toString().slice(-5);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6">

      <div className="w-full max-w-2xl rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-12 text-center shadow-[0_0_60px_rgba(212,175,55,.15)]">

        <CheckCircle2
          size={90}
          className="mx-auto text-[#D4AF37]"
        />

        <h1 className="mt-8 text-5xl font-bold text-white">
          Order Placed Successfully
        </h1>

        <p className="mt-6 text-lg text-gray-400">
          Thank you for shopping with
        </p>

        <h2 className="mt-2 text-3xl font-bold tracking-[5px] text-[#D4AF37]">
          SILENT YAHYA
        </h2>

        <div className="mt-10 rounded-2xl border border-[#D4AF37]/20 bg-black p-6">

          <p className="text-gray-400">
            Order ID
          </p>

          <h3 className="mt-2 text-2xl font-bold text-[#D4AF37]">
            {orderId}
          </h3>

        </div>

        <p className="mt-8 text-gray-400">
          We have received your order and will contact you soon.
        </p>

        <div className="mt-12 flex flex-col gap-5 md:flex-row">

          <Link
            href="/shop"
            className="flex-1 rounded-full bg-[#D4AF37] py-4 text-center font-bold text-black transition hover:scale-105"
          >
            Continue Shopping
          </Link>

          <Link
            href="/"
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#D4AF37] py-4 font-bold text-[#D4AF37] transition hover:bg-[#D4AF37] hover:text-black"
          >
            <ShoppingBag size={20} />
            Back Home
          </Link>

        </div>

      </div>

    </main>
  );
}