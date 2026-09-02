import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import Release from "@/models/Release";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const reservationId = String(
      body.reservationId || ""
    );

    if (!reservationId) {
      return NextResponse.json(
        {
          success: false,
          error: "Reservation ID is required.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // FIND RESERVATION
    // ============================================

    const reservation =
      await Reservation.findById(reservationId);

    if (!reservation) {
      return NextResponse.json(
        {
          success: false,
          error: "Reservation not found.",
        },
        { status: 404 }
      );
    }

    // ============================================
    // RESERVATION MUST BE PENDING
    // ============================================

    if (reservation.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          error:
            "This reservation is no longer available.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // CHECK EXPIRY
    // ============================================

    if (
      reservation.expiresAt &&
      new Date(reservation.expiresAt).getTime() <=
        Date.now()
    ) {
      reservation.status = "EXPIRED";

      await reservation.save();

      return NextResponse.json(
        {
          success: false,
          error:
            "Your reservation has expired.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // FIND RELEASE
    // ============================================

    const release =
      await Release.findById(
        reservation.releaseId
      );

    if (!release) {
      return NextResponse.json(
        {
          success: false,
          error: "Release not found.",
        },
        { status: 404 }
      );
    }

    // ============================================
    // RELEASE MUST BE LIVE
    // ============================================

    if (release.status !== "LIVE") {
      return NextResponse.json(
        {
          success: false,
          error:
            "This release is no longer live.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // CHECK SLOTS
    // ============================================

    const remainingSlots =
      Number(release.totalSlots) -
      Number(release.securedSlots);

    if (remainingSlots <= 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "All release slots have been secured.",
        },
        { status: 400 }
      );
    }

    // ============================================
    // RAZORPAY CREDENTIALS
    // ============================================

    const keyId =
      process.env.RAZORPAY_KEY_ID;

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Razorpay credentials are not configured.",
        },
        { status: 500 }
      );
    }

    // ============================================
    // PREVENT CREATING MULTIPLE RAZORPAY ORDERS
    // ============================================

    if (
      reservation.razorpayOrderId
    ) {
      return NextResponse.json({
        success: true,

        order: {
          id:
            reservation.razorpayOrderId,

          amount:
            Math.round(
              Number(release.price) * 100
            ),

          currency: "INR",
        },

        keyId,

        reservationId:
          reservation._id.toString(),

        existingOrder: true,
      });
    }

    // ============================================
    // CREATE RAZORPAY INSTANCE
    // ============================================

    const razorpay =
      new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

    // ============================================
    // AMOUNT
    // ============================================

    const price =
      Number(release.price);

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid release price.",
        },
        { status: 400 }
      );
    }

    const amount =
      Math.round(price * 100);

    // ============================================
    // UNIQUE RECEIPT
    // ============================================

    const receipt =
      `SY_${reservation._id
        .toString()
        .slice(-10)}_${Date.now()}`;

    // ============================================
    // CREATE RAZORPAY ORDER
    // ============================================

    const order =
      await razorpay.orders.create({
        amount,

        currency: "INR",

        receipt,

        notes: {
          reservationId:
            reservation._id.toString(),

          releaseId:
            release._id.toString(),

          releaseName:
            release.releaseName,
        },

        payment_capture: true,
      });

    // ============================================
    // IMPORTANT:
    // SAVE RAZORPAY ORDER ID ON SERVER
    // ============================================

    reservation.razorpayOrderId =
      order.id;

    await reservation.save();

    // ============================================
    // RETURN SAFE DATA
    // ============================================

    return NextResponse.json({
      success: true,

      order: {
        id: order.id,

        amount: order.amount,

        currency: order.currency,
      },

      keyId,

      reservationId:
        reservation._id.toString(),

      existingOrder: false,
    });
  } catch (error: any) {
    console.error(
      "Razorpay order creation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.error?.description ||
          error?.message ||
          "Unable to create payment order.",
      },
      { status: 500 }
    );
  }
}