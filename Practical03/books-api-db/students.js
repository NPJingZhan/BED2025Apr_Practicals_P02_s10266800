const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.listen(port, async () => {
  try {
    await sql.connect(dbConfig);
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }

  console.log(`Server listening on port ${port}`);
});

process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connection closed");
  process.exit(0);
});

// --- GET all students ---
app.get("/students", async (req, res) => {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection.request().query(
      `SELECT student_id, name, address FROM Students`
    );
    res.json(result.recordset);
  } catch (error) {
    console.error("Error in GET /students:", error);
    res.status(500).send("Error retrieving student details");
  } finally {
    if (connection) await connection.close();
  }
});

// --- GET student by ID ---
app.get("/students/:id", async (req, res) => {
  const studentId = parseInt(req.params.id);
  if (isNaN(studentId)) return res.status(400).send("Invalid student ID");

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("id", studentId);
    const result = await request.query(
      `SELECT student_id, name, address FROM Students WHERE student_id = @id`
    );

    if (!result.recordset[0]) return res.status(404).send("Student not found");
    res.json(result.recordset[0]);
  } catch (error) {
    console.error(`Error in GET /students/${studentId}:`, error);
    res.status(500).send("Error retrieving student details");
  } finally {
    if (connection) await connection.close();
  }
});

// --- POST create new student ---
app.post("/students", async (req, res) => {
  const { name, address } = req.body;
  if (!name) {
    return res.status(400).send("Name is required");
  }

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("name", name);
    request.input("address", address);

    const insertResult = await request.query(`
      INSERT INTO Students (name, address)
      VALUES (@name, @address);
      SELECT SCOPE_IDENTITY() AS student_id;
    `);

    const newStudentId = insertResult.recordset[0].student_id;

    const getResult = await connection
      .request()
      .input("id", newStudentId)
      .query(`SELECT student_id, name, address FROM Students WHERE student_id = @id`);

    res.status(201).json(getResult.recordset[0]);
  } catch (error) {
    console.error("Error in POST /students:", error);
    res.status(500).send("Error creating student");
  } finally {
    if (connection) await connection.close();
  }
});

// --- PUT update student by ID ---
app.put("/students/:id", async (req, res) => {
  const studentId = parseInt(req.params.id);
  const { name, address } = req.body;

  if (isNaN(studentId)) return res.status(400).send("Invalid student ID");
  if (!name) {return res.status(400).send("Name required");}

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("id", studentId);
    request.input("name", name || null);
    request.input("address", address !== undefined ? address : null);

    const updateQuery = `
      UPDATE Students
      SET name = COALESCE(@name, name),
          address = COALESCE(@address, address)
      WHERE student_id = @id;

      SELECT student_id, name, address FROM Students WHERE student_id = @id;
    `;

    const result = await request.query(updateQuery);
    if (!result.recordset[0]) return res.status(404).send("Student not found");

    res.json(result.recordset[0]);
  } catch (error) {
    console.error(`Error in PUT /students/${studentId}:`, error);
    res.status(500).send("Error updating student");
  } finally {
    if (connection) await connection.close();
  }
});

// --- DELETE student by ID ---
app.delete("/students/:id", async (req, res) => {
  const studentId = parseInt(req.params.id);
  if (isNaN(studentId)) return res.status(400).send("Invalid student ID");

  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("id", studentId);

    const result = await request.query(`
      DELETE FROM Students WHERE student_id = @id;
      SELECT @@ROWCOUNT AS affectedRows;
    `);

    if (result.recordset[0].affectedRows === 0)
      return res.status(404).send("Student not found");

    res.json({ message: `Student with ID ${studentId} deleted successfully` });
  } catch (error) {
    console.error(`Error in DELETE /students/${studentId}:`, error);
    res.status(500).send("Error deleting student");
  } finally {
    if (connection) await connection.close();
  }
});
