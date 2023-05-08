import mongoose from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  produks: [
    {
      produk: { type: Schema.Types.ObjectId, ref: "Produks", required: true },
      quantity: { type: Number, required: true },
      noteProduk: { type: String, required: true },
      ukuran: { type: String, required: true },
    },
  ],
  totalHarga: { type: Number, required: true },
  validasiPenerima: {
    suksesTerima: { type: String, default: null },
  },
  buktiTranfer: {
    publick_id: { type: String },
    url: { type: String },
  },
  tanggal: { type: String, required: true },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },

  resiPengiriman: { type: String, default: null },

  gambarResi: {
    publick_id: { type: String, default: null },
    url: { type: String, default: null },
  },

  orderBatal: {
    dibatalkan: { type: Boolean, default: null },
    alasanDibatalkan: { type: String, default: null },
    gambarTranferRefundBatal: {
      publick_id: { type: String, default: null },
      url: { type: String, default: null },
    },
  },
});

orderSchema.plugin(mongooseUniqueValidator);
export default mongoose.model("Orders", orderSchema);
