"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

type OrderItem = {
  id: string | null;
  productId: string | null;
  name: string;
  image: string | null;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  orderId: string | null;

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
    country: string;
  };

  items: OrderItem[];

  quantity: number;
  subtotal: number;
  shipping: number;
  total: number;

  paymentMethod: string;
  paymentStatus: string;

  orderStatus: OrderStatus;

  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;

  isReservation: boolean;
  reservationId: string | null;
  releaseId: string | null;
  releaseName: string | null;

  createdAt: string | null;
  updatedAt: string | null;
};

const STATUSES: OrderStatus[] = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

function formatMoney(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(status: OrderStatus) {
  switch (status) {
    case "Pending":
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";

    case "Processing":
      return "border-blue-500/30 bg-blue-500/10 text-blue-300";

    case "Shipped":
      return "border-purple-500/30 bg-purple-500/10 text-purple-300";

    case "Delivered":
      return "border-green-500/30 bg-green-500/10 text-green-300";

    case "Cancelled":
      return "border-red-500/30 bg-red-500/10 text-red-300";

    default:
      return "border-white/10 bg-white/5 text-white";
  }
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const rawOrderId = params?.orderId;

  const orderId =
    Array.isArray(rawOrderId)
      ? rawOrderId[0]
      : rawOrderId;

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState(false);

  const [error, setError] =
    useState("");

  async function loadOrder() {
    if (!orderId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(
          orderId
        )}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error ||
            "Unable to load order."
        );
      }

      setOrder(data.order);
    } catch (err: any) {
      console.error(
        "Load order error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load order."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  async function updateStatus(
    newStatus: OrderStatus
  ) {
    if (!order) {
      return;
    }

    if (
      newStatus ===
      order.orderStatus
    ) {
      return;
    }

    try {
      setUpdating(true);
      setError("");

      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(
          order.id
        )}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.error ||
            "Unable to update order."
        );
      }

      setOrder(data.order);
    } catch (err: any) {
      console.error(
        "Update order status error:",
        err
      );

      setError(
        err?.message ||
          "Unable to update order."
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#030303] px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded bg-white/10" />

            <div className="h-32 rounded-2xl bg-white/5" />

            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-64 rounded-2xl bg-white/5" />
              <div className="h-64 rounded-2xl bg-white/5" />
            </div>

            <div className="h-80 rounded-2xl bg-white/5" />
          </div>
        </div>
      </main>
    );
  }

  if (error && !order) {
    return (
      <main className="min-h-screen bg-[#030303] px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={() =>
              router.push(
                "/admin/orders"
              )
            }
            className="mb-8 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            ← Back to Orders
          </button>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8">
            <h1 className="text-xl font-semibold text-red-300">
              Unable to load order
            </h1>

            <p className="mt-2 text-sm text-red-200/70">
              {error}
            </p>

            <button
              onClick={loadOrder}
              className="mt-6 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#030303] px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <button
            onClick={() =>
              router.push(
                "/admin/orders"
              )
            }
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            ← Back to Orders
          </button>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8">
            Order not found.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030303] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <button
              onClick={() =>
                router.push(
                  "/admin/orders"
                )
              }
              className="mb-4 text-sm text-white/50 transition hover:text-white"
            >
              ← Back to Orders
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Order Details
              </h1>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClass(
                  order.orderStatus
                )}`}
              >
                {order.orderStatus}
              </span>
            </div>

            <p className="mt-2 text-sm text-white/40">
              {order.orderId ||
                order.id}
            </p>
          </div>

          {/* STATUS CONTROL */}

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-white/40">
              Update Status
            </label>

            <select
              value={order.orderStatus}
              disabled={updating}
              onChange={(event) =>
                updateStatus(
                  event.target
                    .value as OrderStatus
                )
              }
              className="min-w-[190px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {STATUSES.map(
                (status) => (
                  <option
                    key={status}
                    value={status}
                    className="bg-[#111] text-white"
                  >
                    {status}
                  </option>
                )
              )}
            </select>

            {updating && (
              <p className="text-xs text-white/40">
                Updating...
              </p>
            )}
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ORDER SUMMARY */}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-wider text-white/40">
              Total
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {formatMoney(
                order.total
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-wider text-white/40">
              Payment
            </p>

            <p className="mt-2 text-lg font-medium">
              {order.paymentStatus}
            </p>

            <p className="mt-1 text-xs text-white/40">
              {order.paymentMethod}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-wider text-white/40">
              Items
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {order.quantity ||
                order.items.reduce(
                  (
                    total,
                    item
                  ) =>
                    total +
                    item.quantity,
                  0
                )}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-wider text-white/40">
              Ordered
            </p>

            <p className="mt-2 text-sm font-medium">
              {formatDate(
                order.createdAt
              )}
            </p>
          </div>
        </section>

        {/* CUSTOMER + ADDRESS */}

        <section className="mb-6 grid gap-6 lg:grid-cols-2">

          {/* CUSTOMER */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold">
              Customer
            </h2>

            <div className="mt-5 space-y-4">

              <div>
                <p className="text-xs text-white/40">
                  Name
                </p>

                <p className="mt-1 text-sm">
                  {order.customer.name ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-white/40">
                  Email
                </p>

                <p className="mt-1 break-all text-sm">
                  {order.customer.email ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-white/40">
                  Phone
                </p>

                <p className="mt-1 text-sm">
                  {order.customer.phone ||
                    "—"}
                </p>
              </div>
            </div>
          </div>

          {/* ADDRESS */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold">
              Delivery Address
            </h2>

            <div className="mt-5 text-sm leading-7 text-white/70">
              {order.address.address ||
                "—"}

              {(order.address.city ||
                order.address.state ||
                order.address.pincode) && (
                <>
                  <br />

                  {[
                    order.address.city,
                    order.address.state,
                    order.address.pincode,
                  ]
                    .filter(Boolean)
                    .join(
                      ", "
                    )}
                </>
              )}

              {order.address.country && (
                <>
                  <br />
                  {order.address.country}
                </>
              )}
            </div>
          </div>
        </section>

        {/* ITEMS */}

        <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Order Items
            </h2>

            <span className="text-sm text-white/40">
              {order.items.length}{" "}
              product
              {order.items.length !==
              1
                ? "s"
                : ""}
            </span>
          </div>

          <div className="mt-5 divide-y divide-white/10">

            {order.items.length ===
            0 ? (
              <div className="py-8 text-center text-sm text-white/40">
                No item information
                available.
              </div>
            ) : (
              order.items.map(
                (item, index) => (
                  <div
                    key={
                      item.id ||
                      item.productId ||
                      index
                    }
                    className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div className="flex items-center gap-4">

                      {item.image ? (
                        <img
                          src={
                            item.image
                          }
                          alt={
                            item.name
                          }
                          className="h-16 w-16 rounded-xl border border-white/10 object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs text-white/30">
                          No Image
                        </div>
                      )}

                      <div>
                        <p className="font-medium">
                          {item.name}
                        </p>

                        <p className="mt-1 text-sm text-white/40">
                          Qty:{" "}
                          {item.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="font-medium">
                        {formatMoney(
                          item.price *
                            item.quantity
                        )}
                      </p>

                      <p className="mt-1 text-xs text-white/40">
                        {formatMoney(
                          item.price
                        )}{" "}
                        each
                      </p>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </section>

        {/* BOTTOM GRID */}

        <section className="grid gap-6 lg:grid-cols-2">

          {/* PAYMENT */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold">
              Payment
            </h2>

            <div className="mt-5 space-y-4">

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-white/40">
                  Method
                </span>

                <span className="text-sm">
                  {order.paymentMethod}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-white/40">
                  Status
                </span>

                <span className="text-sm">
                  {order.paymentStatus}
                </span>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40">
                    Subtotal
                  </span>

                  <span className="text-sm">
                    {formatMoney(
                      order.subtotal
                    )}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-white/40">
                    Shipping
                  </span>

                  <span className="text-sm">
                    {formatMoney(
                      order.shipping
                    )}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="font-medium">
                    Total
                  </span>

                  <span className="text-xl font-semibold">
                    {formatMoney(
                      order.total
                    )}
                  </span>
                </div>
              </div>

              {order.razorpayOrderId && (
                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs text-white/40">
                    Razorpay Order ID
                  </p>

                  <p className="mt-1 break-all font-mono text-xs text-white/70">
                    {
                      order.razorpayOrderId
                    }
                  </p>
                </div>
              )}

              {order.razorpayPaymentId && (
                <div>
                  <p className="text-xs text-white/40">
                    Razorpay Payment ID
                  </p>

                  <p className="mt-1 break-all font-mono text-xs text-white/70">
                    {
                      order.razorpayPaymentId
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RESERVATION / RELEASE */}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold">
              Release Information
            </h2>

            {order.isReservation ||
            order.reservationId ||
            order.releaseId ? (
              <div className="mt-5 space-y-4">

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-white/40">
                    Reservation
                  </span>

                  <span className="text-sm">
                    Yes
                  </span>
                </div>

                {order.releaseName && (
                  <div>
                    <p className="text-xs text-white/40">
                      Release
                    </p>

                    <p className="mt-1 text-sm">
                      {
                        order.releaseName
                      }
                    </p>
                  </div>
                )}

                {order.reservationId && (
                  <div>
                    <p className="text-xs text-white/40">
                      Reservation ID
                    </p>

                    <p className="mt-1 break-all font-mono text-xs text-white/60">
                      {
                        order.reservationId
                      }
                    </p>
                  </div>
                )}

                {order.releaseId && (
                  <div>
                    <p className="text-xs text-white/40">
                      Release ID
                    </p>

                    <p className="mt-1 break-all font-mono text-xs text-white/60">
                      {
                        order.releaseId
                      }
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/40">
                This is a regular
                store order. No
                reservation information
                is attached.
              </div>
            )}
          </div>
        </section>

        {/* TIMESTAMPS */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold">
            Order Timeline
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">

            <div>
              <p className="text-xs text-white/40">
                Created
              </p>

              <p className="mt-1 text-sm">
                {formatDate(
                  order.createdAt
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/40">
                Last Updated
              </p>

              <p className="mt-1 text-sm">
                {formatDate(
                  order.updatedAt
                )}
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}