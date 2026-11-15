const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5001"
  : "https://digital-libarary-system.onrender.com";


import { useState, useEffect, useRef } from "react";
import "./App.css";
import Barcode from "react-barcode";
import {
  Html5QrcodeScanner,
  Html5QrcodeSupportedFormats
} from "html5-qrcode";
const initialBooks = [
  { id: 1, title: "Introduction to Java", author: "James Gosling", category: "Programming", issuedTo: "" },
  { id: 2, title: "Web Development", author: "John Smith", category: "Web Technology", issuedTo: "" },
  { id: 3, title: "Database Management System", author: "C. J. Date", category: "Database", issuedTo: "" }
];

function App() {
  const [books, setBooks] = useState([]);
    

  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState("dashboard");
  const [studentLibraryOpen, setStudentLibraryOpen] = useState(false);
  const [ebookSearch, setEbookSearch] = useState("");
const [scannedCode, setScannedCode] = useState("");
const [selectedStudentId, setSelectedStudentId] = useState(null);
const [selectedBookId, setSelectedBookId] = useState(null);

const [isLoggedIn, setIsLoggedIn] = useState(false);

const [darkMode, setDarkMode] = useState(() => {
  return localStorage.getItem("darkMode") === "true";
});

const toggleDarkMode = () => {
  setDarkMode(previous => {
    const next = !previous;
    localStorage.setItem("darkMode", String(next));
    return next;
  });
};

useEffect(() => {
  if (page !== "scanner" || !isLoggedIn) return;

  const scanner = new Html5QrcodeScanner(
    "barcode-reader",
    {
      fps: 10,
    
      qrbox: { width: 250, height: 150 },
      rememberLastUsedCamera: true,
    },
    false
  );

  scanner.render(
    (decodedText) => {
      const code = decodedText.trim();
      setScannedCode(code);

      const student = studentsRef.current.find(
  (s) => s.barcode === code || `STU-${s.id}` === code
);

if (student) {
  setSelectedStudentId(student.id);
} else if (/^BOOK-\d+$/.test(code)) {
  setSelectedBookId(code.slice(5));
}
    },
    () => {}
  );

  return () => {
    scanner.clear().catch(console.error);
  };
}, [page, isLoggedIn]);
const [loginUsername, setLoginUsername] = useState("");
const [loginPassword, setLoginPassword] = useState("");
const [loginError, setLoginError] = useState("");


const [students, setStudents] = useState([]);
const studentsRef = useRef([]);

const [studentName, setStudentName] = useState("");
const [studentRoll, setStudentRoll] = useState("");
const [studentCourse, setStudentCourse] = useState("");
const [studentEmail, setStudentEmail] = useState("");
const [studentMobile, setStudentMobile] = useState("");
const [studentBarcode, setStudentBarcode] = useState("");


useEffect(() => {
  fetch(`${API_BASE_URL}/api/students`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load students");
      }
      return response.json();
    })
    
.then((data) => {
  console.log("Students from Backend:", data);
  studentsRef.current = data;
  setStudents(data);
})

    .catch((error) => console.error(error));
}, []);



  useEffect(() => {
  fetch(`${API_BASE_URL}/api/books`)
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load books");
      return response.json();
    })
    .then((data) => setBooks(data))
    .catch((error) => console.error(error));
}, []);

  
const getAuthHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`
});

const addBook = async (e) => {
  e.preventDefault();

  if (!title.trim() || !author.trim() || !category.trim()) {
    alert("Please fill all fields");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify({ title, author, category })
    });

    if (!response.ok) {
      throw new Error("Failed to add book");
    }

    const newBook = await response.json();

    setBooks((previous) => [...previous, newBook]);
    setTitle("");
    setAuthor("");
    setCategory("");

    alert("Book added successfully!");
  } catch (error) {
    alert(error.message);
  }
};


  

  
const deleteBook = async (id) => {
  if (!window.confirm("Delete this book?")) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/books/${id}`,
      
{
  method: "DELETE",
  headers: getAuthHeaders()
}

  
    );

    if (!response.ok) {
      throw new Error("Failed to delete book");
    }

    setBooks((previous) =>
      previous.filter((book) => book.id !== id)
    );

    alert("Book deleted successfully!");
  } catch (error) {
    alert(error.message);
  }
};
const handleLogin = async (e) => {
  e.preventDefault();
  setLoginError("");

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    setIsLoggedIn(true);
    setLoginPassword("");
    setPage("dashboard");

    // Temporary token storage until API protection is added
    sessionStorage.setItem("adminToken", data.token);

    alert("Admin Login Successful!");
  } catch (error) {
    setLoginError(error.message);
  }
};

