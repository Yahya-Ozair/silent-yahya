import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Release from "@/models/Release";
import Reservation from "@/models/Reservation";

const SLOT_NAMES = [
  "THE FIRST LIGHT",
  "THE ORIGIN",
  "THE SIGNATURE",
  "THE LEGACY",
  "THE NOCTURNE",
  "THE ROYAL",
  "THE PRIVATE",
  "THE ARCHIVE",
  "THE HUSNAIN",
  "THE SILENT",
];

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      country,
    } = body;

    /* =========================
       VALIDATION
    ========================= */

    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Full name is required.",
        },
        { status: 400 }
      );
    }

    if (!email?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Email is required.",
        },
        { status: 400 }
      );
    }

    if (!phone?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number is required.",
        },
        { status: 400 }
      );
    }

    if (!address?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Delivery address is required.",
        },
        { status: 400 }
      );
    }

    if (!city?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "City is required.",
        },
        { status: 400 }
      );
    }

    if (!state?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "State is required.",
        },
        { status: 400 }
      );
    }

    if (!pincode?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Pincode is required.",
        },
        { status: 400 }
      );
    }

    if (
      (country || "India") === "India" &&
      !/^\d{6}$/.test(pincode.trim())
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid 6-digit pincode.",
        },
        { status: 400 }
      );
    }

    /* =========================
       FIND LIVE RELEASE
    ========================= */

    const release = await Release.findOne({
      status: "LIVE",
    }).sort({
      createdAt: -1,
    });

    if (!release) {
      return NextResponse.json(
        {
          success: false,
          error: "There is no active release right now.",
        },
        { status: 400 }
      );
    }

    /* =========================
       CLEAN EXPIRED RESERVATIONS
    ========================= */

    await Reservation.updateMany(
      {
        releaseId: release._id,
        status: "PENDING",
        expiresAt: {
          $lte: new Date(),
        },
      },
      {
        $set: {
          status: "EXPIRED",
        },
      }
    );

    /* =========================
       CHECK AVAILABLE CAPACITY
    ========================= */

    const securedSlots = Number(
      release.securedSlots || 0
    );

    const totalSlots = Number(
      release.totalSlots || 0
    );

    if (securedSlots >= totalSlots) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unfortunately, all slots have already been secured.",
        },
        { status: 400 }
      );
    }

    /*
      Count active pending reservations too.
      This prevents multiple people from
      temporarily taking the same remaining pool.
    */

    const activePending =
      await Reservation.countDocuments({
        releaseId: release._id,
        status: "PENDING",
        expiresAt: {
          $gt: new Date(),
        },
      });

    const remainingCapacity =
      totalSlots -
      securedSlots -
      activePending;

    if (remainingCapacity <= 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "All currently available positions are being held. Please try again shortly.",
        },
        { status: 409 }
      );
    }

    /* =========================
       FIND NEXT SLOT NUMBER
    ========================= */

    const existingReservations =
      await Reservation.find({
        releaseId: release._id,
        slotNumber: {
          $ne: null,
        },
      })
        .select("slotNumber")
        .lean();

    const usedNumbers = new Set<number>();

    for (const item of existingReservations) {
      if (
        typeof item.slotNumber === "number"
      ) {
        usedNumbers.add(item.slotNumber);
      }
    }

    let slotNumber = 1;

    while (
      usedNumbers.has(slotNumber) &&
      slotNumber <= totalSlots
    ) {
      slotNumber++;
    }

    if (slotNumber > totalSlots) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No individual slot is currently available.",
        },
        { status: 409 }
      );
    }

    /* =========================
       SLOT NAME
    ========================= */

    const slotName =
      `HY-${String(slotNumber).padStart(
        2,
        "0"
      )} — ${
        SLOT_NAMES[
          (slotNumber - 1) %
            SLOT_NAMES.length
        ]
      }`;

    /* =========================
       10 MINUTE HOLD
    ========================= */

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    /* =========================
       CREATE RESERVATION
    ========================= */

    const reservation =
      await Reservation.create({
        releaseId: release._id,

        name: name.trim(),

        email: email.trim(),

        phone: phone.trim(),

        address: address.trim(),

        city: city.trim(),

        state: state.trim(),

        pincode: pincode.trim(),

        country:
          country?.trim() || "India",

        price: Number(
          release.price || 999
        ),

        status: "PENDING",

        orderStatus: "Processing",

        expiresAt,

        slotNumber,

        slotName,

        paymentStatus: "Pending",
      });

    /* =========================
       SUCCESS
    ========================= */

    return NextResponse.json(
      {
        success: true,

        message:
          "Slot temporarily reserved.",

        reservation: {
          id: reservation._id.toString(),

          releaseId:
            reservation.releaseId.toString(),

          name: reservation.name,

          email: reservation.email,

          phone: reservation.phone,

          address:
            reservation.address || "",

          city:
            reservation.city || "",

          state:
            reservation.state || "",

          pincode:
            reservation.pincode || "",

          country:
            reservation.country || "India",

          price:
            reservation.price ||
            release.price ||
            999,

          status:
            reservation.status,

          orderStatus:
            reservation.orderStatus,

          paymentStatus:
            reservation.paymentStatus,

          expiresAt:
            reservation.expiresAt,

          slotNumber:
            reservation.slotNumber,

          slotName:
            reservation.slotName,

          releaseName:
            release.releaseName,

          totalSlots:
            release.totalSlots,

          securedSlots:
            release.securedSlots,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    console.error(
      "Reservation creation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Unable to create reservation.",
      },
      {
        status: 500,
      }
    );
  }
}