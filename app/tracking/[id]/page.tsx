"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Reservation = {
  id: string;

  name: string;
  email: string;
  phone: string;

  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;

  price: number;

  status: string;
  orderStatus: string;
  paymentStatus: string;

  slotNumber: number | null;
  slotName: string | null;

  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;

  expiresAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type ApiResponse = {
  success: boolean;
  reservation?: Reservation;
  error?: string;
};

export default function TrackingPage() {
  const params = useParams<{ id: string }>();

  const reservationId = params?.id || "";

  const [reservation, setReservation] =
    useState<Reservation | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadReservation = useCallback(
    async (silent = false) => {
      if (!reservationId) {
        setError("Reservation ID is missing.");
        setLoading(false);
        return;
      }

      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await fetch(
          `/api/reservation/${encodeURIComponent(
            reservationId
          )}?t=${Date.now()}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );

        const data: ApiResponse =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              "Reservation not found."
          );
        }

        if (!data.reservation) {
          throw new Error(
            "Reservation data is unavailable."
          );
        }

        setReservation(data.reservation);
        setError("");
      } catch (err: unknown) {
        console.error(
          "Tracking error:",
          err
        );

        if (!silent) {
          const message =
            err instanceof Error
              ? err.message
              : "Unable to load reservation.";

          setError(message);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [reservationId]
  );

  useEffect(() => {
    if (!reservationId) {
      return;
    }

    loadReservation(false);

    const interval = window.setInterval(() => {
      loadReservation(true);
    }, 2000);

    const handleFocus = () => {
      loadReservation(true);
    };

    const handleVisibility = () => {
      if (
        document.visibilityState ===
        "visible"
      ) {
        loadReservation(true);
      }
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      window.clearInterval(interval);

      window.removeEventListener(
        "focus",
        handleFocus
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [
    reservationId,
    loadReservation,
  ]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />

          <p className="text-sm text-white/60">
            Loading your reservation...
          </p>
        </div>
      </main>
    );
  }

  if (error || !reservation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 text-5xl">
            ✦
          </div>

          <h1 className="text-2xl font-semibold">
            Reservation not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/50">
            {error ||
              "We couldn't find this reservation."}
          </p>

          <button
            type="button"
            onClick={() =>
              loadReservation(false)
            }
            className="mt-8 rounded-full border border-white/20 px-6 py-3 text-sm transition hover:bg-white hover:text-black"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const paymentStatus =
    reservation.paymentStatus || "Pending";

  const orderStatus =
    reservation.orderStatus || "Pending";

  const isPaid =
    paymentStatus === "Paid";

  const isSecured =
    reservation.status === "SECURED";

  const isShipped =
    orderStatus === "Shipped" ||
    orderStatus === "Delivered";

  const isDelivered =
    orderStatus === "Delivered";

  const isProcessing =
    orderStatus === "Pending" ||
    orderStatus === "Processing" ||
    orderStatus === "Shipped" ||
    orderStatus === "Delivered";

  const isCancelled =
    orderStatus === "Cancelled";

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-5xl px-5 py-10 md:px-8 md:py-16">

        <header className="mb-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/40">
            Silent Yahya
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            Reservation Tracking
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/50">
            Your private reservation details,
            collector slot and order progress.
          </p>

          {refreshing && (
            <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-white/30">
              Updating...
            </p>
          )}
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                Reservation
              </p>

              <p className="mt-2 break-all font-mono text-xs text-white/50">
                {reservation.id}
              </p>
            </div>

            <div
              className={`inline-flex w-fit rounded-full px-4 py-2 text-xs font-medium ${
                isCancelled
                  ? "bg-red-500/10 text-red-400"
                  : isSecured
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-yellow-500/10 text-yellow-400"
              }`}
            >
              {isCancelled
                ? "ORDER CANCELLED"
                : isSecured
                ? "RESERVATION SECURED"
                : reservation.status}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">

            <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                Collector Slot
              </p>

              <p className="mt-3 text-3xl font-semibold">
                {reservation.slotName ||
                  "Assigning..."}
              </p>

              {reservation.slotNumber && (
                <p className="mt-2 text-sm text-white/40">
                  Slot #{reservation.slotNumber}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                Payment
              </p>

              <p
                className={`mt-3 text-3xl font-semibold ${
                  isPaid
                    ? "text-emerald-400"
                    : "text-yellow-400"
                }`}
              >
                {paymentStatus}
              </p>

              <p className="mt-2 text-sm text-white/40">
                ₹
                {Number(
                  reservation.price || 0
                ).toLocaleString("en-IN")}
              </p>
            </div>

          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">

          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
            Order Progress
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            {orderStatus}
          </h2>

          <div className="mt-8 grid grid-cols-4 gap-2">

            <ProgressStep
              title="Processing"
              active={isProcessing}
              completed={
                orderStatus ===
                  "Shipped" ||
                orderStatus ===
                  "Delivered"
              }
            />

            <ProgressStep
              title="Confirmed"
              active={
                orderStatus ===
                  "Shipped" ||
                orderStatus ===
                  "Delivered"
              }
              completed={
                orderStatus ===
                  "Shipped" ||
                orderStatus ===
                  "Delivered"
              }
            />

            <ProgressStep
              title="Shipped"
              active={isShipped}
              completed={isDelivered}
            />

            <ProgressStep
              title="Delivered"
              active={isDelivered}
              completed={isDelivered}
            />

          </div>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-2">

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
              Customer
            </p>

            <div className="mt-5 space-y-4">

              <InfoRow
                label="Name"
                value={reservation.name}
              />

              <InfoRow
                label="Email"
                value={reservation.email}
              />

              <InfoRow
                label="Phone"
                value={reservation.phone}
              />

            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
              Delivery
            </p>

            <div className="mt-5">

              <p className="whitespace-pre-line text-sm leading-6 text-white/80">
                {reservation.address ||
                  "Address not available"}
              </p>

              <p className="mt-3 text-sm text-white/50">
                {reservation.city}
                {reservation.city &&
                reservation.state
                  ? ", "
                  : ""}
                {reservation.state}
              </p>

              <p className="mt-1 text-sm text-white/50">
                {reservation.pincode}
                {reservation.pincode &&
                reservation.country
                  ? ", "
                  : ""}
                {reservation.country}
              </p>

            </div>
          </div>

        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">

          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
            Payment Details
          </p>

          <div className="mt-6 space-y-4">

            <InfoRow
              label="Payment Status"
              value={paymentStatus}
            />

            <InfoRow
              label="Razorpay Order"
              value={
                reservation.razorpayOrderId ||
                "Not available"
              }
            />

            <InfoRow
              label="Payment ID"
              value={
                reservation.razorpayPaymentId ||
                "Not available"
              }
            />

          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">

          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">
            Reservation Details
          </p>

          <div className="mt-6 space-y-4">

            <InfoRow
              label="Reservation ID"
              value={reservation.id}
            />

            <InfoRow
              label="Created"
              value={
                reservation.createdAt
                  ? new Date(
                      reservation.createdAt
                    ).toLocaleString(
                      "en-IN"
                    )
                  : "—"
              }
            />

            <InfoRow
              label="Last Updated"
              value={
                reservation.updatedAt
                  ? new Date(
                      reservation.updatedAt
                    ).toLocaleString(
                      "en-IN"
                    )
                  : "—"
              }
            />

            <InfoRow
              label="Current Order Status"
              value={orderStatus}
            />

          </div>
        </section>

        <footer className="mt-12 text-center">

          <p className="text-xs text-white/30">
            Tracking updates automatically.
          </p>

          <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/20">
            Silent Yahya
          </p>

        </footer>

      </div>
    </main>
  );
}

function ProgressStep({
  title,
  active,
  completed,
}: {
  title: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="text-center">

      <div className="flex items-center justify-center">

        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs ${
            active
              ? "border-white bg-white text-black"
              : "border-white/20 text-white/30"
          }`}
        >
          {completed ? "✓" : ""}
        </div>

      </div>

      <p
        className={`mt-3 text-[9px] uppercase tracking-wider ${
          active
            ? "text-white"
            : "text-white/30"
        }`}
      >
        {title}
      </p>

    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/5 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">

      <span className="text-xs text-white/35">
        {label}
      </span>

      <span className="break-all text-sm text-white/75 sm:text-right">
        {value}
      </span>

    </div>
  );
}