const handleLogout = () => {
  sessionStorage.removeItem("adminToken");
  setIsLoggedIn(false);
  setLoginUsername("");
  setLoginPassword("");
  setPage("dashboard");
};


const addStudent = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/students`,
      {
        method: "POST",
        
headers: {
  "Content-Type": "application/json",
  ...getAuthHeaders()
},

        body: JSON.stringify({
  name: studentName,
  rollNo: studentRoll,
  course: studentCourse,
  barcode: studentBarcode,
email: studentEmail,
mobile: studentMobile
})
      }
    );





    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to add student");
    }

    setStudents((previous) => [...previous, data]);
    setStudentName("");
    setStudentRoll("");
    setStudentCourse("");

    alert("Student added successfully!");
  } catch (error) {
    alert(error.message);
  }
};
const deleteStudent = async (id) => {
  if (!window.confirm("Delete this student?")) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/students/${id}`,
      { method: "DELETE" ,
        headers:getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete student");
    }

    setStudents((previous) =>
      previous.filter((student) => student.id !== id)
    );

    alert("Student deleted successfully!");
  } catch (error) {
    alert(error.message);
  }
};


  
const issueBook = async (id, studentName = "") => {
  const student = studentName || window.prompt("Enter Student Name:");
  if (!student?.trim()) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/books/${id}/issue`,
      {
        method: "PUT",
        
headers: {
  "Content-Type": "application/json",
  ...getAuthHeaders()
},

        body: JSON.stringify({ student: student.trim() })
      }
    );

    if (!response.ok) {
      throw new Error("Failed to issue book");
    }

    const updatedBook = await response.json();

    setBooks((previous) =>
      previous.map((book) =>
        book.id === id ? updatedBook : book
      )
    );

    alert("Book issued successfully!");
  } catch (error) {
    alert(error.message);
  }
};


  
const returnBook = async (id) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/books/${id}/return`,
      
{
  method: "PUT",
  headers: getAuthHeaders()
}

    );

    if (!response.ok) {
      throw new Error("Failed to return book");
    }

    const updatedBook = await response.json();

    setBooks((previous) =>
      previous.map((book) =>
        book.id === id ? updatedBook : book
      )
    );

    alert("Book returned successfully!");
  } catch (error) {
    alert(error.message);
  }
};


  const filteredBooks = books.filter((book) =>
    `${book.title} ${book.author} ${book.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const issued = books.filter((book) => book.issuedTo).length;
if (studentLibraryOpen && !isLoggedIn) {
  return (
    <div className="login-container">
      <div className="book-form">
        <h1>📚 Student Digital Library</h1>
        <p>Welcome! Read free books online.</p>
        <input
  type="text"
  placeholder="🔍 Search books: Python, Java, Accounting..."
  value={ebookSearch}
  onChange={(e) => setEbookSearch(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    marginBottom: "20px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxSizing: "border-box"
  }}
/>
{("Think Python BCA".toLowerCase().includes(ebookSearch.toLowerCase())) && (
  <>
        <h3>🐍 Think Python — BCA</h3>
        <a
          href="https://greenteapress.com/wp/think-python-2e/"
          target="_blank"
          rel="noopener noreferrer"
        >
          📖 Read Free Book
        </a>
        </>
)}
{("Think Java BCA B.Tech".toLowerCase().includes(ebookSearch.toLowerCase())) && (
  <>
        <h3>☕ Think Java — BCA / B.Tech</h3>
<a
  href="https://greenteapress.com/wp/think-java-2e/"
  target="_blank"
  rel="noopener noreferrer"
>
  📖 Read Free Book
</a>
</>
)}

        <br /><br />

        <button
          type="button"
          className="primary"
          onClick={() => setStudentLibraryOpen(false)}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}
if (!isLoggedIn) {
  return (
    <div className="login-container">
      <form className="book-form" onSubmit={handleLogin}>
        <h1>📚 Digital Library System</h1>
        <h2>Admin Login</h2>

        <input
          type="text"
          placeholder="Username"
          value={loginUsername}
          onChange={(e) => setLoginUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          required
        />

        {loginError && (
          <p style={{ color: "red" }}>{loginError}</p>
        )}

        <button className="primary" type="submit">
          Login
        </button>
        <button
  type="button"
  className="primary"
  onClick={() => setStudentLibraryOpen(true)}
>
  📚 Student Library — Read Free Books
</button>
      </form>
    </div>
  );
}

  return (
    <div className={`layout ${darkMode ? "dark-mode" : ""}`}>
      <aside className="sidebar">
        <h2>📚 Digital Library</h2>
        <button onClick={() => setPage("dashboard")}>🏠 Dashboard</button>
        <button onClick={() => setPage("books")}>📖 Manage Books</button>
        <button onClick={() => setPage("scanner")}>📷 Scan Barcode</button>
        <button onClick={() => setPage("add")}>➕ Add Book</button>
        <button onClick={() => setPage("ebooks")}>📚 BCA PDF Books</button>
        <button onClick={() => setPage("issued")}>📋 Issued Books</button>
      </aside>

      <main className="content">
        <header className="topbar">
          <h1>Digital Library System</h1>
          <span>Admin Panel</span>

<button
  type="button"
  className="theme-toggle"
  onClick={toggleDarkMode}
>
  {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
</button>

<button
  type="button"
  className="primary"
  onClick={handleLogout}
>
  🚪 Logout
</button>

        </header>

        {page === "dashboard" && (
          <>
            <div className="stats">
  <div className="stat">
    <h3>📚 Total Books</h3>
    <strong>{books.length}</strong>
  </div>

  <div className="stat">
    <h3>✅ Available Books</h3>
    <strong>{books.length - issued}</strong>
  </div>

  <div className="stat">
    <h3>📖 Issued Books</h3>
    <strong>{issued}</strong>
  </div>

  <div className="stat">
    <h3>🎓 Total Students</h3>
    <strong>{students.length}</strong>
  </div>
</div>
            
<div className="dashboard-chart">
  <h2>📊 Library Statistics</h2>
  <p>Live Book Availability</p>

  <div className="chart-row">
    <span>✅ Available Books</span>
    <div className="chart-track">
      <div
        className="chart-fill available-fill"
        style={{
          width: `${books.length ? ((books.length - issued) / books.length) * 100 : 0}%`
        }}
      />
    </div>
    <strong>
      {books.length - issued} (
      {books.length
        ? Math.round(((books.length - issued) / books.length) * 100)
        : 0}%)
    </strong>
  </div>

  <div className="chart-row">
    <span>📖 Issued Books</span>
    <div className="chart-track">
      <div
        className="chart-fill issued-fill"
        style={{
          width: `${books.length ? (issued / books.length) * 100 : 0}%`
        }}
      />
    </div>
    <strong>
      {issued} (
      {books.length
        ? Math.round((issued / books.length) * 100)
        : 0}%)
    </strong>
  </div>
</div>

<h2>Welcome to Your Digital Library</h2>

            <p>Manage books, search the collection, issue and return books easily.</p>
            
<button className="primary" onClick={() => setPage("books")}>
  View All Books
</button>

<button className="primary" onClick={() => setPage("students")}>
  🎓 Students
</button>

          </>
        )}
        {page === "ebooks" && (
  <div>
    <h2>📚 BCA Digital PDF Library</h2>
    <p>Free books for BCA students</p>
    <div className="ebook-card">
  <h3>☕ Think Java — 2nd Edition</h3>
  <p>Subject: Java Programming</p>
  <p>Authors: Allen B. Downey & Chris Mayfield</p>
  <a
    href="https://greenteapress.com/wp/think-java-2e/"
    target="_blank"
    rel="noopener noreferrer"
  >
    📖 Read Free Book
  </a>
  <h3>📊 Principles of Accounting — B.Com</h3>
<a
  href="https://openstax.org/subjects/business"
  target="_blank"
  rel="noopener noreferrer"
>
  📖 Find Free Accounting Books
</a>
</div>
<div className="ebook-card">
  <h3>📐 Tea Time Numerical Analysis</h3>
  <p>Subject: Numerical Methods</p>
  <p>Author: Leon Q. Brin</p>
  <a
    href="https://open.umn.edu/opentextbooks/textbooks/741"
    target="_blank"
    rel="noopener noreferrer"
  >
    📖 Read Free Book
  </a>
</div>
<div className="ebook-card">
  <h3>🐍 Think Python — 2nd Edition</h3>
  <p>Subject: Python Programming</p>
  <p>Author: Allen B. Downey</p>
  <a
    href="https://greenteapress.com/wp/think-python-2e/"
    target="_blank"
    rel="noopener noreferrer"
  >
    📖 Read Free Book
  </a>
</div>
<div className="ebook-card">
  <h3>🌐 Computer Networking: Principles, Protocols and Practice</h3>
  <p>Subject: Computer Networks</p>
  <p>Author: Olivier Bonaventure</p>
  <a
    href="https://www.computer-networking.info/"
    target="_blank"
    rel="noopener noreferrer"
  >
    📖 Read Free Book
  </a>
</div>


  </div>
)}
        {page === "scanner" && (
  <div className="scanner-page">
    <h2>📷 Barcode Scanner</h2>
    <p>Scan a Book or Student Barcode using your camera.</p>

    <div
      id="barcode-reader"
      style={{ maxWidth: "450px", margin: "20px auto" }}
    ></div>

    {scannedCode && (
      <div className="scan-result">
        <h3>✅ Barcode Scanned Successfully!</h3>
        <p>
          <strong>Code:</strong> {scannedCode}
        </p>

  {(() => {
  const student = students.find(
    (s) =>
      String(s.barcode || "").trim() === scannedCode.trim() ||
      `STU-${s.id}` === scannedCode.trim()
  );

          return student ? (
            <div className="student-scan-details">
              <h3>🎓 Student Details</h3>
              <p><strong>Student ID:</strong> {student.id}</p>
              <p><strong>Name:</strong> {student.name}</p>
              <p><strong>Roll Number:</strong> {student.rollNo}</p>
              <p><strong>Course:</strong> {student.course}</p>
              <p><strong>Gmail:</strong> {student.email || "Not added"}</p>
<p><strong>Mobile:</strong> {student.mobile || "Not added"}</p>
<h4>📚 Issued Books</h4>

{books.filter(
  (book) => book.issuedTo === student.name
).length === 0 ? (
  <p>No books issued</p>
) : (
  books
    .filter((book) => book.issuedTo === student.name)
    .map((book) => (
      <div key={book.id}>
        <p><strong>Book:</strong> {book.title}</p>
        <p><strong>Issue Date:</strong> {book.issueDate ? new Date(book.issueDate).toLocaleDateString("en-IN") : "—"}</p>
        <p><strong>Return Due:</strong> {book.dueDate ? new Date(book.dueDate).toLocaleDateString("en-IN") : "—"}</p>
      </div>
    ))
)}
            </div>
          ) : (
            <p>❌ Student not found</p>
          );
        })()}

        {scannedCode.startsWith("BOOK-") && (() => {
          const bookId = scannedCode.slice(5);
          const book = books.find(
            (b) => String(b.id) === bookId
          );

          return book ? (
            <div className="book-scan-details">
              <h3>📚 Book Details</h3>
              <p><strong>Book Name:</strong> {book.title}</p>
              <p><strong>Author:</strong> {book.author}</p>
              <p><strong>Category:</strong> {book.category}</p>
              <p>
                <strong>Status:</strong>{" "}
                {book.issuedTo
                  ? `Issued to ${book.issuedTo}`
                  : "Available"}
              </p>
            </div>
          ) : (
            <p>❌ Book not found</p>
          );
        })()}
      </div>
    )}
  </div>
)}

{page === "scanner" && (
  <div className="scan-selection">
    <h3>📚 Barcode Issue / Return</h3>

    <p>
      <strong>🎓 Selected Student:</strong>{" "}
      {selectedStudentId !== null
        ? students.find(s => String(s.id) === String(selectedStudentId))?.name || "Student not found"
        : "Please scan Student Barcode"}
    </p>

    <p>
      <strong>📖 Selected Book:</strong>{" "}
      {selectedBookId !== null
        ? books.find(b => String(b.id) === String(selectedBookId))?.title || "Book not found"
        : "Please scan Book Barcode"}
    </p>
  </div>
)}


{page === "scanner" && selectedStudentId !== null && selectedBookId !== null && (() => {
  const student = studentsRef. current.find(
    s => String(s.id) === String(selectedStudentId)
  );
  const book = books.find(
    b => String(b.id) === String(selectedBookId)
  );

  if (!student || !book) return null;

  return (
    <div className="scan-actions">
      {book.issuedTo ? (
        <div>
          <p>📕 This book is already issued to {book.issuedTo}</p>
          <button
            className="primary"
            onClick={() => {
              if (window.confirm(
                `Return "${book.title}" issued to ${book.issuedTo}?`
              )) {
                returnBook(book.id);
              }
            }}
          >
            ↩️ Return Book
          </button>
        </div>
      ) : (
        <button
          className="primary"
          onClick={() => {
            if (window.confirm(
              `Issue "${book.title}" to ${student.name}?`
            )) {
              issueBook(book.id, student.name);
            }
          }}
        >
          📚 Issue Book to {student.name}
        </button>
      )}
    </div>
  );
})()}

{page === "students" && (
  <>
    <h2>Student Management</h2>

<form className="book-form" onSubmit={addStudent}>
  <input
    type="text"
    placeholder="Student Name"
    value={studentName}
    onChange={(e) => setStudentName(e.target.value)}
    required
  />

  <input
    type="text"
    placeholder="Roll Number"
    value={studentRoll}
    onChange={(e) => setStudentRoll(e.target.value)}
    required
  />

  <input
    type="text"
    placeholder="Course"
    value={studentCourse}
    onChange={(e) => setStudentCourse(e.target.value)}
    required
  />
  <input
  type="email"
  placeholder="Student Gmail"
  value={studentEmail}
  onChange={(e) => setStudentEmail(e.target.value)}
  required
/>
<input
  type="tel"
  placeholder="Student Mobile Number"
  value={studentMobile}
  onChange={(e) => setStudentMobile(e.target.value)}
  maxLength={10}
  required
/>
<input
  type="text"
  placeholder="College ID Barcode"
  value={studentBarcode}
  onChange={(e) => setStudentBarcode(e.target.value)}
/>
  <button className="primary" type="submit">
    Add Student
  </button>
</form>

    <h3>Total Students: {students.length}</h3>

    <div className="table-wrap">
  <table>
      <thead>
        <tr>
          <th>Barcode</th>
          <th>Student Name</th>
          <th>Roll Number</th>
          <th>Course</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student) => (
          <tr key={student.id}>
            <td>
  <Barcode
    value={`STU-${student.id}`}
    width={1}
    height={45}
    fontSize={11}
    margin={3}
  />
</td>
            <td>{student.name}</td>
            <td>{student.rollNo}</td>
            <td>{student.course}</td>
            
<td>
  <button
    className="danger"
    onClick={() => deleteStudent(student.id)}
  >
    Delete
  </button>
</td>

          </tr>
        ))}
      </tbody>
    </table>
  </div>
  </>
)}
        {page === "add" && (
          <>
            <h2>Add New Book</h2>
            <form className="book-form" onSubmit={addBook}>
              <input placeholder="Book Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <input placeholder="Author Name" value={author} onChange={(e) => setAuthor(e.target.value)} />
              <input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
              <button className="primary" type="submit">Add Book</button>
            </form>
          </>
        )}

        {(page === "books" || page === "issued") && (
          <>
            <h2>{page === "issued" ? "Issued Books" : "Manage Books"}</h2>
            <input
              className="search"
              placeholder="Search by title, author or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Barcode</th>
                    <th>Book Name</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Due Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks
                    .filter((book) => page !== "issued" || book.issuedTo)
                    .map((book) => (
                      <tr key={book.id}>
                        <td>
  <Barcode
    value={`BOOK-${book.id}`}
    width={1}
    height={45}
    fontSize={11}
    margin={3}
  />
</td>
                        <td>{book.title}</td>
                        <td>{book.author}</td>
                        <td>{book.category}</td>
                        <td>{book.issuedTo ? `Issued to ${book.issuedTo}` : "Available"}</td>
                        <td>{book.issueDate ? new Date(book.issueDate).toLocaleDateString("en-IN") : "—"}</td>
                        <td>{book.dueDate ? new Date(book.dueDate).toLocaleDateString("en-IN") : "—"}</td>
                        <td>
                          {!book.issuedTo ? "—" :
                           !book.dueDate ? "Date unavailable" :
                           new Date(book.dueDate).toLocaleDateString("en-CA", {
                             timeZone: "Asia/Kolkata"
                           }) < new Date().toLocaleDateString("en-CA", {
                             timeZone: "Asia/Kolkata"
                           })
                             ? "🔴 Overdue"
                             : "🟢 On Time"}
                        </td>
                        <td>
                          {book.issuedTo ? (
                            <button onClick={() => returnBook(book.id)}>Return</button>
                          ) : (
                            <button onClick={() => issueBook(book.id)}>Issue</button>
                          )}
                          <button className="danger" onClick={() => deleteBook(book.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
