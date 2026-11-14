
import { useState, useEffect } from "react";
import "./App.css";
import Barcode from "react-barcode";
import { Html5QrcodeScanner } from "html5-qrcode";
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
const [scannedCode, setScannedCode] = useState("");
const [selectedStudentId, setSelectedStudentId] = useState(null);
const [selectedBookId, setSelectedBookId] = useState(null);

const [isLoggedIn, setIsLoggedIn] = useState(false);

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
      setScannedCode(decodedText);
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
const [studentName, setStudentName] = useState("");
const [studentRoll, setStudentRoll] = useState("");
const [studentCourse, setStudentCourse] = useState("");

useEffect(() => {
  fetch("https://digital-libarary-system.onrender.com/api/students")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load students");
      }
      return response.json();
    })
    
.then((data) => {
  console.log("Students from Backend:", data);
  setStudents(data);
})

    .catch((error) => console.error(error));
}, []);



  useEffect(() => {
  fetch("https://digital-libarary-system.onrender.com/api/books")
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
    const response = await fetch("https://digital-libarary-system.onrender.com/api/books", {
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
      `https://digital-libarary-system.onrender.com/api/books/${id}`,
      
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
      "https://digital-libarary-system.onrender.com/api/login",
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
      "https://digital-libarary-system.onrender.com/api/students",
      {
        method: "POST",
        
headers: {
  "Content-Type": "application/json",
  ...getAuthHeaders()
},

        body: JSON.stringify({
          name: studentName,
          rollNo: studentRoll,
          course: studentCourse
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
      `https://digital-libarary-system.onrender.com/api/students/${id}`,
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
      `https://digital-libarary-system.onrender.com/api/books/${id}/issue`,
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
      `https://digital-libarary-system.onrender.com/api/books/${id}/return`,
      
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
      </form>
    </div>
  );
}

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>📚 Digital Library</h2>
        <button onClick={() => setPage("dashboard")}>🏠 Dashboard</button>
        <button onClick={() => setPage("books")}>📖 Manage Books</button>
        <button onClick={() => setPage("scanner")}>📷 Scan Barcode</button>
        <button onClick={() => setPage("add")}>➕ Add Book</button>
        <button onClick={() => setPage("issued")}>📋 Issued Books</button>
      </aside>

      <main className="content">
        <header className="topbar">
          <h1>Digital Library System</h1>
          <span>Admin Panel</span>

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

        {scannedCode.startsWith("STU-") && (() => {
          const studentId = scannedCode.slice(4);
          const student = students.find(
            (s) => String(s.id) === studentId
          );

          return student ? (
            <div className="student-scan-details">
              <h3>🎓 Student Details</h3>
              <p><strong>Student ID:</strong> {student.id}</p>
              <p><strong>Name:</strong> {student.name}</p>
              <p><strong>Roll Number:</strong> {student.rollNo}</p>
              <p><strong>Course:</strong> {student.course}</p>
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

{page === "scanner" && (selectedStudentId !== null || selectedBookId !== null) && (
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
