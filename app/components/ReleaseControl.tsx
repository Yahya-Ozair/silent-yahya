"use client";

import { useEffect, useState } from "react";

type ReleaseStatus = "DRAFT" | "LIVE";

interface ReleaseState {
  status: ReleaseStatus;
  totalSlots: number;
  securedSlots: number;
  releaseName: string;
  releasedAt: string | null;
}

const DEFAULT_RELEASE: ReleaseState = {
  status: "DRAFT",
  totalSlots: 50,
  securedSlots: 0,
  releaseName: "HUSNAINS EDITION",
  releasedAt: null,
};

const STORAGE_KEY = "silent-yahya-release-v1";

export default function ReleaseControl() {
  const [release, setRelease] =
    useState<ReleaseState>(DEFAULT_RELEASE);

  const [showResetConfirm, setShowResetConfirm] =
    useState(false);

  const [loadingStats, setLoadingStats] =
    useState(false);

  /*
  =====================================================
  LOAD SAVED RELEASE
  =====================================================
  */

  useEffect(() => {
    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed =
          JSON.parse(saved);

        setRelease({
          ...DEFAULT_RELEASE,
          ...parsed,
        });
      } catch {
        setRelease(DEFAULT_RELEASE);
      }
    }
  }, []);

  /*
  =====================================================
  SAVE RELEASE LOCALLY
  =====================================================
  */

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(release)
    );
  }, [release]);

  /*
  =====================================================
  GET REAL SECURED SLOT COUNT
  FROM MONGODB
  =====================================================
  */

  async function refreshStats() {
    try {
      setLoadingStats(true);

      const response =
        await fetch(
          `/api/release/stats?t=${Date.now()}`,
          {
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (
        response.ok &&
        data.success
      ) {
        setRelease((current) => ({
          ...current,
          securedSlots:
            Number(
              data.securedSlots
            ) || 0,
        }));
      }
    } catch (error) {
      console.error(
        "Release stats refresh failed:",
        error
      );
    } finally {
      setLoadingStats(false);
    }
  }

  /*
  =====================================================
  AUTO REFRESH REAL STATS
  =====================================================
  */

  useEffect(() => {
    refreshStats();

    const interval =
      setInterval(() => {
        refreshStats();
      }, 5000);

    return () =>
      clearInterval(interval);
  }, []);

  /*
  =====================================================
  CALCULATIONS
  =====================================================
  */

  const remainingSlots =
    Math.max(
      release.totalSlots -
        release.securedSlots,
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

  /*
  =====================================================
  RELEASE
  =====================================================
  */

  function releaseLaunch() {
    setRelease((current) => ({
      ...current,
      status: "LIVE",
      releasedAt:
        new Date().toISOString(),
    }));
  }

  /*
  =====================================================
  RESET
  =====================================================
  */

  function resetRelease() {
    setRelease({
      ...DEFAULT_RELEASE,

      // Keep admin-configured values
      releaseName:
        release.releaseName,

      totalSlots:
        release.totalSlots,
    });

    setShowResetConfirm(false);

    // Immediately refresh real DB count
    refreshStats();
  }

  /*
  =====================================================
  UI
  =====================================================
  */

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#080808] p-6 text-white shadow-2xl md:p-8">

      {/* Background glow */}

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
              Control the current release
              state.
            </p>

          </div>

          {/* STATUS */}

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-medium tracking-[0.2em] ${
              release.status === "LIVE"
                ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-300"
                : "border-white/10 bg-white/[0.03] text-white/40"
            }`}
          >

            <span
              className={`h-1.5 w-1.5 rounded-full ${
                release.status ===
                "LIVE"
                  ? "animate-pulse bg-emerald-400"
                  : "bg-white/30"
              }`}
            />

            {release.status ===
            "LIVE"
              ? "RELEASE LIVE"
              : "RELEASE DRAFT"}

          </div>

        </div>

        {/* CURRENT RELEASE */}

        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.025] p-5">

          <p className="mb-2 text-[9px] uppercase tracking-[0.3em] text-white/30">
            Current Release
          </p>

          <h3 className="text-xl font-light tracking-[0.12em]">
            {release.releaseName}
          </h3>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

          <Stat
            label="Total Slots"
            value={release.totalSlots}
          />

          <div className="relative">

            <Stat
              label="Secured"
              value={
                release.securedSlots
              }
            />

            {/* LIVE DATABASE INDICATOR */}

            <div className="absolute right-4 top-4 flex items-center gap-1.5">

              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  loadingStats
                    ? "animate-pulse bg-amber-400"
                    : "bg-emerald-400"
                }`}
              />

              <span className="text-[7px] uppercase tracking-[0.15em] text-white/20">
                Live
              </span>

            </div>

          </div>

          <Stat
            label="Remaining"
            value={remainingSlots}
            highlight={
              remainingSlots <= 10
            }
          />

        </div>

        {/* PROGRESS */}

        <div className="mt-8">

          <div className="mb-3 flex justify-between text-[10px] uppercase tracking-[0.2em]">

            <span className="text-white/30">
              Release Progress
            </span>

            <span className="text-white/50">
              {Math.round(
                progress
              )}
              %
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

        <div className="mt-8 grid gap-3 sm:grid-cols-2">

          {/* RELEASE */}

          <button
            onClick={
              releaseLaunch
            }
            disabled={
              release.status ===
              "LIVE"
            }
            className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white px-5 py-4 text-xs font-medium tracking-[0.2em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <span className="relative z-10">
              🚀 RELEASE
            </span>
          </button>

          {/* RESET */}

          <button
            onClick={() =>
              setShowResetConfirm(
                true
              )
            }
            className="rounded-2xl border border-red-400/20 bg-red-400/[0.04] px-5 py-4 text-xs font-medium tracking-[0.2em] text-red-300 transition hover:bg-red-400/[0.08]"
          >
            ↻ RESET RELEASE
          </button>

        </div>

        {/* RELEASE INFO */}

        <div className="mt-6 border-t border-white/10 pt-5">

          <div className="flex flex-col gap-2 text-xs text-white/30 sm:flex-row sm:justify-between">

            <span>
              State:{" "}

              <span className="text-white/60">
                {release.status}
              </span>

            </span>

            <span>
              Database:{" "}

              <span className="text-emerald-300/70">
                Connected
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

      {/* =================================================
          RESET CONFIRMATION
      ================================================= */}

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
              This will return the
              release to draft.
              Secured reservations
              stored in the database
              will not be deleted.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-xs text-white/50">

              <div className="flex justify-between">

                <span>
                  Current secured
                </span>

                <span className="text-white">
                  {release.securedSlots}
                </span>

              </div>

              <div className="mt-2 flex justify-between">

                <span>
                  Release after reset
                </span>

                <span className="text-white">
                  DRAFT
                </span>

              </div>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">

              <button
                onClick={() =>
                  setShowResetConfirm(
                    false
                  )
                }
                className="rounded-2xl border border-white/10 px-4 py-3 text-xs tracking-[0.15em] text-white/50 transition hover:bg-white/5"
              >
                CANCEL
              </button>

              <button
                onClick={
                  resetRelease
                }
                className="rounded-2xl bg-red-500 px-4 py-3 text-xs font-medium tracking-[0.15em] text-white transition hover:bg-red-400"
              >
                RESET
              </button>

            </div>

          </div>

        </div>

      )}

    </section>
  );
}

/*
=====================================================
STAT COMPONENT
=====================================================
*/

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