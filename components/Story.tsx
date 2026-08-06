export default function Story() {
  return (
    <section className="bg-gradient-to-b from-[#0a0a0a] to-[#141414] py-28 px-8">

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">

        {/* Left Side */}

        <div>

          <p className="uppercase tracking-[8px] text-[#D4AF37] text-sm mb-6">
            Our Story
          </p>

          <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-8">
            Crafted for those who appreciate true luxury.
          </h2>

          <p className="text-gray-400 leading-9 text-lg mb-8">
            Silent Yahya was created with a simple belief—
            fragrance should leave a memory, not just a scent.
            Every bottle is handcrafted using premium oils,
            inspired by timeless Arabian traditions and modern elegance.
          </p>

          <p className="text-gray-400 leading-9 text-lg">
            From floral masterpieces to deep woody ouds,
            every creation is designed to reflect confidence,
            sophistication, and individuality.
          </p>

        </div>

        {/* Right Side */}

        <div className="relative">

          <div className="absolute inset-0 bg-[#D4AF37]/20 blur-3xl rounded-full"></div>

          <img
            src="/shanaya.jpg"
            alt="Luxury Attar"
            className="relative rounded-3xl shadow-2xl border border-[#D4AF37]/30"
          />

        </div>

      </div>

    </section>
  );
}