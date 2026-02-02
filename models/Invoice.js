import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    company: { type: String, default: "" }
  },
  { _id: false }
);

const ItemSchema = new mongoose.Schema(
  {
    description: { type: String, default: "" },
    qty: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  { _id: false }
);

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, index: true },
  type: { type: String, enum: ["INVOICE", "QUOTE"], default: "INVOICE" },
  status: { type: String, enum: ["DRAFT", "SENT", "PAID", "VOID"], default: "SENT" },

  client: { type: ClientSchema, default: () => ({}) },
  items: { type: [ItemSchema], default: [] },

  subtotal: { type: Number, default: 0 },
  taxPercent: { type: Number, default: 0 },
  total: { type: Number, default: 0 },

  notes: { type: String, default: "" },

  token: { type: String, unique: true, index: true },

  createdAt: { type: Date, default: Date.now },
  sentAt: { type: Date, default: Date.now },
  viewedAt: { type: Date, default: null }
});

export default mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
