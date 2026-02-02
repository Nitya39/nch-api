import crypto from "crypto";
import { connectDB } from "../lib/mongo.js";
import Invoice from "../models/Invoice.js";

function safeNumber(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

export default async function handler(req, res) {
  // CORS so your Hostinger site can call this API
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "METHOD_NOT_ALLOWED" });

  try {
    await connectDB();

    const body = req.body || {};
    const token = crypto.randomBytes(16).toString("hex");

    const invoiceDoc = {
      invoiceNumber: String(body.invoiceNumber || ""),
      type: body.type === "QUOTE" ? "QUOTE" : "INVOICE",
      status: "SENT",
      client: {
        name: String(body?.client?.name || ""),
        email: String(body?.client?.email || ""),
        company: String(body?.client?.company || "")
      },
      items: Array.isArray(body.items) ? body.items.map(i => ({
        description: String(i?.description || ""),
        qty: safeNumber(i?.qty),
        rate: safeNumber(i?.rate),
        total: safeNumber(i?.total)
      })) : [],
      subtotal: safeNumber(body.subtotal),
      taxPercent: safeNumber(body.taxPercent),
      total: safeNumber(body.total),
      notes: String(body.notes || ""),
      token,
      createdAt: new Date(),
      sentAt: new Date(),
      viewedAt: null
    };

    await Invoice.create(invoiceDoc);

    // IMPORTANT: set this to your real domain view page
    // We'll use query param style: /invoice/view.html?token=...
    const link = `https://nitya.xyz/invoice/view.html?token=${token}`;

    return res.status(200).json({ success: true, token, link });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: "SERVER_ERROR" });
  }
}
