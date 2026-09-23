// server.js
const express = require("express");
const Database = require("better-sqlite3");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
const db = new Database("library.db");

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ---------- DATABASE INIT ----------
db.exec(`
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id TEXT UNIQUE,
  name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id TEXT UNIQUE,
  name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  author TEXT,
  year INTEGER,
  copies INTEGER DEFAULT 1
);
`);

// ---------- API ENDPOINTS ----------

// Student Register
app.post("/api/student/register", (req, res) => {
  const { student_id, name, email, password } = req.body;
  if (!student_id || !name || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const exists = db
    .prepare("SELECT 1 FROM students WHERE student_id = ? OR email = ?")
    .get(student_id, email);
  if (exists) return res.status(409).json({ error: "Already exists" });

  const hash = bcrypt.hashSync(password, 10);
  db.prepare(
    "INSERT INTO students (student_id, name, email, password_hash) VALUES (?, ?, ?, ?)"
  ).run(student_id, name, email, hash);

  res.json({ ok: true, message: "Student registered successfully" });
});

// Student Login
app.post("/api/student/login", (req, res) => {
  const { student_id, password } = req.body;
  const user = db
    .prepare("SELECT * FROM students WHERE student_id = ?")
    .get(student_id);
  if (!user) return res.status(401).json({ error: "Invalid ID" });

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Wrong password" });

  res.json({ ok: true, student: { id: user.id, name: user.name, email: user.email } });
});

// Admin Register
app.post("/api/admin/register", (req, res) => {
  const { admin_id, name, email, password } = req.body;
  if (!admin_id || !name || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const exists = db
    .prepare("SELECT 1 FROM admins WHERE admin_id = ? OR email = ?")
    .get(admin_id, email);
  if (exists) return res.status(409).json({ error: "Already exists" });

  const hash = bcrypt.hashSync(password, 10);
  db.prepare(
    "INSERT INTO admins (admin_id, name, email, password_hash) VALUES (?, ?, ?, ?)"
  ).run(admin_id, name, email, hash);

  res.json({ ok: true, message: "Admin registered successfully" });
});

// Admin Login
app.post("/api/admin/login", (req, res) => {
  const { admin_id, password } = req.body;
  const user = db
    .prepare("SELECT * FROM admins WHERE admin_id = ?")
    .get(admin_id);
  if (!user) return res.status(401).json({ error: "Invalid ID" });

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Wrong password" });

  res.json({ ok: true, admin: { id: user.id, name: user.name, email: user.email } });
});

// ---------- FRONTEND ----------
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BCET Library Portal</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; background-color: #b4c9c7; color: #333; }
        header { background-color: #92c7bf; padding: 20px 40px; display: flex; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        header img { width: 75px; height: 75px; margin-right: 15px; }
        header .title { font-size: 40px; font-weight: bold; color: #3f51b5; }
        .container { text-align: center; padding: 60px 20px; }
        .container h1 { font-size: 36px; margin-bottom: 15px; }
        .container p { font-size: 16px; margin-bottom: 40px; color: #374192; }
        .cards { display: flex; justify-content: center; gap: 30px; flex-wrap: wrap; }
        .card { background-color: #c6f0e3; border-radius: 12px; padding: 30px 20px; width: 250px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); transition: transform 0.3s, box-shadow 0.3s; text-align: center; }
        .card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
        .card .icon { font-size: 40px; margin-bottom: 20px; }
        .card h3 { font-size: 20px; margin-bottom: 10px; }
        .card p { font-size: 14px; color: #140778; margin-bottom: 20px; }
        .card button { padding: 10px 20px; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; transition: background-color 0.3s; }
        .login-btn, .register-btn, .admin-btn { background-color: hsl(231, 100%, 51%); color: #f6f6f5; }
        .login-btn:hover, .register-btn:hover, .admin-btn:hover { background-color: #f6f6f5; color: black; }
        footer { margin-top: 50px; padding: 20px; background-color: #cee8e8; text-align: center; color: #777; font-size: 14px; }
    </style>
</head>
<body>
    <header>
        <img src="https://via.placeholder.com/75" alt="BCET Logo">
        <div>
            <div class="title">Bengal College of Engineering and Technology</div>
        </div>
    </header>
    <div class="container">
        <h1>📚Welcome to the Central Library</h1>
        <p>Your gateway to our extensive collection of books, journals, and digital resources. Please select your login portal to continue.</p>

        <div class="cards">
            <div class="card">
                <div class="icon">👤</div>
                <h3>Student Login</h3>
                <p>Access your student dashboard, search for books, and manage your account.</p>
                <button class="login-btn" onclick="showForm('studentLogin')">Login →</button>
                <button class="register-btn" onclick="showForm('studentReg')">Register</button>
            </div>

            <div class="card">
                <div class="icon">🔑</div>
                <h3>Administrator Login</h3>
                <p>Access the administrative panel to manage library resources and users.</p>
                <button class="admin-btn" onclick="showForm('adminLogin')">Login →</button>
                <button class="register-btn" onclick="showForm('adminReg')">Register</button>
            </div>
        </div>
    </div>

    <div class="container" id="forms"></div>

    <footer>
        © 2025 Bengal College of Engineering and Technology. All Rights Reserved.
    </footer>

<script>
function showForm(type) {
  const forms = {
    studentLogin: \`
      <h3>Student Login</h3>
      <form onsubmit="submitForm(event, '/api/student/login')">
        <input name="student_id" placeholder="Student ID" required><br><br>
        <input name="password" type="password" placeholder="Password" required><br><br>
        <button type="submit">Login</button>
      </form>\`,
    studentReg: \`
      <h3>Student Register</h3>
      <form onsubmit="submitForm(event, '/api/student/register')">
        <input name="student_id" placeholder="Student ID" required><br><br>
        <input name="name" placeholder="Name" required><br><br>
        <input name="email" type="email" placeholder="Email" required><br><br>
        <input name="password" type="password" placeholder="Password" required><br><br>
        <button type="submit">Register</button>
      </form>\`,
    adminLogin: \`
      <h3>Admin Login</h3>
      <form onsubmit="submitForm(event, '/api/admin/login')">
        <input name="admin_id" placeholder="Admin ID" required><br><br>
        <input name="password" type="password" placeholder="Password" required><br><br>
        <button type="submit">Login</button>
      </form>\`,
    adminReg: \`
      <h3>Admin Register</h3>
      <form onsubmit="submitForm(event, '/api/admin/register')">
        <input name="admin_id" placeholder="Admin ID" required><br><br>
        <input name="name" placeholder="Name" required><br><br>
        <input name="email" type="email" placeholder="Email" required><br><br>
        <input name="password" type="password" placeholder="Password" required><br><br>
        <button type="submit">Register</button>
      </form>\`
  };
  document.getElementById("forms").innerHTML = forms[type];
}

async function submitForm(e, url) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const res = await fetch(url, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });
  const json = await res.json();
  alert(JSON.stringify(json));
}
</script>
</body>
</html>
  `);
});

// ---------- START SERVER ----------
const PORT = 3000;
app.listen(PORT, () => console.log("Library system running at http://localhost:" + PORT));
