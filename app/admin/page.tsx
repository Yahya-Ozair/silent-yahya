"use client";

import { useEffect, useMemo, useState } from "react";

interface Reservation {
  _id: string;
  releaseId: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  trackingNumber?: string | null;
}

const STATUS_OPTIONS = [
  "PENDING",
  "RESERVED",
  "SECURED",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");

  async function loadReservations() {
    try {
      const res = await fetch(
        `/api/reservation?t=${Date.now()}`,
        { cache: "no-store" }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || "Unable to load reservations."
        );
      }

      setReservations(data.reservations || []);
      setError("");
    } catch (err: any) {
      setError(err?.message || "Unable to load reservations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReservations();

    const interval = setInterval(loadReservations, 5000);

    return () => clearInterval(interval);
  }, []);

  async function updateStatus(
    reservationId: string,
    status: string
  ) {
    try {
      setUpdating(reservationId);
      setError("");

      const body: {
        reservationId: string;
        status: string;
        trackingNumber?: string;
      } = {
        reservationId,
        status,
      };

      if (status === "SHIPPED") {
        body.trackingNumber =
          trackingNumber.trim();
      }

      const res = await fetch(
        "/api/reservation/status",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error || "Unable to update status."
        );
      }

      setReservations((current) =>
        current.map((item) =>
          item._id === reservationId
            ? data.reservation
            : item
        )
      );

      setSelected(data.reservation);

      setTrackingNumber(
        data.reservation.trackingNumber || ""
      );
    } catch (err: any) {
      setError(
        err?.message || "Unable to update status."
      );
    } finally {
      setUpdating("");
    }
  }

  const filteredReservations = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return reservations;

    return reservations.filter((r) =>
      [
        r.name,
        r.email,
        r.phone,
        r.city,
        r.state,
        r.pincode,
        r.status,
        r.trackingNumber,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(q)
        )
    );
  }, [reservations, search]);

  const total = reservations.length;

  const secured = reservations.filter(
    (r) => r.status === "SECURED"
  ).length;

  const pending = reservations.filter(
    (r) =>
      r.status === "PENDING" ||
      r.status === "RESERVED"
  ).length;

  const shipped = reservations.filter(
    (r) => r.status === "SHIPPED"
  ).length;

  const delivered = reservations.filter(
    (r) => r.status === "DELIVERED"
  ).length;

  function formatDate(date?: string) {
    if (!date) return "—";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  function statusStyle(status: string) {
    switch (status) {
      case "SECURED":
      case "DELIVERED":
        return "border-emerald-400/20 bg-emerald-400/5 text-emerald-300";

      case "SHIPPED":
        return "border-blue-400/20 bg-blue-400/5 text-blue-300";

      case "CONFIRMED":
      case "PACKED":
        return "border-purple-400/20 bg-purple-400/5 text-purple-300";

      case "PENDING":
      case "RESERVED":
        return "border-yellow-400/20 bg-yellow-400/5 text-yellow-300";

      case "CANCELLED":
        return "border-red-400/20 bg-red-400/5 text-red-300";

      default:
        return "border-white/10 bg-white/5 text-white/40";
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* HEADER */}

      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">

          <div>
            <p className="text-[9px] uppercase tracking-[0.5em] text-white/30">
              Silent Yahya
            </p>

            <h1 className="mt-2 text-2xl font-light tracking-[0.08em]">
              ADMIN
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>

            <span className="text-[9px] uppercase tracking-[0.25em] text-white/35">
              Live
            </span>
          </div>

        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* TITLE */}

        <div className="mb-10">
          <p className="text-[9px] uppercase tracking-[0.4em] text-white/25">
            Release Management
          </p>

          <h2 className="mt-3 text-4xl font-extralight">
            Orders
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/35">
            Manage reservations, payments and
            fulfillment from one place.
          </p>
        </div>

        {/* STATS */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <Stat label="Total" value={total} />

          <Stat label="Secured" value={secured} />

          <Stat label="Pending" value={pending} />

          <Stat label="Shipped" value={shipped} />

          <Stat label="Delivered" value={delivered} />

        </div>

        {/* SEARCH */}

        <div className="mt-10 flex gap-3">

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search customer, phone, city, pincode..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4 text-sm outline-none placeholder:text-white/20 focus:border-white/25"
          />

          <button
            onClick={loadReservations}
            className="rounded-2xl border border-white/10 px-6 text-[9px] uppercase tracking-[0.25em] text-white/40 hover:bg-white/5 hover:text-white"
          >
            Refresh
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading ? (

          <div className="mt-8 rounded-3xl border border-white/10 p-12 text-center">
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/25">
              Loading orders...
            </p>
          </div>

        ) : (

          <div className="mt-8 space-y-4">

            {filteredReservations.map((reservation) => (

              <div
                key={reservation._id}
                className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6"
              >

                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                  {/* CUSTOMER */}

                  <button
                    onClick={() => {
                      setSelected(reservation);
                      setTrackingNumber(
                        reservation.trackingNumber || ""
                      );
                    }}
                    className="text-left"
                  >

                    <div className="flex flex-wrap items-center gap-3">

                      <h3 className="text-lg font-light">
                        {reservation.name}
                      </h3>

                      <span
                        className={`rounded-full border px-3 py-1 text-[8px] uppercase tracking-[0.2em] ${statusStyle(
                          reservation.status
                        )}`}
                      >
                        {reservation.status}
                      </span>

                    </div>

                    <p className="mt-2 text-xs text-white/35">
                      {reservation.phone}
                      {" · "}
                      {reservation.email}
                    </p>

                    <p className="mt-2 text-xs text-white/25">
                      {reservation.city || "—"}
                      {reservation.state
                        ? `, ${reservation.state}`
                        : ""}
                      {reservation.pincode
                        ? ` · ${reservation.pincode}`
                        : ""}
                    </p>

                  </button>

                  {/* STATUS */}

                  <div className="flex flex-col gap-2 lg:min-w-[220px]">

                    <label className="text-[8px] uppercase tracking-[0.25em] text-white/20">
                      Update Status
                    </label>

                    <select
                      value={reservation.status}
                      disabled={
                        updating ===
                        reservation._id
                      }
                      onChange={(e) => {

                        const nextStatus =
                          e.target.value;

                        setSelected(reservation);

                        setTrackingNumber(
                          reservation.trackingNumber ||
                            ""
                        );

                        if (
                          nextStatus !==
                          "SHIPPED"
                        ) {
                          updateStatus(
                            reservation._id,
                            nextStatus
                          );
                        }

                      }}
                      className="rounded-xl border border-white/10 bg-[#0c0c0c] px-4 py-3 text-xs text-white outline-none"
                    >

                      {STATUS_OPTIONS.map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {/* DATE */}

                  <div className="lg:min-w-[170px] lg:text-right">

                    <p className="text-[8px] uppercase tracking-[0.25em] text-white/20">
                      Created
                    </p>

                    <p className="mt-2 text-xs text-white/35">
                      {formatDate(
                        reservation.createdAt
                      )}
                    </p>

                  </div>

                </div>

              </div>

            ))}

            {filteredReservations.length === 0 && (
              <div className="rounded-3xl border border-white/10 p-12 text-center text-[9px] uppercase tracking-[0.3em] text-white/25">
                No orders found
              </div>
            )}

          </div>

        )}

      </section>

      {/* DETAIL MODAL */}

      {selected && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-md"
          onClick={() => setSelected(null)}
        >

          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 sm:p-8"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="flex items-start justify-between">

              <div>
                <p className="text-[8px] uppercase tracking-[0.35em] text-white/25">
                  Order Details
                </p>

                <h2 className="mt-3 text-3xl font-light">
                  {selected.name}
                </h2>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="text-2xl text-white/30 hover:text-white"
              >
                ×
              </button>

            </div>

            <div className="mt-5">
              <span
                className={`rounded-full border px-4 py-2 text-[8px] uppercase tracking-[0.25em] ${statusStyle(
                  selected.status
                )}`}
              >
                {selected.status}
              </span>
            </div>

            <Detail title="Customer">

              <Row label="Name" value={selected.name} />

              <Row label="Email" value={selected.email} />

              <Row label="Phone" value={selected.phone} />

            </Detail>

            <Detail title="Delivery">

              <Row
                label="Address"
                value={
                  selected.address ||
                  "Not available"
                }
              />

              <Row
                label="City"
                value={
                  selected.city ||
                  "Not available"
                }
              />

              <Row
                label="State"
                value={
                  selected.state ||
                  "Not available"
                }
              />

              <Row
                label="Pincode"
                value={
                  selected.pincode ||
                  "Not available"
                }
              />

            </Detail>

            <Detail title="Fulfillment">

              <Row
                label="Status"
                value={selected.status}
              />

              <Row
                label="Tracking Number"
                value={
                  selected.trackingNumber ||
                  "Not assigned"
                }
              />

            </Detail>

            {/* SHIPPING */}

            <div className="mt-8">

              <p className="mb-4 text-[8px] uppercase tracking-[0.3em] text-white/25">
                Shipping
              </p>

              <input
                value={trackingNumber}
                onChange={(e) =>
                  setTrackingNumber(
                    e.target.value
                  )
                }
                placeholder="Enter courier tracking number"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 text-sm outline-none placeholder:text-white/20 focus:border-white/25"
              />

              <button
                disabled={
                  updating ===
                  selected._id ||
                  !trackingNumber.trim()
                }
                onClick={() =>
                  updateStatus(
                    selected._id,
                    "SHIPPED"
                  )
                }
                className="mt-3 w-full rounded-2xl bg-white px-5 py-4 text-[9px] font-medium uppercase tracking-[0.25em] text-black disabled:cursor-not-allowed disabled:opacity-30"
              >
                Mark as Shipped
              </button>

            </div>

            {/* QUICK STATUS */}

            <div className="mt-8">

              <p className="mb-4 text-[8px] uppercase tracking-[0.3em] text-white/25">
                Quick Status
              </p>

              <div className="grid grid-cols-2 gap-2">

                {[
                  "CONFIRMED",
                  "PACKED",
                  "DELIVERED",
                  "CANCELLED",
                ].map((status) => (

                  <button
                    key={status}
                    disabled={
                      updating ===
                      selected._id
                    }
                    onClick={() =>
                      updateStatus(
                        selected._id,
                        status
                      )
                    }
                    className="rounded-xl border border-white/10 px-4 py-3 text-[8px] uppercase tracking-[0.2em] text-white/40 hover:bg-white/5 hover:text-white disabled:opacity-30"
                  >
                    {status}
                  </button>

                ))}

              </div>

            </div>

            <Detail title="Payment">

              <Row
                label="Razorpay Order"
                value={
                  selected.razorpayOrderId ||
                  "Not available"
                }
              />

              <Row
                label="Payment ID"
                value={
                  selected.razorpayPaymentId ||
                  "Not available"
                }
              />

            </Detail>

            <button
              onClick={() => setSelected(null)}
              className="mt-8 w-full rounded-2xl border border-white/10 px-5 py-4 text-[9px] uppercase tracking-[0.25em] text-white/40 hover:bg-white/5 hover:text-white"
            >
              Close
            </button>

          </div>

        </div>

      )}

    </main>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">

      <p className="text-[8px] uppercase tracking-[0.3em] text-white/25">
        {label}
      </p>

      <p className="mt-4 text-4xl font-extralight">
        {value}
      </p>

    </div>
  );
}

function Detail({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">

      <p className="mb-4 text-[8px] uppercase tracking-[0.3em] text-white/25">
        {title}
      </p>

      <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.02]">
        {children}
      </div>

    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:justify-between">

      <span className="text-[8px] uppercase tracking-[0.25em] text-white/20">
        {label}
      </span>

      <span className="break-all text-sm text-white/55 sm:text-right">
        {value}
      </span>

    </div>
  );
}