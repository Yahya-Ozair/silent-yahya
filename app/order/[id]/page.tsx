"use client";

import { useEffect, useState } from "react";

interface Order {
  id: string;
  name: string;
  status: string;

  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;

  trackingNumber?: string | null;

  createdAt: string;
  updatedAt: string;
}

const STEPS = [
  "SECURED",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
];

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const [token, setToken] =
    useState("");

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
  ==========================================
  LOAD ORDER
  ==========================================
  */

  useEffect(() => {
    async function loadOrder() {
      try {
        const { id } = await params;

        setToken(id);

        const response =
          await fetch(
            `/api/order/${id}`,
            {
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
              "Order not found."
          );
        }

        setOrder(data.order);

        setError("");
      } catch (err: any) {
        console.error(err);

        setError(
          err?.message ||
            "Unable to load order."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [params]);

  /*
  ==========================================
  AUTO REFRESH
  ==========================================
  */

  useEffect(() => {
    if (!token) return;

    const interval =
      setInterval(async () => {
        try {
          const response =
            await fetch(
              `/api/order/${token}`,
              {
                cache: "no-store",
              }
            );

          const data =
            await response.json();

          if (data.success) {
            setOrder(data.order);
          }
        } catch {
          // Ignore temporary refresh errors
        }
      }, 5000);

    return () =>
      clearInterval(interval);
  }, [token]);

  /*
  ==========================================
  HELPERS
  ==========================================
  */

  function isCompleted(
    step: string
  ) {
    if (!order) return false;

    const current =
      STEPS.indexOf(order.status);

    const target =
      STEPS.indexOf(step);

    return (
      current !== -1 &&
      current >= target
    );
  }

  function formatDate(
    date?: string
  ) {
    if (!date) return "—";

    return new Date(
      date
    ).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /*
  ==========================================
  LOADING
  ==========================================
  */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">

        <div className="text-center">

          <div className="mx-auto h-6 w-6 animate-spin rounded-full border border-white/20 border-t-white" />

          <p className="mt-5 text-[9px] uppercase tracking-[0.35em] text-white/30">
            Loading order
          </p>

        </div>

      </main>
    );
  }

  /*
  ==========================================
  ERROR
  ==========================================
  */

  if (!order || error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">

        <div className="text-center">

          <p className="text-[9px] uppercase tracking-[0.5em] text-white/30">
            Silent Yahya
          </p>

          <h1 className="mt-5 text-3xl font-light">
            Order Not Found
          </h1>

          <p className="mt-3 text-sm text-white/30">
            {error ||
              "This tracking link is invalid or expired."}
          </p>

        </div>

      </main>
    );
  }

  /*
  ==========================================
  MAIN
  ==========================================
  */

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* HEADER */}

      <header className="border-b border-white/10">

        <div className="mx-auto max-w-3xl px-6 py-7">

          <p className="text-[9px] uppercase tracking-[0.5em] text-white/30">
            Silent Yahya
          </p>

          <h1 className="mt-3 text-2xl font-light tracking-[0.08em]">
            Order Tracking
          </h1>

        </div>

      </header>

      <section className="mx-auto max-w-3xl px-6 py-12">

        {/* ORDER CARD */}

        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">

          <p className="text-[8px] uppercase tracking-[0.35em] text-white/25">
            HUSNAINS EDITION
          </p>

          <h2 className="mt-4 text-3xl font-extralight">
            Hello, {order.name}
          </h2>

          <p className="mt-3 text-sm text-white/35">
            Your order status updates
            automatically.
          </p>

          {/* STATUS TIMELINE */}

          <div className="mt-12">

            {STEPS.map(
              (step, index) => {

                const completed =
                  isCompleted(step);

                const active =
                  order.status === step;

                const nextCompleted =
                  index <
                    STEPS.length - 1
                    ? isCompleted(
                        STEPS[index + 1]
                      )
                    : false;

                return (
                  <div
                    key={step}
                    className="relative flex gap-5"
                  >

                    {/* LINE */}

                    {index <
                      STEPS.length - 1 && (
                      <div
                        className={`absolute left-[11px] top-7 h-16 w-px ${
                          nextCompleted
                            ? "bg-white/50"
                            : "bg-white/10"
                        }`}
                      />
                    )}

                    {/* DOT */}

                    <div
                      className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[9px] ${
                        completed
                          ? "border-white bg-white text-black"
                          : "border-white/15 text-white/20"
                      }`}
                    >
                      {completed
                        ? "✓"
                        : ""}
                    </div>

                    {/* LABEL */}

                    <div className="pb-10">

                      <p
                        className={`text-[10px] uppercase tracking-[0.25em] ${
                          active
                            ? "text-white"
                            : completed
                            ? "text-white/60"
                            : "text-white/20"
                        }`}
                      >
                        {step}
                      </p>

                      {active && (
                        <p className="mt-2 text-xs text-white/35">
                          Current status
                        </p>
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>

        {/* SHIPMENT */}

        {(order.status ===
          "SHIPPED" ||
          order.status ===
            "DELIVERED") && (

          <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.02] p-6">

            <p className="text-[8px] uppercase tracking-[0.3em] text-white/25">
              Shipment
            </p>

            <p className="mt-4 text-xs text-white/35">
              Tracking Number
            </p>

            <p className="mt-2 break-all text-lg font-light">
              {order.trackingNumber ||
                "Tracking number will be updated soon."}
            </p>

          </div>
        )}

        {/* DELIVERY */}

        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.02] p-6">

          <p className="text-[8px] uppercase tracking-[0.3em] text-white/25">
            Delivery Address
          </p>

          <div className="mt-5 space-y-2 text-sm text-white/45">

            <p>
              {order.address ||
                "Address unavailable"}
            </p>

            <p>
              {order.city || "—"}
              {order.state
                ? `, ${order.state}`
                : ""}
            </p>

            <p>
              {order.pincode || "—"}
            </p>

          </div>

        </div>

        {/* ORDER INFORMATION */}

        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.02] p-6">

          <p className="text-[8px] uppercase tracking-[0.3em] text-white/25">
            Order Information
          </p>

          <div className="mt-5 space-y-4">

            <Info
              label="Order ID"
              value={order.id}
            />

            <Info
              label="Created"
              value={formatDate(
                order.createdAt
              )}
            />

            <Info
              label="Last Updated"
              value={formatDate(
                order.updatedAt
              )}
            />

          </div>

        </div>

      </section>

    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-white/5 pb-4 last:border-0 last:pb-0 sm:flex-row sm:justify-between">

      <span className="text-[8px] uppercase tracking-[0.25em] text-white/20">
        {label}
      </span>

      <span className="break-all text-xs text-white/45 sm:max-w-[70%] sm:text-right">
        {value}
      </span>

    </div>
  );
}