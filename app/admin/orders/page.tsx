"use client";

import { useEffect, useState } from "react";

type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

interface Customer {
  name?: string;
  email?: string;
  phone?: string;
}

interface Order {
  id: string;
  orderId: string | null;

  customer: Customer;

  total: number;

  paymentMethod: string;
  paymentStatus: string;

  orderStatus: OrderStatus;

  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;

  reservationId: string | null;
  releaseId: string | null;

  createdAt: string | null;
  updatedAt: string | null;
}

const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

function formatMoney(value: number) {
  return (
    "₹" +
    Number(value || 0).toLocaleString("en-IN")
  );
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

function getStatusClass(status: OrderStatus) {
  switch (status) {
    case "Pending":
      return "border-yellow-400/20 bg-yellow-400/5 text-yellow-300";

    case "Processing":
      return "border-blue-400/20 bg-blue-400/5 text-blue-300";

    case "Shipped":
      return "border-purple-400/20 bg-purple-400/5 text-purple-300";

    case "Delivered":
      return "border-emerald-400/20 bg-emerald-400/5 text-emerald-300";

    case "Cancelled":
      return "border-red-400/20 bg-red-400/5 text-red-300";

    default:
      return "border-white/10 bg-white/5 text-white/50";
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [updatingOrderId, setUpdatingOrderId] =
    useState<string | null>(null);

  async function loadOrders() {
    try {
      setError("");

      const params =
        new URLSearchParams();

      if (search.trim()) {
        params.set(
          "search",
          search.trim()
        );
      }

      if (statusFilter !== "All") {
        params.set(
          "status",
          statusFilter
        );
      }

      const query =
        params.toString();

      const url =
        "/api/admin/orders" +
        (query ? "?" + query : "");

      const response =
        await fetch(url, {
          method: "GET",
          cache: "no-store",
        });

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Unable to load orders."
        );
      }

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );
    } catch (err: any) {
      console.error(
        "Load orders error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load orders."
      );
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      try {
        setLoading(true);
        setError("");

        const params =
          new URLSearchParams();

        if (search.trim()) {
          params.set(
            "search",
            search.trim()
          );
        }

        if (
          statusFilter !== "All"
        ) {
          params.set(
            "status",
            statusFilter
          );
        }

        const query =
          params.toString();

        const response =
          await fetch(
            "/api/admin/orders" +
              (query
                ? "?" + query
                : ""),
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.error ||
              "Unable to load orders."
          );
        }

        if (!cancelled) {
          setOrders(
            Array.isArray(
              data.orders
            )
              ? data.orders
              : []
          );
        }
      } catch (err: any) {
        console.error(
          "Initial orders error:",
          err
        );

        if (!cancelled) {
          setError(
            err?.message ||
              "Unable to load orders."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      cancelled = true;
    };
  }, [search, statusFilter]);

  async function handleRefresh() {
    try {
      setRefreshing(true);

      await loadOrders();
    } finally {
      setRefreshing(false);
    }
  }

  async function updateOrderStatus(
    order: Order,
    newStatus: OrderStatus
  ) {
    if (
      order.orderStatus ===
      newStatus
    ) {
      return;
    }

    try {
      setUpdatingOrderId(
        order.id
      );

      setError("");

      const response =
        await fetch(
          "/api/admin/orders",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              id: order.id,
              status: newStatus,
            }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Unable to update order status."
        );
      }

      const updatedOrder =
        data.order;

      setOrders(
        (currentOrders) =>
          currentOrders.map(
            (currentOrder) =>
              currentOrder.id ===
              order.id
                ? updatedOrder
                : currentOrder
          )
      );
    } catch (err: any) {
      console.error(
        "Update order error:",
        err
      );

      setError(
        err?.message ||
          "Unable to update order status."
      );
    } finally {
      setUpdatingOrderId(
        null
      );
    }
  }

  const securedCount =
    orders.filter(
      (order) =>
        order.paymentStatus ===
        "Paid"
    ).length;

  const deliveredCount =
    orders.filter(
      (order) =>
        order.orderStatus ===
        "Delivered"
    ).length;

  const pendingCount =
    orders.filter(
      (order) =>
        order.orderStatus ===
        "Pending"
    ).length;

  return (
    <main className="min-h-screen bg-[#030303] text-white">
      <div className="mx-auto w-full max-w-7xl px-5 py-10">

        {/* HEADER */}

        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="text-[9px] uppercase tracking-[0.55em] text-[#D4AF37]/60">
              SILENT YAHYA
            </p>

            <h1 className="mt-3 text-4xl font-extralight tracking-wide">
              Orders
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/30">
              Manage customer orders,
              payments and delivery
              status from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleRefresh
            }
            disabled={refreshing}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3 text-[9px] uppercase tracking-[0.25em] text-white/50 transition hover:bg-white/[0.06] disabled:opacity-40"
          >
            {refreshing
              ? "Refreshing..."
              : "↻ Refresh Orders"}
          </button>

        </div>

        {/* SUMMARY */}

        <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">

          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
              Orders
            </p>

            <p className="mt-3 text-3xl font-extralight">
              {orders.length}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
              Paid
            </p>

            <p className="mt-3 text-3xl font-extralight text-emerald-300">
              {securedCount}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
              Pending
            </p>

            <p className="mt-3 text-3xl font-extralight text-yellow-300">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-[8px] uppercase tracking-[0.25em] text-white/25">
              Delivered
            </p>

            <p className="mt-3 text-3xl font-extralight text-[#D4AF37]">
              {deliveredCount}
            </p>
          </div>

        </div>

        {/* FILTERS */}

        <div className="mt-7 rounded-3xl border border-white/10 bg-white/[0.025] p-5">

          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search order ID, customer, email, phone or Razorpay ID..."
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#D4AF37]/40"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="rounded-2xl border border-white/10 bg-[#111] px-5 py-4 text-sm text-white outline-none focus:border-[#D4AF37]/40"
            >
              <option value="All">
                All statuses
              </option>

              {ORDER_STATUSES.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
            ⚠️ {error}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="mt-7 rounded-3xl border border-white/10 bg-white/[0.025] p-20 text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#D4AF37]" />

            <p className="mt-6 text-[9px] uppercase tracking-[0.35em] text-white/25">
              Loading orders
            </p>

          </div>
        ) : orders.length === 0 ? (
          /* EMPTY */

          <div className="mt-7 rounded-3xl border border-white/10 bg-white/[0.025] p-20 text-center">

            <div className="text-5xl">
              📦
            </div>

            <h2 className="mt-6 text-2xl font-light">
              No orders found
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/30">
              No orders match your
              current search or
              status filter.
            </p>

          </div>
        ) : (
          /* ORDERS */

          <div className="mt-7 space-y-5">

            {orders.map(
              (order) => (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]"
                >

                  {/* ORDER HEADER */}

                  <div className="p-5 sm:p-7">

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-3">

                          <p className="font-mono text-sm text-white/70">
                            {order.orderId ||
                              order.id}
                          </p>

                          <span
                            className={
                              "rounded-full border px-3 py-1 text-[7px] uppercase tracking-[0.2em] " +
                              getStatusClass(
                                order.orderStatus
                              )
                            }
                          >
                            {
                              order.orderStatus
                            }
                          </span>

                        </div>

                        <h2 className="mt-4 text-xl font-light">
                          {order.customer
                            ?.name ||
                            "Unnamed Customer"}
                        </h2>

                        <div className="mt-3 space-y-1">

                          <p className="text-xs text-white/35">
                            {order.customer
                              ?.email ||
                              "No email"}
                          </p>

                          <p className="text-xs text-white/25">
                            {order.customer
                              ?.phone ||
                              "No phone"}
                          </p>

                        </div>

                        <p className="mt-4 text-[8px] uppercase tracking-[0.2em] text-white/15">
                          Created{" "}
                          {formatDate(
                            order.createdAt
                          )}
                        </p>

                      </div>

                      {/* TOTAL */}

                      <div className="lg:text-right">

                        <p className="text-3xl font-extralight text-[#D4AF37]">
                          {formatMoney(
                            order.total
                          )}
                        </p>

                        <p className="mt-2 text-[8px] uppercase tracking-[0.2em] text-white/30">
                          Payment:{" "}
                          {
                            order.paymentStatus
                          }
                        </p>

                        <p className="mt-1 text-[8px] uppercase tracking-[0.2em] text-white/20">
                          {
                            order.paymentMethod
                          }
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* STATUS CONTROL */}

                  <div className="border-t border-white/10 bg-black/20 p-5 sm:p-7">

                    <p className="mb-4 text-[8px] uppercase tracking-[0.3em] text-white/20">
                      Order Status
                    </p>

                    <div className="flex flex-wrap gap-2">

                      {ORDER_STATUSES.map(
                        (status) => {
                          const active =
                            order.orderStatus ===
                            status;

                          const updating =
                            updatingOrderId ===
                            order.id;

                          return (
                            <button
                              key={
                                status
                              }
                              type="button"
                              disabled={
                                updating
                              }
                              onClick={() =>
                                updateOrderStatus(
                                  order,
                                  status
                                )
                              }
                              className={
                                "rounded-xl border px-4 py-3 text-[8px] uppercase tracking-[0.15em] transition " +
                                (active
                                  ? "border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]"
                                  : "border-white/10 bg-white/[0.02] text-white/35 hover:bg-white/[0.06]") +
                                (updating
                                  ? " cursor-not-allowed opacity-40"
                                  : "")
                              }
                            >
                              {updating &&
                              active
                                ? "Saving..."
                                : status}
                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>

                  {/* PAYMENT DETAILS */}

                  {(order.razorpayOrderId ||
                    order.razorpayPaymentId) && (
                    <div className="border-t border-white/10 p-5 sm:p-7">

                      <p className="text-[8px] uppercase tracking-[0.3em] text-white/20">
                        Razorpay Details
                      </p>

                      {order.razorpayOrderId && (
                        <div className="mt-4">

                          <p className="text-[7px] uppercase tracking-[0.2em] text-white/15">
                            Razorpay Order ID
                          </p>

                          <p className="mt-1 break-all font-mono text-[10px] text-white/35">
                            {
                              order.razorpayOrderId
                            }
                          </p>

                        </div>
                      )}

                      {order.razorpayPaymentId && (
                        <div className="mt-4">

                          <p className="text-[7px] uppercase tracking-[0.2em] text-white/15">
                            Razorpay Payment ID
                          </p>

                          <p className="mt-1 break-all font-mono text-[10px] text-white/35">
                            {
                              order.razorpayPaymentId
                            }
                          </p>

                        </div>
                      )}

                    </div>
                  )}

                  {/* RESERVATION INFO */}

                  {(order.reservationId ||
                    order.releaseId) && (
                    <div className="border-t border-white/10 p-5 sm:p-7">

                      <p className="text-[8px] uppercase tracking-[0.3em] text-[#D4AF37]/50">
                        Silent Yahya Release
                      </p>

                      {order.reservationId && (
                        <div className="mt-4">

                          <p className="text-[7px] uppercase tracking-[0.2em] text-white/15">
                            Reservation ID
                          </p>

                          <p className="mt-1 break-all font-mono text-[10px] text-white/30">
                            {
                              order.reservationId
                            }
                          </p>

                        </div>
                      )}

                      {order.releaseId && (
                        <div className="mt-4">

                          <p className="text-[7px] uppercase tracking-[0.2em] text-white/15">
                            Release ID
                          </p>

                          <p className="mt-1 break-all font-mono text-[10px] text-white/30">
                            {
                              order.releaseId
                            }
                          </p>

                        </div>
                      )}

                    </div>
                  )}

                </div>
              )
            )}

          </div>
        )}

      </div>
    </main>
  );
}