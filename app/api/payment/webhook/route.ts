import { NextResponse } from "next/server";
import crypto from "crypto";

import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import Release from "@/models/Release";
import Order from "@/models/Order";

export const runtime = "nodejs";

function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const receivedBuffer = Buffer.from(
    signature,
    "utf8"
  );

  const expectedBuffer = Buffer.from(
    expectedSignature,
    "utf8"
  );

  if (
    receivedBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    expectedBuffer,
    receivedBuffer
  );
}

export async function POST(request: Request) {
  try {
    /*
     * ============================================================
     * 1. READ RAW BODY
     * ============================================================
     *
     * IMPORTANT:
     * Do NOT use request.json() before signature verification.
     *
     * Razorpay signs the exact raw request body.
     */

    const rawBody = await request.text();

    if (!rawBody) {
      return NextResponse.json(
        {
          success: false,
          error: "Empty webhook body.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ============================================================
     * 2. GET RAZORPAY WEBHOOK SIGNATURE
     * ============================================================
     */

    const razorpaySignature =
      request.headers.get(
        "x-razorpay-signature"
      );

    if (!razorpaySignature) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing Razorpay webhook signature.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ============================================================
     * 3. WEBHOOK SECRET
     * ============================================================
     *
     * IMPORTANT:
     *
     * This is NOT:
     *
     * RAZORPAY_KEY_SECRET
     *
     * You create a separate webhook secret
     * inside Razorpay Dashboard.
     */

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        "RAZORPAY_WEBHOOK_SECRET is not configured."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Webhook secret is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * ============================================================
     * 4. VERIFY SIGNATURE
     * ============================================================
     */

    const validSignature =
      verifyWebhookSignature(
        rawBody,
        razorpaySignature,
        webhookSecret
      );

    if (!validSignature) {
      console.error(
        "Invalid Razorpay webhook signature."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid webhook signature.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ============================================================
     * 5. PARSE BODY ONLY AFTER SIGNATURE VERIFICATION
     * ============================================================
     */

    let payload: any;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON payload.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ============================================================
     * 6. EVENT INFORMATION
     * ============================================================
     */

    const event =
      String(payload?.event || "");

    const eventId =
      request.headers.get(
        "x-razorpay-event-id"
      );

    console.log(
      "Razorpay webhook received:",
      {
        event,
        eventId,
      }
    );

    /*
     * ============================================================
     * 7. ONLY PROCESS EVENTS WE NEED
     * ============================================================
     */

    const supportedEvents = [
      "payment.captured",
      "order.paid",
      "payment.failed",
    ];

    if (!supportedEvents.includes(event)) {
      return NextResponse.json({
        success: true,
        ignored: true,
        event,
      });
    }

    /*
     * ============================================================
     * 8. CONNECT DATABASE
     * ============================================================
     */

    await connectDB();

    /*
     * ============================================================
     * 9. EXTRACT PAYMENT / ORDER INFORMATION
     * ============================================================
     */

    const payment =
      payload?.payload?.payment?.entity;

    const razorpayPaymentId =
      payment?.id
        ? String(payment.id)
        : "";

    const razorpayOrderId =
      payment?.order_id
        ? String(payment.order_id)
        : payload?.payload?.order?.entity?.id
        ? String(
            payload.payload.order.entity.id
          )
        : "";

    /*
     * ============================================================
     * 10. PAYMENT FAILED
     * ============================================================
     *
     * We DO NOT mark the reservation as SECURED.
     *
     * The customer may retry payment while the
     * reservation is still valid.
     */

    if (event === "payment.failed") {
      console.warn(
        "Razorpay payment failed:",
        {
          razorpayPaymentId,
          razorpayOrderId,
        }
      );

      if (razorpayPaymentId) {
        const existingOrder =
          await Order.findOne({
            razorpayPaymentId,
          });

        if (existingOrder) {
          existingOrder.paymentStatus =
            "Failed";

          await existingOrder.save();
        }
      }

      return NextResponse.json({
        success: true,
        processed: true,
        event,
      });
    }

    /*
     * ============================================================
     * 11. CAPTURED / PAID PAYMENT VALIDATION
     * ============================================================
     */

    if (
      event !== "payment.captured" &&
      event !== "order.paid"
    ) {
      return NextResponse.json({
        success: true,
        ignored: true,
        event,
      });
    }

    /*
     * ============================================================
     * 12. PAYMENT ID MUST EXIST
     * ============================================================
     */

    if (!razorpayPaymentId) {
      console.error(
        "Webhook has no Razorpay payment ID."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Razorpay payment ID missing.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ============================================================
     * 13. FIND RESERVATION
     * ============================================================
     *
     * Your /api/payment/create route puts reservationId
     * inside Razorpay order notes.
     */

    const reservationId =
      payment?.notes?.reservationId ||
      payload?.payload?.order?.entity?.notes
        ?.reservationId;

    let reservation = null;

    /*
     * First try reservationId from Razorpay notes.
     */

    if (reservationId) {
      reservation =
        await Reservation.findById(
          String(reservationId)
        );
    }

    /*
     * Second fallback:
     * Search using Razorpay order ID.
     *
     * This works when the reservation has already
     * been associated with the Razorpay order.
     */

    if (
      !reservation &&
      razorpayOrderId
    ) {
      reservation =
        await Reservation.findOne({
          razorpayOrderId,
        });
    }

    /*
     * Third fallback:
     * Find an existing Order and use its reservationId.
     */

    if (
      !reservation &&
      razorpayOrderId
    ) {
      const existingOrder =
        await Order.findOne({
          razorpayOrderId,
        });

      if (
        existingOrder?.reservationId
      ) {
        reservation =
          await Reservation.findById(
            String(
              existingOrder.reservationId
            )
          );
      }
    }

    /*
     * ============================================================
     * 14. RESERVATION NOT FOUND
     * ============================================================
     */

    if (!reservation) {
      console.error(
        "Reservation not found for Razorpay webhook.",
        {
          event,
          eventId,
          razorpayOrderId,
          razorpayPaymentId,
          reservationId,
        }
      );

      /*
       * Returning 400 tells Razorpay the event was not
       * successfully handled.
       *
       * This is intentional because we do not want to
       * silently mark an unknown payment as fulfilled.
       */

      return NextResponse.json(
        {
          success: false,
          error:
            "Reservation could not be identified.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ============================================================
     * 15. IDEMPOTENCY / ALREADY SECURED
     * ============================================================
     *
     * Razorpay can send the same webhook more than once.
     *
     * If our reservation is already SECURED, NEVER allocate
     * another slot.
     */

    if (
      reservation.status ===
      "SECURED"
    ) {
      reservation.paymentStatus =
        "Paid";

      reservation.razorpayOrderId =
        razorpayOrderId ||
        reservation.razorpayOrderId;

      reservation.razorpayPaymentId =
        razorpayPaymentId ||
        reservation.razorpayPaymentId;

      if (
        !reservation.orderStatus
      ) {
        reservation.orderStatus =
          "Processing";
      }

      await reservation.save();

      /*
       * Repair the corresponding Order.
       */

      let existingOrder =
        await Order.findOne({
          $or: [
            {
              razorpayPaymentId,
            },
            {
              razorpayOrderId,
            },
            {
              reservationId:
                String(
                  reservation._id
                ),
            },
          ],
        });

      if (existingOrder) {
        existingOrder.razorpayOrderId =
          razorpayOrderId ||
          existingOrder.razorpayOrderId;

        existingOrder.razorpayPaymentId =
          razorpayPaymentId ||
          existingOrder.razorpayPaymentId;

        existingOrder.paymentStatus =
          "Paid";

        existingOrder.paymentMethod =
          "ONLINE";

        await existingOrder.save();
      }

      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        event,
        reservationId:
          String(reservation._id),
      });
    }

    /*
     * ============================================================
     * 16. RESERVATION MUST BE PENDING
     * ============================================================
     */

    if (
      reservation.status !==
      "PENDING"
    ) {
      console.warn(
        "Webhook received for non-pending reservation.",
        {
          reservationId:
            String(reservation._id),
          status:
            reservation.status,
        }
      );

      /*
       * Do not allocate another slot.
       */

      return NextResponse.json({
        success: true,
        alreadyHandled: true,
        event,
        reservationId:
          String(reservation._id),
      });
    }

    /*
     * ============================================================
     * 17. CHECK RESERVATION EXPIRY
     * ============================================================
     */

    if (
      reservation.expiresAt &&
      new Date(
        reservation.expiresAt
      ).getTime() <= Date.now()
    ) {
      reservation.status =
        "EXPIRED";

      await reservation.save();

      console.warn(
        "Payment captured after reservation expiry.",
        {
          reservationId:
            String(reservation._id),
          razorpayPaymentId,
        }
      );

      /*
       * IMPORTANT:
       *
       * We do not secure an expired reservation.
       *
       * This payment should be investigated/refunded
       * according to your refund policy.
       */

      return NextResponse.json({
        success: true,
        expired: true,
        event,
        reservationId:
          String(reservation._id),
      });
    }

    /*
     * ============================================================
     * 18. FIND RELEASE
     * ============================================================
     */

    const release =
      await Release.findById(
        reservation.releaseId
      );

    if (!release) {
      console.error(
        "Release not found for reservation.",
        {
          reservationId:
            String(reservation._id),
          releaseId:
            String(
              reservation.releaseId
            ),
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Release not found.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * ============================================================
     * 19. RELEASE MUST BE LIVE
     * ============================================================
     */

    if (
      release.status !==
      "LIVE"
    ) {
      console.error(
        "Payment captured but release is not LIVE.",
        {
          releaseId:
            String(release._id),
          status:
            release.status,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Release is not live.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * ============================================================
     * 20. VERIFY PAYMENT AMOUNT
     * ============================================================
     *
     * Razorpay amount is in paise.
     *
     * Your release price is stored in rupees.
     */

    const receivedAmount =
      Number(
        payment?.amount || 0
      );

    const expectedAmount =
      Math.round(
        Number(
          reservation.price ||
            release.price ||
            999
        ) * 100
      );

    if (
      receivedAmount !==
      expectedAmount
    ) {
      console.error(
        "Razorpay amount mismatch.",
        {
          reservationId:
            String(reservation._id),
          receivedAmount,
          expectedAmount,
          razorpayPaymentId,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment amount does not match reservation amount.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ============================================================
     * 21. ATOMIC SLOT ALLOCATION
     * ============================================================
     *
     * Only increment if the release still has a slot.
     */

    const updatedRelease =
      await Release.findOneAndUpdate(
        {
          _id: release._id,

          status: "LIVE",

          $expr: {
            $lt: [
              "$securedSlots",
              "$totalSlots",
            ],
          },
        },
        {
          $inc: {
            securedSlots: 1,
          },
        },
        {
          new: true,
        }
      );

    /*
     * ============================================================
     * 22. NO SLOT AVAILABLE
     * ============================================================
     */

    if (!updatedRelease) {
      console.error(
        "Payment captured but no release slot remains.",
        {
          reservationId:
            String(reservation._id),
          releaseId:
            String(release._id),
          razorpayPaymentId,
        }
      );

      return NextResponse.json({
        success: true,
        noSlotAvailable: true,
        event,
        reservationId:
          String(reservation._id),
      });
    }

    /*
     * ============================================================
     * 23. CREATE SLOT NUMBER
     * ============================================================
     */

    const slotNumber =
      Number(
        updatedRelease.securedSlots
      );

    const slotName =
      `HUSNAIN-${String(
        slotNumber
      ).padStart(3, "0")}`;

    /*
     * ============================================================
     * 24. SECURE RESERVATION
     * ============================================================
     */

    reservation.status =
      "SECURED";

    reservation.slotNumber =
      slotNumber;

    reservation.slotName =
      slotName;

    reservation.paymentStatus =
      "Paid";

    reservation.orderStatus =
      "Processing";

    reservation.razorpayOrderId =
      razorpayOrderId;

    reservation.razorpayPaymentId =
      razorpayPaymentId;

    /*
     * Webhooks don't provide the same checkout signature
     * that your frontend verification route receives.
     *
     * Therefore we DO NOT write razorpaySignature here.
     */

    await reservation.save();

    /*
     * ============================================================
     * 25. FIND EXISTING ORDER
     * ============================================================
     */

    let order =
      await Order.findOne({
        $or: [
          {
            razorpayPaymentId,
          },
          {
            razorpayOrderId,
          },
          {
            reservationId:
              String(
                reservation._id
              ),
          },
        ],
      });

    /*
     * ============================================================
     * 26. CREATE ORDER IF NECESSARY
     * ============================================================
     */

    if (!order) {
      const price =
        Number(
          reservation.price ||
            release.price
        ) || 999;

      order =
        await Order.create({
          /*
           * CUSTOMER
           */

          customer: {
            name:
              reservation.name,

            email:
              reservation.email,

            phone:
              reservation.phone,

            address:
              reservation.address,

            city:
              reservation.city,

            state:
              reservation.state,

            pincode:
              reservation.pincode,
          },

          /*
           * ADDRESS
           */

          address: {
            address:
              reservation.address,

            city:
              reservation.city,

            state:
              reservation.state,

            pincode:
              reservation.pincode,
          },

          /*
           * PRODUCT
           */

          items: [
            {
              productId:
                String(
                  reservation.releaseId
                ),

              name:
                release.releaseName ||
                "Silent Yahya Release",

              image:
                "/images/clock-tower.png",

              price,

              quantity: 1,
            },
          ],

          quantity: 1,

          /*
           * PRICE
           */

          subtotal: price,

          shipping: 0,

          total: price,

          /*
           * PAYMENT
           */

          paymentMethod:
            "ONLINE",

          paymentStatus:
            "Paid",

          /*
           * ORDER
           */

          orderStatus:
            "Pending",

          /*
           * RAZORPAY
           */

          razorpayOrderId:
            razorpayOrderId,

          razorpayPaymentId:
            razorpayPaymentId,

          /*
           * REFERENCES
           */

          reservationId:
            String(
              reservation._id
            ),

          releaseId:
            String(
              reservation.releaseId
            ),
        });
    } else {
      /*
       * ==========================================================
       * REPAIR EXISTING ORDER
       * ==========================================================
       */

      order.razorpayOrderId =
        razorpayOrderId ||
        order.razorpayOrderId;

      order.razorpayPaymentId =
        razorpayPaymentId ||
        order.razorpayPaymentId;

      order.paymentStatus =
        "Paid";

      order.paymentMethod =
        "ONLINE";

      await order.save();
    }

    /*
     * ============================================================
     * 27. REMAINING SLOTS
     * ============================================================
     */

    const remainingSlots =
      Math.max(
        Number(
          updatedRelease.totalSlots
        ) -
          Number(
            updatedRelease.securedSlots
          ),
        0
      );

    /*
     * ============================================================
     * 28. SUCCESS
     * ============================================================
     */

    console.log(
      "Razorpay payment successfully processed.",
      {
        event,
        eventId,
        reservationId:
          String(reservation._id),
        orderId:
          order?._id
            ? String(order._id)
            : null,
        razorpayOrderId,
        razorpayPaymentId,
        slotName,
        remainingSlots,
      }
    );

    return NextResponse.json({
      success: true,

      processed: true,

      event,

      reservation: {
        id: String(
          reservation._id
        ),

        status:
          reservation.status,

        slotNumber:
          reservation.slotNumber,

        slotName:
          reservation.slotName,

        paymentStatus:
          reservation.paymentStatus,

        orderStatus:
          reservation.orderStatus,

        razorpayOrderId:
          reservation.razorpayOrderId,

        razorpayPaymentId:
          reservation.razorpayPaymentId,
      },

      order: {
        id: order?._id
          ? String(order._id)
          : null,

        orderId:
          order?.orderId ||
          null,

        status:
          order?.orderStatus ||
          "Pending",

        paymentStatus:
          order?.paymentStatus ||
          "Paid",

        razorpayOrderId:
          order?.razorpayOrderId ||
          razorpayOrderId,

        razorpayPaymentId:
          order?.razorpayPaymentId ||
          razorpayPaymentId,
      },

      release: {
        securedSlots:
          updatedRelease.securedSlots,

        totalSlots:
          updatedRelease.totalSlots,

        remainingSlots,
      },
    });
  } catch (error: any) {
    console.error(
      "Razorpay webhook processing error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          "Webhook processing failed.",
      },
      {
        status: 500,
      }
    );
  }
}