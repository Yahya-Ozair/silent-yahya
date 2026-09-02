import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

const ALLOWED_STATUSES = [
  "PENDING",
  "RESERVED",
  "SECURED",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export async function PATCH(request: Request) {
  try {
    await connectDB();

    const body = await request.json();

    const { reservationId, status, trackingNumber } = body;

    if (!reservationId) {
      return NextResponse.json(
        {
          success: false,
          error: "Reservation ID is required.",
        },
        { status: 400 }
      );
    }

    if (
      !status ||
      !ALLOWED_STATUSES.includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid reservation status.",
        },
        { status: 400 }
      );
    }

    const updateData: {
      status: string;
      trackingNumber?: string | null;
    } = {
      status,
    };

    if (status === "SHIPPED") {
      updateData.trackingNumber =
        trackingNumber?.trim() || null;
    }

    if (status !== "SHIPPED") {
      updateData.trackingNumber = null;
    }

    const reservation =
      await Reservation.findByIdAndUpdate(
        reservationId,
        updateData,
        {
          new: true,
          runValidators: true,
        }
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

    return NextResponse.json({
      success: true,
      reservation,
    });
  } catch (error: any) {
    console.error(
      "UPDATE RESERVATION STATUS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Unable to update reservation.",
      },
      { status: 500 }
    );
  }
}