export default function Testimonials() {
  const reviews = [
    {
      name: "Ahmed Khan",
      city: "Hyderabad",
      review:
        "The fragrance lasts all day. The packaging feels extremely premium. Definitely worth it.",
    },
    {
      name: "Mohammed Ali",
      city: "Bangalore",
      review:
        "Shanaya has become my signature scent. Beautiful floral opening with rich oud notes.",
    },
    {
      name: "Ayesha",
      city: "Mumbai",
      review:
        "Absolutely luxurious. Even the bottle looks like an expensive designer perfume.",
    },
  ];

  return (
    <section className="bg-[#090909] py-28 px-8">
      <div className="max-w-7xl mx-auto">

        <p className="text-center uppercase tracking-[8px] text-[#D4AF37]">
          Testimonials
        </p>

        <h2 className="text-center text-5xl font-bold text-white mt-4 mb-16">
          Loved by Our Customers
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          {reviews.map((item) => (

            <div
              key={item.name}
              className="bg-[#111] border border-[#D4AF37]/20 rounded-3xl p-8 hover:border-[#D4AF37] duration-500 hover:-translate-y-3"
            >

              <div className="text-[#D4AF37] text-3xl mb-6">
                ★★★★★
              </div>

              <p className="text-gray-300 leading-8">
                "{item.review}"
              </p>

              <div className="mt-8">

                <h4 className="text-white text-xl font-semibold">
                  {item.name}
                </h4>

                <p className="text-gray-500">
                  {item.city}
                </p>

              </div>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}