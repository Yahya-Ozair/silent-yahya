import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find();

    const revenue = orders.reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );

    const paidOrders = orders.filter(
      (o) => o.paymentStatus === "Paid"
    ).length;

    const pendingOrders = orders.filter(
      (o) => o.orderStatus === "Pending"
    ).length;

    return NextResponse.json({
      success: true,
      revenue,
      totalOrders: orders.length,
      paidOrders,
      pendingOrders,
      recentOrders: orders.slice(-5).reverse(),
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