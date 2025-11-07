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
      enum: ["pending", "confirmed", "cancelled"],
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
    stripeSessionId:{type : String},
    expiresAt:{
      type:Date,
      default: function(){
        return new Date(Date.now()+60*60*1000);
      }
    }
  },
  { timestamps: true }
);
 // Add TTL stands for Time To Live index after schema definition
 //orderSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24*60*60 }); // 24 hours
 // TTL index
orderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save hook to handle expiration
orderSchema.pre("save", function(next){
  if(this.status === "confirmed"){
    // Remove expiresAt to prevent deletion
    this.expiresAt = null;
  }
  else{
    // Set expiration for pending/cancelled orders
    this.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  }
  next();
});

// Pre-update hook to handle expiration when using findByIdAndUpdate
orderSchema.pre("findOneAndUpdate", function(next){
  const update = this.getUpdate();
  
  // Check if status is being updated to "confirmed"
  const newStatus = update.status || update.$set?.status;
  
  if(newStatus === "confirmed"){
    // Remove expiresAt to prevent deletion
    if(update.$set){
      update.$set.expiresAt = null;
    } else {
      update.expiresAt = null;
    }
  }
  
  next();
});

orderSchema.index({ user: 1, status: 1 });

 
export default mongoose.models.Order || mongoose.model("Order", orderSchema);
