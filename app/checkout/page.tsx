"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/app/context/CartContext";
import loadRazorpay from "@/lib/loadRazorpay";
import {
  CreditCard,
  Truck,
  MapPin,
  User,
  Lock,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();

  const { cart } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    payment: "ONLINE",
  });

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = cart.length > 0 ? 99 : 0;

  const total = subtotal + shipping;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handlePayment() {
  if (
    !form.name ||
    !form.phone ||
    !form.address ||
    !form.city ||
    !form.state ||
    !form.pincode
  ) {
    alert("Please fill all required fields.");
    return;
  }
  

  // CASH ON DELIVERY
  if (form.payment === "COD") {
    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: {
          name: form.name,
          email: form.email,
          phone: form.phone,
        },
        address: {
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        total,
        paymentMethod: "Cash on Delivery",
        paymentStatus: "Pending",
        orderStatus: "Pending",
      }),
    });

    const data = await res.json();

    if (data.success) {
      router.push("/order-success");
    } else {
      alert("Unable to place order.");
    }

    return;
  }

  // Continue with Razorpay
  const loaded = await loadRazorpay();

    if (!loaded) {
      alert("Unable to load Razorpay.");
      return;
    }

    const response = await fetch("/api/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: total,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      alert("Unable to create Razorpay order.");
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

      amount: data.order.amount,

      currency: data.order.currency,

      name: "Silent Yahya",

      description: "Luxury Attars",

      image: "/logo.png",

      order_id: data.order.id,

      prefill: {
        name: form.name,
        email: form.email,
        contact: form.phone,
      },

      notes: {
        address: form.address,
      },

      theme: {
        color: "#D4AF37",
      },

      handler: async function (response: any) {
  const verify = await fetch("/api/verify-payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...response,

      customer: {
        name: form.name,
        email: form.email,
        phone: form.phone,
      },

      address: {
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      },

      items: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      })),

      subtotal,
      shipping,
      total,
    }),
  });

  const result = await verify.json();

  if (result.success) {
    router.push("/order-success");
  } else {
    console.error(result);
    alert(result.message || "Payment verification failed.");
    router.push("/payment-failed");
  }
},
      modal: {
        ondismiss: function () {
          console.log("Payment cancelled");
        },
      },
    };

    const paymentObject = new (window as any).Razorpay(options);

    paymentObject.open();
  }

  return (
    <>
  <Navbar />

  <main className="min-h-screen bg-[#050505] pt-28 pb-20">

    <div className="mx-auto max-w-7xl px-6">

      <div className="mb-12 text-center">

        <p className="uppercase tracking-[8px] text-[#D4AF37]">
          Silent Yahya
        </p>

        <h1 className="mt-4 text-5xl font-bold text-white md:text-6xl">
          Secure Checkout
        </h1>

        <p className="mt-4 text-gray-400">
          Complete your luxury fragrance purchase.
        </p>

      </div>

      <div className="grid gap-10 lg:grid-cols-2">

        {/* LEFT */}

        <div className="rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-8">

          <h2 className="mb-8 flex items-center gap-3 text-3xl font-bold text-white">
            <User className="text-[#D4AF37]" />
            Customer Details
          </h2>

          <div className="space-y-5">

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#D4AF37]/20 bg-black p-4 text-white outline-none focus:border-[#D4AF37]"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#D4AF37]/20 bg-black p-4 text-white outline-none focus:border-[#D4AF37]"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#D4AF37]/20 bg-black p-4 text-white outline-none focus:border-[#D4AF37]"
            />

          </div>

          <h2 className="mt-10 mb-6 flex items-center gap-3 text-3xl font-bold text-white">
            <MapPin className="text-[#D4AF37]" />
            Shipping Address
          </h2>

          <div className="space-y-5">

            <input
              name="address"
              placeholder="Street Address"
              value={form.address}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#D4AF37]/20 bg-black p-4 text-white outline-none focus:border-[#D4AF37]"
            />

            <div className="grid gap-5 md:grid-cols-2">

              <input
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleChange}
                className="rounded-xl border border-[#D4AF37]/20 bg-black p-4 text-white outline-none focus:border-[#D4AF37]"
              />

              <input
                name="state"
                placeholder="State"
                value={form.state}
                onChange={handleChange}
                className="rounded-xl border border-[#D4AF37]/20 bg-black p-4 text-white outline-none focus:border-[#D4AF37]"
              />

            </div>

            <input
              name="pincode"
              placeholder="Pincode"
              value={form.pincode}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#D4AF37]/20 bg-black p-4 text-white outline-none focus:border-[#D4AF37]"
            />

          </div>

          <h2 className="mt-10 mb-6 flex items-center gap-3 text-3xl font-bold text-white">
            <CreditCard className="text-[#D4AF37]" />
            Payment
          </h2>

          <select
            name="payment"
            value={form.payment}
            onChange={handleChange}
            className="w-full rounded-xl border border-[#D4AF37]/20 bg-black p-4 text-white"
          >
            <option value="ONLINE">Online Payment (Razorpay)</option>
            <option value="COD">Cash On Delivery</option>
          </select>

        </div>

        {/* RIGHT */}

        <div className="rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-8">

          <h2 className="mb-8 flex items-center gap-3 text-3xl font-bold text-white">
            <Truck className="text-[#D4AF37]" />
            Order Summary
          </h2>

          <div className="space-y-6">

            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b border-[#D4AF37]/10 pb-4"
              >
                <div>
                  <h3 className="font-semibold text-white">
                    {item.name}
                  </h3>

                  <p className="text-sm text-gray-400">
                    Qty: {item.quantity}
                  </p>
                </div>

                <p className="font-semibold text-[#D4AF37]">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            ))}

            <div className="flex justify-between text-gray-300">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="flex justify-between text-gray-300">
              <span>Shipping</span>
              <span>₹{shipping}</span>
            </div>

            <hr className="border-[#D4AF37]/20" />

            <div className="flex justify-between text-3xl font-bold text-[#D4AF37]">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <button
              onClick={handlePayment}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#D4AF37] py-4 text-lg font-bold text-black transition hover:scale-105"
            >
              <Lock size={22} />
              Pay Securely
            </button>

          </div>

        </div>

      </div>

    </div>

  </main>

  <Footer />
</>
);
}