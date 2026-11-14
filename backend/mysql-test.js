
const express = require("express");
const db = require("./db");

const app = express();

app.get("/api/books", async (req, res) => {
  try {
    const [books] = await db.query("SELECT * FROM books");
    res.json(books);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/students", async (req, res) => {
  try {
    const [students] = await db.query("SELECT * FROM students");
    res.json(students);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(5002, () => {
  console.log("MySQL Test API running on port 5002");
});
