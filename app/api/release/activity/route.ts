import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

export async function GET() {
  try {
    await connectDB();

    const reservations =
      await Reservation.find({
        status: "SECURED",
      })
        .sort({
          updatedAt: -1,
        })
        .limit(8)
        .select("_id updatedAt");

    const activity = reservations.map(
      (reservation) => ({
        id: reservation._id.toString(),
        securedAt:
          reservation.updatedAt,
      })
    );

    return NextResponse.json(
      {
        success: true,
        activity,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error(
      "Activity API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Unable to load activity.",
      },
      {
        status: 500,
      }
    );
  }
}