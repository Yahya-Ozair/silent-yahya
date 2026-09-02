import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import Release from "@/models/Release";

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

    const reservation =
      await Reservation.findById(
        reservationId
      );

    if (!reservation) {
      return NextResponse.json(
        {
          success: false,
          error: "Reservation not found.",
        },
        { status: 404 }
      );
    }

    if (
      reservation.status !== "PENDING"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Reservation is already ${reservation.status}.`,
        },
        { status: 400 }
      );
    }

    if (
      new Date(reservation.expiresAt) <=
      new Date()
    ) {
      reservation.status = "EXPIRED";
      await reservation.save();

      return NextResponse.json(
        {
          success: false,
          error: "Reservation has expired.",
        },
        { status: 400 }
      );
    }

    /*
      IMPORTANT:

      We use an atomic database update here.
      This prevents two customers from
      securing the final slot at the same time.
    */

    const release =
      await Release.findOneAndUpdate(
        {
          _id: reservation.releaseId,

          status: "LIVE",

          $expr: {
            $lt: [
              "$securedSlots",
              "$totalSlots",
            ],
          },
        },
        {
          $inc: {
            securedSlots: 1,
          },
        },
        {
          new: true,
        }
      );

    if (!release) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No slots are currently available.",
        },
        { status: 400 }
      );
    }

    reservation.status = "SECURED";

    await reservation.save();

    return NextResponse.json({
      success: true,

      message:
        "Slot successfully secured.",

      reservation: {
        id: reservation._id,
        status: reservation.status,
      },

      release: {
        securedSlots:
          release.securedSlots,

        totalSlots:
          release.totalSlots,

        remainingSlots:
          Math.max(
            release.totalSlots -
              release.securedSlots,
            0
          ),
      },
    });
  } catch (error: any) {
    console.error(
      "Secure reservation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Unable to secure reservation.",
      },
      {
        status: 500,
      }
    );
  }
}