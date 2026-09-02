import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

export async function GET() {
  try {
    await connectDB();

    const securedSlots = await Reservation.countDocuments({
      status: "SECURED",
    });

    return NextResponse.json(
      {
        success: true,
        securedSlots,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Release stats error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Unable to load release stats",
      },
      {
        status: 500,
      }
    );
  }
}