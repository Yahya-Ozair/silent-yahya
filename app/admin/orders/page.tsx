"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Order = {
  _id: string;

  customer?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };

  address?: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };

  total?: number;
  subtotal?: number;
  shipping?: number;

  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;

  createdAt: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await fetch("/api/orders/get");
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading Orders...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] p-10 text-white">
      <div className="mx-auto max-w-7xl">

        <h1 className="mb-10 text-5xl font-bold text-[#D4AF37]">
          Customer Orders
        </h1>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-10 text-center text-zinc-400">
            No Orders Found
          </div>
        ) : (
          <div className="space-y-6">

            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-3xl border border-[#D4AF37]/20 bg-[#111] p-8"
              >
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

                  <div>
                    <p className="text-sm text-zinc-500">
                      Customer
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-white">
                      {order.customer?.name || "Unknown Customer"}
                    </h3>

                    <p className="mt-2 text-zinc-400">
                      {order.customer?.phone || "-"}
                    </p>

                    <p className="text-zinc-400">
                      {order.customer?.email || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-500">
                      Address
                    </p>

                    <p className="mt-2 text-zinc-300">
                      {order.address?.address ||
                        order.customer?.address ||
                        "-"}
                    </p>

                    <p className="text-zinc-400">
                      {order.address?.city ||
                        order.customer?.city ||
                        ""}
                    </p>

                    <p className="text-zinc-400">
                      {order.address?.state ||
                        order.customer?.state ||
                        ""}
                    </p>

                    <p className="text-zinc-400">
                      {order.address?.pincode ||
                        order.customer?.pincode ||
                        ""}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-500">
                      Payment
                    </p>

                    <p className="mt-2 font-semibold text-[#D4AF37]">
                      {order.paymentMethod || "-"}
                    </p>

                    <p className="mt-2 text-green-400">
                      {order.paymentStatus || "-"}
                    </p>

                    <p className="mt-2 text-white">
                      ₹
                      {order.total ??
                        ((order.subtotal || 0) +
                          (order.shipping || 0))}
  </p>
                  </div>

                  <div className="flex flex-col items-end">

                    <p className="text-sm font-medium text-zinc-500">
                      Order Status
                    </p>

                    <select
                      value={order.orderStatus || "Pending"}
                      onChange={async (e) => {
                        const status = e.target.value;

                        const res = await fetch("/api/orders/update", {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            id: order._id,
                            orderStatus: status,
                          }),
                        });

                        const data = await res.json();

                        if (data.success) {
                          setOrders((prev) =>
                            prev.map((o) =>
                              o._id === order._id
                                ? {
                                    ...o,
                                    orderStatus: status,
                                  }
                                : o
                            )
                          );
                        } else {
                          alert("Failed to update order.");
                        }
                      }}
                      className={`mt-2 rounded-xl border px-4 py-2 font-semibold outline-none transition
                        ${
                          order.orderStatus === "Delivered"
                            ? "border-green-500 bg-green-500/20 text-green-400"
                            : order.orderStatus === "Cancelled"
                            ? "border-red-500 bg-red-500/20 text-red-400"
                            : order.orderStatus === "Shipped"
                            ? "border-purple-500 bg-purple-500/20 text-purple-400"
                            : order.orderStatus === "Processing"
                            ? "border-blue-500 bg-blue-500/20 text-blue-400"
                            : "border-yellow-500 bg-yellow-500/20 text-yellow-400"
                        }`}
                    >
                      <option value="Pending">🟡 Pending</option>
                      <option value="Processing">🔵 Processing</option>
                      <option value="Shipped">🟣 Shipped</option>
                      <option value="Delivered">🟢 Delivered</option>
                      <option value="Cancelled">🔴 Cancelled</option>
                    </select>

                    <p className="mt-4 text-sm text-zinc-400">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>

                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="mt-5 rounded-xl bg-[#D4AF37] px-5 py-2 text-sm font-bold text-black transition hover:scale-105 hover:shadow-lg"
                    >
                      View Details →
                    </Link>

                  </div>

                </div>
              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}