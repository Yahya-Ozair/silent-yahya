import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

export async function GET() {
  try {
    await connectDB();

    const reservations = await Reservation.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      reservations,
    });
  } catch (error: any) {
    console.error("Admin reservations error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Unable to load reservations.",
      },
      { status: 500 }
    );
  }
}