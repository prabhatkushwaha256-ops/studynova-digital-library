
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password || password.length < 12) {
  console.log("Enter username and password (at least 12 characters)");
  process.exit(1);
}

const admin = {
  username,
  passwordHash: bcrypt.hashSync(password, 12)
};

fs.writeFileSync(
  path.join(__dirname, "admin.json"),
  JSON.stringify(admin, null, 2)
);

console.log("Admin account created successfully!");
