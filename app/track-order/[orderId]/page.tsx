"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import {
  Package,
  CreditCard,
  MapPin,
  User,
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

export default function TrackOrderDetails() {
  const { orderId } = useParams();

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
        Loading...
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

        <div className="mx-auto max-w-6xl px-6">

          <h1 className="text-center text-5xl font-bold text-[#D4AF37]">
            Track Order
          </h1>

          <p className="mt-3 text-center text-zinc-400">
            Order #{order._id}
          </p>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">

            {/* Customer */}

            <div className="rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-8">

              <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
                <User className="text-[#D4AF37]" />
                Customer
              </h2>

              <p>{order.customer.name}</p>
              <p className="text-zinc-400">{order.customer.phone}</p>
              <p className="text-zinc-400">{order.customer.email}</p>

            </div>

            {/* Address */}

            <div className="rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-8">

              <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
                <MapPin className="text-[#D4AF37]" />
                Shipping Address
              </h2>

              <p>{order.address.address}</p>
              <p>
                {order.address.city}, {order.address.state}
              </p>
              <p>{order.address.pincode}</p>

            </div>

          </div>

          {/* Products */}

          <div className="mt-10 rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-8">

            <h2 className="mb-8 flex items-center gap-3 text-3xl font-bold text-white">
              <Package className="text-[#D4AF37]" />
              Ordered Products
            </h2>

            <div className="space-y-6">

              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-6 rounded-2xl border border-[#D4AF37]/10 p-5"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={100}
                    height={100}
                    className="rounded-xl"
                  />

                  <div className="flex-1">
                    <h3 className="text-xl font-bold">
                      {item.name}
                    </h3>

                    <p className="text-zinc-400">
                      Qty : {item.quantity}
                    </p>
                  </div>

                  <div className="text-[#D4AF37] text-xl font-bold">
                    ₹{item.price * item.quantity}
                  </div>

                </div>
              ))}

            </div>

          </div>

          {/* Payment */}

          <div className="mt-10 rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-8">

            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
              <CreditCard className="text-[#D4AF37]" />
              Payment & Status
            </h2>

            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <p className="text-zinc-500">Payment Method</p>
                <p>{order.paymentMethod}</p>
              </div>

              <div>
                <p className="text-zinc-500">Payment Status</p>
                <p className="text-green-400">
                  {order.paymentStatus}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">Order Status</p>
                <p className="text-[#D4AF37]">
                  {order.orderStatus}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">Grand Total</p>
                <p className="text-3xl font-bold text-[#D4AF37]">
                  ₹{order.total}
                </p>
              </div>

            </div>

          </div>

        </div>

      </main>

      <Footer />
    </>
  );
}