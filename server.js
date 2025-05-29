// Import dependencies
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Inisialisasi app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Skema data RSVP
const rsvpSchema = new mongoose.Schema({
  coupleId: { type: String, required: true }, // Tambahkan coupleId
  name: String,
  phone: String,
  attendance: { type: String, enum: ["yes", "no"] },
  guests: Number,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

// Model untuk koleksi khusus
const RSVP = mongoose.model("RSVP", rsvpSchema, "lineArtTheme");

// Endpoint POST untuk menyimpan data RSVP
app.post("/api/rsvp", async (req, res) => {
  try {
    const { coupleId, name, phone, attendance, guests, message } = req.body;

    if (!coupleId || !name || !phone || !attendance) {
      return res.status(400).json({ message: "coupleId, name, phone, and attendance are required." });
    }

    const rsvp = new RSVP({
      coupleId,
      name,
      phone,
      attendance,
      guests: attendance === "yes" ? guests || 1 : 0,
      message,
    });

    await rsvp.save();
    res.status(200).json({ message: "RSVP sent successfully!" });
  } catch (error) {
    console.error("❌ Error saving RSVP:", error);
    res.status(500).json({ message: "Failed to save RSVP." });
  }
});

// Endpoint GET untuk mengambil semua data RSVP berdasarkan coupleId
app.get("/api/rsvps", async (req, res) => {
  try {
    const { coupleId } = req.query;

    if (!coupleId) {
      return res.status(400).json({ message: "coupleId query is required." });
    }

    const data = await RSVP.find({ coupleId }).sort({ createdAt: -1 });

    const formatted = data.map(item => ({
      name: item.name,
      phone: item.phone,
      attendance: item.attendance,
      guests: item.guests,
      message: item.message,
      createdAt: item.createdAt,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("❌ Error fetching RSVP data:", error);
    res.status(500).json({ message: "Failed to fetch RSVP data." });
  }
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
