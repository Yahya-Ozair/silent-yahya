"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ReleaseData = {
  id?: string;
  releaseName?: string;
  price?: number;
  status?: string;
  totalSlots?: number;
  securedSlots?: number;
};

type ReservationData = {
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
  expiresAt: string;
  slotNumber: number;
  slotName: string;
  releaseName: string;
};

type View =
  | "product"
  | "search"
  | "address"
  | "payment"
  | "submitted"
  | "success";

const PRODUCT_IMAGES = [
  "/images/husnains-product-01.jpg",
  "/images/husnains-product-02.jpg",
  "/images/husnains-product-03.jpg",
  "/images/husnains-product-04.jpg",
];

const PACKAGING_IMAGES = [
  "/images/husnains-packaging-01.jpg",
  "/images/husnains-packaging-02.jpg",
  "/images/husnains-packaging-03.jpg",
  "/images/husnains-packaging-04.jpg",
];

const FALLBACK_PRODUCT = "/images/husnains-edition.jpg";
const FALLBACK_PACKAGING = "/images/husnains-packaging.jpg";

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
];

const SEARCH_STAGES = [
  {
    title: "INITIALIZING RELEASE",
    detail: "Connecting to the private release system",
  },
  {
    title: "VERIFYING ACCESS",
    detail: "Checking current release availability",
  },
  {
    title: "SEARCHING POSITIONS",
    detail: "Looking for an available position",
  },
  {
    title: "MATCHING REQUEST",
    detail: "Matching your request with the release",
  },
  {
    title: "CHECKING DATABASE",
    detail: "Confirming live reservation capacity",
  },
  {
    title: "FINALIZING ACCESS",
    detail: "Preparing your private reservation",
  },
];

const SEARCH_DURATION = 10500;

