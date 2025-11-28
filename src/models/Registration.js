import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    storeName: String,
    code: String, 
    deviceId: { type: String, unique: true, sparse: true },
    isUsed: { type: Boolean, default: false },
    spinResult: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Registration ||
  mongoose.model("Registration", RegistrationSchema);
