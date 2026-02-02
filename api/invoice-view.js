import { connectDB } from "../lib/mongo.js";
import Invoice from "../models/Invoice.js";

export default async function handler(req, res) {
  // CORS for your Hostinger site
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }

  try {
    await connectDB();

    const token = String(req.query.token || "");
    if (!token) return res.status(400).json({ error: "MISSING_TOKEN" });

    const invoice = await Invoice.findOne({ token }).lean();
    if (!invoice) return res.status(404).json({ error: "NOT_FOUND" });

    // Set viewedAt once
    if (!invoice.viewedAt) {
      await Invoice.updateOne({ token, viewedAt: null }, { $set: { viewedAt: new Date() } });
      invoice.viewedAt = new Date();
    }

    // Return only safe fields
    delete invoice._id;
    delete invoice.__v;

    return res.status(200).json(invoice);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
}