function formatMoney(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.max(0, seconds % 60);

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(
    2,
    "0"
  )}`;
}

export default function ReleasePage() {
  const [view, setView] = useState<View>("product");

  const [release, setRelease] = useState<ReleaseData>({
    releaseName: "HUSNAINS EDITION",
    price: 999,
    status: "LIVE",
  });

  const [reservation, setReservation] =
    useState<ReservationData | null>(null);

  const [selectedProduct, setSelectedProduct] = useState(0);
  const [selectedPackaging, setSelectedPackaging] = useState(0);

  const [searchProgress, setSearchProgress] = useState(0);
  const [searchStage, setSearchStage] = useState(0);

  const [countdown, setCountdown] = useState(600);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const price = Number(release.price || 999);

  const productImage = useMemo(
    () => PRODUCT_IMAGES[selectedProduct] || FALLBACK_PRODUCT,
    [selectedProduct]
  );

  const packagingImage = useMemo(
    () => PACKAGING_IMAGES[selectedPackaging] || FALLBACK_PACKAGING,
    [selectedPackaging]
  );

  /*
   * Load release status.
   */
  useEffect(() => {
    let mounted = true;

    async function loadRelease() {
      try {
        const response = await fetch("/api/release", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!mounted) return;

        if (data?.success && data?.release) {
          setRelease(data.release);
        }
      } catch {
        // Keep the fallback release information.
      }
    }

    loadRelease();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Search animation.
   */
  useEffect(() => {
    if (view !== "search") return;

    setSearchProgress(0);
    setSearchStage(0);

    const start = Date.now();

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(
        100,
        Math.round((elapsed / SEARCH_DURATION) * 100)
      );

      setSearchProgress(progress);

      const stage = Math.min(
        SEARCH_STAGES.length - 1,
        Math.floor((progress / 100) * SEARCH_STAGES.length)
      );

      setSearchStage(stage);

      if (progress >= 100) {
        window.clearInterval(interval);

        window.setTimeout(() => {
          setView("address");
        }, 700);
      }
    }, 80);

    return () => window.clearInterval(interval);
  }, [view]);

  /*
   * Real reservation countdown.
   */
  useEffect(() => {
    if (!reservation || view !== "payment") return;

    const updateCountdown = () => {
      const expiry = new Date(reservation.expiresAt).getTime();
      const remaining = Math.max(
        0,
        Math.floor((expiry - Date.now()) / 1000)
      );

      setCountdown(remaining);

      if (remaining <= 0) {
        setError(
          "Your temporary reservation has expired. Please start again."
        );
      }
    };

    updateCountdown();

    const interval = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(interval);
  }, [reservation, view]);

  function startReservation() {
    setError("");
    setView("search");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateForm(
    field: keyof typeof form,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function createReservation() {
    setError("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!form.address.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    if (!form.city.trim()) {
      setError("Please enter your city.");
      return;
    }

    if (!form.state.trim()) {
      setError("Please select your state.");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    try {
      const response = await fetch("/api/reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        setError(
          data?.error ||
            "Unable to secure your position right now."
        );
        return;
      }

      setReservation(data.reservation);

      const expiresAt = new Date(
        data.reservation.expiresAt
      ).getTime();

      setCountdown(
        Math.max(
          0,
          Math.floor((expiresAt - Date.now()) / 1000)
        )
      );

      setView("payment");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch {
      setError(
        "Something went wrong while securing your position. Please try again."
      );
    }
  }

  function paymentSubmitted() {
    setError("");
    setView("submitted");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="release-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="grain" />

      {view === "product" && (
        <>
          <TopBar
            onBook={startReservation}
            releaseName={release.releaseName}
          />

          <ProductExperience
            release={release}
            price={price}
            productImage={productImage}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            packagingImage={packagingImage}
            selectedPackaging={selectedPackaging}
            setSelectedPackaging={setSelectedPackaging}
            onBook={startReservation}
          />

          <Footer />
        </>
      )}

      {view === "search" && (
        <SearchExperience
          progress={searchProgress}
          stage={searchStage}
          onBack={() => setView("product")}
        />
      )}

      {view === "address" && (
        <AddressExperience
          form={form}
          updateForm={updateForm}
          onSubmit={createReservation}
          onBack={() => setView("product")}
          error={error}
          price={price}
        />
      )}

      {view === "payment" && reservation && (
        <PaymentExperience
          reservation={reservation}
          countdown={countdown}
          onSubmitted={paymentSubmitted}
          onBack={() => setView("address")}
          error={error}
        />
      )}

      {view === "submitted" && reservation && (
        <SubmittedExperience reservation={reservation} />
      )}

      {view === "success" && reservation && (
        <SuccessExperience reservation={reservation} />
      )}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #050505;
          color: #f2efe8;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .release-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 80% 10%,
              rgba(166, 124, 44, 0.1),
              transparent 30%
            ),
            radial-gradient(
              circle at 10% 50%,
              rgba(255, 255, 255, 0.025),
              transparent 28%
            ),
            #050505;
        }

        .grain {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.035;
          z-index: 100;
          background-image:
            url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
        }

        .ambient {
          position: fixed;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          opacity: 0.12;
          z-index: 0;
          animation: ambientFloat 12s ease-in-out infinite alternate;
        }

        .ambient-one {
          background: #b68a3a;
          top: 20%;
          right: -220px;
        }

        .ambient-two {
          background: #6c5428;
          bottom: 5%;
          left: -240px;
          animation-delay: -5s;
        }

        @keyframes ambientFloat {
          from {
            transform: translate3d(0, 0, 0) scale(1);
          }

          to {
            transform: translate3d(-50px, 40px, 0) scale(1.12);
          }
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 80;
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 5vw;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          background: rgba(5, 5, 5, 0.82);
          backdrop-filter: blur(20px);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          letter-spacing: 0.18em;
          font-size: 12px;
          font-weight: 800;
        }

        .brand-mark {
          width: 36px;
          height: 36px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(214, 177, 94, 0.55);
          color: #d9b76b;
          font-size: 11px;
          letter-spacing: 0.05em;
        }

        .top-status {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 10px;
          color: #8e8b84;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #d4ad61;
          box-shadow: 0 0 15px rgba(212, 173, 97, 0.8);
          animation: pulseDot 1.7s infinite;
        }

        @keyframes pulseDot {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(0.85);
          }

          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        .hero {
          min-height: calc(100vh - 76px);
          display: grid;
          grid-template-columns: 0.95fr 1.05fr;
          align-items: center;
          max-width: 1500px;
          margin: auto;
          padding: 70px 5vw 100px;
          position: relative;
          z-index: 2;
        }

        .hero-copy {
          padding-right: 7vw;
          animation: heroIn 1.1s ease both;
        }

        @keyframes heroIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #bfa56e;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.26em;
          margin-bottom: 25px;
        }

        .eyebrow-line {
          width: 32px;
          height: 1px;
          background: #bfa56e;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(58px, 8vw, 132px);
          line-height: 0.86;
          letter-spacing: -0.065em;
          font-weight: 800;
          max-width: 900px;
        }

        .hero h1 span {
          display: block;
          color: #a68a51;
        }

        .hero-description {
          margin: 34px 0 0;
          max-width: 560px;
          color: #a9a59b;
          font-size: 16px;
          line-height: 1.8;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-top: 38px;
          flex-wrap: wrap;
        }

        .gold-button {
          position: relative;
          min-height: 56px;
          padding: 0 27px;
          border: 1px solid #c6a45d;
          background: #b58a3c;
          color: #080706;
          font-weight: 900;
          font-size: 12px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          overflow: hidden;
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .gold-button::before {
          content: "";
          position: absolute;
          inset: -100% -30%;
          background: linear-gradient(
            110deg,
            transparent 40%,
            rgba(255, 255, 255, 0.38),
            transparent 60%
          );
          transform: translateX(-100%);
          animation: shine 4s infinite;
        }

        @keyframes shine {
          0%,
          55% {
            transform: translateX(-100%);
          }

          75%,
          100% {
            transform: translateX(100%);
          }
        }

        .gold-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 50px rgba(180, 135, 52, 0.2);
        }

        .dark-button {
          min-height: 56px;
          padding: 0 25px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #d6d2ca;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          transition: 0.3s ease;
        }

        .dark-button:hover {
          border-color: rgba(214, 177, 94, 0.5);
          color: #e1bf75;
        }

        .hero-meta {
          display: flex;
          gap: 35px;
          margin-top: 42px;
          flex-wrap: wrap;
        }

        .meta-item strong {
          display: block;
          color: #eeeae1;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .meta-item span {
          color: #6e6b65;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .hero-visual {
          position: relative;
          min-height: 690px;
          display: grid;
          place-items: center;
        }

        .orb {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle at 45% 35%,
              rgba(255, 220, 145, 0.16),
              transparent 34%
            ),
            radial-gradient(
              circle,
              rgba(176, 133, 54, 0.14),
              transparent 66%
            );
          filter: blur(1px);
          animation: orbPulse 6s ease-in-out infinite;
        }

        @keyframes orbPulse {
          0%,
          100% {
            transform: scale(0.96);
          }

          50% {
            transform: scale(1.04);
          }
        }

        .hero-image-wrap {
          position: relative;
          width: min(620px, 90%);
          aspect-ratio: 0.8;
          animation: bottleFloat 6s ease-in-out infinite;
        }

        @keyframes bottleFloat {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }

          50% {
            transform: translateY(-14px) rotate(0.5deg);
          }
        }

        .hero-image-wrap::after {
          content: "";
          position: absolute;
          bottom: -5%;
          left: 14%;
          right: 14%;
          height: 10%;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.8);
          filter: blur(25px);
          z-index: -1;
        }

        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter:
            drop-shadow(0 35px 55px rgba(0, 0, 0, 0.8))
            drop-shadow(0 0 55px rgba(180, 135, 52, 0.08));
        }

        .floating-label {
          position: absolute;
          padding: 13px 16px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          background: rgba(10, 10, 10, 0.78);
          backdrop-filter: blur(14px);
          color: #9b978e;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.17em;
          animation: labelFloat 5s ease-in-out infinite;
        }

        .floating-one {
          top: 15%;
          left: 2%;
        }

        .floating-two {
          right: 0;
          bottom: 20%;
          animation-delay: -2s;
        }

        @keyframes labelFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-8px);
          }
        }

        .section {
          position: relative;
          z-index: 2;
          max-width: 1500px;
          margin: auto;
          padding: 120px 5vw;
        }

        .section-heading {
          max-width: 720px;
          margin-bottom: 60px;
        }

        .section-heading h2 {
          margin: 12px 0 0;
          font-size: clamp(40px, 5vw, 76px);
          line-height: 0.98;
          letter-spacing: -0.05em;
        }

        .section-heading p {
          color: #8f8b83;
          line-height: 1.8;
          margin-top: 24px;
          max-width: 620px;
        }

        .story-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 70px;
          align-items: center;
        }

        .story-image {
          min-height: 650px;
          position: relative;
          overflow: hidden;
          background: #0b0b0b;
          border: 1px solid rgba(255, 255, 255, 0.07);
        }

        .story-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1s ease;
        }

        .story-image:hover img {
          transform: scale(1.04);
        }

        .story-overlay {
          position: absolute;
          inset: auto 0 0;
          padding: 30px;
          background: linear-gradient(
            transparent,
            rgba(0, 0, 0, 0.85)
          );
        }

        .story-overlay span {
          color: #c2a365;
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .story-copy h3 {
          font-size: clamp(32px, 4vw, 58px);
          line-height: 1;
          letter-spacing: -0.045em;
          margin: 0 0 25px;
        }

        .story-copy p {
          color: #98948b;
          line-height: 1.9;
          margin-bottom: 20px;
        }

        .quote {
          border-left: 1px solid #a98645;
          padding-left: 22px;
          color: #d4d0c8 !important;
          font-size: 18px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .info-card {
          min-height: 230px;
          padding: 30px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.035),
              rgba(255, 255, 255, 0.008)
            );
          transition: 0.35s ease;
        }

        .info-card:hover {
          transform: translateY(-7px);
          border-color: rgba(198, 164, 93, 0.35);
          background: rgba(177, 137, 58, 0.045);
        }

        .info-number {
          color: #8c703e;
          font-size: 11px;
          letter-spacing: 0.15em;
        }

        .info-card h3 {
          margin: 55px 0 10px;
          font-size: 22px;
        }

        .info-card p {
          color: #77736b;
          line-height: 1.65;
          font-size: 13px;
        }

        .gallery-section {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 15px;
        }

        .gallery-main {
          min-height: 720px;
          overflow: hidden;
          position: relative;
          background: #090909;
        }

        .gallery-main img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s ease;
        }

        .gallery-main:hover img {
          transform: scale(1.035);
        }

        .gallery-caption {
          position: absolute;
          left: 25px;
          right: 25px;
          bottom: 25px;
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 20px;
        }

        .gallery-caption span {
          color: #c8a963;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.17em;
        }

        .gallery-counter {
          color: #7d7971;
          font-size: 11px;
        }

        .thumbnail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .thumbnail {
          min-height: 250px;
          padding: 0;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: #090909;
          opacity: 0.62;
          transition: 0.3s ease;
        }

        .thumbnail.active,
        .thumbnail:hover {
          opacity: 1;
          border-color: rgba(205, 170, 94, 0.5);
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .packaging-main img {
          object-fit: contain;
          padding: 30px;
        }

        .notes-layout {
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          gap: 70px;
          align-items: start;
        }

        .notes-intro h2 {
          font-size: clamp(42px, 5vw, 74px);
          line-height: 0.95;
          letter-spacing: -0.055em;
          margin: 0;
        }

        .notes-intro p {
          color: #858179;
          line-height: 1.8;
          margin-top: 25px;
        }

        .notes-list {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .note-row {
          display: grid;
          grid-template-columns: 110px 1fr auto;
          align-items: center;
          gap: 25px;
          padding: 28px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .note-index {
          color: #7e6333;
          font-size: 10px;
          letter-spacing: 0.16em;
        }

        .note-row h3 {
          margin: 0 0 7px;
          font-size: 20px;
        }

        .note-row p {
          margin: 0;
          color: #747169;
          font-size: 12px;
        }

        .note-icon {
          font-size: 24px;
          opacity: 0.85;
        }

        .receive-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .receive-card {
          padding: 30px 25px;
          min-height: 200px;
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.07);
        }

        .receive-card .emoji {
          font-size: 27px;
          margin-bottom: 35px;
        }

        .receive-card h3 {
          font-size: 16px;
          margin: 0 0 8px;
        }

        .receive-card p {
          color: #6e6a63;
          font-size: 12px;
          line-height: 1.6;
          margin: 0;
        }

        .launch-panel {
          position: relative;
          overflow: hidden;
          padding: 90px 8vw;
          background:
            radial-gradient(
              circle at 85% 20%,
              rgba(181, 138, 60, 0.14),
              transparent 35%
            ),
            #090909;
          border: 1px solid rgba(255, 255, 255, 0.08);
          text-align: center;
        }

        .launch-panel::before {
          content: "HUSNAINS";
          position: absolute;
          inset: 50% auto auto 50%;
          transform: translate(-50%, -50%);
          font-size: clamp(100px, 20vw, 330px);
          font-weight: 900;
          color: rgba(255, 255, 255, 0.018);
          white-space: nowrap;
          pointer-events: none;
        }

        .launch-panel > * {
          position: relative;
          z-index: 2;
        }

        .launch-panel h2 {
          font-size: clamp(45px, 7vw, 100px);
          line-height: 0.9;
          letter-spacing: -0.065em;
          margin: 10px auto 20px;
          max-width: 900px;
        }

        .launch-panel p {
          max-width: 590px;
          margin: auto;
          color: #88847c;
          line-height: 1.8;
        }

        .launch-price {
          margin: 35px 0;
          font-size: 24px;
          font-weight: 800;
          color: #dfc17a;
        }

        .policies {
          max-width: 900px;
          margin: auto;
        }

        .policy {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .policy summary {
          list-style: none;
          cursor: pointer;
          padding: 23px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #d3d0c8;
          font-size: 14px;
          font-weight: 700;
        }

        .policy summary::-webkit-details-marker {
          display: none;
        }

        .policy summary::after {
          content: "+";
          color: #b28b48;
          font-size: 20px;
          font-weight: 300;
        }

        .policy[open] summary::after {
          content: "−";
        }

        .policy-content {
          color: #706d66;
          font-size: 12px;
          line-height: 1.8;
          padding: 0 0 25px;
        }

        .footer {
          position: relative;
          z-index: 2;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          padding: 50px 5vw;
          display: flex;
          justify-content: space-between;
          gap: 30px;
          color: #68655f;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .footer strong {
          color: #a68b55;
        }

        .experience-screen {
          min-height: 100vh;
          position: relative;
          z-index: 3;
          display: grid;
          place-items: center;
          padding: 50px 20px;
        }

        .experience-box {
          width: min(850px, 100%);
          text-align: center;
        }

        .experience-box h1 {
          margin: 20px 0;
          font-size: clamp(42px, 7vw, 85px);
          line-height: 0.92;
          letter-spacing: -0.06em;
        }

        .experience-box > p {
          color: #77736c;
          max-width: 550px;
          margin: auto;
          line-height: 1.7;
        }

        .radar {
          width: 180px;
          height: 180px;
          margin: 45px auto;
          border-radius: 50%;
          position: relative;
          border: 1px solid rgba(196, 163, 91, 0.32);
          background:
            radial-gradient(
              circle,
              rgba(185, 143, 59, 0.14),
              transparent 60%
            );
          overflow: hidden;
        }

        .radar::before,
        .radar::after {
          content: "";
          position: absolute;
          inset: 20px;
          border: 1px solid rgba(196, 163, 91, 0.2);
          border-radius: 50%;
        }

        .radar::after {
          inset: 55px;
        }

        .radar-line {
          position: absolute;
          width: 50%;
          height: 1px;
          left: 50%;
          top: 50%;
          transform-origin: left center;
          background: linear-gradient(
            90deg,
            rgba(218, 183, 105, 0.9),
            transparent
          );
          animation: radarSweep 2.3s linear infinite;
        }

        @keyframes radarSweep {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        .radar-dot {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #d6b56d;
          box-shadow: 0 0 15px #d6b56d;
          animation: radarDot 2.3s infinite;
        }

        .dot-one {
          top: 35%;
          left: 67%;
        }

        .dot-two {
          top: 67%;
          left: 32%;
          animation-delay: 0.7s;
        }

        .dot-three {
          top: 22%;
          left: 30%;
          animation-delay: 1.2s;
        }

        @keyframes radarDot {
          0%,
          100% {
            opacity: 0.25;
            transform: scale(0.8);
          }

          50% {
            opacity: 1;
            transform: scale(1.4);
          }
        }

        .search-progress {
          width: min(600px, 100%);
          margin: 40px auto 25px;
        }

        .progress-track {
          height: 3px;
          background: #1a1917;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(
            90deg,
            #735622,
            #e0bd72
          );
          box-shadow: 0 0 18px rgba(224, 189, 114, 0.45);
          transition: width 0.15s linear;
        }

        .progress-meta {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          color: #5e5b55;
          font-size: 9px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .search-steps {
          width: min(650px, 100%);
          margin: 35px auto 0;
          text-align: left;
        }

        .search-step {
          display: flex;
          gap: 15px;
          align-items: center;
          padding: 13px 0;
          color: #4e4b46;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: 0.3s ease;
        }

        .search-step.active {
          color: #d4b46e;
        }

        .search-step.done {
          color: #78736b;
        }

        .step-icon {
          width: 21px;
          height: 21px;
          border: 1px solid currentColor;
          display: grid;
          place-items: center;
          font-size: 8px;
        }

        .form-screen {
          min-height: 100vh;
          padding: 100px 20px;
          position: relative;
          z-index: 3;
        }

        .form-container {
          width: min(1000px, 100%);
          margin: auto;
        }

        .form-header {
          margin-bottom: 50px;
        }

        .form-header h1 {
          margin: 12px 0;
          font-size: clamp(42px, 6vw, 76px);
          line-height: 0.94;
          letter-spacing: -0.06em;
        }

        .form-header p {
          color: #77736b;
          max-width: 600px;
          line-height: 1.7;
        }

        .form-layout {
          display: grid;
          grid-template-columns: 1fr 0.38fr;
          gap: 50px;
        }

        .form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .field label {
          color: #77736b;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .field input,
        .field textarea,
        .field select {
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.09);
          background: #0b0b0b;
          color: #eeeae2;
          outline: none;
          padding: 16px;
          transition: 0.25s ease;
        }

        .field textarea {
          min-height: 120px;
          resize: vertical;
        }

        .field input:focus,
        .field textarea:focus,
        .field select:focus {
          border-color: rgba(202, 166, 92, 0.6);
          box-shadow: 0 0 0 3px rgba(202, 166, 92, 0.05);
        }

        .order-summary {
          height: fit-content;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #090909;
          padding: 28px;
          position: sticky;
          top: 110px;
        }

        .summary-label {
          color: #746f66;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
        }

        .summary-product {
          margin: 20px 0;
          color: #e4dfd6;
          font-weight: 800;
        }

        .summary-price {
          font-size: 30px;
          color: #d7b66d;
          font-weight: 800;
          margin-bottom: 25px;
        }

        .summary-line {
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          padding-top: 20px;
          color: #6e6a63;
          font-size: 11px;
          line-height: 1.7;
        }

        .error-box {
          margin: 20px 0;
          border: 1px solid rgba(180, 64, 64, 0.45);
          background: rgba(120, 30, 30, 0.08);
          padding: 14px;
          color: #d68d8d;
          font-size: 12px;
        }

        .payment-container {
          width: min(900px, 100%);
          margin: auto;
        }

        .payment-header {
          text-align: center;
          margin-bottom: 45px;
        }

        .payment-header h1 {
          margin: 15px 0;
          font-size: clamp(42px, 6vw, 75px);
          line-height: 0.9;
          letter-spacing: -0.06em;
        }

        .reservation-chip {
          display: inline-flex;
          border: 1px solid rgba(198, 164, 93, 0.3);
          color: #c9a967;
          padding: 10px 14px;
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .payment-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .payment-card {
          background: #090909;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 30px;
        }

        .qr-card {
          text-align: center;
        }

        .qr-wrap {
          display: inline-flex;
          padding: 15px;
          background: #f4f0e8;
          margin: 20px 0;
        }

        .qr-wrap img {
          width: 250px;
          height: 250px;
          object-fit: contain;
        }

        .payment-card h2 {
          margin: 0 0 10px;
          font-size: 21px;
        }

        .payment-card p {
          color: #77736b;
          font-size: 12px;
          line-height: 1.7;
        }

        .slot-card {
          border-color: rgba(198, 164, 93, 0.23);
          background:
            radial-gradient(
              circle at 80% 0,
              rgba(184, 140, 54, 0.1),
              transparent 45%
            ),
            #090909;
        }

        .slot-number {
          margin: 30px 0;
          font-size: 42px;
          font-weight: 900;
          color: #e0be72;
          letter-spacing: -0.04em;
        }

        .countdown {
          margin-top: 30px;
          padding: 20px;
          border: 1px solid rgba(197, 161, 91, 0.16);
          background: rgba(180, 135, 48, 0.04);
        }

        .countdown-label {
          color: #716c64;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }

        .countdown-time {
          margin-top: 7px;
          color: #e2bf75;
          font-size: 32px;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
        }

        .submitted-box,
        .success-box {
          width: min(750px, 100%);
          text-align: center;
          margin: auto;
          padding: 70px 30px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #090909;
        }

        .success-symbol {
          width: 76px;
          height: 76px;
          margin: auto;
          display: grid;
          place-items: center;
          border-radius: 50%;
          border: 1px solid #bd9953;
          color: #d9b76c;
          font-size: 28px;
          animation: successPulse 2s infinite;
        }

        @keyframes successPulse {
          0%,
          100% {
            box-shadow: 0 0 0 rgba(189, 153, 83, 0);
          }

          50% {
            box-shadow: 0 0 45px rgba(189, 153, 83, 0.15);
          }
        }

        .submitted-box h1,
        .success-box h1 {
          font-size: clamp(40px, 6vw, 70px);
          line-height: 0.95;
          letter-spacing: -0.06em;
          margin: 30px 0 18px;
        }

        .submitted-box p,
        .success-box p {
          color: #77736c;
          max-width: 550px;
          margin: auto;
          line-height: 1.8;
        }

        .reservation-details {
          margin: 35px auto;
          max-width: 520px;
          text-align: left;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 15px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 11px;
        }

        .detail-row span:first-child {
          color: #67635c;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .detail-row span:last-child {
          color: #d6d1c7;
          text-align: right;
        }

        .tracking-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 54px;
          padding: 0 25px;
          border: 1px solid #bd9953;
          color: #d9b66b;
          margin-top: 25px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          transition: 0.3s ease;
        }

        .tracking-button:hover {
          background: #bd9953;
          color: #080706;
        }

        @media (max-width: 1050px) {
          .hero {
            grid-template-columns: 1fr;
          }

          .hero-copy {
            padding-right: 0;
            text-align: center;
          }

          .hero-description {
            margin-left: auto;
            margin-right: auto;
          }

          .hero-actions,
          .hero-meta {
            justify-content: center;
          }

          .hero-visual {
            min-height: 560px;
          }

          .story-grid,
          .notes-layout {
            grid-template-columns: 1fr;
          }

          .info-grid {
            grid-template-columns: 1fr 1fr;
          }

          .receive-grid {
            grid-template-columns: 1fr 1fr;
          }

          .form-layout {
            grid-template-columns: 1fr;
          }

          .order-summary {
            position: static;
          }
        }

        @media (max-width: 700px) {
          .topbar {
            height: 64px;
            padding: 0 18px;
          }

          .top-status {
            display: none;
          }

          .hero {
            padding: 70px 20px 60px;
          }

          .hero h1 {
            font-size: clamp(54px, 17vw, 90px);
          }

          .hero-visual {
            min-height: 430px;
          }

          .hero-image-wrap {
            width: 95%;
          }

          .orb {
            width: 300px;
            height: 300px;
          }

          .floating-label {
            font-size: 7px;
            padding: 9px;
          }

          .section {
            padding: 80px 20px;
          }

          .story-image {
            min-height: 440px;
          }

          .info-grid,
          .receive-grid {
            grid-template-columns: 1fr;
          }

          .gallery-grid {
            grid-template-columns: 1fr;
          }

          .gallery-main {
            min-height: 500px;
          }

          .thumbnail-grid {
            display: flex;
            overflow-x: auto;
            padding-bottom: 5px;
          }

          .thumbnail {
            min-width: 140px;
            height: 160px;
          }

          .note-row {
            grid-template-columns: 45px 1fr auto;
            gap: 12px;
          }

          .form {
            grid-template-columns: 1fr;
          }

          .field.full {
            grid-column: auto;
          }

          .payment-grid {
            grid-template-columns: 1fr;
          }

          .qr-wrap img {
            width: 210px;
            height: 210px;
          }

          .footer {
            flex-direction: column;
          }

          .launch-panel {
            padding: 65px 20px;
          }

          .gold-button,
          .dark-button {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}

/* ============================================================
   TOP BAR
============================================================ */

function TopBar({
  onBook,
  releaseName,
}: {
  onBook: () => void;
  releaseName?: string;
}) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">SY</div>
        <span>SILENT YAHYA</span>
      </div>

      <div className="top-status">
        <span className="status-dot" />
        {releaseName || "HUSNAINS EDITION"} · LIVE
      </div>

      <button className="dark-button" onClick={onBook}>
        BOOK MY SLOT →
      </button>
    </header>
  );
}

/* ============================================================
   PRODUCT EXPERIENCE
============================================================ */

function ProductExperience({
  release,
  price,
  productImage,
  selectedProduct,
  setSelectedProduct,
  packagingImage,
  selectedPackaging,
  setSelectedPackaging,
  onBook,
}: {
  release: ReleaseData;
  price: number;
  productImage: string;
  selectedProduct: number;
  setSelectedProduct: (value: number) => void;
  packagingImage: string;
  selectedPackaging: number;
  setSelectedPackaging: (value: number) => void;
  onBook: () => void;
}) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            PRIVATE RELEASE · 001
          </div>

          <h1>
            HUSNAINS
            <span>EDITION.</span>
          </h1>

          <p className="hero-description">
            A fragrance created to be experienced slowly.
            <br />
            <br />
            The HUSNAINS EDITION is presented as more than a
            bottle. It is a moment, a memory, and a signature
            designed to stay with you long after the first spray.
          </p>

          <div className="hero-actions">
            <button className="gold-button" onClick={onBook}>
              🔐 BOOK MY SLOT
            </button>

            <a href="#story" className="dark-button">
              EXPLORE THE EDITION ↓
            </a>
          </div>

          <div className="hero-meta">
            <div className="meta-item">
              <strong>12 ML</strong>
              <span>Edition Size</span>
            </div>

            <div className="meta-item">
              <strong>{formatMoney(price)}</strong>
              <span>Release Price</span>
            </div>

            <div className="meta-item">
              <strong>001</strong>
              <span>Release Series</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="orb" />

          <div className="floating-label floating-one">
            ✦ THE HUSNAINS EDITION
          </div>

          <div className="floating-label floating-two">
            12 ML · PRIVATE RELEASE
          </div>

          <div className="hero-image-wrap">
            <img
              src={productImage}
              alt="Silent Yahya Husnains Edition"
              className="hero-image"
              onError={(event) => {
                event.currentTarget.src = FALLBACK_PRODUCT;
              }}
            />
          </div>
        </div>
      </section>

      <section className="section" id="story">
        <div className="section-heading">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            THE STORY
          </div>

          <h2>
            Some fragrances
            <br />
            are remembered.
          </h2>

          <p>
            HUSNAINS EDITION was created around a simple idea:
            fragrance should feel personal. The bottle should
            feel intentional. And opening the box should feel
            like receiving something made for you.
          </p>
        </div>

        <div className="story-grid">
          <div className="story-image">
            <img
              src={productImage}
              alt="Husnains Edition fragrance"
              onError={(event) => {
                event.currentTarget.src = FALLBACK_PRODUCT;
              }}
            />

            <div className="story-overlay">
              <span>Silent Yahya · HUSNAINS EDITION</span>
            </div>
          </div>

          <div className="story-copy">
            <h3>
              Not just
              <br />
              another attar.
            </h3>

            <p className="quote">
              “A signature is not what you say about
              yourself. It is what people remember after
              you leave.”
            </p>

            <p>
              This edition is presented with a deliberately
              slower experience — from discovering the
              fragrance, to opening the packaging, to finally
              making it part of your daily ritual.
            </p>

            <p>
              Every element of the release is designed around
              one feeling:
              <strong> quiet confidence.</strong>
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="info-grid">
          <InfoCard
            number="01"
            title="THE BOTTLE"
            emoji="🧴"
            text="A compact 12ml presentation created to feel intimate, collectible and easy to carry."
          />

          <InfoCard
            number="02"
            title="THE RITUAL"
            emoji="🌙"
            text="Designed for moments when you want your fragrance to become part of the atmosphere."
          />

          <InfoCard
            number="03"
            title="THE MEMORY"
            emoji="🖤"
            text="A scent experience built around identity, presence and the moments people remember."
          />
        </div>
      </section>

      <section className="section gallery-section">
        <div className="section-heading">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            THE BOTTLE
          </div>

          <h2>
            Look closer.
            <br />
            Notice everything.
          </h2>
        </div>

        <div className="gallery-grid">
          <div className="gallery-main">
            <img
              src={productImage}
              alt="Husnains Edition product"
              onError={(event) => {
                event.currentTarget.src = FALLBACK_PRODUCT;
              }}
            />

            <div className="gallery-caption">
              <span>HUSNAINS EDITION</span>

              <div className="gallery-counter">
                0{selectedProduct + 1} / 04
              </div>
            </div>
          </div>

          <div className="thumbnail-grid">
            {PRODUCT_IMAGES.map((image, index) => (
              <button
                key={image}
                className={`thumbnail ${
                  selectedProduct === index ? "active" : ""
                }`}
                onClick={() => setSelectedProduct(index)}
                aria-label={`Product image ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`Husnains Edition view ${index + 1}`}
                  onError={(event) => {
                    event.currentTarget.src = FALLBACK_PRODUCT;
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="notes-layout">
          <div className="notes-intro">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              THE SCENT
            </div>

            <h2>
              Let the
              <br />
              fragrance
              <br />
              speak.
            </h2>

            <p>
              Fragrance is difficult to describe through a
              screen. So instead of pretending otherwise, this
              section focuses on the character of the experience
              — how the scent is intended to feel.
            </p>
          </div>

          <div className="notes-list">
            <NoteRow
              index="01"
              title="THE OPENING"
              emoji="✨"
              description="The first impression — immediate, expressive and designed to draw attention."
            />

            <NoteRow
              index="02"
              title="THE HEART"
              emoji="🌹"
              description="The character that develops after the opening begins to settle."
            />

            <NoteRow
              index="03"
              title="THE DEPTH"
              emoji="🪵"
              description="A deeper, warmer character intended to remain close to the skin."
            />

            <NoteRow
              index="04"
              title="THE SIGNATURE"
              emoji="🖤"
              description="The final impression — personal, memorable and distinctly yours."
            />
          </div>
        </div>
      </section>

      <section className="section gallery-section">
        <div className="section-heading">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            THE UNBOXING
          </div>

          <h2>
            The experience
            <br />
            starts before the scent.
          </h2>

          <p>
            The packaging is part of the release. Every layer is
            meant to build anticipation before the bottle is
            finally revealed.
          </p>
        </div>

        <div className="gallery-grid">
          <div className="gallery-main packaging-main">
            <img
              src={packagingImage}
              alt="Husnains Edition packaging"
              onError={(event) => {
                event.currentTarget.src = FALLBACK_PACKAGING;
              }}
            />

            <div className="gallery-caption">
              <span>THE PACKAGING</span>

              <div className="gallery-counter">
                0{selectedPackaging + 1} / 04
              </div>
            </div>
          </div>

          <div className="thumbnail-grid">
            {PACKAGING_IMAGES.map((image, index) => (
              <button
                key={image}
                className={`thumbnail ${
                  selectedPackaging === index ? "active" : ""
                }`}
                onClick={() => setSelectedPackaging(index)}
              >
                <img
                  src={image}
                  alt={`Packaging view ${index + 1}`}
                  onError={(event) => {
                    event.currentTarget.src =
                      FALLBACK_PACKAGING;
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            INSIDE THE RELEASE
          </div>

          <h2>
            What arrives
            <br />
            at your door.
          </h2>
        </div>

        <div className="receive-grid">
          <ReceiveCard
            emoji="🧴"
            title="12 ML ATTAR"
            text="The HUSNAINS EDITION fragrance bottle."
          />

          <ReceiveCard
            emoji="📦"
            title="PRESENTATION BOX"
            text="The dedicated release packaging."
          />

          <ReceiveCard
            emoji="🏷️"
            title="RELEASE ID"
            text="Your reservation is associated with a unique release position."
          />

          <ReceiveCard
            emoji="📍"
            title="ORDER TRACKING"
            text="Track your reservation and order journey online."
          />
        </div>
      </section>

      <section className="section">
        <div className="launch-panel">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            THE RELEASE IS LIVE
          </div>

          <h2>
            Your position
            <br />
            is waiting.
          </h2>

          <p>
            Begin the private release process. We will search
            for an available position, collect your delivery
            details, and create your temporary reservation.
          </p>

          <div className="launch-price">
            {formatMoney(price)} · 12 ML
          </div>

          <button className="gold-button" onClick={onBook}>
            🔐 BOOK MY SLOT
          </button>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            BEFORE YOU RESERVE
          </div>

          <h2>
            Read it once.
            <br />
            Know everything.
          </h2>
        </div>

        <div className="policies">
          <Policy
            title="🚚 Shipping Policy"
            text="Orders are processed after payment verification. Shipping and delivery timelines depend on the destination and courier network. Tracking information will be made available once the order enters the shipping stage."
          />

          <Policy
            title="↩️ Refund & Cancellation Policy"
            text="Please review the final business refund and cancellation terms before publishing this page. Payment verification and fulfilment status may affect whether cancellation or refund is available."
          />

          <Policy
            title="📜 Terms & Conditions"
            text="By reserving a release position, you agree to provide accurate contact and delivery information and to follow the payment instructions shown during checkout."
          />

          <Policy
            title="🔐 Privacy Policy"
            text="Customer information is used for reservation processing, payment verification, communication and order fulfilment. Do not publish any broader data-use claim until your final privacy policy has been confirmed."
          />

          <Policy
            title="💳 Payment Policy"
            text="Payments for this release are submitted using the payment method displayed during checkout. Manual payment verification may be required before a reservation becomes secured."
          />
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            FAQ
          </div>

          <h2>
            Questions before
            <br />
            you enter?
          </h2>
        </div>

        <div className="policies">
          <Policy
            title="❓ What is HUSNAINS EDITION?"
            text="HUSNAINS EDITION is a 12ml Silent Yahya fragrance release presented as a limited private-release experience."
          />

          <Policy
            title="⏳ How does the reservation work?"
            text="You begin by booking your position. The system checks the active release, collects your delivery details and creates a temporary reservation with a 10-minute payment window."
          />

          <Policy
            title="💰 What is the price?"
            text={`The current release price is ${formatMoney(
              price
            )}.`}
          />

          <Policy
            title="📱 How do I pay?"
            text="After your reservation is created, the payment screen displays the available payment instructions and QR code."
          />

          <Policy
            title="📦 Can I track my order?"
            text="Yes. Once your reservation has been created, your reservation ID can be used to access the tracking journey."
          />
        </div>
      </section>
    </>
  );
}

/* ============================================================
   COMPONENTS
============================================================ */

function InfoCard({
  number,
  title,
  emoji,
  text,
}: {
  number: string;
  title: string;
  emoji: string;
  text: string;
}) {
  return (
    <article className="info-card">
      <div className="info-number">
        {number} · {emoji}
      </div>

      <h3>{title}</h3>

      <p>{text}</p>
    </article>
  );
}

function NoteRow({
  index,
  title,
  emoji,
  description,
}: {
  index: string;
  title: string;
  emoji: string;
  description: string;
}) {
  return (
    <div className="note-row">
      <div className="note-index">{index}</div>

      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <div className="note-icon">{emoji}</div>
    </div>
  );
}

function ReceiveCard({
  emoji,
  title,
  text,
}: {
  emoji: string;
  title: string;
  text: string;
}) {
  return (
    <article className="receive-card">
      <div className="emoji">{emoji}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function Policy({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <details className="policy">
      <summary>{title}</summary>
      <div className="policy-content">{text}</div>
    </details>
  );
}

/* ============================================================
   SEARCH EXPERIENCE
============================================================ */

function SearchExperience({
  progress,
  stage,
  onBack,
}: {
  progress: number;
  stage: number;
  onBack: () => void;
}) {
  return (
    <section className="experience-screen">
      <div className="experience-box">
        <div className="eyebrow">
          <span className="eyebrow-line" />
          PRIVATE RELEASE SYSTEM
        </div>

        <h1>
          Searching for
          <br />
          your position.
        </h1>

        <p>
          Please stay on this page while the release system
          checks the current reservation capacity.
        </p>

        <div className="radar">
          <div className="radar-line" />
          <div className="radar-dot dot-one" />
          <div className="radar-dot dot-two" />
          <div className="radar-dot dot-three" />
        </div>

        <div className="search-progress">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="progress-meta">
            <span>SECURE CONNECTION</span>
            <span>{progress}%</span>
          </div>
        </div>

        <div className="search-steps">
          {SEARCH_STAGES.map((item, index) => {
            const active = index === stage;
            const done = index < stage;

            return (
              <div
                key={item.title}
                className={`search-step ${
                  active ? "active" : ""
                } ${done ? "done" : ""}`}
              >
                <div className="step-icon">
                  {done ? "✓" : index + 1}
                </div>

                <div>
                  <strong>{item.title}</strong>
                  <div
                    style={{
                      marginTop: 4,
                      color: active ? "#746f66" : "#3f3d39",
                      letterSpacing: "0.04em",
                      fontSize: 9,
                    }}
                  >
                    {item.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {progress < 5 && (
          <button
            className="dark-button"
            style={{ marginTop: 30 }}
            onClick={onBack}
          >
            CANCEL
          </button>
        )}
      </div>
    </section>
  );
}

/* ============================================================
   ADDRESS
============================================================ */

function AddressExperience({
  form,
  updateForm,
  onSubmit,
  onBack,
  error,
  price,
}: {
  form: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  updateForm: (
    field:
      | "name"
      | "email"
      | "phone"
      | "address"
      | "city"
      | "state"
      | "pincode"
      | "country",
    value: string
  ) => void;
  onSubmit: () => void;
  onBack: () => void;
  error: string;
  price: number;
}) {
  return (
    <section className="form-screen">
      <div className="form-container">
        <div className="form-header">
          <div className="eyebrow">
            <span className="eyebrow-line" />
            POSITION FOUND
          </div>

          <h1>
            Tell us where
            <br />
            to send it.
          </h1>

          <p>
            Your release position is being prepared. Enter
            accurate details so we can create your temporary
            reservation and continue to payment.
          </p>
        </div>

        <div className="form-layout">
          <div>
            <div className="form">
              <div className="field">
                <label>Full Name</label>
                <input
                  value={form.name}
                  onChange={(event) =>
                    updateForm("name", event.target.value)
                  }
                  placeholder="Your full name"
                />
              </div>

              <div className="field">
                <label>Phone Number</label>
                <input
                  value={form.phone}
                  onChange={(event) =>
                    updateForm("phone", event.target.value)
                  }
                  placeholder="10-digit mobile number"
                  inputMode="tel"
                />
              </div>

              <div className="field full">
                <label>Email Address</label>
                <input
                  value={form.email}
                  onChange={(event) =>
                    updateForm("email", event.target.value)
                  }
                  placeholder="you@example.com"
                  type="email"
                />
              </div>

              <div className="field full">
                <label>Delivery Address</label>
                <textarea
                  value={form.address}
                  onChange={(event) =>
                    updateForm(
                      "address",
                      event.target.value
                    )
                  }
                  placeholder="House / Flat / Street / Area"
                />
              </div>

              <div className="field">
                <label>City</label>
                <input
                  value={form.city}
                  onChange={(event) =>
                    updateForm("city", event.target.value)
                  }
                  placeholder="City"
                />
              </div>

              <div className="field">
                <label>State</label>
                <select
                  value={form.state}
                  onChange={(event) =>
                    updateForm("state", event.target.value)
                  }
                >
                  <option value="">Select state</option>

                  {STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Pincode</label>
                <input
                  value={form.pincode}
                  onChange={(event) =>
                    updateForm(
                      "pincode",
                      event.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="6-digit pincode"
                  inputMode="numeric"
                  maxLength={6}
                />
              </div>

              <div className="field">
                <label>Country</label>
                <input
                  value={form.country}
                  onChange={(event) =>
                    updateForm(
                      "country",
                      event.target.value
                    )
                  }
                />
              </div>
            </div>

            {error && <div className="error-box">⚠️ {error}</div>}

            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 25,
                flexWrap: "wrap",
              }}
            >
              <button
                className="dark-button"
                onClick={onBack}
              >
                ← BACK
              </button>

              <button
                className="gold-button"
                onClick={onSubmit}
              >
                CONTINUE TO PAYMENT →
              </button>
            </div>
          </div>

          <aside className="order-summary">
            <div className="summary-label">
              YOUR RELEASE
            </div>

            <div className="summary-product">
              🖤 HUSNAINS EDITION
              <br />
              <span
                style={{
                  color: "#68645e",
                  fontSize: 11,
                  fontWeight: 400,
                }}
              >
                12 ML · SILENT YAHYA
              </span>
            </div>

            <div className="summary-price">
              {formatMoney(price)}
            </div>

            <div className="summary-line">
              🔐 Temporary reservation
              <br />
              ⏳ 10-minute payment window after
              reservation creation
              <br />
              📦 Delivery details saved securely
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PAYMENT
============================================================ */

function PaymentExperience({
  reservation,
  countdown,
  onSubmitted,
  onBack,
  error,
}: {
  reservation: ReservationData;
  countdown: number;
  onSubmitted: () => void;
  onBack: () => void;
  error: string;
}) {
  const upiLink =
    `upi://pay?pa=9121783895%40fam` +
    `&pn=Silent%20Yahya` +
    `&am=${Number(reservation.price || 999).toFixed(2)}` +
    `&cu=INR` +
    `&tn=HUSNAINS%20EDITION`;

  return (
    <section className="experience-screen">
      <div className="payment-container">
        <div className="payment-header">
          <div className="reservation-chip">
            ✓ POSITION TEMPORARILY HELD
          </div>

          <h1>
            One final
            <br />
            step.
          </h1>

          <p
            style={{
              color: "#77736c",
              lineHeight: 1.7,
              maxWidth: 550,
              margin: "auto",
            }}
          >
            Complete the payment within the reservation window
            shown below. Payment confirmation may require
            manual verification.
          </p>
        </div>

        <div className="payment-grid">
          <div className="payment-card qr-card">
            <h2>💳 Complete Payment</h2>

            <p>
              Scan the QR code using your UPI app or use the
              button below if your device supports UPI links.
            </p>

            <div className="qr-wrap">
              <img
                src="/images/fampay-qr.png"
                alt="Silent Yahya FamPay payment QR"
              />
            </div>

            <div
              style={{
                color: "#d8b66b",
                fontWeight: 800,
                fontSize: 27,
              }}
            >
              {formatMoney(reservation.price)}
            </div>

            <p
              style={{
                marginTop: 8,
                color: "#5f5b55",
              }}
            >
              Silent Yahya · FamPay
            </p>

            <a
              href={upiLink}
              className="tracking-button"
              style={{
                width: "100%",
              }}
            >
              📱 OPEN UPI PAYMENT
            </a>

            {error && (
              <div className="error-box">{error}</div>
            )}

            <button
              className="gold-button"
              style={{
                width: "100%",
                marginTop: 12,
              }}
              onClick={onSubmitted}
              disabled={countdown <= 0}
            >
              ✓ I HAVE COMPLETED PAYMENT
            </button>

            <button
              className="dark-button"
              style={{
                width: "100%",
                marginTop: 12,
              }}
              onClick={onBack}
            >
              ← BACK
            </button>
          </div>

          <div className="payment-card slot-card">
            <div className="summary-label">
              YOUR RELEASE POSITION
            </div>

            <div className="slot-number">
              {reservation.slotName}
            </div>

            <p>
              This position has been temporarily assigned to
              your reservation.
            </p>

            <div className="countdown">
              <div className="countdown-label">
                PAYMENT WINDOW
              </div>

              <div className="countdown-time">
                {formatTime(countdown)}
              </div>
            </div>

            <div className="reservation-details">
              <div className="detail-row">
                <span>Reservation</span>
                <span>{reservation.id}</span>
              </div>

              <div className="detail-row">
                <span>Release</span>
                <span>HUSNAINS EDITION</span>
              </div>

              <div className="detail-row">
                <span>Amount</span>
                <span>
                  {formatMoney(reservation.price)}
                </span>
              </div>

              <div className="detail-row">
                <span>Status</span>
                <span>PENDING PAYMENT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SUBMITTED
============================================================ */

function SubmittedExperience({
  reservation,
}: {
  reservation: ReservationData;
}) {
  return (
    <section className="experience-screen">
      <div className="submitted-box">
        <div className="success-symbol">✓</div>

        <div className="eyebrow" style={{ marginTop: 30 }}>
          PAYMENT SUBMISSION RECEIVED
        </div>

        <h1>
          Your request
          <br />
          is in review.
        </h1>

        <p>
          We have received your payment confirmation request.
          Manual verification may be required before your
          reservation becomes secured.
        </p>

        <div className="reservation-details">
          <div className="detail-row">
            <span>Reservation</span>
            <span>{reservation.id}</span>
          </div>

          <div className="detail-row">
            <span>Position</span>
            <span>{reservation.slotName}</span>
          </div>

          <div className="detail-row">
            <span>Order Status</span>
            <span>PROCESSING</span>
          </div>

          <div className="detail-row">
            <span>Payment</span>
            <span>SUBMITTED FOR REVIEW</span>
          </div>
        </div>

        <Link
          href={`/tracking/${reservation.id}`}
          className="tracking-button"
        >
          📦 TRACK MY RESERVATION →
        </Link>
      </div>
    </section>
  );
}

/* ============================================================
   SUCCESS
============================================================ */

function SuccessExperience({
  reservation,
}: {
  reservation: ReservationData;
}) {
  return (
    <section className="experience-screen">
      <div className="success-box">
        <div className="success-symbol">✓</div>

        <div className="eyebrow" style={{ marginTop: 30 }}>
          RESERVATION SECURED
        </div>

        <h1>
          Welcome to
          <br />
          HUSNAINS.
        </h1>

        <p>
          Your reservation has been secured. Keep your
          reservation ID safe for tracking and future
          communication.
        </p>

        <div className="reservation-details">
          <div className="detail-row">
            <span>Reservation</span>
            <span>{reservation.id}</span>
          </div>

          <div className="detail-row">
            <span>Position</span>
            <span>{reservation.slotName}</span>
          </div>

          <div className="detail-row">
            <span>Release</span>
            <span>HUSNAINS EDITION</span>
          </div>

          <div className="detail-row">
            <span>Status</span>
            <span>SECURED</span>
          </div>
        </div>

        <Link
          href={`/tracking/${reservation.id}`}
          className="tracking-button"
        >
          📦 TRACK YOUR ORDER →
        </Link>
      </div>
    </section>
  );
}

/* ============================================================
   FOOTER
============================================================ */

function Footer() {
  return (
    <footer className="footer">
      <div>
        <strong>SILENT YAHYA</strong>
        <br />
        HUSNAINS EDITION
      </div>

      <div>
        Crafted for the ones
        <br />
        who leave a memory.
      </div>

      <div>
        © {new Date().getFullYear()} SILENT YAHYA
      </div>
    </footer>
  );
}