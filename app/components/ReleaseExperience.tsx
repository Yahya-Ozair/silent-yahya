"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: string;
  expiresAt: string;
  slotNumber?: number;
  slotName?: string;
}

interface ActivityItem {
  id: string;
  securedAt: string;
}

const INDIA_STATES: Record<string, string[]> = {
  "Andhra Pradesh": [
    "Visakhapatnam",
    "Vijayawada",
    "Guntur",
    "Nellore",
    "Kurnool",
    "Tirupati",
    "Rajahmundry",
    "Kadapa",
  ],
  Telangana: [
    "Hyderabad",
    "Warangal",
    "Nizamabad",
    "Karimnagar",
    "Khammam",
    "Ramagundam",
    "Mahbubnagar",
    "Adilabad",
  ],
  Karnataka: [
    "Bengaluru",
    "Mysuru",
    "Mangaluru",
    "Hubballi",
    "Belagavi",
    "Dharwad",
    "Kalaburagi",
    "Shivamogga",
  ],
  Maharashtra: [
    "Mumbai",
    "Pune",
    "Nagpur",
    "Nashik",
    "Thane",
    "Aurangabad",
    "Kolhapur",
    "Navi Mumbai",
  ],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
    "Tiruppur",
    "Erode",
    "Vellore",
    "Thoothukudi",
  ],
  Kerala: [
    "Thiruvananthapuram",
    "Kochi",
    "Kozhikode",
    "Thrissur",
    "Kollam",
    "Kannur",
    "Alappuzha",
    "Kottayam",
  ],
  Gujarat: [
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Bhavnagar",
    "Jamnagar",
    "Gandhinagar",
    "Junagadh",
  ],
  Rajasthan: [
    "Jaipur",
    "Jodhpur",
    "Udaipur",
    "Kota",
    "Ajmer",
    "Bikaner",
    "Alwar",
    "Bharatpur",
  ],
  Delhi: ["New Delhi", "Delhi"],
  Punjab: [
    "Ludhiana",
    "Amritsar",
    "Jalandhar",
    "Patiala",
    "Bathinda",
    "Mohali",
    "Pathankot",
  ],
  Haryana: [
    "Gurugram",
    "Faridabad",
    "Panipat",
    "Ambala",
    "Hisar",
    "Rohtak",
    "Karnal",
    "Sonipat",
  ],
  Bihar: [
    "Patna",
    "Gaya",
    "Bhagalpur",
    "Muzaffarpur",
    "Darbhanga",
    "Purnia",
    "Ara",
  ],
  Odisha: [
    "Bhubaneswar",
    "Cuttack",
    "Rourkela",
    "Berhampur",
    "Sambalpur",
    "Puri",
    "Balasore",
  ],
  "West Bengal": [
    "Kolkata",
    "Howrah",
    "Durgapur",
    "Asansol",
    "Siliguri",
    "Kharagpur",
    "Darjeeling",
  ],
  "Uttar Pradesh": [
    "Lucknow",
    "Kanpur",
    "Ghaziabad",
    "Agra",
    "Varanasi",
    "Prayagraj",
    "Meerut",
    "Noida",
    "Bareilly",
    "Aligarh",
  ],
  Uttarakhand: [
    "Dehradun",
    "Haridwar",
    "Rishikesh",
    "Haldwani",
    "Nainital",
    "Roorkee",
  ],
  "Himachal Pradesh": [
    "Shimla",
    "Manali",
    "Dharamshala",
    "Solan",
    "Mandi",
    "Kullu",
    "Baddi",
  ],
  Jharkhand: [
    "Ranchi",
    "Jamshedpur",
    "Dhanbad",
    "Bokaro",
    "Deoghar",
    "Hazaribagh",
  ],
  Chhattisgarh: [
    "Raipur",
    "Bhilai",
    "Bilaspur",
    "Korba",
    "Durg",
    "Raigarh",
    "Jagdalpur",
  ],
  Goa: [
    "Panaji",
    "Margao",
    "Vasco da Gama",
    "Mapusa",
    "Ponda",
  ],
  Assam: [
    "Guwahati",
    "Silchar",
    "Dibrugarh",
    "Jorhat",
    "Nagaon",
    "Tinsukia",
    "Tezpur",
  ],
  "Jammu and Kashmir": [
    "Srinagar",
    "Jammu",
    "Anantnag",
    "Baramulla",
    "Kathua",
  ],
  Ladakh: ["Leh", "Kargil"],
  Puducherry: [
    "Puducherry",
    "Karaikal",
    "Mahe",
    "Yanam",
  ],
  Chandigarh: ["Chandigarh"],
};

