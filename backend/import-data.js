
const fs = require("fs");
const db = require("./db");

async function importData() {
  const tables = ["books", "students"];

  for (const table of tables) {
    const data = JSON.parse(
      fs.readFileSync(`${table}.json`, "utf8")
    );

    console.log(`Importing ${table}: ${data.length} records`);

    for (const item of data) {
      const [existing] = await db.query(
        `SELECT id FROM ${table} WHERE id = ?`,
        [String(item.id)]
      );

      if (existing.length > 0) {
        console.log(`Skipped existing ${table} ID: ${item.id}`);
        continue;
      }

      if (table === "books") {
        await db.query(
          `INSERT INTO books
          (id, title, author, category, issued, issuedTo)
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            String(item.id),
            item.title,
            item.author,
            item.category || null,
            Boolean(item.issued),
            item.issuedTo || null
          ]
        );
      } else {
        await db.query(
          `INSERT INTO students
          (id, name, rollNo, course)
          VALUES (?, ?, ?, ?)`,
          [
            String(item.id),
            item.name,
            item.rollNo,
            item.course
          ]
        );
      }
    }
  }

  console.log("Import completed!");
}

importData()
  .catch(err => console.error("Import error:", err.message))
  .finally(() => db.end());
