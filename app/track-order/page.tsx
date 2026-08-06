"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");

  async function trackOrder() {
    if (!orderId) {
      alert("Enter Order ID");
      return;
    }

    window.location.href = `/track-order/${orderId}`;
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#050505] pt-28 pb-24">

        <div className="mx-auto max-w-3xl px-6">

          <div className="rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-12">

            <p className="text-center uppercase tracking-[8px] text-[#D4AF37]">
              Silent Yahya
            </p>

            <h1 className="mt-4 text-center text-5xl font-bold text-white">
              Track Your Order
            </h1>

            <p className="mt-4 text-center text-zinc-400">
              Enter your Order ID to see the latest delivery updates.
            </p>

            <input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter Order ID"
              className="mt-10 w-full rounded-xl border border-[#D4AF37]/20 bg-black p-5 text-white outline-none focus:border-[#D4AF37]"
            />

            <button
              onClick={trackOrder}
              className="mt-8 w-full rounded-full bg-[#D4AF37] py-4 text-lg font-bold text-black transition hover:scale-105"
            >
              Track Order
            </button>

          </div>

        </div>

      </main>

      <Footer />
    </>
  );
}