const SEARCH_STEPS = [
  {
    emoji: "🔎",
    title: "Initializing secure search",
    text: "Connecting to the private release allocation system...",
  },
  {
    emoji: "🛰️",
    title: "Scanning the release pool",
    text: "Checking current collector allocations...",
  },
  {
    emoji: "🧭",
    title: "Searching available positions",
    text: "Looking through the active allocation pool...",
  },
  {
    emoji: "🔐",
    title: "Checking live availability",
    text: "Verifying which positions can still be secured...",
  },
  {
    emoji: "✨",
    title: "Matching your request",
    text: "Trying to find an available position for you...",
  },
  {
    emoji: "🎟️",
    title: "Final allocation check",
    text: "One last verification before we reveal your position...",
  },
  {
    emoji: "👑",
    title: "Allocation located",
    text: "A position has been found for you.",
  },
];

export default function ReleaseExperience() {
  const router = useRouter();

  const [release, setRelease] = useState<ReleaseState>({
    status: "DRAFT",
    totalSlots: 50,
    securedSlots: 0,
    releaseName: "HUSNAINS EDITION",
    price: 999,
    launchAt: "",
    releasedAt: null,
  });

  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activityIndex, setActivityIndex] = useState(0);

  const [searching, setSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchStep, setSearchStep] = useState(0);
  const [searchComplete, setSearchComplete] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [reservation, setReservation] =
    useState<Reservation | null>(null);

  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  async function refreshRelease() {
    try {
      const response = await fetch(
        "/api/release?t=" + Date.now(),
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (data.success && data.release) {
        setRelease(data.release);
      }
    } catch (err) {
      console.error("Release refresh failed:", err);
    }
  }

  async function refreshActivity() {
    try {
      const response = await fetch(
        "/api/release/activity?t=" + Date.now(),
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (
        data.success &&
        Array.isArray(data.activity)
      ) {
        setActivity(data.activity);
      }
    } catch (err) {
      console.error("Activity refresh failed:", err);
    }
  }

  useEffect(() => {
    refreshRelease();
    refreshActivity();

    const interval = window.setInterval(() => {
      refreshRelease();
      refreshActivity();
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activity.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActivityIndex((current) => {
        return (current + 1) % activity.length;
      });
    }, 5000);

    return () => window.clearInterval(interval);
  }, [activity.length]);

  useEffect(() => {
    if (!reservation?.expiresAt) {
      setSecondsLeft(0);
      return;
    }

    const updateTimer = () => {
      const expiry =
        new Date(reservation.expiresAt).getTime();

      const difference = expiry - Date.now();

      setSecondsLeft(
        Math.max(Math.floor(difference / 1000), 0)
      );
    };

    updateTimer();

    const interval = window.setInterval(
      updateTimer,
      1000
    );

    return () => window.clearInterval(interval);
  }, [reservation]);

  const remainingSlots = Math.max(
    release.totalSlots - release.securedSlots,
    0
  );

  const allocationProgress =
    release.totalSlots > 0
      ? Math.min(
          (release.securedSlots /
            release.totalSlots) *
            100,
          100
        )
      : 0;

  const availableCities = state
    ? INDIA_STATES[state] || []
    : [];

  const currentActivity =
    activity.length > 0
      ? activity[activityIndex % activity.length]
      : null;

  const searchData =
    SEARCH_STEPS[
      Math.min(searchStep, SEARCH_STEPS.length - 1)
    ];

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const slotDisplay = useMemo(() => {
    if (!reservation) {
      return "PENDING";
    }

    if (reservation.slotName) {
      return reservation.slotName;
    }

    if (reservation.slotNumber) {
      return (
        "HY-" +
        String(reservation.slotNumber).padStart(2, "0")
      );
    }

    return "HUSNAINS / RESERVED";
  }, [reservation]);

  function formatActivityTime(date: string) {
    const difference = Math.max(
      0,
      Date.now() - new Date(date).getTime()
    );

    const secondsAgo = Math.floor(
      difference / 1000
    );

    if (secondsAgo < 10) {
      return "just now";
    }

    if (secondsAgo < 60) {
      return secondsAgo + "s ago";
    }

    const minutesAgo = Math.floor(
      secondsAgo / 60
    );

    if (minutesAgo < 60) {
      return minutesAgo + "m ago";
    }

    const hoursAgo = Math.floor(
      minutesAgo / 60
    );

    if (hoursAgo < 24) {
      return hoursAgo + "h ago";
    }

    return (
      Math.floor(hoursAgo / 24) +
      "d ago"
    );
  }

  function beginSlotSearch() {
    if (release.status !== "LIVE") {
      setError(
        "The release is not currently open."
      );
      return;
    }

    if (remainingSlots <= 0) {
      setError(
        "There are currently no available positions."
      );
      return;
    }

    setError("");
    setSearchProgress(0);
    setSearchStep(0);
    setSearchComplete(false);
    setSearching(true);

    const duration =
      8500 + Math.floor(Math.random() * 3500);

    const start = Date.now();

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start;

      const percentage = Math.min(
        (elapsed / duration) * 100,
        100
      );

      setSearchProgress(percentage);

      const calculatedStep = Math.min(
        Math.floor(
          (percentage / 100) *
            SEARCH_STEPS.length
        ),
        SEARCH_STEPS.length - 1
      );

      setSearchStep(calculatedStep);

      if (percentage >= 100) {
        window.clearInterval(interval);

        window.setTimeout(() => {
          setSearching(false);
          setSearchComplete(true);
          setShowForm(true);
        }, 900);
      }
    }, 100);
  }

  async function createReservation() {
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!address.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    if (!country) {
      setError("Please select your country.");
      return;
    }

    if (!state) {
      setError("Please select your state.");
      return;
    }

    if (!city) {
      setError("Please select your city.");
      return;
    }

    if (
      country === "India" &&
      !/^\d{6}$/.test(pincode.trim())
    ) {
      setError(
        "Please enter a valid 6-digit pincode."
      );
      return;
    }

    if (
      country !== "India" &&
      !pincode.trim()
    ) {
      setError(
        "Please enter your postal / ZIP code."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        "/api/reservation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            address: address.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
            country: country.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.error ||
            "Unable to reserve your position."
        );
        return;
      }

      setReservation(data.reservation);

      await refreshRelease();
    } catch (err) {
      console.error("Reservation error:", err);

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existing = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );

      if (existing) {
        existing.addEventListener(
          "load",
          () => resolve(true)
        );

        existing.addEventListener(
          "error",
          () => resolve(false)
        );

        return;
      }

      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  }

  async function startPayment() {
    if (!reservation?.id) {
      setError("Reservation not found.");
      return;
    }

    if (secondsLeft <= 0) {
      setError(
        "Your reservation has expired."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch(
        "/api/payment/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reservationId: reservation.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.error ||
            "Unable to create payment."
        );
        return;
      }

      const loaded =
        await loadRazorpayScript();

      if (!loaded) {
        setError(
          "Unable to load Razorpay Checkout."
        );
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Silent Yahya",
        description: release.releaseName,
        order_id: data.order.id,

        prefill: {
          name: reservation.name,
          email: reservation.email,
          contact: reservation.phone,
        },

        notes: {
          reservationId: reservation.id,
        },

        theme: {
          color: "#D4AF37",
        },

        modal: {
          ondismiss: () => {
            setSubmitting(false);
          },
        },

        handler: async (
          paymentResponse: any
        ) => {
          try {
            setSubmitting(true);
            setError("");

            const verifyResponse =
              await fetch(
                "/api/payment/verify",
                {
                  method: "POST",
                  headers: {
                    "Content-Type":
                      "application/json",
                  },
                  body: JSON.stringify({
                    razorpay_order_id:
                      paymentResponse.razorpay_order_id,

                    razorpay_payment_id:
                      paymentResponse.razorpay_payment_id,

                    razorpay_signature:
                      paymentResponse.razorpay_signature,

                    reservationId:
                      reservation.id,
                  }),
                }
              );

            const verifyData =
              await verifyResponse.json();

            if (
              !verifyResponse.ok ||
              !verifyData.success
            ) {
              setError(
                verifyData.error ||
                  "Payment verification failed."
              );
              return;
            }

            const securedReservation =
              verifyData.reservation;

            setReservation(
              (current) =>
                current
                  ? {
                      ...current,
                      status: "SECURED",
                      slotName:
                        securedReservation?.slotName ||
                        current.slotName,
                      slotNumber:
                        securedReservation?.slotNumber ||
                        current.slotNumber,
                    }
                  : current
            );

            await refreshRelease();
            await refreshActivity();

            /*
             * Give the success state a moment to render,
             * then take the collector to tracking.
             */
            window.setTimeout(() => {
              router.push(
                "/tracking/" + reservation.id
              );
            }, 1800);
          } catch (err) {
            console.error(
              "Verification error:",
              err
            );

            setError(
              "Payment was received but verification failed."
            );
          } finally {
            setSubmitting(false);
          }
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        (response: any) => {
          console.error(
            "Payment failed:",
            response
          );

          setError(
            response?.error?.description ||
              "Payment failed."
          );

          setSubmitting(false);
        }
      );

      razorpay.open();
    } catch (err) {
      console.error("Payment error:", err);

      setError(
        "Unable to start payment."
      );

      setSubmitting(false);
    }
  }

  function closeForm() {
    if (submitting) {
      return;
    }

    setShowForm(false);
    setError("");

    if (!reservation) {
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setCountry("India");
      setState("");
      setCity("");
      setPincode("");
    }
  }

  function handleStateChange(
    selectedState: string
  ) {
    setState(selectedState);
    setCity("");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#030303] text-white">

      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-250px] h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-[#D4AF37]/[0.055] blur-[170px]" />

        <div className="absolute bottom-[-250px] left-[-150px] h-[500px] w-[500px] rounded-full bg-white/[0.018] blur-[150px]" />

        <div className="absolute right-[-150px] top-1/2 h-[500px] w-[500px] rounded-full bg-[#D4AF37]/[0.025] blur-[150px]" />
      </div>

      {/* HERO */}

      <section className="relative flex min-h-screen items-center justify-center px-5 py-24">

        <div className="relative z-10 w-full max-w-6xl">

          <div className="grid items-center gap-16 lg:grid-cols-2">

            {/* PRODUCT */}

            <div className="order-2 flex justify-center lg:order-1">

              <div className="relative">

                <div className="absolute -inset-20 rounded-full bg-[#D4AF37]/[0.045] blur-[100px]" />

                <div className="absolute -inset-10 rounded-full border border-[#D4AF37]/10" />

                <div className="absolute -inset-16 rounded-full border border-white/[0.025]" />

                <div className="relative h-[410px] w-[300px] overflow-hidden rounded-[42px] border border-white/10 bg-gradient-to-b from-white/[0.07] via-white/[0.025] to-black shadow-2xl">

                  <Image
                    src="/images/shanaya.png"
                    alt="Silent Yahya Husnains Edition"
                    fill
                    priority
                    sizes="300px"
                    className="object-contain p-8"
                  />

                  <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  <div className="absolute bottom-7 left-0 right-0 text-center">

                    <p className="text-[8px] uppercase tracking-[0.55em] text-[#D4AF37]/70">
                      SILENT YAHYA
                    </p>

                    <p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-white/60">
                      HUSNAINS EDITION
                    </p>

                  </div>

                </div>

                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] uppercase tracking-[0.5em] text-white/20">
                  A LIMITED COLLECTOR CREATION
                </div>

              </div>

            </div>

            {/* CONTENT */}

            <div className="order-1 text-center lg:order-2 lg:text-left">

              <p className="text-[9px] uppercase tracking-[0.65em] text-white/30">
                SILENT YAHYA
              </p>

              <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/[0.035] px-5 py-2">

                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D4AF37]" />

                <span className="text-[8px] uppercase tracking-[0.35em] text-[#D4AF37]/70">
                  PRIVATE RELEASE
                </span>

              </div>

              <h1 className="mt-9 text-6xl font-extralight leading-[0.88] tracking-[0.05em] sm:text-7xl md:text-8xl">

                THE NEXT

                <br />

                <span className="text-white/25">
                  RELEASE
                </span>

              </h1>

              <p className="mt-8 text-[10px] uppercase tracking-[0.5em] text-[#D4AF37]/60">
                {release.releaseName}
              </p>

              <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/35 lg:mx-0">
                An exclusive Silent Yahya
                creation reserved for a
                limited number of collectors.
                <br />
                <span className="text-white/55">
                  Your position is discovered
                  before it can be secured.
                </span>
              </p>

              {/* LIVE ACTIVITY */}

              {release.status === "LIVE" &&
                currentActivity && (
                  <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.025] px-5 py-3">

                    <span className="relative flex h-2 w-2">

                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />

                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />

                    </span>

                    <span className="text-[8px] uppercase tracking-[0.2em] text-white/40">
                      A collector just secured
                      a position
                    </span>

                    <span className="text-[8px] text-white/20">
                      {formatActivityTime(
                        currentActivity.securedAt
                      )}
                    </span>

                  </div>
                )}

              {/* MAIN CARD */}

              <div className="mt-10 max-w-xl rounded-[32px] border border-white/10 bg-white/[0.025] p-7 shadow-2xl backdrop-blur-xl">

                <div className="flex items-end justify-between">

                  <div className="text-left">

                    <p className="text-[8px] uppercase tracking-[0.35em] text-white/25">
                      Collector Pool
                    </p>

                    <p className="mt-3 text-3xl font-extralight">
                      {release.totalSlots}
                    </p>

                    <p className="mt-1 text-[8px] uppercase tracking-[0.25em] text-white/20">
                      Exclusive Positions
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-2xl font-light text-[#D4AF37]">
                      ₹
                      {release.price.toLocaleString(
                        "en-IN"
                      )}
                    </p>

                    <p className="mt-1 text-[8px] uppercase tracking-[0.25em] text-white/20">
                      Edition Price
                    </p>

                  </div>

                </div>

                <div className="mt-7">

                  <div className="flex justify-between text-[8px] uppercase tracking-[0.2em] text-white/20">

                    <span>
                      Release activity
                    </span>

                    <span>
                      {release.securedSlots}/
                      {release.totalSlots}
                    </span>

                  </div>

                  <div className="mt-3 h-[2px] overflow-hidden rounded-full bg-white/10">

                    <div
                      className="h-full bg-[#D4AF37] transition-all duration-1000"
                      style={{
                        width:
                          allocationProgress +
                          "%",
                      }}
                    />

                  </div>

                </div>

                {/* SEARCH BUTTON */}

                <button
                  type="button"
                  onClick={beginSlotSearch}
                  disabled={
                    searching ||
                    release.status !== "LIVE" ||
                    remainingSlots <= 0
                  }
                  className="group relative mt-8 w-full overflow-hidden rounded-2xl bg-white px-6 py-5 text-black transition duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
                >

                  <span className="relative z-10 flex items-center justify-center gap-3 text-[10px] font-semibold tracking-[0.3em]">

                    <span className="text-base">
                      🔎
                    </span>

                    {release.status !== "LIVE"
                      ? "RELEASE NOT OPEN"
                      : remainingSlots <= 0
                      ? "RELEASE CLOSED"
                      : "SEARCH FOR MY SLOT"}

                  </span>

                  <div className="absolute inset-0 -translate-x-full bg-[#D4AF37]/30 transition-transform duration-700 group-hover:translate-x-0" />

                </button>

                <div className="mt-5 flex items-center justify-center gap-2 text-[8px] uppercase tracking-[0.25em] text-white/15">

                  <span>🔐</span>

                  <span>
                    Live allocation check
                  </span>

                </div>

              </div>

              {/* TRUST INFO */}

              <div className="mt-7 grid max-w-xl grid-cols-3 gap-3">

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">

                  <p className="text-xl">
                    🎟️
                  </p>

                  <p className="mt-2 text-[7px] uppercase tracking-[0.2em] text-white/25">
                    Named Slot
                  </p>

                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">

                  <p className="text-xl">
                    🔐
                  </p>

                  <p className="mt-2 text-[7px] uppercase tracking-[0.2em] text-white/25">
                    Secure Payment
                  </p>

                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-center">

                  <p className="text-xl">
                    👑
                  </p>

                  <p className="mt-2 text-[7px] uppercase tracking-[0.2em] text-white/25">
                    Collector
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* SEARCH EXPERIENCE */}

      {searching && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/[0.97] px-6 backdrop-blur-2xl">

          <div className="w-full max-w-md text-center">

            <div className="relative mx-auto flex h-36 w-36 items-center justify-center">

              <div className="absolute inset-0 animate-ping rounded-full border border-[#D4AF37]/20" />

              <div className="absolute inset-3 animate-[spin_5s_linear_infinite] rounded-full border border-dashed border-[#D4AF37]/30" />

              <div className="absolute inset-8 rounded-full border border-white/10" />

              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.025]">

                <span className="animate-pulse text-4xl">
                  {searchData.emoji}
                </span>

              </div>

            </div>

            <p className="mt-10 text-[9px] uppercase tracking-[0.5em] text-[#D4AF37]/60">
              PRIVATE ALLOCATION SYSTEM
            </p>

            <h2 className="mt-5 text-3xl font-extralight tracking-wide">
              {searchData.title}
            </h2>

            <p className="mt-4 min-h-[42px] text-sm leading-6 text-white/35">
              {searchData.text}
            </p>

            <div className="mt-9 h-1 overflow-hidden rounded-full bg-white/10">

              <div
                className="h-full bg-gradient-to-r from-[#8f7425] via-[#D4AF37] to-[#f5d76e] transition-all duration-300"
                style={{
                  width:
                    searchProgress + "%",
                }}
              />

            </div>

            <div className="mt-4 flex justify-between text-[8px] uppercase tracking-[0.2em] text-white/20">

              <span>
                {searchProgress < 25
                  ? "CONNECTING"
                  : searchProgress < 50
                  ? "SCANNING"
                  : searchProgress < 80
                  ? "MATCHING"
                  : "FINALIZING"}
              </span>

              <span>
                {Math.floor(searchProgress)}
                %
              </span>

            </div>

            {/* SEARCH STATUS */}

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.025] p-5">

              <div className="flex items-center gap-4 text-left">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37]/[0.06]">

                  <span className="animate-pulse text-lg">
                    {searchData.emoji}
                  </span>

                </div>

                <div>

                  <p className="text-[8px] uppercase tracking-[0.25em] text-white/20">
                    Search status
                  </p>

                  <p className="mt-1 text-xs text-white/55">
                    Please keep this window
                    open while we search.
                  </p>

                </div>

              </div>

            </div>

            <p className="mt-10 text-[8px] uppercase tracking-[0.3em] text-white/15">
              ⏳ This may take a few moments
            </p>

          </div>

        </div>
      )}

      {/* FORM / RESERVATION MODAL */}

      {showForm && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/90 px-4 py-5 backdrop-blur-xl">

          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[34px] border border-white/10 bg-[#090909] p-6 shadow-2xl sm:p-8">

            {!reservation ? (
              <>
                <div className="flex items-start justify-between">

                  <div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.04] px-3 py-1.5">

                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                      <span className="text-[7px] uppercase tracking-[0.3em] text-emerald-300/70">
                        🎉 Position Found
                      </span>

                    </div>

                    <h2 className="mt-5 text-3xl font-light">
                      Your allocation is
                      waiting.
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-white/30">
                      Complete your details
                      to temporarily hold
                      this position.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={closeForm}
                    className="text-2xl text-white/25 transition hover:text-white"
                  >
                    ×
                  </button>

                </div>

                <div className="mt-7 rounded-3xl border border-[#D4AF37]/15 bg-[#D4AF37]/[0.025] p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[7px] uppercase tracking-[0.3em] text-[#D4AF37]/50">
                        Allocation Found
                      </p>

                      <p className="mt-2 text-xl font-light">
                        🎟️ A position has
                        been located.
                      </p>

                    </div>

                    <span className="text-3xl">
                      👑
                    </span>

                  </div>

                </div>

                {/* CONTACT */}

                <div className="mt-7">

                  <p className="mb-3 text-[8px] uppercase tracking-[0.3em] text-white/25">
                    👤 Collector Details
                  </p>

                  <div className="space-y-3">

                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm outline-none placeholder:text-white/20 focus:border-[#D4AF37]/40"
                    />

                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm outline-none placeholder:text-white/20 focus:border-[#D4AF37]/40"
                    />

                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value)
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm outline-none placeholder:text-white/20 focus:border-[#D4AF37]/40"
                    />

                  </div>

                </div>

                {/* ADDRESS */}

                <div className="mt-7">

                  <p className="mb-3 text-[8px] uppercase tracking-[0.3em] text-white/25">
                    📍 Delivery Details
                  </p>

                  <div className="space-y-3">

                    <textarea
                      placeholder="House / Flat / Building + Street / Area"
                      value={address}
                      onChange={(e) =>
                        setAddress(e.target.value)
                      }
                      rows={3}
                      className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm outline-none placeholder:text-white/20 focus:border-[#D4AF37]/40"
                    />

                    <select
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        setState("");
                        setCity("");
                      }}
                      className="w-full appearance-none rounded-2xl border border-white/10 bg-[#111] px-5 py-4 text-sm text-white outline-none"
                    >
                      <option value="India">
                        India
                      </option>

                      <option value="United Kingdom">
                        United Kingdom
                      </option>

                      <option value="United States">
                        United States
                      </option>

                      <option value="United Arab Emirates">
                        United Arab Emirates
                      </option>
                    </select>

                    {country === "India" ? (
                      <select
                        value={state}
                        onChange={(e) =>
                          handleStateChange(
                            e.target.value
                          )
                        }
                        className="w-full appearance-none rounded-2xl border border-white/10 bg-[#111] px-5 py-4 text-sm text-white outline-none"
                      >
                        <option value="">
                          Select State / UT
                        </option>

                        {Object.keys(
                          INDIA_STATES
                        )
                          .sort()
                          .map((stateName) => (
                            <option
                              key={stateName}
                              value={stateName}
                            >
                              {stateName}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="State / Province"
                        value={state}
                        onChange={(e) =>
                          setState(e.target.value)
                        }
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm outline-none placeholder:text-white/20"
                      />
                    )}

                    {country === "India" ? (
                      <select
                        value={city}
                        onChange={(e) =>
                          setCity(e.target.value)
                        }
                        disabled={!state}
                        className="w-full appearance-none rounded-2xl border border-white/10 bg-[#111] px-5 py-4 text-sm text-white outline-none disabled:opacity-40"
                      >
                        <option value="">
                          {state
                            ? "Select City"
                            : "Select State First"}
                        </option>

                        {availableCities
                          .slice()
                          .sort()
                          .map((cityName) => (
                            <option
                              key={cityName}
                              value={cityName}
                            >
                              {cityName}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) =>
                          setCity(e.target.value)
                        }
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm outline-none placeholder:text-white/20"
                      />
                    )}

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={
                        country === "India"
                          ? 6
                          : undefined
                      }
                      placeholder={
                        country === "India"
                          ? "6-Digit Pincode"
                          : "Postal / ZIP Code"
                      }
                      value={pincode}
                      onChange={(e) =>
                        setPincode(
                          country === "India"
                            ? e.target.value.replace(
                                /\D/g,
                                ""
                              )
                            : e.target.value
                        )
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm outline-none placeholder:text-white/20"
                    />

                  </div>

                </div>

                {error && (
                  <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/[0.04] px-4 py-3 text-xs text-red-300">
                    ⚠️ {error}
                  </p>
                )}

                <div className="mt-6 grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={submitting}
                    className="rounded-2xl border border-white/10 px-4 py-4 text-[9px] tracking-[0.2em] text-white/40 transition hover:bg-white/5"
                  >
                    CANCEL
                  </button>

                  <button
                    type="button"
                    onClick={createReservation}
                    disabled={submitting}
                    className="rounded-2xl bg-white px-4 py-4 text-[9px] font-medium tracking-[0.2em] text-black disabled:opacity-40"
                  >
                    {submitting
                      ? "🔐 HOLDING..."
                      : "🎟️ HOLD MY POSITION"}
                  </button>

                </div>
              </>
            ) : (
              <div className="text-center">

                {reservation.status !==
                "SECURED" ? (
                  <>
                    <div className="relative mx-auto flex h-24 w-24 items-center justify-center">

                      <div className="absolute inset-0 animate-ping rounded-full border border-[#D4AF37]/20" />

                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/[0.05]">

                        <span className="text-3xl">
                          🎟️
                        </span>

                      </div>

                    </div>

                    <p className="mt-7 text-[8px] uppercase tracking-[0.4em] text-[#D4AF37]/60">
                      Position Temporarily Held
                    </p>

                    <h2 className="mt-3 text-3xl font-light">
                      Don't lose it.
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-white/35">
                      Your allocation is
                      temporarily held while
                      payment is completed.
                    </p>

                    <div className="mt-7 rounded-3xl border border-white/10 bg-white/[0.025] p-6">

                      <p className="text-[8px] uppercase tracking-[0.3em] text-white/25">
                        Reservation expires in
                      </p>

                      <p className="mt-4 font-mono text-5xl font-light">
                        {String(minutes).padStart(
                          2,
                          "0"
                        )}
                        :
                        {String(seconds).padStart(
                          2,
                          "0"
                        )}
                      </p>

                    </div>

                    {error && (
                      <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.04] px-4 py-3 text-xs text-red-300">
                        ⚠️ {error}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={startPayment}
                      disabled={
                        submitting ||
                        secondsLeft <= 0
                      }
                      className="mt-5 w-full rounded-2xl bg-white px-4 py-5 text-[10px] font-medium tracking-[0.25em] text-black transition hover:scale-[1.01] disabled:opacity-40"
                    >
                      {submitting
                        ? "🔐 OPENING SECURE CHECKOUT..."
                        : "👑 SECURE " +
                          slotDisplay +
                          " · ₹" +
                          release.price.toLocaleString(
                            "en-IN"
                          )}
                    </button>

                    <p className="mt-4 text-[8px] uppercase tracking-[0.2em] text-white/15">
                      🔒 Secure payment powered by
                      Razorpay
                    </p>

                  </>
                ) : (
                  <>
                    <div className="relative mx-auto flex h-28 w-28 items-center justify-center">

                      <div className="absolute inset-0 animate-ping rounded-full border border-emerald-400/20" />

                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/[0.05]">

                        <span className="text-4xl text-emerald-300">
                          ✓
                        </span>

                      </div>

                    </div>

                    <p className="mt-7 text-[8px] uppercase tracking-[0.4em] text-emerald-300/60">
                      Payment Verified
                    </p>

                    <h2 className="mt-3 text-4xl font-light">
                      You're In. 👑
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-white/35">
                      Your HUSNAINS EDITION
                      allocation has been
                      permanently secured.
                    </p>

                    {/* SLOT CARD */}

                    <div className="mt-8 overflow-hidden rounded-3xl border border-[#D4AF37]/20 bg-gradient-to-b from-[#D4AF37]/[0.06] to-white/[0.015]">

                      <div className="border-b border-white/10 p-6">

                        <p className="text-[8px] uppercase tracking-[0.4em] text-[#D4AF37]/60">
                          🎟️ Collector Allocation
                        </p>

                        <p className="mt-4 text-4xl font-extralight tracking-[0.15em] text-white">
                          {slotDisplay}
                        </p>

                      </div>

                      <div className="grid grid-cols-2 gap-px bg-white/10">

                        <div className="bg-[#090909] p-5">

                          <p className="text-[7px] uppercase tracking-[0.3em] text-white/20">
                            Edition
                          </p>

                          <p className="mt-2 text-xs text-white/60">
                            {release.releaseName}
                          </p>

                        </div>

                        <div className="bg-[#090909] p-5">

                          <p className="text-[7px] uppercase tracking-[0.3em] text-white/20">
                            Status
                          </p>

                          <p className="mt-2 text-xs text-emerald-300">
                            SECURED ✓
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="mt-6 rounded-2xl border border-[#D4AF37]/10 bg-[#D4AF37]/[0.025] p-4">

                      <p className="text-[8px] uppercase tracking-[0.2em] text-[#D4AF37]/60">
                        Next
                      </p>

                      <p className="mt-2 text-xs text-white/45">
                        🚚 Your collector allocation
                        is now being prepared.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/tracking/" +
                            reservation.id
                        )
                      }
                      className="mt-6 w-full rounded-2xl bg-[#D4AF37] px-4 py-5 text-[10px] font-semibold tracking-[0.25em] text-black transition hover:scale-[1.02]"
                    >
                      VIEW MY ALLOCATION →
                    </button>

                    <div className="mt-3 grid grid-cols-2 gap-3">

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            "/tracking/" +
                              reservation.id
                          )
                        }
                        className="rounded-2xl border border-white/10 px-4 py-4 text-[8px] tracking-[0.2em] text-white/45 transition hover:bg-white/5"
                      >
                        TRACK ORDER
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          window.print()
                        }
                        className="rounded-2xl border border-white/10 px-4 py-4 text-[8px] tracking-[0.2em] text-white/45 transition hover:bg-white/5"
                      >
                        PRINT RECORD
                      </button>

                    </div>

                    <p className="mt-6 text-[7px] uppercase leading-5 tracking-[0.25em] text-white/15">
                      Keep your allocation reference
                      safe.
                      <br />
                      It identifies your collector
                      position within this release.
                    </p>
                  </>
                )}

                {reservation.status !==
                  "SECURED" && (
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={submitting}
                    className="mt-4 w-full rounded-2xl border border-white/10 px-4 py-4 text-[9px] tracking-[0.2em] text-white/30 transition hover:bg-white/5"
                  >
                    CLOSE
                  </button>
                )}

              </div>
            )}

          </div>

        </div>
      )}

    </main>
  );
}