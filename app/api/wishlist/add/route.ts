import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Wishlist from "@/models/Wishlist";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first",
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as any;

    const { productId } = await req.json();

    const exists = await Wishlist.findOne({
      userId: decoded.id,
      productId,
    });

    if (exists) {
      return NextResponse.json({
        success: true,
        message: "Already in wishlist",
      });
    }

    await Wishlist.create({
      userId: decoded.id,
      productId,
    });

    return NextResponse.json({
      success: true,
      message: "Added to wishlist",
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}