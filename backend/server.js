
const express = require("express");
const db = require("./db");
const cors = require("cors");
const fs = require("fs");
const path = require("path");


const app = express();
app.use(cors());
app.use(express.json());


const DATA_FILE = path.join(__dirname, "books.json");

let books;

try {
  const data = fs.readFileSync(DATA_FILE, "utf8");
  books = JSON.parse(data);

  if (!Array.isArray(books)) {
    throw new Error("Invalid books data");
  }
} catch (error) {
  console.error("Could not load books.json:", error.message);
  books = [];
}

function saveBooks() {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(books, null, 2),
    "utf8"
  );
}


function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Login required"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(403).json({
      error: "Invalid or expired token"
    });
  }
}


app.get("/api/health", (req, res) => {
  res.json({ message: "Digital Library Backend Running" });
});


app.get("/api/books", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM books");

    const books = rows.map(book => ({
      ...book,
      id: Number(book.id),
      issuedTo: book.issuedTo || ""
    }));

    res.json(books);
  } catch (error) {
    console.error("MySQL Books Error:", error.message);
    res.status(500).json({ error: "Unable to load books" });
  }
});



app.post("/api/books", verifyToken, async (req, res) => {
  const { title, author, category } = req.body;

  if (
    typeof title !== "string" || !title.trim() ||
    typeof author !== "string" || !author.trim() ||
    typeof category !== "string" || !category.trim()
  ) {
    return res.status(400).json({ error: "All fields required" });
  }

  const book = {
    id: Date.now(),
    title: title.trim(),
    author: author.trim(),
    category: category.trim(),
    issuedTo: ""
  };

  try {
    await db.query(
      `INSERT INTO books
       (id, title, author, category, issued, issuedTo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [book.id, book.title, book.author, book.category, false, null]
    );

    res.status(201).json(book);
  } catch (error) {
    console.error("Add Book Error:", error.message);
    res.status(500).json({ error: "Unable to add book" });
  }
});





app.delete("/api/books/:id", verifyToken, async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM books WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json({ message: "Book deleted" });
  } catch (error) {
    console.error("Delete Book Error:", error.message);
    res.status(500).json({ error: "Unable to delete book" });
  }
});



app.put("/api/books/:id/issue", verifyToken, async (req, res) => {
  const student = req.body.student?.trim();

  if (!student) {
    return res.status(400).json({
      error: "Student name required"
    });
  }

  try {
    const [result] = await db.query(
      `UPDATE books
       SET issuedTo = ?,
           issued = 1,
           issueDate = CURRENT_DATE(),
           dueDate = DATE_ADD(CURRENT_DATE(), INTERVAL 14 DAY)
       WHERE id = ?
       AND (issuedTo IS NULL OR issuedTo = '')`,
      [student, req.params.id]
    );

    if (result.affectedRows === 0) {
      const [rows] = await db.query(
        "SELECT id FROM books WHERE id = ?",
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          error: "Book not found"
        });
      }

      return res.status(409).json({
        error: "Already issued"
      });
    }

    const [rows] = await db.query(
      "SELECT * FROM books WHERE id = ?",
      [req.params.id]
    );

    res.json({
      ...rows[0],
      id: Number(rows[0].id),
      issuedTo: rows[0].issuedTo || ""
    });
  } catch (error) {
    console.error("Issue Book Error:", error.message);
    res.status(500).json({
      error: "Unable to issue book"
    });
  }
});



app.put("/api/books/:id/return", verifyToken, async (req, res) => {
  try {
    const [result] = await db.query(
      `UPDATE books
       SET issuedTo = NULL,
           issued = 0,
           issueDate = NULL,
           dueDate = NULL
       WHERE id = ?`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Book not found"
      });
    }

    const [rows] = await db.query(
      "SELECT * FROM books WHERE id = ?",
      [req.params.id]
    );

    res.json({
      ...rows[0],
      id: Number(rows[0].id),
      issuedTo: ""
    });
  } catch (error) {
    console.error("Return Book Error:", error.message);
    res.status(500).json({
      error: "Unable to return book"
    });
  }
});


const STUDENTS_FILE = path.join(__dirname, "students.json");

function getStudents() {
  return JSON.parse(
    fs.readFileSync(STUDENTS_FILE, "utf8")
  );
}

// Get all students

app.get("/api/students", async (req, res) => {
  try {
    const [students] = await db.query(
      "SELECT * FROM students"
    );

    res.json(students);
  } catch (error) {
    console.error("Students Error:", error.message);

    res.status(500).json({
      error: "Unable to load students"
    });
  }
});


// Add a new student

app.post("/api/students", verifyToken, async (req, res) => {
  const { name, rollNo, course, barcode ,email,mobile} = req.body;

  if (
    typeof name !== "string" || !name.trim() ||
    typeof rollNo !== "string" || !rollNo.trim() ||
    typeof course !== "string" || !course.trim()
  ) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    const [existing] = await db.query(
      "SELECT id FROM students WHERE rollNo = ?",
      [rollNo.trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: "Roll number already exists"
      });
    }

    const student = {
      id: Date.now().toString(),
      name: name.trim(),
      rollNo: rollNo.trim(),
      course: course.trim(),
barcode: typeof barcode === "string" ? barcode.trim() || null : null,
email: typeof email === "string" ? email.trim() : "",
mobile: typeof mobile === "string" ? mobile.trim() : ""
    };

    await db.query(
      "INSERT INTO students (id, name, rollNo, course, barcode,email,mobile) VALUES (?, ?, ?, ?)",
      [student.id, student.name, student.rollNo, student.course,student.barcode,student.email,student.mobile]
    );

    res.status(201).json(student);
  } catch (error) {
    console.error("Add Student Error:", error.message);
    res.status(500).json({ error: "Unable to add student" });
  }
});



app.delete("/api/students/:id", verifyToken, async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM students WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Student not found"
      });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Delete Student Error:", error.message);
    res.status(500).json({
      error: "Unable to delete student"
    });
  }
});


const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const ADMIN_FILE = path.join(__dirname, "admin.json");

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (typeof username !== "string" ||
      typeof password !== "string") {
    return res.status(400).json({
      error: "Username and password required"
    });
  }

  try {
    
const admin = {
  username: process.env.ADMIN_USERNAME,
  passwordHash: process.env.ADMIN_PASSWORD_HASH
};


    if (
      username !== admin.username ||
      !bcrypt.compareSync(password, admin.passwordHash)
    ) {
      return res.status(401).json({
        error: "Invalid username or password"
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        error: "Login configuration missing"
      });
    }

    const token = jwt.sign(
      { username: admin.username, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token, username: admin.username });
  } catch (error) {
    res.status(500).json({
      error: "Login is unavailable"
    });
  }
});


const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});
