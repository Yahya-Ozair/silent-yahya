import mongoose, { Schema, Document, Model } from "mongoose";

/*
=====================================================
ORDER TYPES
=====================================================
*/

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type PaymentStatus =
  | "Pending"
  | "Paid"
  | "Failed"
  | "Refunded";

export type PaymentMethod =
  | "ONLINE"
  | "Cash on Delivery"
  | "COD"
  | string;

/*
=====================================================
CUSTOMER
=====================================================
*/

export interface IOrderCustomer {
  name?: string;
  email?: string;
  phone?: string;

  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

/*
=====================================================
ADDRESS
=====================================================
*/

export interface IOrderAddress {
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

/*
=====================================================
ORDER ITEM
=====================================================
*/

export interface IOrderItem {
  productId?: string | number;
  id?: string | number;

  name?: string;
  image?: string;

  price: number;
  quantity: number;
}

/*
=====================================================
ORDER DOCUMENT
=====================================================
*/

export interface IOrder extends Document {
  /*
  -----------------------------------------------
  EXISTING STORE ORDER FIELDS
  -----------------------------------------------
  */

  orderId?: string;

  customer?: IOrderCustomer;

  address?: IOrderAddress;

  quantity?: number;

  items?: IOrderItem[];

  subtotal?: number;

  shipping?: number;

  total?: number;

  paymentMethod?: PaymentMethod;

  paymentStatus?: PaymentStatus;

  orderStatus?: OrderStatus;

  razorpayOrderId?: string;

  razorpayPaymentId?: string;

  /*
  -----------------------------------------------
  SILENT YAHYA RESERVATION FIELDS
  -----------------------------------------------
  */

  isReservation?: boolean;

  reservationId?: mongoose.Types.ObjectId;

  releaseId?: mongoose.Types.ObjectId;

  releaseName?: string;

  /*
  -----------------------------------------------
  TIMESTAMPS
  -----------------------------------------------
  */

  createdAt: Date;

  updatedAt: Date;
}

/*
=====================================================
CUSTOMER SCHEMA
=====================================================
*/

const CustomerSchema =
  new Schema<IOrderCustomer>(
    {
      name: {
        type: String,
        trim: true,
      },

      email: {
        type: String,
        trim: true,
      },

      phone: {
        type: String,
        trim: true,
      },

      address: {
        type: String,
        trim: true,
      },

      city: {
        type: String,
        trim: true,
      },

      state: {
        type: String,
        trim: true,
      },

      pincode: {
        type: String,
        trim: true,
      },

      country: {
        type: String,
        trim: true,
      },
    },
    {
      _id: false,
    }
  );

/*
=====================================================
ADDRESS SCHEMA
=====================================================
*/

const AddressSchema =
  new Schema<IOrderAddress>(
    {
      address: {
        type: String,
        trim: true,
      },

      city: {
        type: String,
        trim: true,
      },

      state: {
        type: String,
        trim: true,
      },

      pincode: {
        type: String,
        trim: true,
      },

      country: {
        type: String,
        trim: true,
      },
    },
    {
      _id: false,
    }
  );

/*
=====================================================
ITEM SCHEMA
=====================================================
*/

const OrderItemSchema =
  new Schema<IOrderItem>(
    {
      productId: {
        type: Schema.Types.Mixed,
      },

      id: {
        type: Schema.Types.Mixed,
      },

      name: {
        type: String,
        trim: true,
      },

      image: {
        type: String,
        trim: true,
      },

      price: {
        type: Number,
        default: 0,
      },

      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
    },
    {
      _id: true,
    }
  );

/*
=====================================================
MAIN ORDER SCHEMA
=====================================================
*/

const OrderSchema =
  new Schema<IOrder>(
    {
      /*
      ---------------------------------------------
      EXISTING STORE ORDER
      ---------------------------------------------
      */

      orderId: {
        type: String,
        trim: true,
        index: true,
      },

      customer: {
        type: CustomerSchema,
        default: undefined,
      },

      address: {
        type: AddressSchema,
        default: undefined,
      },

      quantity: {
        type: Number,
        default: 1,
      },

      items: {
        type: [OrderItemSchema],
        default: [],
      },

      subtotal: {
        type: Number,
        default: 0,
      },

      shipping: {
        type: Number,
        default: 0,
      },

      total: {
        type: Number,
        default: 0,
      },

      /*
      ---------------------------------------------
      PAYMENT
      ---------------------------------------------
      */

      paymentMethod: {
        type: String,
        default: "ONLINE",
        trim: true,
      },

      paymentStatus: {
        type: String,
        enum: [
          "Pending",
          "Paid",
          "Failed",
          "Refunded",
        ],
        default: "Pending",
      },

      /*
      ---------------------------------------------
      ORDER STATUS
      ---------------------------------------------
      */

      orderStatus: {
        type: String,
        enum: [
          "Pending",
          "Processing",
          "Shipped",
          "Delivered",
          "Cancelled",
        ],
        default: "Pending",
      },

      /*
      ---------------------------------------------
      RAZORPAY
      ---------------------------------------------
      */

      razorpayOrderId: {
        type: String,
        trim: true,
        index: true,
      },

      razorpayPaymentId: {
        type: String,
        trim: true,
        index: true,
      },

      /*
      =============================================
      SILENT YAHYA RESERVATION ORDER
      =============================================
      */

      isReservation: {
        type: Boolean,
        default: false,
        index: true,
      },

      reservationId: {
        type: Schema.Types.ObjectId,
        ref: "Reservation",
        index: true,
      },

      releaseId: {
        type: Schema.Types.ObjectId,
        ref: "Release",
        index: true,
      },

      releaseName: {
        type: String,
        trim: true,
      },
    },

    {
      timestamps: true,

      /*
      Important:
      Existing orders may contain fields that were
      created before the reservation system existed.
      */

      strict: true,
    }
  );

/*
=====================================================
INDEXES
=====================================================
*/

OrderSchema.index({
  createdAt: -1,
});

OrderSchema.index({
  isReservation: 1,
  createdAt: -1,
});

OrderSchema.index({
  reservationId: 1,
});

OrderSchema.index({
  releaseId: 1,
});

/*
=====================================================
MODEL
=====================================================
*/

const Order: Model<IOrder> =
  mongoose.models.Order ||
  mongoose.model<IOrder>(
    "Order",
    OrderSchema
  );

export default Order;