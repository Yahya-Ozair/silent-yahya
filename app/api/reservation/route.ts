import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Release from "@/models/Release";
import Reservation from "@/models/Reservation";
import { getHusnainsVariant } from "@/lib/husnainsVariants";

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    // ==========================================
    // CUSTOMER DETAILS
    // ==========================================

    const name = clean(body.name);
    const email = clean(body.email).toLowerCase();
    const phone = clean(body.phone);

    // ==========================================
    // DELIVERY ADDRESS
    // ==========================================

    const address = clean(body.address);
    const city = clean(body.city);
    const state = clean(body.state);
    const pincode = clean(body.pincode);
    const country = clean(body.country) || "India";

    // ==========================================
    // VARIANT
    // ==========================================

    const variantKey = clean(body.variantKey);

    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please complete all required delivery details.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // PINCODE VALIDATION
    // ==========================================

    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please enter a valid 6-digit Indian pincode.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // RESOLVE VARIANT SERVER-SIDE
    // ==========================================

    const variant = getHusnainsVariant(variantKey);

    if (!variant) {
      return NextResponse.json(
        {
          success: false,
          error:
            "That edition finish is not available.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // FIND LIVE RELEASE
    // ==========================================

    const release = await Release.findOne({
      status: "LIVE",
    }).sort({
      releasedAt: -1,
      createdAt: -1,
    });

    if (!release) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The private release is not currently live.",
        },
        { status: 409 }
      );
    }

    const now = new Date();

    // ==========================================
    // EXPIRE OLD PENDING RESERVATIONS
    // ==========================================

    await Reservation.updateMany(
      {
        status: "PENDING",
        expiresAt: {
          $lte: now,
        },
      },
      {
        $set: {
          status: "CANCELLED",
          orderStatus: "Cancelled",
        },
      }
    );

    // ==========================================
    // TOTAL RELEASE SLOTS
    // ==========================================

    const totalSlots = Number(
      release.totalSlots || 0
    );

    if (!totalSlots) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No reservation positions are configured.",
        },
        { status: 409 }
      );
    }

    // ==========================================
    // FIND ACTIVE SLOT RESERVATIONS
    // ==========================================

    const activeReservations =
      await Reservation.find({
        $or: [
          {
            status: {
              $in: [
                "SECURED",
                "CONFIRMED",
              ],
            },
          },
          {
            status: "PENDING",
            expiresAt: {
              $gt: now,
            },
          },
        ],
      })
        .select("slotNumber")
        .lean();

    // ==========================================
    // BUILD USED SLOT SET
    // ==========================================

    const usedSlots = new Set<number>();

    for (const item of activeReservations) {
      const slot = Number(item.slotNumber);

      if (
        Number.isInteger(slot) &&
        slot > 0
      ) {
        usedSlots.add(slot);
      }
    }

    // ==========================================
    // FIND FIRST AVAILABLE SLOT
    // ==========================================

    let slotNumber = 0;

    for (
      let candidate = 1;
      candidate <= totalSlots;
      candidate += 1
    ) {
      if (!usedSlots.has(candidate)) {
        slotNumber = candidate;
        break;
      }
    }

    if (!slotNumber) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No reservation positions are currently available.",
        },
        { status: 409 }
      );
    }

    // ==========================================
    // RESERVATION HOLD
    // ==========================================

    const slotName =
      `HY-${String(slotNumber).padStart(2, "0")} — ${variant.shortName}`;

    const expiresAt = new Date(
      now.getTime() + 10 * 60 * 1000
    );

    // ==========================================
    // CREATE RESERVATION
    // ==========================================

    const reservation =
      await Reservation.create({
        releaseId: release._id,

        name,
        email,
        phone,

        address,
        city,
        state,
        pincode,
        country,

        // Variant information
        variantKey: variant.key,
        variantName: variant.name,
        variantSku: variant.sku,

        // IMPORTANT:
        // Price comes from the server-side
        // variant configuration.
        price: variant.price,

        status: "PENDING",

        expiresAt,

        slotNumber,
        slotName,

        orderStatus: "Processing",
        paymentStatus: "Pending",
      });

    // ==========================================
    // RESPONSE
    // ==========================================

    return NextResponse.json({
      success: true,

      reservation: {
        id: reservation._id?.toString(),

        releaseId:
          reservation.releaseId?.toString(),

        name: reservation.name,
        email: reservation.email,
        phone: reservation.phone,

        address: reservation.address,
        city: reservation.city,
        state: reservation.state,
        pincode: reservation.pincode,
        country: reservation.country,

        variantKey:
          reservation.variantKey,

        variantName:
          reservation.variantName,

        variantSku:
          reservation.variantSku,

        price:
          reservation.price,

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
    });
  } catch (error) {
    console.error(
      "POST /api/reservation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to create your reservation right now.",
      },
      { status: 500 }
    );
  }
}