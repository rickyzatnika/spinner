import mongoose from "mongoose";

const SpinLogSchema = new mongoose.Schema(
  {
    code: String,
    userId: mongoose.Schema.Types.ObjectId,
    prize: String,
    prizeId: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

export default mongoose.models.SpinLog ||
  mongoose.model("SpinLog", SpinLogSchema);
