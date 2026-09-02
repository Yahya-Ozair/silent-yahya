import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = orders.map((order: any) => ({
      ...order,

      customer: {
        name: order.customer?.name || "",
        email: order.customer?.email || "",
        phone: order.customer?.phone || "",
        address:
          order.customer?.address ||
          order.address?.address ||
          "",
        city:
          order.customer?.city ||
          order.address?.city ||
          "",
        state:
          order.customer?.state ||
          order.address?.state ||
          "",
        pincode:
          order.customer?.pincode ||
          order.address?.pincode ||
          "",
      },

      address: {
        address:
          order.address?.address ||
          order.customer?.address ||
          "",
        city:
          order.address?.city ||
          order.customer?.city ||
          "",
        state:
          order.address?.state ||
          order.customer?.state ||
          "",
        pincode:
          order.address?.pincode ||
          order.customer?.pincode ||
          "",
      },

      total: Number(order.total || 0),
      subtotal: Number(order.subtotal || 0),
      shipping: Number(order.shipping || 0),

      paymentMethod:
        order.paymentMethod ||
        "ONLINE",

      paymentStatus:
        order.paymentStatus ||
        "Pending",

      orderStatus:
        order.orderStatus ||
        "Pending",

      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
    });
  } catch (error: any) {
    console.error(
      "GET /api/orders/get error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Failed to load orders.",
      },
      {
        status: 500,
      }
    );
  }
}