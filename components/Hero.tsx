"use client";

import FloatingBottle from "./FloatingBottle";
import FadeUp from "./animations/FadeUp";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-black">

      {/* Background Glow */}
      <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/10 blur-[180px]" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-2">

        {/* LEFT SIDE */}

        <FadeUp>

          <p className="mb-6 uppercase tracking-[10px] text-[#D4AF37]">
            Premium Luxury Attar
          </p>

          <h1 className="mb-8 font-serif text-6xl font-bold leading-none text-white md:text-8xl">
            SHANAYA
          </h1>

          <p className="max-w-xl text-lg leading-9 text-gray-300">
            Crafted from premium non-alcoholic oils, Shanaya blends rich oud,
            delicate florals and timeless elegance into an unforgettable luxury fragrance.
          </p>

          <div className="mt-12 flex flex-wrap gap-5">

            <button className="rounded-full bg-[#D4AF37] px-10 py-4 text-lg font-semibold text-black transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(212,175,55,.45)]">
              Shop Now
            </button>

            <button className="rounded-full border border-[#D4AF37] px-10 py-4 text-lg text-[#D4AF37] transition duration-500 hover:bg-[#D4AF37] hover:text-black">
              Explore
            </button>

          </div>

          <div className="mt-16 flex flex-wrap gap-12">

            <div>
              <h2 className="text-4xl font-bold text-[#D4AF37]">
                12ml
              </h2>

              <p className="text-gray-400">
                Premium Bottle
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-[#D4AF37]">
                100%
              </h2>

              <p className="text-gray-400">
                Alcohol Free
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-[#D4AF37]">
                24H
              </h2>

              <p className="text-gray-400">
                Long Lasting
              </p>
            </div>

          </div>

        </FadeUp>

        {/* RIGHT SIDE */}

        <div className="relative flex justify-center">

          <div className="absolute h-[420px] w-[420px] rounded-full bg-[#D4AF37]/20 blur-[130px]" />

          <FloatingBottle />

        </div>

      </div>

    </section>
  );
}