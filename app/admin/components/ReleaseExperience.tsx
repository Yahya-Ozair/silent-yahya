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

export default function ReleaseExperience() {
  const [release, setRelease] =
    useState<ReleaseState>(DEFAULT_RELEASE);

  const [loading, setLoading] = useState(true);

  async function fetchRelease() {
    try {
      // Cache-buster so browser cannot give us an old response
      const response = await fetch(
        `/api/release?t=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `API error: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "SILENT YAHYA RELEASE:",
        data
      );

      if (data.success && data.release) {
        setRelease(data.release);
      }
    } catch (error) {
      console.error(
        "Could not load release:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  // Load immediately
  useEffect(() => {
    fetchRelease();

    // Keep public page synchronized with Admin
    const interval = setInterval(() => {
      fetchRelease();
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const remainingSlots = Math.max(
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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/30">
            Silent Yahya
          </p>

          <p className="mt-5 text-[9px] uppercase tracking-[0.35em] text-white/20">
            Preparing release...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-20">

        {/* BACKGROUND GLOW */}
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-amber-500/[0.035] blur-[140px]" />

        <div className="relative z-10 w-full max-w-4xl text-center">

          {/* BRAND */}
          <p className="text-[10px] uppercase tracking-[0.55em] text-white/35">
            Silent Yahya
          </p>

          {/* STATUS */}
          <div className="mt-8 flex justify-center">

            <div
              className={`
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                px-5
                py-2.5
                text-[9px]
                uppercase
                tracking-[0.3em]
                ${
                  release.status === "LIVE"
                    ? "border-emerald-400/20 bg-emerald-400/[0.04] text-emerald-300"
                    : release.status === "LOCKED"
                    ? "border-amber-400/20 bg-amber-400/[0.04] text-amber-300"
                    : "border-white/10 bg-white/[0.025] text-white/40"
                }
              `}
            >

              <span
                className={`
                  h-1.5
                  w-1.5
                  rounded-full
                  ${
                    release.status === "LIVE"
                      ? "animate-pulse bg-emerald-400"
                      : release.status === "LOCKED"
                      ? "bg-amber-400"
                      : "bg-white/30"
                  }
                `}
              />

              {release.status === "LIVE"
                ? "RELEASE LIVE"
                : release.status === "LOCKED"
                ? "RELEASE LOCKED"
                : "COMING SOON"}

            </div>

          </div>

          {/* HERO */}
          <h1 className="mt-12 text-5xl font-extralight leading-[0.95] tracking-[0.08em] sm:text-7xl md:text-8xl">

            THE NEXT

            <br />

            <span className="text-white/35">
              RELEASE
            </span>

          </h1>

          {/* RELEASE NAME */}
          <p className="mt-10 text-[10px] uppercase tracking-[0.45em] text-white/45">
            {release.releaseName}
          </p>

          <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-white/35">
            A limited Silent Yahya creation.
            <br />
            Once the slots are secured, this
            release disappears.
          </p>

          {/* SLOT SECTION */}
          <div className="mx-auto mt-16 max-w-md">

            <div className="flex items-end justify-between">

              <div className="text-left">

                <p className="text-[9px] uppercase tracking-[0.3em] text-white/25">
                  Slots Remaining
                </p>

                <p className="mt-3 text-5xl font-extralight">
                  {remainingSlots}
                </p>

              </div>

              <div className="text-right">

                <p className="text-xs text-white/30">
                  {release.securedSlots} /{" "}
                  {release.totalSlots}
                </p>

                <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/20">
                  Secured
                </p>

              </div>

            </div>

            {/* PROGRESS */}
            <div className="mt-6 h-[2px] overflow-hidden bg-white/10">

              <div
                className="h-full bg-white transition-all duration-700"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

          </div>

          {/* PRICE */}
          <div className="mt-10">

            <p className="text-[9px] uppercase tracking-[0.3em] text-white/25">
              Edition Price
            </p>

            <p className="mt-2 text-2xl font-light">
              ₹
              {release.price.toLocaleString(
                "en-IN"
              )}
            </p>

          </div>

          {/* BUTTON */}
          <div className="mt-12">

            {release.status === "LIVE" ? (

              <button
                type="button"
                className="rounded-full bg-white px-10 py-4 text-[10px] font-medium tracking-[0.3em] text-black transition duration-300 hover:scale-105"
              >
                SECURE YOUR SLOT
              </button>

            ) : release.status === "LOCKED" ? (

              <div className="inline-flex rounded-full border border-amber-400/20 px-8 py-4 text-[9px] uppercase tracking-[0.3em] text-amber-300/60">
                RELEASE CLOSED
              </div>

            ) : (

              <div className="inline-flex rounded-full border border-white/10 px-8 py-4 text-[9px] uppercase tracking-[0.3em] text-white/35">
                RELEASE NOT OPEN
              </div>

            )}

          </div>

          {/* FOOTER */}
          <div className="mt-20">

            <div className="mx-auto h-px w-12 bg-white/10" />

            <p className="mt-6 text-[8px] uppercase tracking-[0.4em] text-white/20">
              Limited by design
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}