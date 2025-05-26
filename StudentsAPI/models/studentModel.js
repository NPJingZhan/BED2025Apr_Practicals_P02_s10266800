const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getAllStudents() {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const result = await connection.request().query(
      `SELECT student_id, name, address FROM Students`
    );
    return result.recordset;
  } finally {
    if (connection) await connection.close();
  }
}

async function getStudentById(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("id", id);
    const result = await request.query(
      `SELECT student_id, name, address FROM Students WHERE student_id = @id`
    );
    return result.recordset[0] || null;
  } finally {
    if (connection) await connection.close();
  }
}

async function createStudent({ name, address }) {
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

    return getResult.recordset[0];
  } finally {
    if (connection) await connection.close();
  }
}

async function updateStudent(id, { name, address }) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("id", id);
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
    return result.recordset[0] || null;
  } finally {
    if (connection) await connection.close();
  }
}

async function deleteStudent(id) {
  let connection;
  try {
    connection = await sql.connect(dbConfig);
    const request = connection.request();
    request.input("id", id);

    const result = await request.query(`
      DELETE FROM Students WHERE student_id = @id;
      SELECT @@ROWCOUNT AS affectedRows;
    `);

    return result.recordset[0].affectedRows > 0;
  } finally {
    if (connection) await connection.close();
  }
}

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};