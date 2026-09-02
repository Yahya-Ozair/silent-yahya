"use client";

import { useEffect, useState } from "react";

type ReleaseStatus = "DRAFT" | "LIVE" | "LOCKED";

interface ReleaseState {
  status: ReleaseStatus;
  totalSlots: number;
  securedSlots: number;
  releaseName: string;
  price: number;
  launchAt: string;
  releasedAt: string | null;
}

const DEFAULT_RELEASE: ReleaseState = {
  status: "DRAFT",
  totalSlots: 50,
  securedSlots: 0,
  releaseName: "HUSNAINS EDITION",
  price: 999,
  launchAt: "",
  releasedAt: null,
};

export default function ReleaseControl() {
  const [release, setRelease] =
    useState<ReleaseState>(DEFAULT_RELEASE);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] =
    useState(false);

  useEffect(() => {
    loadRelease();
  }, []);

  async function loadRelease() {
    try {
      const res = await fetch("/api/release", {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success) {
        setRelease(data.release);
      }
    } catch (error) {
      console.error("Failed to load release:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateRelease(
    updates: Partial<ReleaseState>
  ) {
    setSaving(true);

    try {
      const res = await fetch("/api/release", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(
          data.error || "Failed to update release"
        );
      }

      setRelease(data.release);
    } catch (error) {
      console.error(error);
      alert("Failed to update release.");
    } finally {
      setSaving(false);
    }
  }

  async function releaseLaunch() {
    await updateRelease({
      status: "LIVE",
      releasedAt: new Date().toISOString(),
    });
  }

  async function resetRelease() {
    await updateRelease({
      status: "DRAFT",
      securedSlots: 0,
      releasedAt: null,
    });

    setShowResetConfirm(false);
  }

  async function lockRelease() {
    await updateRelease({
      status: "LOCKED",
    });
  }

  const remainingSlots = Math.max(
    release.totalSlots - release.securedSlots,
    0
  );

  const progress =
    release.totalSlots > 0
      ? Math.min(
          (release.securedSlots /
            release.totalSlots) *
            100,
          100
        )
      : 0;

  if (loading) {
    return (
      <section className="rounded-3xl border border-white/10 bg-[#080808] p-8 text-white">
        <p className="text-sm text-white/40">
          Loading release control...
        </p>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#080808] p-6 text-white shadow-2xl md:p-8">

      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative z-10">

        {/* HEADER */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-start">

          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.35em] text-white/40">
              Silent Yahya
            </p>

            <h2 className="text-2xl font-light tracking-wide md:text-3xl">
              Release Control
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Control the live release from MongoDB.
            </p>
          </div>

          {/* STATUS */}
          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-medium tracking-[0.2em] ${
              release.status === "LIVE"
                ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-300"
                : release.status === "LOCKED"
                ? "border-amber-400/20 bg-amber-400/5 text-amber-300"
                : "border-white/10 bg-white/[0.03] text-white/40"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                release.status === "LIVE"
                  ? "animate-pulse bg-emerald-400"
                  : release.status === "LOCKED"
                  ? "bg-amber-400"
                  : "bg-white/30"
              }`}
            />

            {release.status === "LIVE"
              ? "RELEASE LIVE"
              : release.status === "LOCKED"
              ? "RELEASE LOCKED"
              : "RELEASE DRAFT"}
          </div>

        </div>

        {/* RELEASE */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.025] p-5">

          <p className="mb-2 text-[9px] uppercase tracking-[0.3em] text-white/30">
            Current Release
          </p>

          <h3 className="text-xl font-light tracking-[0.12em]">
            {release.releaseName}
          </h3>

          <p className="mt-3 text-sm text-white/30">
            ₹{release.price.toLocaleString("en-IN")}
          </p>

        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

          <Stat
            label="Total Slots"
            value={release.totalSlots}
          />

          <Stat
            label="Secured"
            value={release.securedSlots}
          />

          <Stat
            label="Remaining"
            value={remainingSlots}
            highlight={remainingSlots <= 10}
          />

        </div>

        {/* PROGRESS */}
        <div className="mt-8">

          <div className="mb-3 flex justify-between text-[10px] uppercase tracking-[0.2em]">

            <span className="text-white/30">
              Release Progress
            </span>

            <span className="text-white/50">
              {Math.round(progress)}%
            </span>

          </div>

          <div className="h-1 overflow-hidden rounded-full bg-white/10">

            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

        {/* CONTROLS */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">

          {/* RELEASE */}
          <button
            onClick={releaseLaunch}
            disabled={
              release.status === "LIVE" ||
              saving
            }
            className="rounded-2xl border border-white/20 bg-white px-5 py-4 text-xs font-medium tracking-[0.2em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {saving
              ? "UPDATING..."
              : "🚀 RELEASE"}
          </button>

          {/* LOCK */}
          <button
            onClick={lockRelease}
            disabled={
              release.status !== "LIVE" ||
              saving
            }
            className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] px-5 py-4 text-xs font-medium tracking-[0.2em] text-amber-300 transition hover:bg-amber-400/[0.08] disabled:cursor-not-allowed disabled:opacity-30"
          >
            🔒 LOCK RELEASE
          </button>

          {/* RESET */}
          <button
            onClick={() => setShowResetConfirm(true)}
            disabled={saving}
            className="rounded-2xl border border-red-400/20 bg-red-400/[0.04] px-5 py-4 text-xs font-medium tracking-[0.2em] text-red-300 transition hover:bg-red-400/[0.08] disabled:opacity-30"
          >
            ↻ RESET
          </button>

        </div>

        {/* INFO */}
        <div className="mt-6 border-t border-white/10 pt-5">

          <div className="flex flex-col gap-2 text-xs text-white/30 sm:flex-row sm:justify-between">

            <span>
              Database State:{" "}
              <span className="text-white/60">
                {release.status}
              </span>
            </span>

            {release.releasedAt && (
              <span>
                Released:{" "}
                <span className="text-white/60">
                  {new Date(
                    release.releasedAt
                  ).toLocaleString()}
                </span>
              </span>
            )}

          </div>

        </div>

      </div>

      {/* RESET CONFIRMATION */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-5 backdrop-blur-md">

          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0b0b] p-7 shadow-2xl">

            <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-red-300/60">
              Warning
            </p>

            <h3 className="text-2xl font-light">
              Reset this release?
            </h3>

            <p className="mt-4 text-sm leading-6 text-white/40">
              This will reset the release to DRAFT
              and return secured slots to zero.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-xs text-white/50">

              <div className="flex justify-between">
                <span>Current secured</span>

                <span className="text-white">
                  {release.securedSlots}
                </span>
              </div>

              <div className="mt-2 flex justify-between">
                <span>After reset</span>

                <span className="text-white">
                  0
                </span>
              </div>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">

              <button
                onClick={() =>
                  setShowResetConfirm(false)
                }
                className="rounded-2xl border border-white/10 px-4 py-3 text-xs tracking-[0.15em] text-white/50 transition hover:bg-white/5"
              >
                CANCEL
              </button>

              <button
                onClick={resetRelease}
                disabled={saving}
                className="rounded-2xl bg-red-500 px-4 py-3 text-xs font-medium tracking-[0.15em] text-white transition hover:bg-red-400 disabled:opacity-50"
              >
                {saving ? "RESETTING..." : "RESET"}
              </button>

            </div>

          </div>

        </div>
      )}

    </section>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">

      <p className="text-[9px] uppercase tracking-[0.25em] text-white/30">
        {label}
      </p>

      <p
        className={`mt-3 text-3xl font-light ${
          highlight
            ? "text-red-300"
            : "text-white"
        }`}
      >
        {value}
      </p>

    </div>
  );
}