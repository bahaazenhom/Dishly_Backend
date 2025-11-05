import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        quantity: {
          type: Number,
          min: 1,
          required: true,
        },
        priceAtPurchase: {
          type: Number,
          required: true,
          min: 0,
        },
        originalPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        discountApplied: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "online"],
      default: "cash",
    },
    // Customer Information
    customerFullName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    // Delivery Details
    deliveryAddress: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);
 // Add TTL stands for Time To Live index after schema definition
 //orderSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 }); // 24 hours
orderSchema.index({ user: 1, status: 1 });

orderSchema.post("save", function (doc) {
  if (doc.status === "pending") {
    setTimeout(async () => {
      try {
        const order = await mongoose.models.Order.findById(doc._id);
        if (order && order.status === "pending") {
          await order.deleteOne();
          console.log(`Order ${doc._id} auto-deleted after 24h (still pending)`);
        }
      } catch (err) {
        console.error("Failed to auto-delete order:", err);
      }
    }, 60 * 60 * 1000); // 1 minutes in milliseconds
  }
});

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
