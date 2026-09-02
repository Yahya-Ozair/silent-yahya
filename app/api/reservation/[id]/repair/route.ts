import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import Release from "@/models/Release";

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const reservation =
      await Reservation.findById(id);

    if (!reservation) {
      return NextResponse.json(
        {
          success: false,
          error: "Reservation not found",
        },
        { status: 404 }
      );
    }

    const release =
      await Release.findById(
        reservation.releaseId
      );

    if (!release) {
      return NextResponse.json(
        {
          success: false,
          error: "Release not found",
        },
        { status: 404 }
      );
    }

    // Only repair an already secured reservation
    if (reservation.status !== "SECURED") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only SECURED reservations can be repaired.",
        },
        { status: 400 }
      );
    }

    // If it already has a slot, don't create another one
    if (reservation.slotNumber) {
      return NextResponse.json({
        success: true,
        message:
          "Reservation already has a slot.",
        reservation,
      });
    }

    // Current secured count
    const securedSlots =
      Number(release.securedSlots || 0);

    // Assign the next slot
    const slotNumber =
      securedSlots;

    const slotName =
      `HUSNAIN-${String(
        slotNumber
      ).padStart(3, "0")}`;

    reservation.slotNumber =
      slotNumber;

    reservation.slotName =
      slotName;

    (reservation as any).paymentStatus =
      "PAID";

    (reservation as any).orderStatus =
      "Processing";

    await reservation.save();

    return NextResponse.json({
      success: true,

      message:
        "Reservation repaired successfully.",

      reservation: {
        id: String(
          reservation._id
        ),

        status:
          reservation.status,

        slotNumber:
          reservation.slotNumber,

        slotName:
          reservation.slotName,

        paymentStatus:
          (reservation as any)
            .paymentStatus,

        orderStatus:
          (reservation as any)
            .orderStatus,
      },
    });
  } catch (error: any) {
    console.error(
      "Reservation repair error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to repair reservation.",
      },
      { status: 500 }
    );
  }
}