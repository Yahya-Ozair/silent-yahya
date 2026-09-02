import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Tracking token is required.",
        },
        { status: 400 }
      );
    }

    /*
    ==========================================
    FIND USING PRIVATE TOKEN
    ==========================================
    */

    const reservation =
      await Reservation.findOne({
        trackingToken: id,
      }).lean();

    if (!reservation) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    /*
    ==========================================
    NEVER RETURN PRIVATE TOKEN
    ==========================================
    */

    return NextResponse.json({
      success: true,

      order: {
        id: reservation._id.toString(),

        name: reservation.name,

        status: reservation.status,

        address:
          reservation.address || null,

        city:
          reservation.city || null,

        state:
          reservation.state || null,

        pincode:
          reservation.pincode || null,

        trackingNumber:
          reservation.trackingNumber || null,

        createdAt:
          reservation.createdAt,

        updatedAt:
          reservation.updatedAt,
      },
    });
  } catch (error: any) {
    console.error(
      "ORDER TRACKING ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Unable to load order.",
      },
      { status: 500 }
    );
  }
}