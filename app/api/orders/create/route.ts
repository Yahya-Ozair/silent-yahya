import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

function generateOrderId() {
  return `SY${Date.now()}`;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    console.log("Incoming Order:");
    console.log(JSON.stringify(body, null, 2));

    const order = await Order.create({
      orderId: generateOrderId(),

      customer: body.customer,

      address: body.address,

      items: body.items,

      subtotal: body.subtotal || 0,

      shipping: body.shipping || 0,

      total: body.total,

      paymentMethod: body.paymentMethod || "Cash on Delivery",

      paymentStatus: body.paymentStatus || "Pending",

      orderStatus: body.orderStatus || "Pending",
    });

    console.log("Order Saved:");
    console.log(order);

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error("========== ORDER ERROR ==========");
console.error(error);
console.error(error.message);
console.error(error.stack);

if (error.errors) {
  console.error(error.errors);
}

    if (error.errors) {
      console.error("Validation Errors:");
      console.error(error.errors);
    }

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