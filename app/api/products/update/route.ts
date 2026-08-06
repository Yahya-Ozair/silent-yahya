import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      id,
      name,
      slug,
      description,
      category,
      image,
      price,
      originalPrice,
      stock,
      volume,
      rating,
      topNotes,
      heartNotes,
      baseNotes,
      featured,
      bestSeller,
      newArrival,
    } = body;

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        description,
        category,
        image,
        price,
        originalPrice,
        stock,
        volume,
        rating,
        topNotes,
        heartNotes,
        baseNotes,
        featured,
        bestSeller,
        newArrival,
      },
      {
        new: true,
      }
    );

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}