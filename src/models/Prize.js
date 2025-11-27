import mongoose from "mongoose";

const PrizeSchema = new mongoose.Schema(
  {
    name: String,
    weight: { type: Number, default: 1 }, // Semakin besar, semakin sering muncul
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Prize ||
  mongoose.model("Prize", PrizeSchema);
