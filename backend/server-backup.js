
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let books = [
  {
    id: 1,
    title: "Introduction to Java",
    author: "James Gosling",
    category: "Programming",
    issuedTo: ""
  },
  {
    id: 2,
    title: "Web Development",
    author: "John Smith",
    category: "Web Technology",
    issuedTo: ""
  }
];

app.get("/api/health", (req, res) => {
  res.json({ message: "Digital Library Backend Running" });
});

app.get("/api/books", (req, res) => {
  res.json(books);
});

app.post("/api/books", (req, res) => {
  const { title, author, category } = req.body;

  if (!title?.trim() || !author?.trim() || !category?.trim()) {
    return res.status(400).json({ error: "All fields required" });
  }

  const book = {
    id: Date.now(),
    title: title.trim(),
    author: author.trim(),
    category: category.trim(),
    issuedTo: ""
  };

  books.push(book);
  res.status(201).json(book);
});

app.delete("/api/books/:id", (req, res) => {
  books = books.filter(book => book.id !== Number(req.params.id));
  res.json({ message: "Book deleted" });
});

app.put("/api/books/:id/issue", (req, res) => {
  const book = books.find(b => b.id === Number(req.params.id));

  if (!book) return res.status(404).json({ error: "Book not found" });
  if (book.issuedTo) return res.status(409).json({ error: "Already issued" });

  const student = req.body.student?.trim();
  if (!student) return res.status(400).json({ error: "Student name required" });

  book.issuedTo = student;
  res.json(book);
});

app.put("/api/books/:id/return", (req, res) => {
  const book = books.find(b => b.id === Number(req.params.id));

  if (!book) return res.status(404).json({ error: "Book not found" });

  book.issuedTo = "";
  res.json(book);
});

app.listen(5001, () => {
  console.log("Backend running on port 5001");
});
