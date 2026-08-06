import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const { id, orderStatus } = await req.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Order ID is required",
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus,
      },
      {
        new: true,
      }
    );

    if (!updatedOrder) {
      return NextResponse.json({
        success: false,
        message: "Order not found",
      });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
      message: "Failed to update order",
    });
  }
}