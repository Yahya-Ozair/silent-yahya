"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  User,
  MapPin,
  CreditCard,
  Package,
  Calendar,
  Printer,
} from "lucide-react";

type Order = {
  _id: string;

  customer: {
    name: string;
    email: string;
    phone: string;
  };

  address: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };

  items: {
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];

  total: number;

  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;

  createdAt: string;
};

export default function OrderDetailsPage() {
  const params = useParams();

  const orderId = params.orderId as string;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrder();
  }, []);

  async function loadOrder() {
    try {
      const res = await fetch(`/api/orders/${orderId}`);

      const data = await res.json();

      if (data.success) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        Loading Order...
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        Order Not Found
      </main>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#050505] pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-6">

          <h1 className="text-5xl font-bold text-[#D4AF37]">
            Order Details
          </h1>

          <p className="mt-3 text-zinc-400">
            Order ID: {order._id}
          </p>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">

  {/* Customer */}

  <div className="rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-8">

    <h2 className="mb-8 flex items-center gap-3 text-3xl font-bold text-white">
      <User className="text-[#D4AF37]" />
      Customer Details
    </h2>

    <div className="space-y-5">

      <div>
        <p className="text-sm uppercase tracking-widest text-zinc-500">
          Full Name
        </p>

        <p className="mt-1 text-xl font-semibold text-white">
          {order.customer.name}
        </p>
      </div>

      <div>
        <p className="text-sm uppercase tracking-widest text-zinc-500">
          Phone
        </p>

        <p className="mt-1 text-lg text-white">
          {order.customer.phone}
        </p>
      </div>

      <div>
        <p className="text-sm uppercase tracking-widest text-zinc-500">
          Email
        </p>

        <p className="mt-1 text-lg text-white">
          {order.customer.email || "N/A"}
        </p>
      </div>

    </div>

  </div>

  <div className="mt-10 rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-8">

  <h2 className="mb-8 flex items-center gap-3 text-3xl font-bold text-white">
    <Package className="text-[#D4AF37]" />
    Ordered Products
  </h2>

  <div className="space-y-6">

    {order.items.map((item, index) => (
      <div
        key={index}
        className="flex flex-col items-center gap-6 rounded-2xl border border-[#D4AF37]/10 bg-black/30 p-5 md:flex-row"
      >
        <Image
          src={item.image}
          alt={item.name}
          width={120}
          height={120}
          className="rounded-xl object-contain"
        />

        <div className="flex-1">

          <h3 className="text-2xl font-bold text-white">
            {item.name}
          </h3>

          <div className="mt-3 flex flex-wrap gap-6 text-zinc-400">

            <p>
              Price:
              <span className="ml-2 text-[#D4AF37]">
                ₹{item.price}
              </span>
            </p>

            <p>
              Qty:
              <span className="ml-2 text-white">
                {item.quantity}
              </span>
            </p>

          </div>

        </div>

        <div className="text-right">

          <p className="text-sm uppercase tracking-widest text-zinc-500">
            Total
          </p>

          <p className="mt-2 text-2xl font-bold text-[#D4AF37]">
            ₹{item.price * item.quantity}
          </p>

        </div>

      </div>
    ))}

  </div>

</div>
<div className="mt-10 grid gap-8 lg:grid-cols-2">

  {/* Payment */}

  <div className="rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-8">

    <h2 className="mb-8 flex items-center gap-3 text-3xl font-bold text-white">
      <CreditCard className="text-[#D4AF37]" />
      Payment Details
    </h2>

    <div className="space-y-6">

      <div className="flex justify-between border-b border-[#D4AF37]/10 pb-4">
        <span className="text-zinc-400">Payment Method</span>
        <span className="font-semibold text-white">
          {order.paymentMethod}
        </span>
      </div>

      <div className="flex justify-between border-b border-[#D4AF37]/10 pb-4">
        <span className="text-zinc-400">Payment Status</span>

        <span
          className={`rounded-full px-4 py-2 text-sm font-bold ${
            order.paymentStatus === "Paid"
              ? "bg-green-500/20 text-green-400"
              : "bg-yellow-500/20 text-yellow-400"
          }`}
        >
          {order.paymentStatus}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-zinc-400">Order Status</span>

        <span
          className={`rounded-full px-4 py-2 text-sm font-bold ${
            order.orderStatus === "Delivered"
              ? "bg-green-500/20 text-green-400"
              : order.orderStatus === "Cancelled"
              ? "bg-red-500/20 text-red-400"
              : "bg-blue-500/20 text-blue-400"
          }`}
        >
          {order.orderStatus}
        </span>
      </div>

    </div>

  </div>

  {/* Summary */}

  <div className="rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-8">

    <h2 className="mb-8 flex items-center gap-3 text-3xl font-bold text-white">
      <Calendar className="text-[#D4AF37]" />
      Order Summary
    </h2>

    <div className="space-y-6">

      <div className="flex justify-between border-b border-[#D4AF37]/10 pb-4">
        <span className="text-zinc-400">Order Date</span>

        <span className="text-white">
          {new Date(order.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="flex justify-between border-b border-[#D4AF37]/10 pb-4">
        <span className="text-zinc-400">Products</span>

        <span className="text-white">
          {order.items.length}
        </span>
      </div>

      <div className="flex justify-between border-b border-[#D4AF37]/10 pb-4">
        <span className="text-zinc-400">Grand Total</span>

        <span className="text-3xl font-bold text-[#D4AF37]">
          ₹{order.total}
        </span>
      </div>

      <button
        onClick={() => window.print()}
        className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#D4AF37] py-4 text-lg font-bold text-black transition hover:scale-105"
      >
        <Printer size={22} />
        Print Invoice
      </button>

    </div>

  </div>

</div>

  {/* Address */}

  <div className="rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-8">

    <h2 className="mb-8 flex items-center gap-3 text-3xl font-bold text-white">
      <MapPin className="text-[#D4AF37]" />
      Shipping Address
    </h2>

    <div className="space-y-5">

      <div>
        <p className="text-sm uppercase tracking-widest text-zinc-500">
          Address
        </p>

        <p className="mt-1 text-lg text-white">
          {order.address.address}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">

        <div>
          <p className="text-sm uppercase tracking-widest text-zinc-500">
            City
          </p>

          <p className="mt-1 text-white">
            {order.address.city}
          </p>
        </div>

        <div>
          <p className="text-sm uppercase tracking-widest text-zinc-500">
            State
          </p>

          <p className="mt-1 text-white">
            {order.address.state}
          </p>
        </div>

      </div>

      <div>
        <p className="text-sm uppercase tracking-widest text-zinc-500">
          Pincode
        </p>

        <p className="mt-1 text-white">
          {order.address.pincode}
        </p>
      </div>

    </div>

  </div>

</div>

        </div>
      </main>

      <Footer />
    </>
  );
}