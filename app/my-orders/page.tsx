"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  _id: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
};

export default function MyOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await fetch("/api/my-orders");
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
        Loading Orders...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] py-24 px-6">

      <div className="mx-auto max-w-6xl">

        <h1 className="text-5xl font-bold text-[#D4AF37]">
          My Orders
        </h1>

        <p className="mt-3 text-zinc-400">
          Track all your purchases.
        </p>

        {orders.length === 0 && (

          <div className="mt-16 rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-12 text-center">

            <h2 className="text-3xl font-bold text-white">
              No Orders Yet
            </h2>

            <p className="mt-4 text-zinc-400">
              Start shopping to see your orders here.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-block rounded-full bg-[#D4AF37] px-8 py-4 font-bold text-black"
            >
              Shop Now
            </Link>

          </div>

        )}

        <div className="mt-12 space-y-8">

          {orders.map((order) => (

            <div
              key={order._id}
              className="rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-8"
            >

              <div className="flex flex-col justify-between gap-8 lg:flex-row">

                <div>

                  <p className="text-sm uppercase tracking-[4px] text-[#D4AF37]">
                    Order ID
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-white break-all">
                    {order._id}
                  </h2>

                  <p className="mt-4 text-zinc-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>

                </div>

                <div>

                  <p className="text-sm uppercase tracking-[4px] text-[#D4AF37]">
                    Total
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-[#D4AF37]">
                    ₹{order.total}
                  </h2>

                </div>

                <div>

                  <p className="text-sm uppercase tracking-[4px] text-[#D4AF37]">
                    Order Status
                  </p>

                  <span className="mt-3 inline-block rounded-full bg-[#D4AF37]/20 px-4 py-2 font-semibold text-[#D4AF37]">
                    {order.orderStatus}
                  </span>

                </div>

                <div>

                  <p className="text-sm uppercase tracking-[4px] text-[#D4AF37]">
                    Payment
                  </p>

                  <span className="mt-3 inline-block rounded-full bg-green-500/20 px-4 py-2 font-semibold text-green-400">
                    {order.paymentStatus}
                  </span>

                </div>

              </div>

              <div className="mt-8 flex flex-wrap gap-4">

                <Link
                  href={`/admin/orders/${order._id}`}
                  className="rounded-full bg-[#D4AF37] px-6 py-3 font-bold text-black"
                >
                  View Details
                </Link>

                <Link
                  href={`/invoice/${order._id}`}
                  className="rounded-full border border-[#D4AF37] px-6 py-3 text-white transition hover:bg-[#D4AF37] hover:text-black"
                >
                  Invoice
                </Link>

                <Link
                  href="/track-order"
                  className="rounded-full border border-[#D4AF37] px-6 py-3 text-white transition hover:bg-[#D4AF37] hover:text-black"
                >
                  Track Order
                </Link>

              </div>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}