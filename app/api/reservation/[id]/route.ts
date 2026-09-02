import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const reservationId = String(id || "").trim();

    if (!reservationId) {
      return NextResponse.json(
        {
          success: false,
          error: "Reservation ID is required.",
        },
        { status: 400 }
      );
    }

    if (!mongoose.isValidObjectId(reservationId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid reservation ID.",
        },
        { status: 400 }
      );
    }

    const reservation =
      await Reservation.findById(
        reservationId
      ).lean();

    if (!reservation) {
      return NextResponse.json(
        {
          success: false,
          error: "Reservation not found.",
        },
        { status: 404 }
      );
    }

    const result = {
      id: String(reservation._id),

      name: reservation.name || "",
      email: reservation.email || "",
      phone: reservation.phone || "",

      address: reservation.address || "",
      city: reservation.city || "",
      state: reservation.state || "",
      pincode: reservation.pincode || "",
      country: reservation.country || "India",

      price: Number(reservation.price || 0),

      status: reservation.status || "PENDING",

      orderStatus:
        reservation.orderStatus ||
        "Processing",

      paymentStatus:
        reservation.paymentStatus ||
        "Pending",

      slotNumber:
        reservation.slotNumber ?? null,

      slotName:
        reservation.slotName ?? null,

      razorpayOrderId:
        reservation.razorpayOrderId ||
        null,

      razorpayPaymentId:
        reservation.razorpayPaymentId ||
        null,

      expiresAt:
        reservation.expiresAt || null,

      createdAt:
        reservation.createdAt || null,

      updatedAt:
        reservation.updatedAt || null,
    };

    return NextResponse.json(
      {
        success: true,
        reservation: result,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "Reservation GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to load reservation.",
      },
      { status: 500 }
    );
  }
}