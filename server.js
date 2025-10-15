const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");

console.log("🟢 Starting server script...");

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",         // 🔹 your MySQL username
  password: "Pavani@123", // 🔹 your MySQL password
  database: "food_feedback"
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1); // Exit Node if DB fails
  } else {
    console.log("✅ Connected to MySQL database!");
  }
});

// Route to store feedback
app.post("/submit-feedback", (req, res) => {
  const { student_id, day, meal_type, liked, suggestion } = req.body;

  if (!student_id || !day || !meal_type || liked === undefined) {
    console.warn("⚠️ Missing required fields:", req.body);
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    INSERT INTO feedback (student_id, day, meal_type, liked, suggestion)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [student_id, day, meal_type, liked, suggestion || ""];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Error inserting data:", err);
      return res.status(500).json({ error: "Database error" });
    }
    console.log(`✅ Feedback saved: Student ID ${student_id}, ${day} - ${meal_type}`);
    res.status(200).json({ message: "Feedback submitted successfully!" });
  });
});

// Route to fetch all feedback (for Power BI)
app.get("/feedback", (req, res) => {
  db.query("SELECT * FROM feedback", (err, results) => {
    if (err) {
      console.error("❌ Error fetching feedback:", err);
      return res.status(500).json({ error: "Database error" });
    }
    console.log(`📄 Fetched ${results.length} feedback entries`);
    res.json(results);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// Global error handling
process.on('uncaughtException', (err) => {
  console.error("💥 Uncaught Exception:", err);
});

process.on('unhandledRejection', (err) => {
  console.error("💥 Unhandled Rejection:", err);
});
