export default function Footer() {
  return (
    <footer className="bg-black border-t border-[#D4AF37]/20 py-20 px-8">

      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">

        <div>
          <h2 className="text-3xl font-bold text-[#D4AF37]">
            SILENT YAHYA
          </h2>

          <p className="text-gray-400 mt-6 leading-8">
            Luxury non-alcoholic attars inspired by timeless Arabian elegance.
          </p>
        </div>

        <div>
          <h3 className="text-white text-xl mb-6">Shop</h3>

          <ul className="space-y-3 text-gray-400">
            <li>Shanaya</li>
            <li>Noor</li>
            <li>Royal Musk</li>
          </ul>
        </div>

        <div>
          <h3 className="text-white text-xl mb-6">Company</h3>

          <ul className="space-y-3 text-gray-400">
            <li>About</li>
            <li>Contact</li>
            <li>Shipping</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div>
          <h3 className="text-white text-xl mb-6">
            Newsletter
          </h3>

          <input
            type="email"
            placeholder="Your Email"
            className="w-full p-4 rounded-xl bg-[#111] border border-[#D4AF37]/20 text-white"
          />

          <button className="mt-5 w-full bg-[#D4AF37] text-black py-4 rounded-xl font-semibold hover:scale-105 duration-300">
            Subscribe
          </button>
        </div>

      </div>

      <div className="text-center text-gray-500 mt-16">
        © 2026 Silent Yahya. All Rights Reserved.
      </div>

    </footer>
  );
}